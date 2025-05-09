"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, UserCheck, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import { Loading } from '@/components/Loading';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  created_at: string;
  product_id?: string; // Opcional
  sender_profile?: { full_name?: string; avatar_url?: string; is_vendor?: boolean }; // Para mostrar info del remitente
  recipient_profile?: { full_name?: string; avatar_url?: string; is_vendor?: boolean }; // Para mostrar info del destinatario
}

interface Conversation {
  participant_id: string;
  participant_name?: string;
  participant_avatar?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  is_vendor?: boolean;
}

export default function DashboardMessages() {
  const { user } = useAuth(); // Admin user
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    // Esta query es compleja: necesitamos agrupar mensajes por participante (que no sea el admin)
    // y obtener el último mensaje y conteo de no leídos.
    // Supabase RPC function sería ideal aquí. Por ahora, una aproximación:
    const { data, error } = await supabase
      .from('contact_messages')
      .select(`
        *,
        sender_profile:profiles!contact_messages_sender_id_fkey(full_name, avatar_url, is_vendor),
        recipient_profile:profiles!contact_messages_recipient_id_fkey(full_name, avatar_url, is_vendor)
      `)
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`) // Mensajes donde el admin es sender o receiver
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Failed to load conversations: " + error.message);
      setConversations([]);
    } else {
      const convMap = new Map<string, Conversation>();
      data?.forEach(msg => {
        const participant = msg.sender_id === user.id ? msg.recipient_profile : msg.sender_profile;
        const participantId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;

        if (!participantId || participantId === user.id) return; // Ignorar mensajes a uno mismo o sin participante claro

        if (!convMap.has(participantId)) {
          convMap.set(participantId, {
            participant_id: participantId,
            participant_name: participant?.full_name || 'Unknown User',
            participant_avatar: participant?.avatar_url,
            is_vendor: participant?.is_vendor,
            last_message: msg.message,
            last_message_time: msg.created_at,
            unread_count: 0, // TODO: Implementar conteo de no leídos
          });
        }
        // TODO: Actualizar unread_count y last_message si es más reciente
      });
      setConversations(Array.from(convMap.values()));
    }
    setIsLoading(false);
  }, [user]);

  const fetchMessages = useCallback(async (participantId: string) => {
    if (!user || !participantId) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from('contact_messages')
      .select(`
        *,
        sender_profile:profiles!contact_messages_sender_id_fkey(full_name, avatar_url),
        recipient_profile:profiles!contact_messages_recipient_id_fkey(full_name, avatar_url)
      `)
      .or(`(sender_id.eq.${user.id},recipient_id.eq.${participantId}),(sender_id.eq.${participantId},recipient_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    if (error) {
      toast.error("Failed to load messages: " + error.message);
      setMessages([]);
    } else {
      setMessages(data as Message[] || []);
      // TODO: Marcar mensajes como leídos
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.participant_id);
    } else {
      setMessages([]);
    }
  }, [selectedConversation, fetchMessages]);
  
  // Real-time for new messages in selected conversation
  useEffect(() => {
    if (!user || !selectedConversation) return;

    const messageChannel = supabase
      .channel(`public:contact_messages:conv-${selectedConversation.participant_id}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'contact_messages', 
          filter: `or(and(sender_id.eq.${user.id},recipient_id.eq.${selectedConversation.participant_id}),and(sender_id.eq.${selectedConversation.participant_id},recipient_id.eq.${user.id}))`
        },
        (payload) => {
          console.log('New message in conversation:', payload);
          // Optimistically add new message or re-fetch
          setMessages(prev => [...prev, payload.new as Message]);
          // Potentially update conversations list too if it's a new one or affects unread count
          fetchConversations(); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
    };
  }, [user, selectedConversation, fetchConversations]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !selectedConversation) return;

    setIsSending(true);
    const { error } = await supabase
      .from('contact_messages')
      .insert({
        sender_id: user.id,
        recipient_id: selectedConversation.participant_id,
        message: newMessage,
        message_type: selectedConversation.is_vendor ? 'admin_to_vendor' : 'admin_to_user', // Ajustar según sea necesario
        // product_id: ... // si es relevante
      });
    
    setIsSending(false);
    if (error) {
      toast.error("Failed to send message: " + error.message);
    } else {
      setNewMessage('');
      // Optimistic update or rely on real-time listener
    }
  };

  if (isLoading && conversations.length === 0) return <Loading />;

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Messages</h1>
      <Card className="flex-grow flex overflow-hidden bg-card/70 backdrop-blur-sm border-border/30 shadow-xl">
        <div className="w-1/3 border-r border-border/30 bg-card/50 overflow-y-auto">
          <CardHeader className="border-b border-border/30">
            <CardTitle className="text-foreground">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {conversations.length === 0 && !isLoading && (
              <p className="p-4 text-muted-foreground text-center">No conversations yet.</p>
            )}
            {conversations.map((convo) => (
              <div
                key={convo.participant_id}
                className={cn(
                  "flex items-center p-4 cursor-pointer hover:bg-accent/50 smooth-hover",
                  selectedConversation?.participant_id === convo.participant_id ? 'bg-accent/70' : ''
                )}
                onClick={() => setSelectedConversation(convo)}
              >
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={convo.participant_avatar} alt={convo.participant_name} />
                  <AvatarFallback className="bg-brand-orange text-primary-foreground">
                    {convo.participant_name?.substring(0, 1).toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-grow overflow-hidden">
                  <p className="font-semibold text-foreground truncate flex items-center">
                    {convo.participant_name}
                    {convo.is_vendor ? <Briefcase className="h-3 w-3 ml-1.5 text-muted-foreground" /> : <UserCheck className="h-3 w-3 ml-1.5 text-muted-foreground" />}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">{convo.last_message}</p>
                </div>
                {/* {convo.unread_count > 0 && (
                  <span className="ml-auto bg-brand-orange text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                    {convo.unread_count}
                  </span>
                )} */}
              </div>
            ))}
          </CardContent>
        </div>

        <div className="w-2/3 flex flex-col">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b border-border/30">
                <CardTitle className="text-foreground">{selectedConversation.participant_name}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {selectedConversation.is_vendor ? "Vendor" : "Client"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow overflow-y-auto p-6 space-y-4">
                {isLoading && messages.length === 0 && <Loading />}
                {!isLoading && messages.length === 0 && (
                  <p className="text-center text-muted-foreground">No messages in this conversation yet.</p>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex", msg.sender_id === user?.id ? 'justify-end' : 'justify-start')}>
                    <div className={cn(
                      "max-w-xs lg:max-w-md px-4 py-2.5 rounded-xl shadow", 
                      msg.sender_id === user?.id 
                        ? 'bg-brand-orange text-primary-foreground rounded-br-none' 
                        : 'bg-accent text-accent-foreground rounded-bl-none'
                    )}>
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      <p className={cn(
                        "text-xs mt-1 opacity-70",
                        msg.sender_id === user?.id ? 'text-right' : 'text-left'
                      )}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
              <form onSubmit={handleSendMessage} className="border-t border-border/30 p-4">
                <div className="flex items-center space-x-2">
                  <Input 
                    type="text" 
                    placeholder="Type a message..." 
                    className="flex-grow bg-input/50 border-border/50 focus:ring-brand-orange" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={isSending}
                  />
                  <Button type="submit" size="icon" className="bg-brand-orange hover:bg-brand-orange/90" disabled={isSending}>
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-grow flex items-center justify-center">
              <p className="text-muted-foreground text-lg">Select a conversation to start chatting.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
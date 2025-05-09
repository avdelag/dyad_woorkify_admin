"use client";
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, UserCheck, Users, Briefcase, Loader2 } from 'lucide-react'; // Añadido Loader2
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import { Loading } from '@/components/Loading'; // Usaremos el componente Loading general
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  created_at: string;
  product_id?: string;
  sender_profile?: { full_name?: string; avatar_url?: string; is_vendor?: boolean };
  recipient_profile?: { full_name?: string; avatar_url?: string; is_vendor?: boolean };
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
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);

  const [isSending, setIsSending] = useState(false);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startLoadingTimer = () => {
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    loadingTimerRef.current = setTimeout(() => {
      setShowLoadingIndicator(true);
    }, 500); // Mostrar indicador después de 500ms
  };

  const stopLoadingTimer = () => {
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    setShowLoadingIndicator(false);
  };

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setIsLoadingConversations(true);
    startLoadingTimer();

    try {
      const { data, error } = await supabase
        .from('contact_messages') // Verificado: tabla contact_messages
        .select(`
          *,
          sender_profile:profiles!contact_messages_sender_id_fkey(full_name, avatar_url, is_vendor),
          recipient_profile:profiles!contact_messages_recipient_id_fkey(full_name, avatar_url, is_vendor)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      stopLoadingTimer();
      if (error) {
        toast.error("Failed to load conversations: " + error.message);
        setConversations([]);
      } else {
        const convMap = new Map<string, Conversation>();
        data?.forEach(msg => {
          const participant = msg.sender_id === user.id ? msg.recipient_profile : msg.sender_profile;
          const participantId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;

          if (!participantId || participantId === user.id) return;

          if (!convMap.has(participantId)) {
            convMap.set(participantId, {
              participant_id: participantId,
              participant_name: participant?.full_name || 'Unknown User',
              participant_avatar: participant?.avatar_url,
              is_vendor: participant?.is_vendor,
              last_message: msg.message,
              last_message_time: msg.created_at,
              unread_count: 0, // Implementar conteo de no leídos es más complejo y requiere otra query o función RPC
            });
          }
          // Lógica para actualizar last_message si es más reciente y unread_count
          const existingConvo = convMap.get(participantId);
          if (existingConvo && new Date(msg.created_at) > new Date(existingConvo.last_message_time)) {
            existingConvo.last_message = msg.message;
            existingConvo.last_message_time = msg.created_at;
          }
          // if (msg.recipient_id === user.id && !msg.read_status) { // Asumiendo un campo read_status
          //  existingConvo.unread_count++;
          // }
        });
        setConversations(Array.from(convMap.values()).sort((a,b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()));
      }
    } catch (e: any) {
      stopLoadingTimer();
      toast.error("An unexpected error occurred while fetching conversations.");
      console.error(e);
      setConversations([]);
    } finally {
      setIsLoadingConversations(false);
      stopLoadingTimer();
    }
  }, [user]);

  const fetchMessages = useCallback(async (participantId: string) => {
    if (!user || !participantId) return;
    setIsLoadingMessages(true);
    startLoadingTimer();
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select(`
          *,
          sender_profile:profiles!contact_messages_sender_id_fkey(full_name, avatar_url),
          recipient_profile:profiles!contact_messages_recipient_id_fkey(full_name, avatar_url)
        `)
        .or(`(sender_id.eq.${user.id},recipient_id.eq.${participantId}),(sender_id.eq.${participantId},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      
      stopLoadingTimer();
      if (error) {
        toast.error("Failed to load messages: " + error.message);
        setMessages([]);
      } else {
        setMessages(data as Message[] || []);
        // Aquí podrías marcar los mensajes como leídos
        // await supabase.from('contact_messages').update({ read_status: true }).match({ recipient_id: user.id, sender_id: participantId, read_status: false });
        // fetchConversations(); // Para actualizar el contador de no leídos
      }
    } catch (e: any) {
      stopLoadingTimer();
      toast.error("An unexpected error occurred while fetching messages.");
      console.error(e);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
      stopLoadingTimer();
    }
  }, [user, fetchConversations]);

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
  
  useEffect(() => {
    if (!user) return;

    const messageChannel = supabase
      .channel('public:contact_messages')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'contact_messages', 
          // El filtro debe ser más general para actualizar la lista de conversaciones
          // filter: `or(recipient_id.eq.${user.id},sender_id.eq.${user.id})`
        },
        (payload) => {
          console.log('New message received (real-time):', payload);
          // Si el mensaje pertenece a la conversación seleccionada, añadirlo
          const newMessageData = payload.new as Message;
          if (selectedConversation && 
              ((newMessageData.sender_id === user.id && newMessageData.recipient_id === selectedConversation.participant_id) ||
               (newMessageData.sender_id === selectedConversation.participant_id && newMessageData.recipient_id === user.id))
          ) {
            setMessages(prev => [...prev, newMessageData]);
          }
          // Siempre refrescar la lista de conversaciones para actualizar el último mensaje y potencialmente el orden
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
        message_type: selectedConversation.is_vendor ? 'admin_to_vendor' : 'admin_to_user',
      });
    
    setIsSending(false);
    if (error) {
      toast.error("Failed to send message: " + error.message);
    } else {
      setNewMessage('');
      // El listener de real-time debería encargarse de añadir el mensaje visualmente
      // y de actualizar la lista de conversaciones.
    }
  };

  // Estado de carga principal para la UI general
  const isOverallLoading = isLoadingConversations && conversations.length === 0;

  if (isOverallLoading && !showLoadingIndicator) { // Si está cargando pero el timer no ha pasado, no mostrar nada aún
    return <div className="h-[calc(100vh-10rem)] flex items-center justify-center"><p className="text-muted-foreground">Initializing messages...</p></div>;
  }
  if (isOverallLoading && showLoadingIndicator) { // Si el timer pasó, mostrar Loading
    return <Loading />;
  }

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Messages</h1>
      <Card className="flex-grow flex overflow-hidden bg-card/70 backdrop-blur-sm border-border/30 shadow-xl">
        <div className="w-1/3 border-r border-border/30 bg-card/50 overflow-y-auto">
          <CardHeader className="border-b border-border/30 sticky top-0 bg-card/80 backdrop-blur-sm z-10">
            <CardTitle className="text-foreground">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingConversations && showLoadingIndicator && (
              <div className="p-4 text-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto my-4" />
                Loading conversations...
              </div>
            )}
            {!isLoadingConversations && conversations.length === 0 && (
              <p className="p-4 text-muted-foreground text-center">No messages yet.</p>
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
                  <AvatarImage src={convo.participant_avatar || undefined} alt={convo.participant_name} />
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
                {/* {convo.unread_count > 0 && ( ... ) } */}
              </div>
            ))}
          </CardContent>
        </div>

        <div className="w-2/3 flex flex-col">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b border-border/30 sticky top-0 bg-card/80 backdrop-blur-sm z-10">
                <CardTitle className="text-foreground">{selectedConversation.participant_name}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {selectedConversation.is_vendor ? "Vendor" : "Client"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow overflow-y-auto p-6 space-y-4">
                {isLoadingMessages && showLoadingIndicator && (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
                  </div>
                )}
                {!isLoadingMessages && messages.length === 0 && (
                  <p className="text-center text-muted-foreground">No messages in this conversation yet. Say hello!</p>
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
              <form onSubmit={handleSendMessage} className="border-t border-border/30 p-4 bg-card">
                <div className="flex items-center space-x-2">
                  <Input 
                    type="text" 
                    placeholder="Type a message..." 
                    className="flex-grow bg-input/50 border-border/50 focus:ring-brand-orange" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={isSending}
                  />
                  <Button type="submit" size="icon" className="bg-brand-orange hover:bg-brand-orange/90" disabled={isSending || !newMessage.trim()}>
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
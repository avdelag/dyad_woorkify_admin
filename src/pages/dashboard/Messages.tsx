"use client";
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, UserCheck, Users, Briefcase, Loader2 } from 'lucide-react';
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
  product_id?: string;
  sender_profile?: { full_name?: string; avatar_url?: string; is_vendor?: boolean };
  recipient_profile?: { full_name?: string; avatar_url?: string; is_vendor?: boolean };
  read_at?: string | null; // Para marcar como leído
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
  const { user, profile: adminProfile } = useAuth(); // Usar user del contexto, que es el admin logueado
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);

  const [isSending, setIsSending] = useState(false);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  const startLoadingTimer = () => {
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    loadingTimerRef.current = setTimeout(() => {
      setShowLoadingIndicator(true);
    }, 500);
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
      // Usamos una función RPC para obtener las conversaciones y el conteo de no leídos
      // Esto es más eficiente que procesarlo en el cliente.
      // Asegúrate de que la función 'get_conversations_for_user' exista en tu DB.
      // Si no existe, podemos volver al método anterior y calcular unread_count en el cliente.
      const { data, error } = await supabase.rpc('get_conversations_for_user', {
        user_id_param: user.id
      });

      stopLoadingTimer();
      if (error) {
        console.error("Error fetching conversations via RPC:", error);
        toast.error("Failed to load conversations: " + error.message);
        // Fallback a la lógica anterior si RPC falla o no existe
        const { data: manualData, error: manualError } = await supabase
          .from('contact_messages')
          .select(`
            *,
            sender_profile:profiles!contact_messages_sender_id_fkey(full_name, avatar_url, is_vendor),
            recipient_profile:profiles!contact_messages_recipient_id_fkey(full_name, avatar_url, is_vendor)
          `)
          .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .order('created_at', { ascending: false });
        
        if (manualError) {
          toast.error("Failed to load conversations (manual): " + manualError.message);
          setConversations([]);
        } else {
          const convMap = new Map<string, Conversation>();
          manualData?.forEach(msg => {
            const participantIsSender = msg.sender_id !== user.id;
            const participantProfile = participantIsSender ? msg.sender_profile : msg.recipient_profile;
            const participantId = participantIsSender ? msg.sender_id : msg.recipient_id;

            if (!participantId || participantId === user.id) return;

            if (!convMap.has(participantId)) {
              convMap.set(participantId, {
                participant_id: participantId,
                participant_name: participantProfile?.full_name || 'Unknown User',
                participant_avatar: participantProfile?.avatar_url,
                is_vendor: participantProfile?.is_vendor,
                last_message: msg.message,
                last_message_time: msg.created_at,
                unread_count: 0, 
              });
            }
            const existingConvo = convMap.get(participantId);
            if (existingConvo && new Date(msg.created_at) > new Date(existingConvo.last_message_time)) {
              existingConvo.last_message = msg.message;
              existingConvo.last_message_time = msg.created_at;
            }
            // Contar no leídos (simplificado, idealmente esto viene de la DB o RPC)
            if (msg.recipient_id === user.id && !msg.read_at && existingConvo) {
               existingConvo.unread_count = (existingConvo.unread_count || 0) + 1;
            }
          });
          setConversations(Array.from(convMap.values()).sort((a,b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()));
        }
      } else {
        // Procesar datos de la función RPC
        const mappedConversations = data.map((convo: any) => ({
          participant_id: convo.other_user_id,
          participant_name: convo.other_user_profile?.full_name || 'Unknown User', // Asume que RPC devuelve perfil
          participant_avatar: convo.other_user_profile?.avatar_url,
          is_vendor: convo.other_user_profile?.is_vendor,
          last_message: convo.last_message_content,
          last_message_time: convo.last_message_created_at,
          unread_count: convo.unread_count || 0,
        }));
        setConversations(mappedConversations);
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

  const markMessagesAsRead = async (participantId: string) => {
    if (!user || !participantId) return;
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('recipient_id', user.id)
        .eq('sender_id', participantId)
        .is('read_at', null); // Solo actualiza los no leídos

      if (error) {
        console.error("Error marking messages as read:", error);
      } else {
        // Actualizar UI: quitar contador de no leídos para esta conversación
        setConversations(prevConvos => 
          prevConvos.map(c => 
            c.participant_id === participantId ? { ...c, unread_count: 0 } : c
          )
        );
        // Marcar mensajes individuales como leídos en el estado local
        setMessages(prevMsgs => 
            prevMsgs.map(m => 
                m.sender_id === participantId && m.recipient_id === user.id && !m.read_at 
                ? { ...m, read_at: new Date().toISOString() } 
                : m
            )
        );
      }
    } catch (e) {
      console.error("Exception marking messages as read:", e);
    }
  };

  const fetchMessages = useCallback(async (participantId: string) => {
    if (!user || !participantId) return;
    setIsLoadingMessages(true);
    startLoadingTimer();
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select(`
          *,
          sender_profile:profiles!contact_messages_sender_id_fkey(full_name, avatar_url, is_vendor),
          recipient_profile:profiles!contact_messages_recipient_id_fkey(full_name, avatar_url, is_vendor)
        `)
        .or(`(sender_id.eq.${user.id},recipient_id.eq.${participantId}),(sender_id.eq.${participantId},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      
      stopLoadingTimer();
      if (error) {
        toast.error("Failed to load messages: " + error.message);
        setMessages([]);
      } else {
        setMessages(data as Message[] || []);
        await markMessagesAsRead(participantId);
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
  
  useEffect(() => {
    if (!user) return;

    const messageChannel = supabase
      .channel('public:contact_messages:admin_dashboard') // Canal específico
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'contact_messages',
          // Filtro para escuchar mensajes donde el admin es el sender o receiver
          filter: `or(recipient_id.eq.${user.id},sender_id.eq.${user.id})`
        },
        (payload) => {
          console.log('[Admin Messages] New message event received (real-time):', payload);
          const newMessageData = payload.new as Message;
          
          // Si el mensaje pertenece a la conversación actualmente seleccionada
          if (selectedConversation && 
              ((newMessageData.sender_id === user.id && newMessageData.recipient_id === selectedConversation.participant_id) ||
               (newMessageData.sender_id === selectedConversation.participant_id && newMessageData.recipient_id === user.id))
          ) {
            // Añadir el nuevo mensaje a la lista de mensajes de la conversación activa
            setMessages(prev => [...prev, newMessageData]);
            // Si el admin es el receptor del nuevo mensaje en la conversación activa, marcarlo como leído
            if (newMessageData.recipient_id === user.id) {
              markMessagesAsRead(newMessageData.sender_id);
            }
          } else if (newMessageData.recipient_id === user.id) {
            // Si el mensaje es para el admin pero no es de la conversación activa,
            // mostrar una notificación y actualizar la lista de conversaciones para el contador.
            toast.info(`New message from ${newMessageData.sender_profile?.full_name || 'a user'}`);
          }
          // Siempre refrescar la lista de conversaciones para actualizar el último mensaje y el contador de no leídos
          fetchConversations(); 
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Admin Messages] Subscribed to contact_messages channel for admin!');
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('[Admin Messages] Subscription error:', status, err);
          toast.error('Real-time connection error for messages.');
        }
      });

    return () => {
      console.log('[Admin Messages] Unsubscribing from contact_messages channel.');
      supabase.removeChannel(messageChannel);
    };
  }, [user, selectedConversation, fetchConversations]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !selectedConversation || !adminProfile) return;

    setIsSending(true);
    const { error } = await supabase
      .from('contact_messages')
      .insert({
        sender_id: user.id, // Admin es el sender
        recipient_id: selectedConversation.participant_id,
        message: newMessage,
        // Determinar message_type basado en si el adminProfile existe y es admin
        // y si el receptor (selectedConversation) es un vendor.
        message_type: adminProfile.is_admin && selectedConversation.is_vendor ? 'admin_to_vendor' 
                      : adminProfile.is_admin && !selectedConversation.is_vendor ? 'admin_to_user'
                      : 'unknown', // Fallback, aunque no debería ocurrir si admin está logueado
        // admin_id: user.id, // Si tienes una columna específica para admin_id
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

  const isOverallLoading = isLoadingConversations && conversations.length === 0;

  if (isOverallLoading && !showLoadingIndicator) {
    return <div className="h-[calc(100vh-10rem)] flex items-center justify-center"><p className="text-muted-foreground">Initializing messages...</p></div>;
  }
  if (isOverallLoading && showLoadingIndicator) {
    return <Loading />;
  }

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Messages</h1>
      <Card className="flex-grow flex overflow-hidden bg-card/70 backdrop-blur-sm border-border/30 shadow-xl">
        <div className="w-full md:w-1/3 border-r border-border/30 bg-card/50 overflow-y-auto">
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
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-foreground truncate flex items-center">
                      {convo.participant_name}
                      {convo.is_vendor ? <Briefcase className="h-3 w-3 ml-1.5 text-muted-foreground" /> : <UserCheck className="h-3 w-3 ml-1.5 text-muted-foreground" />}
                    </p>
                    {convo.unread_count > 0 && (
                      <span className="bg-brand-orange text-xs text-white font-bold rounded-full px-2 py-0.5">
                        {convo.unread_count}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{convo.last_message}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </div>

        <div className="hidden md:flex w-2/3 flex-col">
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
                        {msg.sender_id === user?.id && msg.read_at && <Check className="inline h-3 w-3 ml-1 text-blue-300" />}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
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
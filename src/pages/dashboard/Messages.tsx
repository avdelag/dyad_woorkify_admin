"use client";
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, UserCheck, Briefcase, Loader2, Check } from 'lucide-react'; // Added Check
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
  read_at?: string | null; 
  message_type?: string; // Added for consistency
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
  const { user, profile: adminProfile } = useAuth(); 
  const location = useLocation();
  const navigate = useNavigate(); // For clearing navigation state

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

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const startLoadingTimer = () => {
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    loadingTimerRef.current = setTimeout(() => {
      setShowLoadingIndicator(true);
    }, 300); // Shorter delay
  };

  const stopLoadingTimer = () => {
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    setShowLoadingIndicator(false);
  };

  const fetchConversations = useCallback(async (participantToSelect?: string) => {
    if (!user) return;
    setIsLoadingConversations(true);
    if (!selectedConversation && !participantToSelect) startLoadingTimer();

    try {
      const { data, error } = await supabase.rpc('get_conversations_for_user', {
        user_id_param: user.id
      });

      if (!selectedConversation && !participantToSelect) stopLoadingTimer();
      if (error) {
        console.error("Error fetching conversations via RPC:", error);
        toast.error("Failed to load conversations: " + error.message);
        setConversations([]);
      } else {
        const mappedConversations = data.map((convo: any) => ({
          participant_id: convo.other_user_id,
          participant_name: convo.other_user_profile?.full_name || 'Unknown User',
          participant_avatar: convo.other_user_profile?.avatar_url,
          is_vendor: convo.other_user_profile?.is_vendor,
          last_message: convo.last_message_content,
          last_message_time: convo.last_message_created_at,
          unread_count: convo.unread_count || 0,
        }));
        setConversations(mappedConversations);

        if (participantToSelect) {
          const convoToSelect = mappedConversations.find(c => c.participant_id === participantToSelect);
          if (convoToSelect) {
            setSelectedConversation(convoToSelect);
          } else {
            console.warn(`Conversation with participant ${participantToSelect} not found after fetching.`);
          }
        }
      }
    } catch (e: any) {
      if (!selectedConversation && !participantToSelect) stopLoadingTimer();
      toast.error("An unexpected error occurred while fetching conversations.");
      console.error(e);
      setConversations([]);
    } finally {
      setIsLoadingConversations(false);
      if (!selectedConversation && !participantToSelect) stopLoadingTimer();
    }
  }, [user, selectedConversation]);

  const markMessagesAsRead = useCallback(async (participantId: string) => {
    if (!user || !participantId) return;
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('recipient_id', user.id)
        .eq('sender_id', participantId)
        .is('read_at', null); 

      if (error) {
        console.error("Error marking messages as read:", error);
      } else {
        setConversations(prevConvos => 
          prevConvos.map(c => 
            c.participant_id === participantId ? { ...c, unread_count: 0 } : c
          )
        );
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
          sender_profile:profiles!contact_messages_sender_id_fkey(id, full_name, avatar_url, is_vendor),
          recipient_profile:profiles!contact_messages_recipient_id_fkey(id, full_name, avatar_url, is_vendor)
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
  }, [user, markMessagesAsRead]);

  useEffect(() => {
    const participantToSelect = location.state?.openConversationWith;
    fetchConversations(participantToSelect);
    if (participantToSelect) {
      // Clear the state after using it
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [fetchConversations, location.state, location.pathname, navigate]);

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
      .channel(`public:contact_messages:admin_dashboard:${user.id}`) 
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'contact_messages',
          filter: `or(recipient_id.eq.${user.id},sender_id.eq.${user.id})`
        },
        (payload) => {
          console.log('[Admin Messages] New message event received (real-time):', payload);
          const newMessageData = payload.new as Message;
          
          fetchConversations(selectedConversation?.participant_id); // Refresh conversations to update unread counts and last message

          if (selectedConversation && 
              ((newMessageData.sender_id === user.id && newMessageData.recipient_id === selectedConversation.participant_id) ||
               (newMessageData.sender_id === selectedConversation.participant_id && newMessageData.recipient_id === user.id))
          ) {
            setMessages(prev => {
              // Avoid duplicates if message already added optimistically or by another fetch
              if (prev.find(m => m.id === newMessageData.id)) return prev;
              return [...prev, newMessageData];
            });
            if (newMessageData.recipient_id === user.id) {
              markMessagesAsRead(newMessageData.sender_id);
            }
          } else if (newMessageData.recipient_id === user.id) {
            toast.info(`New message from ${newMessageData.sender_profile?.full_name || 'a user'}`);
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Admin Messages] Subscribed to contact_messages channel for admin!');
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('[Admin Messages] Subscription error:', status, err);
        }
      });

    return () => {
      supabase.removeChannel(messageChannel);
    };
  }, [user, selectedConversation, fetchConversations, markMessagesAsRead]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !selectedConversation || !adminProfile) return;

    setIsSending(true);
    const tempId = `temp-${Date.now()}`; // Optimistic update ID
    const messageToSend: Partial<Message> = {
      id: tempId, // Temporary ID for optimistic update
      sender_id: user.id, 
      recipient_id: selectedConversation.participant_id,
      message: newMessage,
      created_at: new Date().toISOString(),
      message_type: adminProfile.is_admin && selectedConversation.is_vendor ? 'admin_to_vendor' 
                    : adminProfile.is_admin && !selectedConversation.is_vendor ? 'admin_to_user'
                    : 'unknown',
      sender_profile: { // Optimistic sender profile
        full_name: adminProfile.full_name,
        avatar_url: adminProfile.avatar_url,
        is_vendor: adminProfile.is_admin // Admins are not vendors in this context
      }
    };

    // Optimistic update
    setMessages(prev => [...prev, messageToSend as Message]);
    setNewMessage('');

    const { data: insertedMessage, error } = await supabase
      .from('contact_messages')
      .insert({
        sender_id: messageToSend.sender_id,
        recipient_id: messageToSend.recipient_id,
        message: messageToSend.message,
        message_type: messageToSend.message_type,
      })
      .select()
      .single();
    
    setIsSending(false);
    if (error) {
      toast.error("Failed to send message: " + error.message);
      // Revert optimistic update
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setNewMessage(messageToSend.message!); // Put message back in input
    } else if (insertedMessage) {
      // Replace temp message with actual message from DB
      setMessages(prev => prev.map(m => m.id === tempId ? { ...insertedMessage, sender_profile: messageToSend.sender_profile } as Message : m));
      fetchConversations(selectedConversation.participant_id); // Update conversation list
    }
  };

  const isOverallLoading = isLoadingConversations && conversations.length === 0 && !selectedConversation;

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
            {isLoadingConversations && conversations.length === 0 && showLoadingIndicator && (
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
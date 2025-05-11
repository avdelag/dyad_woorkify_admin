"use client";
import React, { useEffect, useState } from 'react';
import { Bell, Check, MessageSquare } from 'lucide-react'; // Added MessageSquare for message type
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext'; // Assuming useAuth provides the user object
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom'; // For navigation

interface NotificationData {
  message_id?: string;
  sender_id?: string; // Crucial for opening the conversation
  product_id?: string;
  // Add other potential fields from your notification data
}

interface Notification {
  id: string;
  user_id: string; 
  title: string;
  message: string; 
  type: string; // e.g., 'message', 'product_approval', 'admin_message'
  read: boolean; 
  created_at: string;
  data?: NotificationData; // Parsed JSONB data
}

export const NotificationBell = () => {
  const { user } = useAuth(); // Admin user
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id) 
        .order('created_at', { ascending: false })
        .limit(10); 

      if (error) {
        toast.error("Failed to load notifications: " + error.message);
      } else {
        const parsedNotifications = data?.map(n => ({
          ...n,
          read: n.read_status ?? n.read ?? false, // Adapt to your column name for read status
          data: typeof n.data === 'string' ? JSON.parse(n.data) : n.data // Ensure data is parsed if it's a string
        })) as Notification[] || [];
        setNotifications(parsedNotifications);
        const unread = parsedNotifications?.filter(n => !n.read).length || 0;
        setUnreadCount(unread);
      }
    };

    fetchNotifications();

    const notificationsChannel = supabase
      .channel(`public:notifications:user:${user.id}`) // Unique channel per user
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          console.log("New notification received via channel", payload);
          toast.info("You have a new notification!");
          fetchNotifications();
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to notifications for user ${user.id}`);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Notification channel error:', err);
        }
      });

    return () => {
      supabase.removeChannel(notificationsChannel);
    };
  }, [user]);

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read first
    if (!notification.read) {
      const { error } = await supabase
        .from('notifications')
        .update({ read_status: true, read: true }) // Update both possible column names
        .eq('id', notification.id);

      if (error) {
        toast.error("Failed to mark notification as read.");
      } else {
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }

    // Navigate if it's a message type and has sender_id
    // Adjust 'type' based on what your 'handle_new_message' trigger sets for message notifications
    if ((notification.type === 'message' || notification.type === 'new_message' || notification.type === 'admin_message') && notification.data?.sender_id) {
      console.log("Navigating to message from sender:", notification.data.sender_id);
      navigate('/dashboard/messages', { state: { openConversationWith: notification.data.sender_id } });
    } else if (notification.type === 'product_approval' && notification.data?.product_id) {
      // Example: navigate to a product page
      // navigate(`/dashboard/products/${notification.data.product_id}`);
      toast.info("Product related notification clicked. Navigation to product page not yet implemented.");
    }
    // Add other navigation logic for different notification types
  };
  
  const markAllAsRead = async () => {
    if (!user) return;
    const unreadNotificationIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadNotificationIds.length === 0) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read_status: true, read: true }) // Update both possible column names
      .in('id', unreadNotificationIds)
      .eq('user_id', user.id);
    
    if (error) {
      toast.error("Failed to mark all notifications as read.");
    } else {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read.");
    }
  };

  const getNotificationIcon = (type: string) => {
    if (type === 'message' || type === 'new_message' || type === 'admin_message') {
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    }
    // Add other icons for other types
    return <Bell className="h-4 w-4 text-brand-orange" />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-foreground/80 hover:text-foreground hover:bg-accent/50 smooth-hover rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-orange"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 md:w-96 bg-card border-border/50 shadow-xl rounded-lg mt-2">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && <span className="text-xs text-brand-orange">{unreadCount} New</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50" />
        {notifications.length === 0 ? (
          <DropdownMenuItem disabled className="text-muted-foreground text-center py-4">
            No new notifications
          </DropdownMenuItem>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.map(notif => (
              <DropdownMenuItem 
                key={notif.id} 
                className={cn(
                  "flex items-start gap-3 py-3 px-4 hover:bg-accent/50 smooth-hover text-foreground/80 cursor-pointer",
                  !notif.read && "bg-accent/30 dark:bg-accent/20"
                )}
                onClick={() => handleNotificationClick(notif)} // Updated onClick handler
              >
                <div className="flex-shrink-0 pt-0.5">
                  {!notif.read ? getNotificationIcon(notif.type) : <Check className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="flex-grow">
                  <p className={cn("text-sm font-medium", !notif.read && "text-foreground")}>{notif.title}</p>
                  <p className="text-xs text-muted-foreground">{notif.message}</p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">{new Date(notif.created_at).toLocaleString()}</p>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        {notifications.length > 0 && unreadCount > 0 && (
          <>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem onClick={markAllAsRead} className="justify-center text-brand-orange hover:!bg-brand-orange/10 hover:!text-brand-orange py-2">
              Mark all as read
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
"use client";
import React, { useEffect, useState } from 'react';
import { Bell, Check } from 'lucide-react';
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
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  // user_id: string; // Asumo que target_id es el user_id del admin o el perfil relevante
  title: string;
  message: string; // Usaré 'content' como 'message'
  type: string;
  read: boolean; // Usaré 'read_status' como 'read'
  created_at: string;
  data?: any;
}

export const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      const { data, error, count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id) // Filtrar por el admin actual
        // .eq('role', 'admin') // O si tienes un campo 'role'
        .order('created_at', { ascending: false })
        .limit(10); // Limitar para no sobrecargar

      if (error) {
        toast.error("Failed to load notifications: " + error.message);
      } else {
        setNotifications(data as Notification[] || []);
        const unread = data?.filter(n => !n.read_status).length || 0;
        setUnreadCount(unread);
      }
    };

    fetchNotifications();

    const notificationsChannel = supabase
      .channel('public:notifications:admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          toast.info("You have a new notification!");
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsChannel);
    };
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read_status: true })
      .eq('id', notificationId);

    if (error) {
      toast.error("Failed to mark notification as read.");
    } else {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };
  
  const markAllAsRead = async () => {
    if (!user) return;
    const unreadNotificationIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadNotificationIds.length === 0) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read_status: true })
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
                onClick={() => !notif.read && markAsRead(notif.id)}
              >
                {/* Icon based on type could be added here */}
                <div className="flex-shrink-0 pt-0.5">
                  {!notif.read ? <Bell className="h-4 w-4 text-brand-orange" /> : <Check className="h-4 w-4 text-muted-foreground" />}
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
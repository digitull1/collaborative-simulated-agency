import { Check, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { NotificationFilters } from "./notifications/NotificationFilters";
import { NotificationItem } from "./notifications/NotificationItem";
import type { Notification } from "@/types/notification";

export const NotificationPanel = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "agent" | "system">("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .order('timestamp', { ascending: false });

        if (error) throw error;
        setNotifications(data);
      } catch (error) {
        console.error('Error loading notifications:', error);
        toast({
          title: "Error",
          description: "Failed to load notifications",
          variant: "destructive",
        });
      }
    };

    loadNotifications();

    // Subscribe to real-time notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          
          // Show toast for new notification
          toast({
            title: newNotification.type === 'agent_response' ? "New Agent Response" : "New Notification",
            description: newNotification.content,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );

      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to update notifications",
        variant: "destructive",
      });
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notification.id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n =>
          n.id === notification.id ? { ...n, read: true } : n
        )
      );

      if (notification.thread_id) {
        navigate(`/thread/${notification.thread_id}`);
      }
    } catch (error) {
      console.error('Error handling notification:', error);
      toast({
        title: "Error",
        description: "Failed to update notification",
        variant: "destructive",
      });
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (unreadOnly && notification.read) return false;
    if (filter === "all") return true;
    return notification.type.startsWith(filter);
  });

  return (
    <div className="space-y-2 p-4 bg-background rounded-lg border border-border">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={markAllAsRead}
          className="hover:bg-secondary"
        >
          <Check className="w-4 h-4 mr-2" />
          Mark all as read
        </Button>
      </div>

      <NotificationFilters
        filter={filter}
        setFilter={setFilter}
        unreadOnly={unreadOnly}
        setUnreadOnly={setUnreadOnly}
      />

      <ScrollArea className="h-[300px]">
        <div className="space-y-2">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="w-8 h-8 mb-2" />
              <p>No notifications to show</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={handleNotificationClick}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
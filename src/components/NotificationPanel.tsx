import { Bell, Check, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Notification = {
  id: string;
  type: string;
  content: string;
  sender: string;
  timestamp: string;
  read: boolean;
};

export const NotificationPanel = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "campaign" | "insight">("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;

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
          setNotifications(prev => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

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

  const filteredNotifications = notifications.filter(notification => {
    if (unreadOnly && notification.read) return false;
    if (filter === "all") return true;
    return notification.type === filter;
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-2 mb-2">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={filter === "all" ? "bg-sidebar-accent" : ""}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={filter === "campaign" ? "bg-sidebar-accent" : ""}
            onClick={() => setFilter("campaign")}
          >
            Campaign
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={filter === "insight" ? "bg-sidebar-accent" : ""}
            onClick={() => setFilter("insight")}
          >
            Insights
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={markAllAsRead}
        >
          <Check className="w-4 h-4" />
        </Button>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => setUnreadOnly(!unreadOnly)}
      >
        <Filter className="w-4 h-4 mr-2" />
        {unreadOnly ? "Show All" : "Show Unread Only"}
      </Button>

      <ScrollArea className="h-[300px]">
        <div className="space-y-1">
          {filteredNotifications.map((notification) => (
            <button
              key={notification.id}
              className="flex items-start w-full p-2 text-sm rounded-md hover:bg-sidebar-accent group"
            >
              <Bell className="w-4 h-4 mt-0.5 mr-2 shrink-0" />
              <div className="flex-1 text-left">
                <div className="font-medium flex items-center justify-between">
                  <span>{notification.type}</span>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{notification.content}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{notification.sender}</span>
                  <span>{new Date(notification.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
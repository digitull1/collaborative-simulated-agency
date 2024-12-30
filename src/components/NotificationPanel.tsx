import { Bell, Check, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const notifications = [
  {
    id: 1,
    title: "Campaign Update",
    message: "Sophia has updated the campaign strategy",
    time: "5m ago",
    unread: true,
    type: "campaign",
    sender: "Sophia Harper"
  },
  {
    id: 2,
    title: "New Insight",
    message: "Noor discovered a trending pattern",
    time: "15m ago",
    unread: true,
    type: "insight",
    sender: "Noor Patel"
  },
  {
    id: 3,
    title: "Goal Achieved",
    message: "Monthly engagement target reached",
    time: "1h ago",
    unread: false,
    type: "achievement",
    sender: "Taylor Brooks"
  },
];

type NotificationType = "campaign" | "insight" | "achievement" | "all";

export const NotificationPanel = () => {
  const { toast } = useToast();
  const [filter, setFilter] = useState<NotificationType>("all");
  const [unreadOnly, setUnreadOnly] = useState(false);

  const filteredNotifications = notifications.filter(notification => {
    if (unreadOnly && !notification.unread) return false;
    if (filter === "all") return true;
    return notification.type === filter;
  });

  const markAllAsRead = () => {
    // In a real app, this would call an API
    toast({
      title: "Success",
      description: "All notifications marked as read",
    });
  };

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
                  <span>{notification.title}</span>
                  {notification.unread && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{notification.message}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{notification.sender}</span>
                  <span>{notification.time}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
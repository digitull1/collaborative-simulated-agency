import { Bell } from "lucide-react";

const notifications = [
  {
    id: 1,
    title: "Campaign Update",
    message: "Sophia has updated the campaign strategy",
    time: "5m ago",
    unread: true,
  },
  {
    id: 2,
    title: "New Insight",
    message: "Noor discovered a trending pattern",
    time: "15m ago",
    unread: true,
  },
  {
    id: 3,
    title: "Goal Achieved",
    message: "Monthly engagement target reached",
    time: "1h ago",
    unread: false,
  },
];

export const NotificationPanel = () => {
  return (
    <div className="space-y-1">
      {notifications.map((notification) => (
        <button
          key={notification.id}
          className="flex items-start w-full p-2 text-sm rounded-md hover:bg-sidebar-accent group"
        >
          <Bell className="w-4 h-4 mt-0.5 mr-2 shrink-0" />
          <div className="flex-1 text-left">
            <div className="font-medium">{notification.title}</div>
            <p className="text-xs text-muted-foreground">{notification.message}</p>
            <span className="text-xs text-muted-foreground">{notification.time}</span>
          </div>
          {notification.unread && (
            <div className="w-2 h-2 mt-1 rounded-full bg-primary" />
          )}
        </button>
      ))}
    </div>
  );
};
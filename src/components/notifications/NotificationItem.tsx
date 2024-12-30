import { Bell } from "lucide-react";
import type { Notification } from "@/types/notification";

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
}

export const NotificationItem = ({ notification, onClick }: NotificationItemProps) => {
  return (
    <button
      onClick={() => onClick(notification)}
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
  );
};
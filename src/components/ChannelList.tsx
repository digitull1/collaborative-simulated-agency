import { MessageSquare } from "lucide-react";

const channels = [
  {
    id: "campaign-planning",
    name: "Campaign Planning",
    unreadCount: 2,
  },
  {
    id: "data-insights",
    name: "Data Insights",
    unreadCount: 0,
  },
  {
    id: "creative-ideas",
    name: "Creative Ideas",
    unreadCount: 5,
  },
  {
    id: "budget-management",
    name: "Budget Management",
    unreadCount: 0,
  },
];

interface ChannelListProps {
  onSelectChannel: (channel: typeof channels[0]) => void;
}

export const ChannelList = ({ onSelectChannel }: ChannelListProps) => {
  return (
    <div className="space-y-1">
      {channels.map((channel) => (
        <button
          key={channel.id}
          onClick={() => onSelectChannel(channel)}
          className="flex items-center w-full px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent group"
        >
          <MessageSquare className="w-4 h-4 mr-2 shrink-0" />
          <span className="truncate"># {channel.name}</span>
          {channel.unreadCount > 0 && (
            <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
              {channel.unreadCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};
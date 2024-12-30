import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChannelList } from "@/components/ChannelList";
import { AgentList } from "@/components/AgentList";
import { NotificationPanel } from "@/components/NotificationPanel";
import { ChatArea } from "@/components/ChatArea";
import { useState } from "react";

export type ChatTarget = {
  type: "agent" | "channel";
  id: number | string;
  name: string;
};

export const SlackLayout = () => {
  const [activeChatTarget, setActiveChatTarget] = useState<ChatTarget>({
    type: "agent",
    id: 1,
    name: "Sophia Harper"
  });

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <div className="w-64 border-r border-border bg-sidebar">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-6">
            <div>
              <h2 className="px-2 mb-2 text-lg font-semibold">Agents</h2>
              <AgentList onSelectAgent={(agent) => 
                setActiveChatTarget({
                  type: "agent",
                  id: agent.id,
                  name: agent.name
                })
              } />
            </div>
            
            <Separator className="mx-2" />
            
            <div>
              <h2 className="px-2 mb-2 text-lg font-semibold">Channels</h2>
              <ChannelList onSelectChannel={(channel) =>
                setActiveChatTarget({
                  type: "channel",
                  id: channel.id,
                  name: channel.name
                })
              } />
            </div>
            
            <Separator className="mx-2" />
            
            <div>
              <h2 className="px-2 mb-2 text-lg font-semibold">Notifications</h2>
              <NotificationPanel />
            </div>
          </div>
        </ScrollArea>
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1">
        <ChatArea chatTarget={activeChatTarget} />
      </div>
    </div>
  );
};
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChannelList } from "@/components/ChannelList";
import { AgentList } from "@/components/AgentList";
import { NotificationPanel } from "@/components/NotificationPanel";
import { ChatArea } from "@/components/ChatArea";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

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
  
  const [sectionsState, setSectionsState] = useState({
    agents: true,
    channels: true,
    notifications: true
  });

  const toggleSection = (section: keyof typeof sectionsState) => {
    setSectionsState(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Enhanced Left Sidebar */}
      <div className="w-64 border-r border-border bg-sidebar">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            <Collapsible
              defaultOpen={sectionsState.agents}
              onOpenChange={() => toggleSection('agents')}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="px-2 text-lg font-semibold">Agents</h2>
                <CollapsibleTrigger className="p-2 hover:bg-sidebar-accent rounded-md">
                  {sectionsState.agents ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <AgentList onSelectAgent={(agent) => 
                  setActiveChatTarget({
                    type: "agent",
                    id: agent.id,
                    name: agent.name
                  })
                } />
              </CollapsibleContent>
            </Collapsible>
            
            <Separator className="mx-2" />
            
            <Collapsible
              defaultOpen={sectionsState.channels}
              onOpenChange={() => toggleSection('channels')}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="px-2 text-lg font-semibold">Channels</h2>
                <CollapsibleTrigger className="p-2 hover:bg-sidebar-accent rounded-md">
                  {sectionsState.channels ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <ChannelList onSelectChannel={(channel) =>
                  setActiveChatTarget({
                    type: "channel",
                    id: channel.id,
                    name: channel.name
                  })
                } />
              </CollapsibleContent>
            </Collapsible>
            
            <Separator className="mx-2" />
            
            <Collapsible
              defaultOpen={sectionsState.notifications}
              onOpenChange={() => toggleSection('notifications')}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="px-2 text-lg font-semibold">Notifications</h2>
                <CollapsibleTrigger className="p-2 hover:bg-sidebar-accent rounded-md">
                  {sectionsState.notifications ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <NotificationPanel />
              </CollapsibleContent>
            </Collapsible>
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
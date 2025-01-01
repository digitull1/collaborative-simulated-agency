import { ScrollArea } from "@/components/ui/scroll-area";
import { ChannelList } from "@/components/ChannelList";
import { AgentList } from "@/components/AgentList";
import { Separator } from "@/components/ui/separator";
import type { ChatTarget } from "@/components/SlackLayout";

interface SidebarProps {
  onSelectChannel: (channel: { id: string; name: string; unreadCount: number }) => void;
  onSelectAgent: (agent: { id: number; name: string }) => void;
  activeTarget: ChatTarget | null;
}

export const Sidebar = ({ onSelectChannel, onSelectAgent, activeTarget }: SidebarProps) => {
  return (
    <div className="w-64 border-r border-border bg-sidebar fixed left-0 top-0 h-screen">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          <div>
            <h2 className="px-2 text-lg font-semibold mb-2">Channels</h2>
            <ChannelList 
              onSelectChannel={onSelectChannel}
            />
          </div>
          
          <Separator className="mx-2" />
          
          <div>
            <h2 className="px-2 text-lg font-semibold mb-2">Agents</h2>
            <AgentList 
              onSelectAgent={onSelectAgent}
              activeAgentId={activeTarget?.type === 'agent' ? Number(activeTarget.id) : undefined}
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
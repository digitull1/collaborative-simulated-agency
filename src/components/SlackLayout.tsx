import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChannelList } from "@/components/ChannelList";
import { AgentList } from "@/components/AgentList";
import { NotificationPanel } from "@/components/NotificationPanel";
import { ChatArea } from "@/components/ChatArea";
import { useState, useEffect } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export type ChatTarget = {
  type: "agent" | "channel";
  id: number | string;
  name: string;
};

export const SlackLayout = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeChatTarget, setActiveChatTarget] = useState<ChatTarget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [sectionsState, setSectionsState] = useState({
    channels: true,
    agents: true,
    notifications: true
  });

  useEffect(() => {
    const loadLastActiveChannel = async () => {
      if (!user) return;
      
      try {
        // First try to get the last active thread
        const { data: lastThread, error: threadError } = await supabase
          .from('threads')
          .select('*')
          .eq('type', 'channel')
          .order('last_message_at', { ascending: false })
          .limit(1)
          .single();

        if (threadError && threadError.code !== 'PGRST116') {
          throw threadError;
        }

        if (lastThread) {
          setActiveChatTarget({
            type: 'channel',
            id: lastThread.id,
            name: lastThread.title
          });
        } else {
          // If no active channel found, default to first agent
          setActiveChatTarget({
            type: "agent",
            id: 1,
            name: "Sophia Harper"
          });
        }
      } catch (error) {
        console.error('Error loading last active channel:', error);
        toast({
          title: "Error",
          description: "Failed to load your last conversation. Starting a new one.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadLastActiveChannel();
  }, [user, toast]);

  const toggleSection = (section: keyof typeof sectionsState) => {
    setSectionsState(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading your workspace...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <div className="w-64 border-r border-border bg-sidebar">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {/* Channels Section First */}
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
                <ChannelList 
                  onSelectChannel={(channel) =>
                    setActiveChatTarget({
                      type: "channel",
                      id: channel.id,
                      name: channel.name
                    })
                  }
                  activeChannelId={activeChatTarget?.type === 'channel' ? activeChatTarget.id : undefined}
                />
              </CollapsibleContent>
            </Collapsible>
            
            <Separator className="mx-2" />
            
            {/* Agents Section Below Channels */}
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
                <AgentList 
                  onSelectAgent={(agent) =>
                    setActiveChatTarget({
                      type: "agent",
                      id: agent.id,
                      name: agent.name
                    })
                  }
                  activeAgentId={activeChatTarget?.type === 'agent' ? Number(activeChatTarget.id) : undefined}
                />
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
      
      {/* Main Chat Area with Fixed Right Panel */}
      <div className="flex-1 flex">
        <div className="flex-1 overflow-hidden">
          {activeChatTarget ? (
            <ChatArea chatTarget={activeChatTarget} />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Select a channel or agent to start chatting
            </div>
          )}
        </div>
        {/* Fixed Right Panel - Similar to ChatGPT */}
        <div className="w-64 border-l border-border bg-sidebar p-4">
          <h3 className="font-semibold mb-4">Context & Resources</h3>
          {/* Add your right panel content here */}
        </div>
      </div>
    </div>
  );
};
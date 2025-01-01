import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { MainHeader } from "@/components/layout/MainHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { MainContent } from "@/components/layout/MainContent";

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

  useEffect(() => {
    const loadLastActiveChannel = async () => {
      if (!user) return;
      
      try {
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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading your workspace...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        onSelectChannel={(channel) =>
          setActiveChatTarget({
            type: "channel",
            id: channel.id,
            name: channel.name
          })
        }
        onSelectAgent={(agent) =>
          setActiveChatTarget({
            type: "agent",
            id: agent.id,
            name: agent.name
          })
        }
        activeTarget={activeChatTarget}
      />
      
      <div className="flex-1 ml-64">
        <MainHeader />
        <main className="pt-14 h-[calc(100vh-3.5rem)]">
          <MainContent chatTarget={activeChatTarget} />
        </main>
      </div>
    </div>
  );
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const agents = [
  {
    id: 1,
    name: "Sophia Harper",
    role: "Campaign Architect",
    avatar: "/avatars/sophia.png",
    status: "online",
  },
  {
    id: 2,
    name: "Noor Patel",
    role: "Data Whisperer",
    avatar: "/avatars/noor.png",
    status: "online",
  },
  {
    id: 3,
    name: "Riley Kim",
    role: "Viral Visionary",
    avatar: "/avatars/riley.png",
    status: "online",
  },
  {
    id: 4,
    name: "Taylor Brooks",
    role: "ROI Master",
    avatar: "/avatars/taylor.png",
    status: "online",
  },
  {
    id: 5,
    name: "Morgan Blake",
    role: "Automation Pro",
    avatar: "/avatars/morgan.png",
    status: "online",
  },
];

interface AgentListProps {
  onSelectAgent: (agent: typeof agents[0]) => void;
  activeAgentId?: number;
}

export const AgentList = ({ onSelectAgent, activeAgentId }: AgentListProps) => {
  const { toast } = useToast();
  const [typingAgents, setTypingAgents] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Subscribe to real-time typing indicators
    const channel = supabase.channel('typing-indicators')
      .on(
        'broadcast',
        { event: 'typing' },
        ({ payload }) => {
          if (payload.agentId) {
            setTypingAgents(prev => {
              const newSet = new Set(prev);
              newSet.add(payload.agentId);
              // Remove typing indicator after 3 seconds
              setTimeout(() => {
                setTypingAgents(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(payload.agentId);
                  return newSet;
                });
              }, 3000);
              return newSet;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAgentClick = async (agent: typeof agents[0]) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error("User must be logged in");
      }

      // Check for existing thread
      const { data: existingThread, error: fetchError } = await supabase
        .from('threads')
        .select('*')
        .eq('type', 'agent')
        .eq('title', agent.name)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!existingThread) {
        // Create new thread with proper participants array
        const { data: newThread, error: createError } = await supabase
          .from('threads')
          .insert([
            {
              type: 'agent',
              title: agent.name,
              participants: [user.id, agent.name],
              last_message: null,
              last_message_at: null
            }
          ])
          .select()
          .single();

        if (createError) throw createError;
      }

      onSelectAgent(agent);
    } catch (error) {
      console.error('Error managing thread:', error);
      toast({
        title: "Error",
        description: "Failed to open chat thread. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-1">
      {agents.map((agent) => (
        <button
          key={agent.id}
          onClick={() => handleAgentClick(agent)}
          className={`flex items-center w-full space-x-4 rounded-lg p-2 hover:bg-sidebar-accent cursor-pointer transition-colors ${
            activeAgentId === agent.id ? 'bg-sidebar-accent' : ''
          }`}
        >
          <div className="relative">
            <Avatar>
              <AvatarImage src={agent.avatar} alt={agent.name} />
              <AvatarFallback>{agent.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
            </Avatar>
            <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
              agent.status === "online" ? "bg-green-500" : "bg-gray-500"
            }`} />
          </div>
          <div className="text-left flex-1">
            <h3 className="font-medium text-sm">{agent.name}</h3>
            <p className="text-xs text-muted-foreground">{agent.role}</p>
            {typingAgents.has(agent.id) && (
              <p className="text-xs text-muted-foreground animate-pulse">
                typing...
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};
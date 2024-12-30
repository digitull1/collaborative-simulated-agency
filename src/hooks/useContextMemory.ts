import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectDetails {
  project_name: string;
  goals: string;
  milestones: string[];
  active_agents: string[];
}

interface ConversationEntry {
  agent_name: string;
  timestamp: string;
  message: string;
}

export interface ContextMemory {
  project_details: ProjectDetails;
  conversation_history: ConversationEntry[];
}

export const useContextMemory = (threadId: string | null) => {
  const [contextMemory, setContextMemory] = useState<ContextMemory | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!threadId || !user) return;

    const loadContextMemory = async () => {
      try {
        const { data, error } = await supabase
          .from('context_memory')
          .select('*')
          .eq('thread_id', threadId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          // Ensure the data matches our expected types
          const projectDetails = data.project_details as ProjectDetails;
          const conversationHistory = data.conversation_history as ConversationEntry[];
          
          setContextMemory({
            project_details: projectDetails,
            conversation_history: conversationHistory
          });
        } else {
          // Initialize new context memory with proper types
          const { error: insertError } = await supabase
            .from('context_memory')
            .insert([{
              thread_id: threadId,
              user_id: user.id,
              agent_name: 'System',
              project_details: {
                project_name: 'AIGency Project',
                goals: 'Enhance marketing strategies with AI',
                milestones: [],
                active_agents: []
              } as ProjectDetails,
              conversation_history: [] as ConversationEntry[]
            }]);

          if (insertError) throw insertError;
        }
      } catch (error) {
        console.error('Error loading context memory:', error);
        toast({
          title: "Error",
          description: "Failed to load context memory",
          variant: "destructive",
        });
      }
    };

    loadContextMemory();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`context_memory_${threadId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'context_memory',
          filter: `thread_id=eq.${threadId}`
        },
        (payload) => {
          if (payload.new) {
            const newData = payload.new;
            setContextMemory({
              project_details: newData.project_details as ProjectDetails,
              conversation_history: newData.conversation_history as ConversationEntry[]
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, user, toast]);

  return contextMemory;
};
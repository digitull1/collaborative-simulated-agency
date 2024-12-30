import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface ContextMemory {
  project_details: {
    project_name: string;
    goals: string;
    milestones: string[];
    active_agents: string[];
  };
  conversation_history: Array<{
    agent_name: string;
    timestamp: string;
    message: string;
  }>;
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
          .single();

        if (error) throw error;

        if (data) {
          setContextMemory({
            project_details: data.project_details,
            conversation_history: data.conversation_history
          });
        } else {
          // Initialize new context memory
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
              },
              conversation_history: []
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
            setContextMemory({
              project_details: payload.new.project_details,
              conversation_history: payload.new.conversation_history
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
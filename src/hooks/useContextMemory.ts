import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

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

type ContextMemoryRow = Database['public']['Tables']['context_memory']['Row'];

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
          // Type assertion with validation
          const projectDetails = data.project_details as unknown;
          const conversationHistory = data.conversation_history as unknown;

          // Validate project details structure
          if (
            typeof projectDetails === 'object' && 
            projectDetails !== null &&
            'project_name' in projectDetails &&
            'goals' in projectDetails &&
            'milestones' in projectDetails &&
            'active_agents' in projectDetails
          ) {
            const typedProjectDetails = projectDetails as ProjectDetails;
            const typedConversationHistory = Array.isArray(conversationHistory) 
              ? conversationHistory as ConversationEntry[]
              : [];

            setContextMemory({
              project_details: typedProjectDetails,
              conversation_history: typedConversationHistory
            });
          }
        } else {
          // Initialize new context memory with default values
          const defaultProjectDetails: ProjectDetails = {
            project_name: 'AIGency Project',
            goals: 'Enhance marketing strategies with AI',
            milestones: [],
            active_agents: []
          };

          const { error: insertError } = await supabase
            .from('context_memory')
            .insert({
              thread_id: threadId,
              user_id: user.id,
              agent_name: 'System',
              project_details: defaultProjectDetails,
              conversation_history: []
            } satisfies Partial<ContextMemoryRow>);

          if (insertError) throw insertError;

          setContextMemory({
            project_details: defaultProjectDetails,
            conversation_history: []
          });
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
            const newData = payload.new as ContextMemoryRow;
            const projectDetails = newData.project_details as unknown;
            const conversationHistory = newData.conversation_history as unknown;

            if (
              typeof projectDetails === 'object' && 
              projectDetails !== null &&
              'project_name' in projectDetails &&
              'goals' in projectDetails &&
              'milestones' in projectDetails &&
              'active_agents' in projectDetails
            ) {
              setContextMemory({
                project_details: projectDetails as ProjectDetails,
                conversation_history: Array.isArray(conversationHistory) 
                  ? conversationHistory as ConversationEntry[]
                  : []
              });
            }
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
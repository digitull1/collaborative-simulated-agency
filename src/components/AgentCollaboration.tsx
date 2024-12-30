import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { CollaborationLog, CollaborationRequest } from "@/types/collaboration";
import { CollaborationRequest } from "./collaboration/CollaborationRequest";
import { CollaborationHistory } from "./collaboration/CollaborationHistory";
import { CollaborationMetrics } from "./collaboration/CollaborationMetrics";

interface AgentCollaborationProps {
  projectId: string;
  currentAgent: string;
}

export const AgentCollaboration = ({ projectId, currentAgent }: AgentCollaborationProps) => {
  const [collaborationLogs, setCollaborationLogs] = useState<CollaborationLog[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadCollaborationLogs = async () => {
      if (!projectId) return;
      
      try {
        const { data, error } = await supabase
          .from('agent_collaboration_logs')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCollaborationLogs(data);
      } catch (error) {
        console.error('Error loading collaboration logs:', error);
      }
    };

    loadCollaborationLogs();

    const channel = supabase
      .channel('agent_collaboration')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_collaboration_logs',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newLog = payload.new as CollaborationLog;
            setCollaborationLogs(prev => [newLog, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const handleCollaborationRequest = async (request: CollaborationRequest) => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "Project ID is required to send a collaboration request.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Record the collaboration request
      const { error: logError } = await supabase
        .from("agent_collaboration_logs")
        .insert([
          {
            project_id: projectId,
            requesting_agent: currentAgent,
            target_agent: request.target_agent,
            message: request.message,
          },
        ]);

      if (logError) throw logError;

      // Record metrics for the collaboration
      await supabase
        .from("collaboration_metrics")
        .insert([
          {
            workflow_id: projectId,
            agent_name: currentAgent,
            metric_type: 'collaboration_requests',
            value: 1,
            details: { target_agent: request.target_agent }
          },
        ]);

      // Create a notification for the target agent
      await supabase
        .from("notifications")
        .insert([
          {
            type: "collaboration",
            sender: currentAgent,
            content: `Requested expertise: ${request.message}`,
            thread_id: projectId,
          },
        ]);

      toast({
        title: "Success",
        description: "Collaboration request sent successfully.",
      });
    } catch (error) {
      console.error('Error sending collaboration request:', error);
      toast({
        title: "Error",
        description: "Failed to send request. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <CollaborationRequest onSubmit={handleCollaborationRequest} />
        <CollaborationHistory logs={collaborationLogs} />
      </div>
      <CollaborationMetrics workflowId={projectId} />
    </div>
  );
};
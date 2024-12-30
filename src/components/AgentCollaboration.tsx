import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { CollaborationLog, CollaborationRequestData } from "@/types/collaboration";
import { CollaborationRequestForm } from "./collaboration/CollaborationRequest";
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
      if (!projectId) {
        console.log('No project ID provided');
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('agent_collaboration_logs')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCollaborationLogs(data || []);
      } catch (error) {
        console.error('Error loading collaboration logs:', error);
        toast({
          title: "Error",
          description: "Failed to load collaboration logs. Please try again.",
          variant: "destructive",
        });
      }
    };

    loadCollaborationLogs();

    // Only set up real-time subscription if we have a valid projectId
    if (projectId) {
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
    }
  }, [projectId, toast]);

  const handleCollaborationRequest = async (request: CollaborationRequestData) => {
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
      const { error: metricsError } = await supabase
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

      if (metricsError) throw metricsError;

      // Create a notification for the target agent
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert([
          {
            type: "collaboration",
            sender: currentAgent,
            content: `Requested expertise: ${request.message}`,
            thread_id: projectId,
          },
        ]);

      if (notificationError) throw notificationError;

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

  // If no projectId is provided, show a message
  if (!projectId) {
    return (
      <div className="flex items-center justify-center p-4 text-muted-foreground">
        No project selected
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <CollaborationRequestForm onSubmit={handleCollaborationRequest} />
          <CollaborationHistory logs={collaborationLogs} />
        </div>
        <CollaborationMetrics workflowId={projectId} />
      </div>
    </div>
  );
};
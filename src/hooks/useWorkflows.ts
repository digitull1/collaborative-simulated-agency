import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { WorkflowWithDetails } from "@/types/workflow";

export const useWorkflows = (projectId: string) => {
  const [workflows, setWorkflows] = useState<WorkflowWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const { data: workflowsData, error: workflowsError } = await supabase
          .from("workflows")
          .select("*")
          .eq("project_id", projectId);

        if (workflowsError) throw workflowsError;

        const workflowsWithDetails = await Promise.all(
          workflowsData.map(async (workflow) => {
            const [
              { data: assignments },
              { data: dependencies },
              { data: updates },
            ] = await Promise.all([
              supabase
                .from("workflow_assignments")
                .select("*")
                .eq("workflow_id", workflow.id),
              supabase
                .from("workflow_dependencies")
                .select("*")
                .eq("workflow_id", workflow.id),
              supabase
                .from("workflow_updates")
                .select("*")
                .eq("workflow_id", workflow.id)
                .order("created_at", { ascending: false }),
            ]);

            return {
              ...workflow,
              assignments: assignments || [],
              dependencies: dependencies || [],
              updates: updates || [],
            };
          })
        );

        setWorkflows(workflowsWithDetails);
      } catch (error) {
        console.error("Error fetching workflows:", error);
        toast({
          title: "Error",
          description: "Failed to load workflows. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflows();

    // Subscribe to real-time updates
    const workflowsChannel = supabase
      .channel("workflows-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workflows",
        },
        (payload) => {
          console.log("Workflow change:", payload);
          // Refresh workflows when changes occur
          fetchWorkflows();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(workflowsChannel);
    };
  }, [projectId, toast]);

  return { workflows, isLoading };
};
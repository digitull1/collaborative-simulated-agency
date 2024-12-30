import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { WorkflowWithDetails } from "@/types/workflow";

export const useWorkflows = (projectId: string) => {
  const [workflows, setWorkflows] = useState<WorkflowWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkflows = async () => {
    if (!projectId) {
      setWorkflows([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
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
              .eq("workflow_id", workflow.id),
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
      setWorkflows([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [projectId]);

  return {
    workflows,
    isLoading,
    refetch: fetchWorkflows,
  };
};
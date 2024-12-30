import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { WorkflowWithDetails } from "@/types/workflow";

class WorkflowManager {
  public async createWorkflow(
    projectId: string,
    name: string,
    description?: string
  ) {
    try {
      const { data, error } = await supabase
        .from("workflows")
        .insert([{ project_id: projectId, name, description }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating workflow:", error);
      toast({
        title: "Error",
        description: "Failed to create workflow. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }

  public async assignAgent(workflowId: string, agentName: string, role?: string) {
    try {
      const { error } = await supabase
        .from("workflow_assignments")
        .insert([{ workflow_id: workflowId, agent_name: agentName, role }]);

      if (error) throw error;
    } catch (error) {
      console.error("Error assigning agent:", error);
      toast({
        title: "Error",
        description: "Failed to assign agent. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }

  public async addUpdate(
    workflowId: string,
    agentName: string,
    updateType: string,
    content: string
  ) {
    try {
      const { error } = await supabase.from("workflow_updates").insert([
        {
          workflow_id: workflowId,
          agent_name: agentName,
          update_type: updateType,
          content,
        },
      ]);

      if (error) throw error;
    } catch (error) {
      console.error("Error adding update:", error);
      toast({
        title: "Error",
        description: "Failed to add update. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }

  public async updateStatus(workflowId: string, status: string) {
    try {
      const { error } = await supabase
        .from("workflows")
        .update({ status })
        .eq("id", workflowId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating workflow status:", error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }
}

export const workflowManager = new WorkflowManager();
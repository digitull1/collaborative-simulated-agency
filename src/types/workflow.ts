import type { Database } from "@/integrations/supabase/types";

export type Workflow = Database["public"]["Tables"]["workflows"]["Row"];
export type WorkflowAssignment = Database["public"]["Tables"]["workflow_assignments"]["Row"];
export type WorkflowDependency = Database["public"]["Tables"]["workflow_dependencies"]["Row"];
export type WorkflowUpdate = Database["public"]["Tables"]["workflow_updates"]["Row"];

export type WorkflowWithDetails = Workflow & {
  assignments: WorkflowAssignment[];
  dependencies: WorkflowDependency[];
  updates: WorkflowUpdate[];
};
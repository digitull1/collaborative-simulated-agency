import type { Database } from "@/integrations/supabase/types";

export type CollaborationLog = Database["public"]["Tables"]["agent_collaboration_logs"]["Row"];

export interface CollaborationRequestData {
  target_agent: string;
  message: string;
}
import type { Json } from '@/integrations/supabase/types';

export interface Task {
  id: string;
  agent_name: string;
  description: string;
  status: string;
  dependencies: string[];
  created_by: string;
  created_at: string;
  project_id: string | null;
  last_updated: string | null;
}

export interface TaskFromDB {
  id: string;
  agent_name: string;
  description: string;
  status: string;
  dependencies: Json;
  created_by: string;
  created_at: string;
  project_id: string | null;
  last_updated: string | null;
}

export const convertTaskFromDB = (task: TaskFromDB): Task => ({
  ...task,
  dependencies: Array.isArray(task.dependencies) 
    ? task.dependencies.map(dep => String(dep)) // Convert each dependency to string
    : []
});
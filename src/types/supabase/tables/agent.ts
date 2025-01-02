export interface AgentTables {
  agent_mentions: {
    Row: {
      id: string;
      thread_id: string | null;
      message_id: string | null;
      agent_name: string;
      mentioned_at: string | null;
      resolved: boolean | null;
      context: Record<string, any> | null;
    };
    Insert: {
      id?: string;
      thread_id?: string | null;
      message_id?: string | null;
      agent_name: string;
      mentioned_at?: string | null;
      resolved?: boolean | null;
      context?: Record<string, any> | null;
    };
    Update: {
      id?: string;
      thread_id?: string | null;
      message_id?: string | null;
      agent_name?: string;
      mentioned_at?: string | null;
      resolved?: boolean | null;
      context?: Record<string, any> | null;
    };
    Relationships: [
      {
        foreignKeyName: "agent_mentions_message_id_fkey";
        columns: ["message_id"];
        isOneToOne: false;
        referencedRelation: "thread_messages";
        referencedColumns: ["id"];
      },
      {
        foreignKeyName: "agent_mentions_thread_id_fkey";
        columns: ["thread_id"];
        isOneToOne: false;
        referencedRelation: "threads";
        referencedColumns: ["id"];
      }
    ];
  };
  agent_collaboration_logs: {
    Row: {
      id: string;
      requesting_agent: string;
      target_agent: string;
      project_id: string | null;
      message: string;
      status: string | null;
      created_at: string | null;
    };
    Insert: {
      id?: string;
      requesting_agent: string;
      target_agent: string;
      project_id?: string | null;
      message: string;
      status?: string | null;
      created_at?: string | null;
    };
    Update: {
      id?: string;
      requesting_agent?: string;
      target_agent?: string;
      project_id?: string | null;
      message?: string;
      status?: string | null;
      created_at?: string | null;
    };
    Relationships: [
      {
        foreignKeyName: "agent_collaboration_logs_project_id_fkey";
        columns: ["project_id"];
        isOneToOne: false;
        referencedRelation: "threads";
        referencedColumns: ["id"];
      }
    ];
  };
}
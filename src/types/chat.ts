export interface ChatMessage {
  id: number;
  content: string;
  sender: string;
  timestamp: Date;
  agentId?: number;
}

export interface Agent {
  id: number;
  name: string;
  role: string;
  avatar: string;
  status: "online" | "offline";
}

export interface AgentMention {
  id: string;
  thread_id: string | null;
  message_id: string | null;
  agent_name: string;
  mentioned_at: string | null;
  resolved: boolean | null;
  context: Record<string, any> | null;
}
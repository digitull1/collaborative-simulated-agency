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
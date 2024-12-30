import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type WebSocketMessage = {
  type: 'message' | 'typing' | 'notification';
  sender: string;
  content: string;
  thread_id?: string;
  timestamp: string;
};

class WebSocketManager {
  private channel: any;
  private messageHandlers: ((message: WebSocketMessage) => void)[] = [];

  constructor() {
    this.initializeChannel();
  }

  private initializeChannel() {
    this.channel = supabase.channel('chat')
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        this.messageHandlers.forEach(handler => handler(payload));
      })
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          console.log('Connected to chat channel');
        } else if (status === 'CLOSED') {
          console.log('Disconnected from chat channel');
          toast({
            title: "Connection Lost",
            description: "Attempting to reconnect...",
            variant: "destructive",
          });
          // Attempt to reconnect after a delay
          setTimeout(() => this.initializeChannel(), 5000);
        }
      });
  }

  public onMessage(handler: (message: WebSocketMessage) => void) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  public async sendMessage(message: Omit<WebSocketMessage, 'timestamp'>) {
    try {
      await this.channel.send({
        type: 'broadcast',
        event: 'message',
        payload: {
          ...message,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  }

  public async sendTypingIndicator(sender: string, thread_id: string) {
    try {
      await this.channel.send({
        type: 'broadcast',
        event: 'message',
        payload: {
          type: 'typing',
          sender,
          thread_id,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  }

  public disconnect() {
    if (this.channel) {
      this.channel.unsubscribe();
    }
  }
}

export const wsManager = new WebSocketManager();
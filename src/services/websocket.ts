import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type WebSocketMessage = {
  type: 'message' | 'typing' | 'notification';
  sender: string;
  content: string;
  thread_id?: string;
  timestamp: string;
  typing?: boolean;
};

class WebSocketManager {
  private channel: any;
  private messageHandlers: ((message: WebSocketMessage) => void)[] = [];
  private typingHandlers: ((data: { sender: string; thread_id: string }) => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.initializeChannel();
  }

  private initializeChannel() {
    this.channel = supabase.channel('chat')
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        this.messageHandlers.forEach(handler => handler(payload));
      })
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        this.typingHandlers.forEach(handler => handler(payload));
      })
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          console.log('Connected to chat channel');
          this.reconnectAttempts = 0;
        } else if (status === 'CLOSED') {
          console.log('Disconnected from chat channel');
          this.handleDisconnect();
        }
      });
  }

  private handleDisconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      toast({
        title: "Connection Lost",
        description: "Attempting to reconnect...",
        variant: "destructive",
      });
      this.reconnectAttempts++;
      setTimeout(() => this.initializeChannel(), 5000 * this.reconnectAttempts);
    } else {
      toast({
        title: "Connection Failed",
        description: "Please refresh the page to reconnect.",
        variant: "destructive",
      });
    }
  }

  public onMessage(handler: (message: WebSocketMessage) => void) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  public onTyping(handler: (data: { sender: string; thread_id: string }) => void) {
    this.typingHandlers.push(handler);
    return () => {
      this.typingHandlers = this.typingHandlers.filter(h => h !== handler);
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
        event: 'typing',
        payload: {
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
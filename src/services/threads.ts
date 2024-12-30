import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Thread {
  id: string;
  title: string;
  last_message?: string;
  last_message_at?: string;
  participants: string[];
}

export interface ThreadMessage {
  id: string;
  thread_id: string;
  sender: string;
  content: string;
  timestamp: string;
}

class ThreadManager {
  public async createThread(title: string, participants: string[]): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('threads')
        .insert([
          { title, participants }
        ])
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating thread:', error);
      toast({
        title: "Error",
        description: "Failed to create thread. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }

  public async getThreadMessages(threadId: string): Promise<ThreadMessage[]> {
    try {
      const { data, error } = await supabase
        .from('thread_messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching thread messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }

  public async addMessage(threadId: string, message: Omit<ThreadMessage, 'id'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('thread_messages')
        .insert([{ ...message, thread_id: threadId }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error adding message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }
}

export const threadManager = new ThreadManager();
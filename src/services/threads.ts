import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

export type Thread = Database["public"]["Tables"]["threads"]["Row"];
export type ThreadMessage = Database["public"]["Tables"]["thread_messages"]["Row"];

class ThreadManager {
  private messageCache: Map<string, ThreadMessage[]> = new Map();

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

  public async getThreadMessages(threadId: string, limit = 50, offset = 0): Promise<ThreadMessage[]> {
    try {
      // Check cache first
      const cachedMessages = this.messageCache.get(threadId);
      if (cachedMessages) {
        return cachedMessages.slice(offset, offset + limit);
      }

      const { data, error } = await supabase
        .from('thread_messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('timestamp', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      
      // Update cache
      this.messageCache.set(threadId, data);
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

      // Update thread's last message
      await supabase
        .from('threads')
        .update({
          last_message: message.content,
          last_message_at: message.timestamp
        })
        .eq('id', threadId);

      // Update cache
      const cachedMessages = this.messageCache.get(threadId) || [];
      this.messageCache.set(threadId, [...cachedMessages, { ...message, id: Date.now().toString() }]);
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

  public clearCache(threadId?: string) {
    if (threadId) {
      this.messageCache.delete(threadId);
    } else {
      this.messageCache.clear();
    }
  }
}

export const threadManager = new ThreadManager();
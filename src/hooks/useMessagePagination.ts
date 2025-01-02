import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const PAGE_SIZE = 20;

export const useMessagePagination = (threadId: string | null) => {
  const [messages, setMessages] = useState<Array<{
    id: number;
    content: string;
    sender: string;
    timestamp: Date;
    agentId?: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const { toast } = useToast();

  const loadMessages = async (reset = false) => {
    if (!threadId || isLoading) return;

    try {
      setIsLoading(true);
      const newPage = reset ? 0 : page;
      const start = newPage * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('thread_messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('timestamp', { ascending: false })
        .range(start, end);

      if (error) throw error;

      // Convert timestamps to Date objects
      const formattedMessages = data.map(msg => ({
        ...msg,
        id: Number(msg.id), // Ensure ID is a number
        timestamp: new Date(msg.timestamp),
      }));

      // Deduplicate messages based on ID
      const uniqueMessages = reset ? formattedMessages : [
        ...messages,
        ...formattedMessages.filter(newMsg => 
          !messages.some(existingMsg => existingMsg.id === newMsg.id)
        )
      ];

      setMessages(uniqueMessages);
      setHasMore(data.length === PAGE_SIZE);
      setPage(prev => reset ? 0 : prev + 1);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Unable to load messages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setMessages([]);
    setPage(0);
    setHasMore(true);
    loadMessages(true);
  };

  return {
    messages,
    isLoading,
    hasMore,
    loadMore: () => loadMessages(false),
    reset,
  };
};
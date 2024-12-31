import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ChatMessage } from "@/types/chat";

export const useChannelMessages = (channelId: string) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { data: threadMessages, error } = await supabase
          .from('thread_messages')
          .select('*')
          .eq('thread_id', channelId)
          .order('timestamp', { ascending: true });

        if (error) throw error;

        const formattedMessages = threadMessages.map((msg, index) => ({
          id: index + 1,
          content: msg.content,
          sender: msg.sender,
          timestamp: new Date(msg.timestamp),
        }));

        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error loading messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive",
        });
      }
    };

    if (channelId) {
      loadMessages();
      
      // Subscribe to real-time updates
      const channel = supabase
        .channel(`channel-${channelId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'thread_messages',
            filter: `thread_id=eq.${channelId}`
          },
          (payload) => {
            const newMessage = payload.new;
            setMessages(prev => [...prev, {
              id: prev.length + 1,
              content: newMessage.content,
              sender: newMessage.sender,
              timestamp: new Date(newMessage.timestamp),
            }]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [channelId, toast]);

  return { messages, isLoading };
};
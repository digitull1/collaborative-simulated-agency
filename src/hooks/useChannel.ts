import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { fetchChannelMessages, subscribeToChannelMessages } from "@/utils/channelUtils";

export const useChannel = (channelId: string | null) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();

  const loadMessages = useCallback(async (offset = 0) => {
    if (!channelId) return;
    
    setIsLoading(true);
    try {
      const newMessages = await fetchChannelMessages(channelId, 20, offset);
      setMessages(prev => offset === 0 ? newMessages : [...prev, ...newMessages]);
      setHasMore(newMessages.length === 20);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [channelId, toast]);

  const handleNewMessage = useCallback((newMessage: any) => {
    setMessages(prev => {
      // Prevent duplicate messages
      if (prev.some(msg => msg.id === newMessage.id)) {
        return prev;
      }
      return [...prev, newMessage];
    });
  }, []);

  useEffect(() => {
    if (!channelId) return;

    loadMessages(0);
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToChannelMessages(channelId, handleNewMessage);
    
    return () => {
      unsubscribe();
    };
  }, [channelId, loadMessages, handleNewMessage]);

  return {
    messages,
    isLoading,
    hasMore,
    loadMore: () => loadMessages(messages.length),
  };
};
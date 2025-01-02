import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateAgentResponse } from '@/services/ai';

export const useChatState = (chatTarget: any, threadId: string | null) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Array<{
    id: number;
    content: string;
    sender: string;
    timestamp: Date;
    agentId?: number;
  }>>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || isLoading || !threadId) return;
    
    setIsLoading(true);
    console.log('Sending message:', newMessage);

    try {
      // Insert user message
      const { error: messageError } = await supabase
        .from('thread_messages')
        .insert([{
          thread_id: threadId,
          content: newMessage,
          sender: "You",
        }]);

      if (messageError) throw messageError;

      // Update thread's last message
      await supabase
        .from('threads')
        .update({
          last_message: newMessage,
          last_message_at: new Date().toISOString()
        })
        .eq('id', threadId);

      // Generate agent response
      const agentName = chatTarget.name;
      const chatHistory = messages.map(msg => ({
        sender: msg.sender,
        content: msg.content
      }));
      
      const response = await generateAgentResponse(agentName, newMessage, chatHistory);
      
      if (response) {
        const { error: responseError } = await supabase
          .from('thread_messages')
          .insert([{
            thread_id: threadId,
            content: response,
            sender: agentName,
          }]);

        if (responseError) throw responseError;
      }

      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [newMessage, isLoading, threadId, chatTarget, messages, toast]);

  return {
    messages,
    setMessages,
    newMessage,
    setNewMessage,
    isLoading,
    setIsLoading,
    handleSendMessage
  };
};
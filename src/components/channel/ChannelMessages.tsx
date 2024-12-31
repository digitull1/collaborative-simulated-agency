import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Messages } from "@/components/Messages";
import { MessageInput } from "@/components/MessageInput";
import { generateAgentResponse } from "@/services/ai";

interface ChannelMessagesProps {
  channelId: string;
  channelName: string;
}

export const ChannelMessages = ({ channelId, channelName }: ChannelMessagesProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Array<{
    id: number;
    content: string;
    sender: string;
    timestamp: Date;
  }>>([]);
  const [newMessage, setNewMessage] = useState("");
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

      // Subscribe to real-time message updates
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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    setIsLoading(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("User must be logged in");

      // Send user message
      const { error: messageError } = await supabase
        .from('thread_messages')
        .insert([{
          thread_id: channelId,
          content: newMessage,
          sender: user.email || "Anonymous",
        }]);

      if (messageError) throw messageError;

      // Check if message mentions any agents
      const mentionedAgents = newMessage.match(/@(\w+)/g);
      if (mentionedAgents) {
        for (const mention of mentionedAgents) {
          const agentName = mention.substring(1); // Remove @ symbol
          const chatHistory = messages.map(msg => ({
            sender: msg.sender,
            content: msg.content
          }));
          
          const response = await generateAgentResponse(agentName, newMessage, chatHistory);
          
          const { error: agentError } = await supabase
            .from('thread_messages')
            .insert([{
              thread_id: channelId,
              content: response,
              sender: agentName,
            }]);

          if (agentError) throw agentError;
        }
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
  };

  return (
    <div className="flex flex-col h-full">
      <Messages 
        messages={messages}
        isLoading={isLoading}
        chatTargetName={channelName}
      />
      
      <MessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
        isLoading={isLoading}
        placeholder={`Message #${channelName}...`}
      />
    </div>
  );
};
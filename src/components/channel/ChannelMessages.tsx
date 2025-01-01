import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Messages } from "@/components/Messages";
import { MessageInput } from "@/components/MessageInput";
import { generateAgentResponse } from "@/services/ai";
import { Loader2 } from "lucide-react";

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
    agentId?: number;
  }>>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agentTyping, setAgentTyping] = useState<string | null>(null);

  // Load initial messages and set up real-time listener
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
          agentId: msg.sender.startsWith('@') ? Number(msg.sender.substring(1)) : undefined,
        }));

        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error loading messages:', error);
        toast({
          title: "Error",
          description: "Failed to load message history. Please try again.",
          variant: "destructive",
        });
      }
    };

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
          console.log('New message received:', payload);
          setMessages(prev => [...prev, {
            id: prev.length + 1,
            content: newMessage.content,
            sender: newMessage.sender,
            timestamp: new Date(newMessage.timestamp),
            agentId: newMessage.sender.startsWith('@') ? Number(newMessage.sender.substring(1)) : undefined,
          }]);

          // Clear agent typing indicator if this is an agent response
          if (newMessage.sender.startsWith('@')) {
            setAgentTyping(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, toast]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    setIsLoading(true);

    try {
      // Extract @mentions from the message
      const mentionedAgents = newMessage.match(/@(\w+)/g);
      
      // Send user message
      const { error: messageError } = await supabase
        .from('thread_messages')
        .insert([{
          thread_id: channelId,
          content: newMessage,
          sender: "You",
        }]);

      if (messageError) throw messageError;

      // Handle agent responses for @mentions
      if (mentionedAgents) {
        for (const mention of mentionedAgents) {
          const agentName = mention.substring(1); // Remove @ symbol
          setAgentTyping(agentName);
          
          try {
            // Get chat history for context
            const chatHistory = messages.slice(-5).map(msg => ({
              sender: msg.sender,
              content: msg.content
            }));
            
            const response = await generateAgentResponse(agentName, newMessage, chatHistory);
            
            if (response) {
              const { error: agentError } = await supabase
                .from('thread_messages')
                .insert([{
                  thread_id: channelId,
                  content: response,
                  sender: `@${agentName}`,
                }]);

              if (agentError) throw agentError;
            }
          } catch (error) {
            console.error(`Error getting response from agent ${agentName}:`, error);
            toast({
              title: "Agent Error",
              description: `Failed to get response from ${agentName}. Please try again.`,
              variant: "destructive",
            });
          } finally {
            setAgentTyping(null);
          }
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
      
      {agentTyping && (
        <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{agentTyping} is typing...</span>
        </div>
      )}
      
      <MessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
        isLoading={isLoading}
        placeholder={`Message #${channelName}... Use @agent to mention an agent`}
      />
    </div>
  );
};
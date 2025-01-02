import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Messages } from "@/components/Messages";
import { MessageInput } from "@/components/MessageInput";
import { generateAgentResponse } from "@/services/ai";
import { Loader2 } from "lucide-react";
import { useMessagePagination } from "@/hooks/useMessagePagination";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface ChannelMessagesProps {
  channelId: string;
  channelName: string;
}

export const ChannelMessages = ({ channelId, channelName }: ChannelMessagesProps) => {
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agentTyping, setAgentTyping] = useState<string | null>(null);
  const { messages, isLoading: messagesLoading, hasMore, loadMore, reset } = useMessagePagination(channelId);

  const extractMentions = (message: string): string[] => {
    const mentions = message.match(/@(\w+\s+\w+|\w+)/g) || [];
    return mentions.map(mention => mention.substring(1));
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    setIsLoading(true);

    try {
      // Extract @mentions from the message
      const mentionedAgents = extractMentions(newMessage);
      
      // Send user message
      const { data: messageData, error: messageError } = await supabase
        .from('thread_messages')
        .insert([{
          thread_id: channelId,
          content: newMessage,
          sender: "You",
        }])
        .select()
        .single();

      if (messageError) throw messageError;

      // Record mentions in a separate table
      if (mentionedAgents.length > 0) {
        const { error: mentionsError } = await supabase
          .from('agent_mentions')
          .insert(
            mentionedAgents.map(agent => ({
              thread_id: channelId,
              message_id: messageData.id,
              agent_name: agent,
              context: {
                message: newMessage,
                timestamp: new Date().toISOString()
              }
            }))
          );

        if (mentionsError) {
          console.error('Error recording mentions:', mentionsError);
          // Don't throw - we want to continue even if mention recording fails
        }
      }

      // Handle agent responses
      const defaultAgent = "Sophia";
      const agentsToRespond = mentionedAgents.length > 0 ? mentionedAgents : [defaultAgent];

      for (const agent of agentsToRespond) {
        setAgentTyping(agent);
        
        try {
          const chatHistory = messages.slice(-5).map(msg => ({
            sender: msg.sender,
            content: msg.content
          }));
          
          const response = await generateAgentResponse(agent, newMessage, chatHistory);
          
          if (response) {
            const { error: agentError } = await supabase
              .from('thread_messages')
              .insert([{
                thread_id: channelId,
                content: response,
                sender: `@${agent}`,
              }]);

            if (agentError) throw agentError;
          }
        } catch (error) {
          console.error(`Error getting response from agent ${agent}:`, error);
          toast({
            title: "Agent Error",
            description: `Failed to get response from ${agent}. Please try again.`,
            variant: "destructive",
          });
        } finally {
          setAgentTyping(null);
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
      {hasMore && (
        <div className="p-2 text-center">
          <Button 
            variant="ghost" 
            onClick={() => loadMore()}
            disabled={messagesLoading}
          >
            {messagesLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
      
      <Messages 
        messages={messages}
        isLoading={messagesLoading}
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
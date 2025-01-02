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
          const agentName = mention.substring(1);
          setAgentTyping(agentName);
          
          try {
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
      } else {
        // Default to Sophia if no agent is mentioned
        setAgentTyping("Sophia");
        try {
          const chatHistory = messages.slice(-5).map(msg => ({
            sender: msg.sender,
            content: msg.content
          }));
          
          const response = await generateAgentResponse("Sophia", newMessage, chatHistory);
          
          if (response) {
            await supabase
              .from('thread_messages')
              .insert([{
                thread_id: channelId,
                content: response,
                sender: "@Sophia",
              }]);
          }
        } catch (error) {
          console.error('Error getting response from Sophia:', error);
          toast({
            title: "Agent Error",
            description: "Failed to get response from Sophia. Please try again.",
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useState } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { generateAgentResponse } from "@/services/ai";
import { useToast } from "@/components/ui/use-toast";
import type { ChatTarget } from "@/components/SlackLayout";

interface ChatAreaProps {
  chatTarget: ChatTarget;
}

export const ChatArea = ({ chatTarget }: ChatAreaProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Array<{
    id: number;
    content: string;
    sender: string;
    timestamp: Date;
    agentId?: number;
  }>>([
    {
      id: 1,
      content: chatTarget.type === "channel" 
        ? `Welcome to #${chatTarget.name}! How can our team help you today?`
        : `Welcome to AIGency! I'm ${chatTarget.name}, your ${chatTarget.type === "agent" ? "AI assistant" : "channel"}. How can I help you today?`,
      sender: chatTarget.type === "channel" ? "System" : chatTarget.name,
      timestamp: new Date(),
      agentId: chatTarget.type === "agent" ? Number(chatTarget.id) : undefined,
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;
    
    const userMessage = {
      id: messages.length + 1,
      content: newMessage,
      sender: "You",
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsLoading(true);

    try {
      const agentName = chatTarget.name;
      const chatHistory = messages.map(msg => ({
        sender: msg.sender,
        content: msg.content
      }));
      
      const response = await generateAgentResponse(agentName, newMessage, chatHistory);
      
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        content: response,
        sender: agentName,
        timestamp: new Date(),
        agentId: chatTarget.type === "agent" ? Number(chatTarget.id) : undefined,
      }]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-4">
        <h2 className="text-lg font-semibold">
          {chatTarget.type === "channel" ? `#${chatTarget.name}` : chatTarget.name}
        </h2>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="animate-pulse">
                {chatTarget.name} is typing...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="border-t border-border p-4">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${chatTarget.type === "channel" ? `#${chatTarget.name}` : chatTarget.name}...`}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button 
            onClick={handleSendMessage} 
            size="icon"
            disabled={isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
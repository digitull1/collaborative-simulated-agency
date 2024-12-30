import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useState } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { generateAgentResponse } from "@/services/ai";
import { useToast } from "@/components/ui/use-toast";

export const ChatArea = () => {
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
      content: "Welcome to AIGency! I'm Sophia, your Campaign Architect. How can our team help you today?",
      sender: "Sophia Harper",
      timestamp: new Date(),
      agentId: 1,
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
      // For now, we'll always have Sophia respond
      const agentName = "Sophia Harper";
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
        agentId: 1,
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
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="animate-pulse">Sophia is typing...</div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="border-t border-border p-4">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/ChatMessage";
import { useEffect, useRef } from "react";

interface MessagesProps {
  messages: Array<{
    id: number;
    content: string;
    sender: string;
    timestamp: Date;
    agentId?: number;
  }>;
  isLoading: boolean;
  chatTargetName: string;
}

export const Messages = ({ messages, isLoading, chatTargetName }: MessagesProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
      <div className="space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="animate-pulse">
              {chatTargetName} is typing...
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
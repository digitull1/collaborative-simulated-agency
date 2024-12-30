import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/ChatMessage";

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
  return (
    <ScrollArea className="flex-1 p-4">
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
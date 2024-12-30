import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatMessageProps {
  message: {
    id: number;
    content: string;
    sender: string;
    timestamp: Date;
    agentId?: number;
  };
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isAgent = message.agentId !== undefined;
  
  return (
    <div className={`flex items-start space-x-4 ${isAgent ? "" : "flex-row-reverse space-x-reverse"}`}>
      <Avatar>
        {isAgent ? (
          <>
            <AvatarImage src={`/avatars/${message.sender.split(" ")[0].toLowerCase()}.png`} alt={message.sender} />
            <AvatarFallback>{message.sender.split(" ").map(n => n[0]).join("")}</AvatarFallback>
          </>
        ) : (
          <>
            <AvatarImage src="/avatars/user.png" alt="You" />
            <AvatarFallback>You</AvatarFallback>
          </>
        )}
      </Avatar>
      <div className={`flex flex-col ${isAgent ? "" : "items-end"}`}>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">{message.sender}</span>
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
        <div className={`mt-1 rounded-lg p-3 ${
          isAgent ? "bg-background border border-border" : "bg-primary text-primary-foreground"
        }`}>
          {message.content}
        </div>
      </div>
    </div>
  );
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
import { useState } from "react";

interface ChatMessageProps {
  message: {
    id: number;
    content: string;
    sender: string;
    timestamp: Date | string;
    agentId?: number;
    threadId?: string;
    reactions?: {
      type: "like" | "dislike";
      count: number;
    }[];
  };
  onReply?: (messageId: number) => void;
  onReact?: (messageId: number, reaction: "like" | "dislike") => void;
}

export const ChatMessage = ({ message, onReply, onReact }: ChatMessageProps) => {
  const isAgent = message.agentId !== undefined;
  const [showActions, setShowActions] = useState(false);

  // Convert timestamp to Date if it's a string
  const timestamp = message.timestamp instanceof Date 
    ? message.timestamp 
    : new Date(message.timestamp);
  
  return (
    <div 
      className={`flex items-start space-x-4 ${isAgent ? "" : "flex-row-reverse space-x-reverse"}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
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
            {timestamp.toLocaleTimeString()}
          </span>
        </div>
        <div className={`mt-1 rounded-lg p-3 relative group ${
          isAgent ? "bg-background border border-border" : "bg-primary text-primary-foreground"
        }`}>
          {message.content}
          
          {showActions && (
            <div className={`absolute ${isAgent ? "-right-24" : "-left-24"} top-1/2 -translate-y-1/2 flex items-center gap-1`}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onReact?.(message.id, "like")}
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onReact?.(message.id, "dislike")}
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onReply?.(message.id)}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {message.reactions && message.reactions.length > 0 && (
            <div className="absolute -bottom-2 left-2 flex gap-1">
              {message.reactions.map((reaction, index) => (
                <div
                  key={index}
                  className="bg-background border border-border rounded-full px-2 py-0.5 text-xs flex items-center gap-1"
                >
                  {reaction.type === "like" ? (
                    <ThumbsUp className="h-3 w-3" />
                  ) : (
                    <ThumbsDown className="h-3 w-3" />
                  )}
                  <span>{reaction.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
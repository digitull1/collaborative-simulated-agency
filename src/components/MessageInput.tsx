import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: () => void;
  isLoading: boolean;
  placeholder: string;
}

export const MessageInput = ({
  newMessage,
  setNewMessage,
  handleSendMessage,
  isLoading,
  placeholder
}: MessageInputProps) => {
  return (
    <div className="border-t border-border p-4">
      <div className="flex space-x-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={placeholder}
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
  );
};
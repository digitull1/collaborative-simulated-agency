import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { MentionSuggestions } from "./mentions/MentionSuggestions";

const agents = [
  {
    id: 1,
    name: "Sophia Harper",
    role: "Campaign Architect",
    avatar: "/avatars/sophia.png",
  },
  {
    id: 2,
    name: "Noor Patel",
    role: "Data Whisperer",
    avatar: "/avatars/noor.png",
  },
  {
    id: 3,
    name: "Riley Kim",
    role: "Viral Visionary",
    avatar: "/avatars/riley.png",
  },
  {
    id: 4,
    name: "Taylor Brooks",
    role: "ROI Master",
    avatar: "/avatars/taylor.png",
  },
  {
    id: 5,
    name: "Morgan Blake",
    role: "Automation Pro",
    avatar: "/avatars/morgan.png",
  },
];

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
  placeholder,
}: MessageInputProps) => {
  const [mentionSearch, setMentionSearch] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const position = e.target.selectionStart || 0;
    setCursorPosition(position);

    // Check for @ symbol
    const lastAtSymbol = value.lastIndexOf("@", position);
    if (lastAtSymbol !== -1 && lastAtSymbol < position) {
      const searchTerm = value.slice(lastAtSymbol + 1, position);
      if (!searchTerm.includes(" ")) {
        setMentionSearch(searchTerm);
        setShowMentions(true);
        return;
      }
    }

    setShowMentions(false);
    setNewMessage(value);
  };

  const handleMentionSelect = (agent: typeof agents[0]) => {
    if (!inputRef.current) return;

    const beforeMention = newMessage.slice(0, newMessage.lastIndexOf("@"));
    const afterMention = newMessage.slice(cursorPosition);
    const newValue = `${beforeMention}@${agent.name} ${afterMention}`;

    setNewMessage(newValue);
    setShowMentions(false);
    inputRef.current.focus();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowMentions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="border-t border-border p-4">
      <div className="flex space-x-2 relative">
        <MentionSuggestions
          agents={agents}
          searchTerm={mentionSearch}
          onSelect={handleMentionSelect}
          isVisible={showMentions}
        />
        <Input
          ref={inputRef}
          value={newMessage}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !showMentions) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <Button onClick={handleSendMessage} size="icon" disabled={isLoading}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Agent {
  id: number;
  name: string;
  role: string;
  avatar: string;
}

interface MentionSuggestionsProps {
  agents: Agent[];
  searchTerm: string;
  onSelect: (agent: Agent) => void;
  isVisible: boolean;
}

export const MentionSuggestions = ({
  agents,
  searchTerm,
  onSelect,
  isVisible,
}: MentionSuggestionsProps) => {
  if (!isVisible) return null;

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredAgents.length === 0) return null;

  return (
    <div className="absolute bottom-full mb-2 w-64 bg-popover rounded-md shadow-lg border border-border">
      <ScrollArea className="h-[200px]">
        <div className="p-2 space-y-1">
          {filteredAgents.map((agent) => (
            <button
              key={agent.id}
              className="flex items-center w-full space-x-2 p-2 hover:bg-accent rounded-md transition-colors"
              onClick={() => onSelect(agent)}
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={agent.avatar} alt={agent.name} />
                <AvatarFallback>{agent.name[0]}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="text-sm font-medium">{agent.name}</div>
                <div className="text-xs text-muted-foreground">{agent.role}</div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
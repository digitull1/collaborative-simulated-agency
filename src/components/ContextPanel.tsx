import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { ContextMemory } from "@/hooks/useContextMemory";
import { Badge } from "@/components/ui/badge";

interface ContextPanelProps {
  contextMemory: ContextMemory | null;
}

export const ContextPanel = ({ contextMemory }: ContextPanelProps) => {
  if (!contextMemory) return null;

  return (
    <div className="border-b border-border p-4 space-y-4">
      <div>
        <h3 className="font-semibold mb-2">Project Details</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Project:</strong> {contextMemory.project_details.project_name}
          </p>
          <p>
            <strong>Goals:</strong> {contextMemory.project_details.goals}
          </p>
          
          {contextMemory.project_details.milestones.length > 0 && (
            <div>
              <strong>Milestones:</strong>
              <ul className="list-disc pl-4 mt-1">
                {contextMemory.project_details.milestones.map((milestone, index) => (
                  <li key={index}>{milestone}</li>
                ))}
              </ul>
            </div>
          )}
          
          {contextMemory.project_details.active_agents.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              <strong className="w-full">Active Agents:</strong>
              {contextMemory.project_details.active_agents.map((agent, index) => (
                <Badge key={index} variant="secondary">
                  {agent}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="font-medium mb-2">Recent History</h4>
        <ScrollArea className="h-32">
          <div className="space-y-2">
            {contextMemory.conversation_history.map((entry, index) => (
              <div key={index} className="text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{entry.agent_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-muted-foreground ml-4">{entry.message}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
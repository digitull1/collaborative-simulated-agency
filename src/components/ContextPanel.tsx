import { ScrollArea } from "@/components/ui/scroll-area";
import type { ContextMemory } from "@/hooks/useContextMemory";

interface ContextPanelProps {
  contextMemory: ContextMemory | null;
}

export const ContextPanel = ({ contextMemory }: ContextPanelProps) => {
  if (!contextMemory) return null;

  return (
    <div className="border-b border-border p-4 space-y-4">
      <div>
        <h3 className="font-semibold">Project Details</h3>
        <p className="text-sm text-muted-foreground">
          <strong>Project:</strong> {contextMemory.project_details.project_name}
        </p>
        <p className="text-sm text-muted-foreground">
          <strong>Goals:</strong> {contextMemory.project_details.goals}
        </p>
      </div>

      {contextMemory.project_details.milestones.length > 0 && (
        <div>
          <h4 className="font-medium">Milestones</h4>
          <ul className="text-sm text-muted-foreground list-disc pl-4">
            {contextMemory.project_details.milestones.map((milestone, index) => (
              <li key={index}>{milestone}</li>
            ))}
          </ul>
        </div>
      )}

      {contextMemory.project_details.active_agents.length > 0 && (
        <div>
          <h4 className="font-medium">Active Agents</h4>
          <p className="text-sm text-muted-foreground">
            {contextMemory.project_details.active_agents.join(', ')}
          </p>
        </div>
      )}

      <div>
        <h4 className="font-medium">Recent History</h4>
        <ScrollArea className="h-24">
          {contextMemory.conversation_history.map((entry, index) => (
            <div key={index} className="text-sm text-muted-foreground mb-2">
              <strong>{entry.agent_name}:</strong> {entry.message}
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
};
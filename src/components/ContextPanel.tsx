import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { ContextMemory } from "@/hooks/useContextMemory";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, ListChecks } from "lucide-react";
import { useState } from "react";

interface ContextPanelProps {
  contextMemory: ContextMemory | null;
}

export const ContextPanel = ({ contextMemory }: ContextPanelProps) => {
  const [sectionsState, setSectionsState] = useState({
    projectDetails: true,
    history: false,
    tasks: false
  });

  if (!contextMemory) return null;

  const toggleSection = (section: keyof typeof sectionsState) => {
    setSectionsState(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Mock tasks for now - in a real implementation, this would come from the contextMemory
  const tasks = [
    { id: 1, title: "Design social media strategy", assignedTo: "Riley Kim", status: "in-progress" },
    { id: 2, title: "Analyze campaign metrics", assignedTo: "Noor Patel", status: "pending" }
  ];

  return (
    <div className="border-b border-border space-y-2">
      {/* Project Details Section */}
      <Collapsible
        defaultOpen={sectionsState.projectDetails}
        onOpenChange={() => toggleSection('projectDetails')}
        className="p-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Project Details</h3>
          <CollapsibleTrigger className="hover:bg-accent p-1 rounded-md">
            {sectionsState.projectDetails ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent className="space-y-2 mt-2 text-sm text-muted-foreground">
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
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Tasks Section */}
      <Collapsible
        defaultOpen={sectionsState.tasks}
        onOpenChange={() => toggleSection('tasks')}
        className="p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4" />
            <h4 className="font-medium">Active Tasks</h4>
          </div>
          <CollapsibleTrigger className="hover:bg-accent p-1 rounded-md">
            {sectionsState.tasks ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent className="mt-2">
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="text-sm border rounded-md p-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{task.title}</span>
                    <Badge variant={task.status === 'in-progress' ? "secondary" : "outline"}>
                      {task.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Assigned to: {task.assignedTo}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Conversation History Section */}
      <Collapsible
        defaultOpen={sectionsState.history}
        onOpenChange={() => toggleSection('history')}
        className="p-4"
      >
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Recent History</h4>
          <CollapsibleTrigger className="hover:bg-accent p-1 rounded-md">
            {sectionsState.history ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent>
          <ScrollArea className="h-32 mt-2">
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
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
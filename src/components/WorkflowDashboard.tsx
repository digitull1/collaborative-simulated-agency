import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWorkflows } from "@/hooks/useWorkflows";
import { Loader2 } from "lucide-react";
import { WorkflowStages } from "@/components/workflows/WorkflowStages";

interface WorkflowDashboardProps {
  projectId: string;
}

export const WorkflowDashboard = ({ projectId }: WorkflowDashboardProps) => {
  const { workflows, isLoading, refetch } = useWorkflows(projectId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-4">
        {workflows.map((workflow) => (
          <Card key={workflow.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {workflow.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {workflow.description}
              </p>
              
              <WorkflowStages workflow={workflow} onUpdate={refetch} />
              
              {workflow.assignments.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Assigned Agents</h4>
                  <div className="flex flex-wrap gap-2">
                    {workflow.assignments.map((assignment) => (
                      <Badge key={assignment.id} variant="secondary">
                        {assignment.agent_name}
                        {assignment.role && ` (${assignment.role})`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {workflow.updates.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Recent Updates</h4>
                  <div className="space-y-2">
                    {workflow.updates.slice(0, 3).map((update) => (
                      <div
                        key={update.id}
                        className="text-sm text-muted-foreground"
                      >
                        <span className="font-medium">{update.agent_name}</span>:{" "}
                        {update.content}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import type { Task } from "@/types/task";

interface TaskDependenciesProps {
  task: Task;
  allTasks: Task[];
}

export const TaskDependencies = ({ task, allTasks }: TaskDependenciesProps) => {
  // Find dependent tasks (tasks that depend on this task)
  const dependentTasks = allTasks.filter(t => 
    t.dependencies.includes(task.id)
  );

  // Find prerequisite tasks (tasks this task depends on)
  const prerequisiteTasks = allTasks.filter(t =>
    task.dependencies.includes(t.id)
  );

  return (
    <div className="space-y-4">
      {prerequisiteTasks.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Prerequisites</h4>
          <ScrollArea className="h-24">
            {prerequisiteTasks.map(preTask => (
              <Card key={preTask.id} className="p-2 mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant={preTask.status === 'completed' ? 'default' : 'secondary'}>
                    {preTask.status}
                  </Badge>
                  <ArrowRight className="h-4 w-4" />
                  <span className="text-sm">{preTask.description}</span>
                </div>
              </Card>
            ))}
          </ScrollArea>
        </div>
      )}

      {dependentTasks.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Dependent Tasks</h4>
          <ScrollArea className="h-24">
            {dependentTasks.map(depTask => (
              <Card key={depTask.id} className="p-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{depTask.description}</span>
                  <ArrowRight className="h-4 w-4" />
                  <Badge variant={depTask.status === 'completed' ? 'default' : 'secondary'}>
                    {depTask.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
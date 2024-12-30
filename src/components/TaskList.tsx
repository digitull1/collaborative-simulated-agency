import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Task, TaskFromDB } from "@/types/task";
import { convertTaskFromDB } from "@/types/task";

interface TaskListProps {
  projectId: string;
  currentAgent: string;
}

export const TaskList = ({ projectId, currentAgent }: TaskListProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    description: "",
    agent_name: "",
    dependencies: [] as string[],
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tasks:", error);
        return;
      }

      // Convert the tasks from DB format to our Task interface
      const convertedTasks = (data as TaskFromDB[]).map(convertTaskFromDB);
      setTasks(convertedTasks);
    };

    fetchTasks();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`tasks-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log("Task change received:", payload);
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const createTask = async () => {
    const { error } = await supabase.from("tasks").insert([
      {
        project_id: projectId,
        description: newTask.description,
        agent_name: newTask.agent_name,
        dependencies: newTask.dependencies,
        created_by: currentAgent,
      },
    ]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsCreateOpen(false);
    setNewTask({
      description: "",
      agent_name: "",
      dependencies: [],
    });

    toast({
      title: "Success",
      description: "Task created successfully.",
    });
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", taskId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Tasks</h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> New Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  placeholder="Task description..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Assign To</label>
                <Select
                  value={newTask.agent_name}
                  onValueChange={(value) =>
                    setNewTask({ ...newTask, agent_name: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sophia Harper">Sophia Harper</SelectItem>
                    <SelectItem value="Noor Patel">Noor Patel</SelectItem>
                    <SelectItem value="Riley Kim">Riley Kim</SelectItem>
                    <SelectItem value="Taylor Brooks">Taylor Brooks</SelectItem>
                    <SelectItem value="Morgan Blake">Morgan Blake</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={createTask}>Create Task</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-[300px]">
        <div className="space-y-2">
          {tasks.map((task) => (
            <Card key={task.id}>
              <CardHeader className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium">
                      {task.description}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Assigned to: {task.agent_name}
                    </p>
                  </div>
                  <Badge
                    variant={
                      task.status === "completed"
                        ? "default"
                        : task.status === "in-progress"
                        ? "secondary"
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() =>
                      updateTaskStatus(
                        task.id,
                        task.status === "todo"
                          ? "in-progress"
                          : task.status === "in-progress"
                          ? "completed"
                          : "todo"
                      )
                    }
                  >
                    {task.status}
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
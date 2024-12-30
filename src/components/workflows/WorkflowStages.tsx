import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight, CheckCircle } from "lucide-react";
import { workflowManager } from "@/services/workflows";
import { toast } from "@/hooks/use-toast";
import type { WorkflowWithDetails } from "@/types/workflow";

interface WorkflowStagesProps {
  workflow: WorkflowWithDetails;
  onUpdate: () => void;
}

export const WorkflowStages = ({ workflow, onUpdate }: WorkflowStagesProps) => {
  const stages = ["planning", "in-progress", "review", "completed"];
  const currentStageIndex = stages.indexOf(workflow.status || "planning");

  const handleAdvanceStage = async () => {
    if (currentStageIndex >= stages.length - 1) return;
    
    try {
      await workflowManager.updateStatus(workflow.id, stages[currentStageIndex + 1]);
      onUpdate();
      toast({
        title: "Success",
        description: "Workflow stage updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update workflow stage",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">Workflow Progress</h3>
        <Badge variant="outline">{workflow.status}</Badge>
      </div>
      
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => (
          <div key={stage} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index <= currentStageIndex
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {index <= currentStageIndex ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
            {index < stages.length - 1 && (
              <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>
      
      {currentStageIndex < stages.length - 1 && (
        <Button
          onClick={handleAdvanceStage}
          className="w-full mt-4"
          variant="outline"
        >
          Advance to {stages[currentStageIndex + 1]}
        </Button>
      )}
    </Card>
  );
};
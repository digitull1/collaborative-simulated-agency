import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import type { CollaborationLog } from "@/types/collaboration";

interface CollaborationStatusProps {
  collaborationLogs: CollaborationLog[];
}

export const CollaborationStatus = ({ collaborationLogs }: CollaborationStatusProps) => {
  return (
    <ScrollArea className="h-[200px]">
      <div className="space-y-2">
        {collaborationLogs.map((log) => (
          <Card key={log.id} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {log.requesting_agent} → {log.target_agent}
                </span>
                <p className="text-xs text-muted-foreground">{log.message}</p>
              </div>
              <Badge
                variant={
                  log.status === "completed"
                    ? "default"
                    : log.status === "in-progress"
                    ? "secondary"
                    : "outline"
                }
              >
                {log.status}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};
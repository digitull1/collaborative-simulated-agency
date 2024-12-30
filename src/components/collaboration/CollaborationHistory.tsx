import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { CollaborationLog } from "@/types/collaboration";

interface CollaborationHistoryProps {
  logs: CollaborationLog[];
}

export const CollaborationHistory = ({ logs }: CollaborationHistoryProps) => {
  if (logs.length === 0) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="ml-2">
          <AlertCircle className="h-4 w-4 mr-2" />
          View Collaboration History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Collaboration History</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] mt-4">
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{log.requesting_agent}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-medium">{log.target_agent}</span>
                  </div>
                  <Badge variant={log.status === 'completed' ? 'default' : 'secondary'}>
                    {log.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{log.message}</p>
                <div className="text-xs text-muted-foreground mt-2">
                  {new Date(log.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
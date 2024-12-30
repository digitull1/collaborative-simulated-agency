import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquarePlus, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface AgentCollaborationProps {
  projectId: string;
  currentAgent: string;
}

export const AgentCollaboration = ({ projectId, currentAgent }: AgentCollaborationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [request, setRequest] = useState({
    target_agent: "",
    message: "",
  });
  const [collaborationLogs, setCollaborationLogs] = useState<Array<{
    id: string;
    requesting_agent: string;
    target_agent: string;
    message: string;
    status: string;
    created_at: string;
  }>>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadCollaborationLogs = async () => {
      try {
        const { data, error } = await supabase
          .from('agent_collaboration_logs')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCollaborationLogs(data);
      } catch (error) {
        console.error('Error loading collaboration logs:', error);
      }
    };

    loadCollaborationLogs();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('agent_collaboration')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_collaboration_logs',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCollaborationLogs(prev => [payload.new, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const sendCollaborationRequest = async () => {
    try {
      const { error } = await supabase
        .from("agent_collaboration_logs")
        .insert([
          {
            project_id: projectId,
            requesting_agent: currentAgent,
            target_agent: request.target_agent,
            message: request.message,
          },
        ]);

      if (error) throw error;

      // Create a notification for the target agent
      await supabase
        .from("notifications")
        .insert([
          {
            type: "collaboration",
            sender: currentAgent,
            content: `Requested expertise: ${request.message}`,
            thread_id: projectId,
          },
        ]);

      setIsOpen(false);
      setRequest({
        target_agent: "",
        message: "",
      });

      toast({
        title: "Success",
        description: "Collaboration request sent successfully.",
      });
    } catch (error) {
      console.error('Error sending collaboration request:', error);
      toast({
        title: "Error",
        description: "Failed to send request. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <MessageSquarePlus className="h-4 w-4" />
            Request Expertise
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Agent Expertise</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Agent</label>
              <Select
                value={request.target_agent}
                onValueChange={(value) =>
                  setRequest({ ...request, target_agent: value })
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
            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea
                value={request.message}
                onChange={(e) =>
                  setRequest({ ...request, message: e.target.value })
                }
                placeholder="Describe what you need help with..."
              />
            </div>
            <Button onClick={sendCollaborationRequest}>Send Request</Button>
          </div>
        </DialogContent>
      </Dialog>

      {collaborationLogs.length > 0 && (
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
                {collaborationLogs.map((log) => (
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
      )}
    </>
  );
};
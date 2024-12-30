import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquarePlus } from "lucide-react";

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
  const { toast } = useToast();

  const sendCollaborationRequest = async () => {
    const { error } = await supabase.from("agent_collaboration_logs").insert([
      {
        project_id: projectId,
        requesting_agent: currentAgent,
        target_agent: request.target_agent,
        message: request.message,
      },
    ]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send collaboration request. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsOpen(false);
    setRequest({
      target_agent: "",
      message: "",
    });

    toast({
      title: "Success",
      description: "Collaboration request sent successfully.",
    });
  };

  return (
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
  );
};
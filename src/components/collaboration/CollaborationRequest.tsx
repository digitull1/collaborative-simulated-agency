import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquarePlus } from "lucide-react";
import type { CollaborationRequest } from "@/types/collaboration";

interface CollaborationRequestProps {
  onSubmit: (request: CollaborationRequest) => Promise<void>;
}

export const CollaborationRequest = ({ onSubmit }: CollaborationRequestProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [request, setRequest] = useState<CollaborationRequest>({
    target_agent: "",
    message: "",
  });

  const handleSubmit = async () => {
    await onSubmit(request);
    setIsOpen(false);
    setRequest({ target_agent: "", message: "" });
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
                <SelectItem value="Sophia Harper">Sophia Harper (Marketing Strategy)</SelectItem>
                <SelectItem value="Noor Patel">Noor Patel (Content Creation)</SelectItem>
                <SelectItem value="Riley Kim">Riley Kim (Data Analysis)</SelectItem>
                <SelectItem value="Taylor Brooks">Taylor Brooks (Social Media)</SelectItem>
                <SelectItem value="Morgan Blake">Morgan Blake (Campaign Management)</SelectItem>
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
          <Button onClick={handleSubmit}>Send Request</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
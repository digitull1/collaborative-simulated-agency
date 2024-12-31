import { AgentCollaboration } from "@/components/AgentCollaboration";
import type { ChatTarget } from "@/components/SlackLayout";

interface ChatHeaderProps {
  chatTarget: ChatTarget;
  threadId: string | null;
}

export const ChatHeader = ({ chatTarget, threadId }: ChatHeaderProps) => {
  return (
    <div className="border-b border-border p-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold">
        {chatTarget.type === "channel" ? `#${chatTarget.name}` : chatTarget.name}
      </h2>
      {chatTarget.type === "agent" && threadId && (
        <AgentCollaboration
          projectId={threadId}
          currentAgent={chatTarget.name}
        />
      )}
    </div>
  );
};
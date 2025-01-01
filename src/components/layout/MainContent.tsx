import { ChatArea } from "@/components/ChatArea";
import type { ChatTarget } from "@/components/SlackLayout";

interface MainContentProps {
  chatTarget: ChatTarget | null;
}

export const MainContent = ({ chatTarget }: MainContentProps) => {
  if (!chatTarget) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Select a channel or agent to start chatting
      </div>
    );
  }

  return <ChatArea chatTarget={chatTarget} />;
};
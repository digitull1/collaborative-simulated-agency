import { useContextMemory } from "@/hooks/useContextMemory";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatContent } from "@/components/chat/ChatContent";
import type { ChatTarget } from "@/components/SlackLayout";
import { useChatProvider } from "@/components/chat/ChatProvider";

interface ChatAreaProps {
  chatTarget: ChatTarget;
}

export const ChatArea = ({ chatTarget }: ChatAreaProps) => {
  const {
    messages,
    newMessage,
    setNewMessage,
    isLoading,
    threadId,
    handleSendMessage
  } = useChatProvider(chatTarget);

  if (!chatTarget) {
    return null;
  }

  return (
    <div className="flex h-full flex-col">
      <ChatHeader chatTarget={chatTarget} threadId={threadId} />
      
      <ChatContent
        chatTarget={chatTarget}
        threadId={threadId}
        messages={messages}
        isLoading={isLoading}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
      />
    </div>
  );
};
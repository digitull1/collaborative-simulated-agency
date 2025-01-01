import { Messages } from "@/components/Messages";
import { MessageInput } from "@/components/MessageInput";
import { ChannelMessages } from "@/components/channel/ChannelMessages";
import type { ChatTarget } from "@/components/SlackLayout";

interface ChatContentProps {
  chatTarget: ChatTarget;
  threadId: string | null;
  messages: Array<{
    id: number;
    content: string;
    sender: string;
    timestamp: Date;
    agentId?: number;
  }>;
  isLoading: boolean;
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: () => void;
}

export const ChatContent = ({
  chatTarget,
  threadId,
  messages,
  isLoading,
  newMessage,
  setNewMessage,
  handleSendMessage,
}: ChatContentProps) => {
  return (
    <div className="flex-1 flex flex-col">
      {chatTarget.type === 'channel' && threadId ? (
        <ChannelMessages 
          channelId={threadId}
          channelName={chatTarget.name}
        />
      ) : (
        <>
          <Messages 
            messages={messages}
            isLoading={isLoading}
            chatTargetName={chatTarget.name}
          />
          
          <MessageInput
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder={`Message ${chatTarget.name}...`}
          />
        </>
      )}
    </div>
  );
};
import { Messages } from "@/components/Messages";
import { MessageInput } from "@/components/MessageInput";
import { ChannelMessages } from "@/components/channel/ChannelMessages";
import { TaskList } from "@/components/TaskList";
import { WorkflowDashboard } from "@/components/WorkflowDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    <Tabs defaultValue="chat" className="flex-1">
      <TabsList className="mx-4 mt-2">
        <TabsTrigger value="chat">Chat</TabsTrigger>
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
        <TabsTrigger value="workflows">Workflows</TabsTrigger>
      </TabsList>
      
      <TabsContent value="chat" className="flex-1 flex flex-col">
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
      </TabsContent>

      <TabsContent value="tasks" className="flex-1 p-4">
        {threadId && (
          <TaskList projectId={threadId} currentAgent={chatTarget.name} />
        )}
      </TabsContent>
      
      <TabsContent value="workflows" className="flex-1">
        {threadId && <WorkflowDashboard projectId={threadId} />}
      </TabsContent>
    </Tabs>
  );
};
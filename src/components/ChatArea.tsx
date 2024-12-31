import { useState, useEffect } from "react";
import { generateAgentResponse } from "@/services/ai";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { ChatTarget } from "@/components/SlackLayout";
import { Messages } from "@/components/Messages";
import { MessageInput } from "@/components/MessageInput";
import { ContextDrawer } from "@/components/ContextDrawer";
import { WorkflowDashboard } from "@/components/WorkflowDashboard";
import { TaskList } from "@/components/TaskList";
import { AgentCollaboration } from "@/components/AgentCollaboration";
import { useContextMemory } from "@/hooks/useContextMemory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChannelMessages } from "./channel/ChannelMessages";

interface ChatAreaProps {
  chatTarget: ChatTarget;
}

export const ChatArea = ({ chatTarget }: ChatAreaProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Array<{
    id: number;
    content: string;
    sender: string;
    timestamp: Date;
    agentId?: number;
  }>>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const contextMemory = useContextMemory(threadId);

  useEffect(() => {
    const loadThread = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          throw new Error("User must be logged in");
        }

        // Find or create thread for this chat target
        const { data: existingThread, error: fetchError } = await supabase
          .from('threads')
          .select('*')
          .eq('type', chatTarget.type)
          .eq('title', chatTarget.name)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (existingThread) {
          setThreadId(existingThread.id);
          
          if (chatTarget.type === 'agent') {
            // Load thread messages for agent chat
            const { data: threadMessages, error: messagesError } = await supabase
              .from('thread_messages')
              .select('*')
              .eq('thread_id', existingThread.id)
              .order('timestamp', { ascending: true });

            if (messagesError) throw messagesError;

            const formattedMessages = threadMessages.map((msg, index) => ({
              id: index + 1,
              content: msg.content,
              sender: msg.sender,
              timestamp: new Date(msg.timestamp),
              agentId: chatTarget.type === 'agent' ? Number(chatTarget.id) : undefined,
            }));

            setMessages(formattedMessages);
          }
        } else {
          // Create new thread
          const { data: newThread, error: createError } = await supabase
            .from('threads')
            .insert([{
              type: chatTarget.type,
              title: chatTarget.name,
              participants: [user.id],
              last_message: null,
              last_message_at: null
            }])
            .select()
            .single();

          if (createError) throw createError;

          setThreadId(newThread.id);
          
          if (chatTarget.type === 'agent') {
            const welcomeMessage = {
              id: 1,
              content: `Welcome! I'm ${chatTarget.name}, your AI assistant. How can I help you today?`,
              sender: chatTarget.name,
              timestamp: new Date(),
              agentId: Number(chatTarget.id),
            };
            setMessages([welcomeMessage]);
          }
        }
      } catch (error) {
        console.error('Error loading thread:', error);
        toast({
          title: "Error",
          description: "Failed to load chat history. Please try again.",
          variant: "destructive",
        });
      }
    };

    loadThread();
  }, [chatTarget, toast]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading || !threadId) return;
    
    setIsLoading(true);

    try {
      const { error: messageError } = await supabase
        .from('thread_messages')
        .insert([{
          thread_id: threadId,
          content: newMessage,
          sender: "You",
        }]);

      if (messageError) throw messageError;

      if (chatTarget.type === 'agent') {
        const agentName = chatTarget.name;
        const chatHistory = messages.map(msg => ({
          sender: msg.sender,
          content: msg.content
        }));
        
        const response = await generateAgentResponse(agentName, newMessage, chatHistory);
        
        const { error: responseError } = await supabase
          .from('thread_messages')
          .insert([{
            thread_id: threadId,
            content: response,
            sender: agentName,
          }]);

        if (responseError) throw responseError;
      }

      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
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
      
      {contextMemory && <ContextDrawer contextMemory={contextMemory} />}
      
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
    </div>
  );
};
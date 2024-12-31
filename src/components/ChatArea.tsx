import { useState, useEffect } from "react";
import { generateAgentResponse } from "@/services/ai";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { ChatTarget } from "@/components/SlackLayout";
import { ContextDrawer } from "@/components/ContextDrawer";
import { useContextMemory } from "@/hooks/useContextMemory";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatContent } from "@/components/chat/ChatContent";

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
      <ChatHeader chatTarget={chatTarget} threadId={threadId} />
      
      {contextMemory && <ContextDrawer contextMemory={contextMemory} />}
      
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
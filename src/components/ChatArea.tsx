import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useState, useEffect } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { generateAgentResponse } from "@/services/ai";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { ChatTarget } from "@/components/SlackLayout";

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

  useEffect(() => {
    const loadThread = async () => {
      try {
        const user = await supabase.auth.getUser();
        if (!user.data.user) {
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
          // Load thread messages
          const { data: threadMessages, error: messagesError } = await supabase
            .from('thread_messages')
            .select('*')
            .eq('thread_id', existingThread.id)
            .order('timestamp', { ascending: true });

          if (messagesError) throw messagesError;

          setMessages(threadMessages.map((msg, index) => ({
            id: index + 1,
            content: msg.content,
            sender: msg.sender,
            timestamp: new Date(msg.timestamp),
            agentId: chatTarget.type === 'agent' ? Number(chatTarget.id) : undefined,
          })));
        } else {
          // Create new thread with proper participants array
          const { data: newThread, error: createError } = await supabase
            .from('threads')
            .insert([{
              type: chatTarget.type,
              title: chatTarget.name,
              participants: [user.data.user.id, chatTarget.name],
              last_message: null,
              last_message_at: null
            }])
            .select()
            .single();

          if (createError) throw createError;

          setThreadId(newThread.id);
          // Initialize with welcome message
          setMessages([{
            id: 1,
            content: chatTarget.type === "channel" 
              ? `Welcome to #${chatTarget.name}! How can our team help you today?`
              : `Welcome to AIGency! I'm ${chatTarget.name}, your ${chatTarget.type === "agent" ? "AI assistant" : "channel"}. How can I help you today?`,
            sender: chatTarget.type === "channel" ? "System" : chatTarget.name,
            timestamp: new Date(),
            agentId: chatTarget.type === "agent" ? Number(chatTarget.id) : undefined,
          }]);
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

    // Subscribe to real-time message updates
    const channel = supabase.channel('thread-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'thread_messages',
          filter: `thread_id=eq.${threadId}`
        },
        (payload) => {
          const newMessage = payload.new;
          setMessages(prev => [...prev, {
            id: prev.length + 1,
            content: newMessage.content,
            sender: newMessage.sender,
            timestamp: new Date(newMessage.timestamp),
            agentId: chatTarget.type === 'agent' ? Number(chatTarget.id) : undefined,
          }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatTarget, threadId, toast]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;
    
    const userMessage = {
      id: messages.length + 1,
      content: newMessage,
      sender: "You",
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsLoading(true);

    try {
      // Save message to thread
      if (threadId) {
        const { error: messageError } = await supabase
          .from('thread_messages')
          .insert([{
            thread_id: threadId,
            content: newMessage,
            sender: "You",
          }]);

        if (messageError) throw messageError;
      }

      const agentName = chatTarget.name;
      const chatHistory = messages.map(msg => ({
        sender: msg.sender,
        content: msg.content
      }));
      
      const response = await generateAgentResponse(agentName, newMessage, chatHistory);
      
      // Save agent response to thread
      if (threadId) {
        const { error: responseError } = await supabase
          .from('thread_messages')
          .insert([{
            thread_id: threadId,
            content: response,
            sender: agentName,
          }]);

        if (responseError) throw responseError;
      }

      setMessages(prev => [...prev, {
        id: prev.length + 1,
        content: response,
        sender: agentName,
        timestamp: new Date(),
        agentId: chatTarget.type === "agent" ? Number(chatTarget.id) : undefined,
      }]);
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
      <div className="border-b border-border p-4">
        <h2 className="text-lg font-semibold">
          {chatTarget.type === "channel" ? `#${chatTarget.name}` : chatTarget.name}
        </h2>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="animate-pulse">
                {chatTarget.name} is typing...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="border-t border-border p-4">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${chatTarget.type === "channel" ? `#${chatTarget.name}` : chatTarget.name}...`}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button 
            onClick={handleSendMessage} 
            size="icon"
            disabled={isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
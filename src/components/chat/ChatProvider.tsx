import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateAgentResponse } from "@/services/ai";
import type { ChatTarget } from "@/components/SlackLayout";

export const useChatProvider = (chatTarget: ChatTarget) => {
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

        let currentThreadId: string;

        if (existingThread) {
          currentThreadId = existingThread.id;
          setThreadId(currentThreadId);
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
          currentThreadId = newThread.id;
          setThreadId(currentThreadId);

          if (chatTarget.type === 'agent') {
            const welcomeMessage = {
              id: 1,
              content: `Welcome! I'm ${chatTarget.name}, your AI assistant. How can I help you today?`,
              sender: chatTarget.name,
              timestamp: new Date(),
              agentId: Number(chatTarget.id),
            };
            setMessages([welcomeMessage]);

            await supabase
              .from('thread_messages')
              .insert([{
                thread_id: currentThreadId,
                content: welcomeMessage.content,
                sender: welcomeMessage.sender,
              }]);
          }
        }

        // Load thread messages
        const { data: threadMessages, error: messagesError } = await supabase
          .from('thread_messages')
          .select('*')
          .eq('thread_id', currentThreadId)
          .order('timestamp', { ascending: true });

        if (messagesError) throw messagesError;

        if (threadMessages) {
          const formattedMessages = threadMessages.map((msg, index) => ({
            id: index + 1,
            content: msg.content || '',
            sender: msg.sender || 'Unknown',
            timestamp: new Date(msg.timestamp || Date.now()),
            agentId: chatTarget.type === 'agent' ? Number(chatTarget.id) : undefined,
          }));

          setMessages(formattedMessages);
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

    if (chatTarget) {
      loadThread();
    }

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`thread_${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'thread_messages',
          filter: `thread_id=eq.${threadId}`
        },
        (payload) => {
          console.log('New message received:', payload);
          const newMsg = payload.new;
          setMessages(prev => [...prev, {
            id: prev.length + 1,
            content: newMsg.content || '',
            sender: newMsg.sender || 'Unknown',
            timestamp: new Date(newMsg.timestamp || Date.now()),
            agentId: chatTarget.type === 'agent' ? Number(chatTarget.id) : undefined,
          }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatTarget, toast, threadId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading || !threadId) return;
    
    setIsLoading(true);
    console.log('Sending message:', newMessage);

    try {
      // Insert user message
      const { error: messageError } = await supabase
        .from('thread_messages')
        .insert([{
          thread_id: threadId,
          content: newMessage,
          sender: "You",
        }]);

      if (messageError) throw messageError;

      // Update thread's last message
      await supabase
        .from('threads')
        .update({
          last_message: newMessage,
          last_message_at: new Date().toISOString()
        })
        .eq('id', threadId);

      // Generate agent response for both channels and direct messages
      const agentName = chatTarget.name;
      const chatHistory = messages.map(msg => ({
        sender: msg.sender,
        content: msg.content
      }));
      
      const response = await generateAgentResponse(agentName, newMessage, chatHistory);
      
      if (response) {
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

  return {
    messages,
    newMessage,
    setNewMessage,
    isLoading,
    threadId,
    handleSendMessage
  };
};
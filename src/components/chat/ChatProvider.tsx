import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ChatTarget } from "@/components/SlackLayout";
import { useChatState } from "@/hooks/useChatState";

export const useChatProvider = (chatTarget: ChatTarget) => {
  const { toast } = useToast();
  const [threadId, setThreadId] = useState<string | null>(null);
  const {
    messages,
    setMessages,
    newMessage,
    setNewMessage,
    isLoading,
    setIsLoading,
    handleSendMessage
  } = useChatState(chatTarget, threadId);

  useEffect(() => {
    let mounted = true;
    let channel: any = null;

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

        if (threadMessages && mounted) {
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
    if (threadId) {
      channel = supabase
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
            if (mounted) {
              setMessages(prev => [...prev, {
                id: prev.length + 1,
                content: newMsg.content || '',
                sender: newMsg.sender || 'Unknown',
                timestamp: new Date(newMsg.timestamp || Date.now()),
                agentId: chatTarget.type === 'agent' ? Number(chatTarget.id) : undefined,
              }]);
            }
          }
        )
        .subscribe();
    }

    return () => {
      mounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [chatTarget, toast, threadId]);

  return {
    messages,
    newMessage,
    setNewMessage,
    isLoading,
    threadId,
    handleSendMessage
  };
};
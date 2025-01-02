import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const getLastActiveChannel = async () => {
  try {
    const { data: threads, error } = await supabase
      .from('threads')
      .select('*')
      .eq('type', 'channel')
      .order('last_message_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return threads;
  } catch (error) {
    console.error('Error fetching last active channel:', error);
    return null;
  }
};

export const fetchChannelMessages = async (channelId: string, limit = 20, offset = 0) => {
  try {
    const { data: messages, error } = await supabase
      .from('thread_messages')
      .select('*')
      .eq('thread_id', channelId)
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return messages.reverse();
  } catch (error) {
    console.error('Error fetching channel messages:', error);
    toast({
      title: "Error",
      description: "Unable to load messages. Please try again.",
      variant: "destructive",
    });
    return [];
  }
};

export const subscribeToChannelMessages = (
  channelId: string,
  onNewMessage: (message: any) => void
) => {
  const channel = supabase
    .channel(`channel-${channelId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'thread_messages',
        filter: `thread_id=eq.${channelId}`
      },
      (payload) => {
        console.log('New message received:', payload);
        onNewMessage(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
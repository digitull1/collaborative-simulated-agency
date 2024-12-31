import { useState, useEffect } from "react";
import { MessageSquare, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";

interface Channel {
  id: string;
  name: string;
  unreadCount: number;
}

interface ChannelListProps {
  onSelectChannel: (channel: Channel) => void;
}

export const ChannelList = ({ onSelectChannel }: ChannelListProps) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [newChannelName, setNewChannelName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadChannels = async () => {
      try {
        const { data: threads, error } = await supabase
          .from('threads')
          .select('*')
          .eq('type', 'channel')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedChannels = threads.map(thread => ({
          id: thread.id,
          name: thread.title,
          unreadCount: 0 // TODO: Implement unread count logic
        }));

        setChannels(formattedChannels);
      } catch (error) {
        console.error('Error loading channels:', error);
        toast({
          title: "Error",
          description: "Failed to load channels. Please try again.",
          variant: "destructive",
        });
      }
    };

    loadChannels();

    // Subscribe to real-time channel updates
    const channel = supabase
      .channel('public:threads')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'threads',
          filter: "type=eq.channel"
        },
        () => {
          loadChannels();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a channel name.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const { data: thread, error } = await supabase
        .from('threads')
        .insert([
          {
            title: newChannelName,
            type: 'channel',
            participants: [user.user.id],
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const newChannel = {
        id: thread.id,
        name: thread.title,
        unreadCount: 0
      };

      setChannels(prev => [newChannel, ...prev]);
      setNewChannelName("");
      setIsOpen(false);
      
      toast({
        title: "Success",
        description: "Channel created successfully.",
      });
    } catch (error) {
      console.error('Error creating channel:', error);
      toast({
        title: "Error",
        description: "Failed to create channel. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Channel
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Channel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter channel name"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateChannel();
                }
              }}
            />
            <Button onClick={handleCreateChannel} className="w-full">
              Create Channel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-1">
        {channels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => onSelectChannel(channel)}
            className="flex items-center w-full px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent group"
          >
            <MessageSquare className="w-4 h-4 mr-2 shrink-0" />
            <span className="truncate"># {channel.name}</span>
            {channel.unreadCount > 0 && (
              <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                {channel.unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
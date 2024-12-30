import { ScrollArea } from "@/components/ui/scroll-area";
import { AgentList } from "@/components/AgentList";
import { ChatArea } from "@/components/ChatArea";

const Index = () => {
  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <div className="w-64 border-r border-border bg-sidebar">
        <ScrollArea className="h-full">
          <div className="p-4">
            <h2 className="mb-4 text-lg font-semibold">AIGency Team</h2>
            <AgentList />
          </div>
        </ScrollArea>
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1">
        <ChatArea />
      </div>
    </div>
  );
};

export default Index;
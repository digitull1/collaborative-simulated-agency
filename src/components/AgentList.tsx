import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const agents = [
  {
    id: 1,
    name: "Sophia Harper",
    role: "Campaign Architect",
    avatar: "/avatars/sophia.png",
    status: "online",
  },
  {
    id: 2,
    name: "Noor Patel",
    role: "Data Whisperer",
    avatar: "/avatars/noor.png",
    status: "online",
  },
  {
    id: 3,
    name: "Riley Kim",
    role: "Viral Visionary",
    avatar: "/avatars/riley.png",
    status: "online",
  },
  {
    id: 4,
    name: "Taylor Brooks",
    role: "ROI Master",
    avatar: "/avatars/taylor.png",
    status: "online",
  },
  {
    id: 5,
    name: "Morgan Blake",
    role: "Automation Pro",
    avatar: "/avatars/morgan.png",
    status: "online",
  },
];

export const AgentList = () => {
  return (
    <div className="space-y-4">
      {agents.map((agent) => (
        <div
          key={agent.id}
          className="flex items-center space-x-4 rounded-lg p-2 hover:bg-sidebar-accent cursor-pointer transition-colors"
        >
          <div className="relative">
            <Avatar>
              <AvatarImage src={agent.avatar} alt={agent.name} />
              <AvatarFallback>{agent.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
            </Avatar>
            <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
              agent.status === "online" ? "bg-green-500" : "bg-gray-500"
            }`} />
          </div>
          <div>
            <h3 className="font-medium text-sm">{agent.name}</h3>
            <p className="text-xs text-muted-foreground">{agent.role}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
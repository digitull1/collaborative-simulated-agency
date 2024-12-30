import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface NotificationFiltersProps {
  filter: "all" | "campaign" | "insight";
  setFilter: (filter: "all" | "campaign" | "insight") => void;
  unreadOnly: boolean;
  setUnreadOnly: (unreadOnly: boolean) => void;
}

export const NotificationFilters = ({
  filter,
  setFilter,
  unreadOnly,
  setUnreadOnly
}: NotificationFiltersProps) => {
  return (
    <>
      <div className="flex items-center justify-between px-2 mb-2">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={filter === "all" ? "bg-sidebar-accent" : ""}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={filter === "campaign" ? "bg-sidebar-accent" : ""}
            onClick={() => setFilter("campaign")}
          >
            Campaign
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={filter === "insight" ? "bg-sidebar-accent" : ""}
            onClick={() => setFilter("insight")}
          >
            Insights
          </Button>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => setUnreadOnly(!unreadOnly)}
      >
        <Filter className="w-4 h-4 mr-2" />
        {unreadOnly ? "Show All" : "Show Unread Only"}
      </Button>
    </>
  );
};
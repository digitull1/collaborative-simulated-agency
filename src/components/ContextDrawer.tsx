import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SidebarOpen } from "lucide-react";
import { ContextPanel } from "./ContextPanel";
import type { ContextMemory } from "@/hooks/useContextMemory";

interface ContextDrawerProps {
  contextMemory: ContextMemory | null;
}

export const ContextDrawer = ({ contextMemory }: ContextDrawerProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed top-4 right-4 z-50">
          <SidebarOpen className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px]">
        <SheetHeader>
          <SheetTitle>Project Details</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-80px)] mt-4">
          <ContextPanel contextMemory={contextMemory} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
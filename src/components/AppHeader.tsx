import { Search, Bell } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AppHeader() {
  return (
    <header className="h-14 flex items-center gap-4 px-4 border-b border-border bg-card/50 backdrop-blur-sm shrink-0">
      <SidebarTrigger />

      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar clientes, serviços..."
          className="pl-9 bg-secondary border-border h-9 text-sm"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </Button>
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-primary/20 text-primary text-xs font-medium">
            MA
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

import { Search, Bell, Info } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function AppHeader() {
  const { data: pendingCount = 0 } = useQuery({
    queryKey: ['pending-appointments-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

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
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative group">
              <Bell className="w-4 h-4 transition-transform group-hover:rotate-12" />
              {pendingCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary border-2 border-background" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4 border-b border-border">
              <h4 className="text-sm font-semibold">Notificações</h4>
            </div>
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                <Info className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-foreground font-medium">Sem novas notificações</p>
              <p className="text-xs text-muted-foreground mt-1">
                Avisaremos você quando houver atualizações nos seus agendamentos.
              </p>
            </div>
          </PopoverContent>
        </Popover>
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-primary/20 text-primary text-xs font-medium">
            MA
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

import { Clock, User, Trash2, CalendarX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Status = "confirmed" | "pending" | "cancelled";

const statusMap: Record<Status, { label: string; className: string }> = {
  confirmed: { label: "Confirmado", className: "status-confirmed" },
  pending: { label: "Pendente", className: "status-pending" },
  cancelled: { label: "Cancelado", className: "status-cancelled" },
};

export function UpcomingAppointments() {
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['upcoming-appointments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id, service_name, scheduled_at, status,
          clients ( name )
        `)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(6);

      if (error) throw error;
      return data.map((a: any) => ({
        id: a.id,
        time: format(new Date(a.scheduled_at), "HH:mm"),
        date: format(new Date(a.scheduled_at), "dd/MM", { locale: ptBR }),
        client: a.clients?.name || "Cliente",
        service: a.service_name,
        status: a.status as Status,
      }));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcoming-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success("Agendamento excluído com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir agendamento: " + error.message);
    }
  });

  if (isLoading) {
    return (
      <div className="glass-card p-5 h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse text-sm">Carregando agendamentos...</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 h-full flex flex-col">
      <h3 className="font-serif text-lg text-foreground mb-4">
        Próximos Agendamentos
      </h3>
      <div className="space-y-3 flex-1 overflow-auto pr-1">
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-60">
            <CalendarX className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground font-medium">Nenhum agendamento<br />para os próximos dias</p>
          </div>
        ) : (
          appointments.map((a: any) => {
            const s = statusMap[a.status];
            return (
              <div
                key={a.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
              >
                <div className="flex flex-col items-center justify-center w-12 shrink-0 border-r border-border pr-2">
                  <span className="text-[10px] uppercase text-muted-foreground font-semibold">
                    {a.date}
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {a.time}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {a.client}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate italic">
                      {a.service}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge variant="outline" className={`text-[9px] px-1.5 py-0 leading-tight ${s.className}`}>
                    {s.label}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteMutation.mutate(a.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

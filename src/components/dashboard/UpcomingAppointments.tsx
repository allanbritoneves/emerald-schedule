import { Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Status = "confirmed" | "pending" | "cancelled";

const appointments = [
  { time: "09:00", client: "Ana Silva", service: "Corte + Escova", status: "confirmed" as Status },
  { time: "10:30", client: "Carlos Mendes", service: "Barba", status: "confirmed" as Status },
  { time: "11:00", client: "Julia Santos", service: "Coloração", status: "pending" as Status },
  { time: "14:00", client: "Pedro Lima", service: "Corte Masculino", status: "confirmed" as Status },
  { time: "15:30", client: "Mariana Costa", service: "Hidratação", status: "cancelled" as Status },
  { time: "16:00", client: "Rafael Oliveira", service: "Corte + Barba", status: "confirmed" as Status },
];

const statusMap: Record<Status, { label: string; className: string }> = {
  confirmed: { label: "Confirmado", className: "status-confirmed" },
  pending: { label: "Pendente", className: "status-pending" },
  cancelled: { label: "Cancelado", className: "status-cancelled" },
};

export function UpcomingAppointments() {
  return (
    <div className="glass-card p-5">
      <h3 className="font-serif text-lg text-foreground mb-4">
        Próximos Agendamentos
      </h3>
      <div className="space-y-3">
        {appointments.map((a, i) => {
          const s = statusMap[a.status];
          return (
            <div
              key={i}
              className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-2 w-16 shrink-0">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {a.time}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {a.client}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {a.service}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${s.className}`}>
                {s.label}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}

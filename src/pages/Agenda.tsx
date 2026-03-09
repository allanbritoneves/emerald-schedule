import { useState } from "react";
import { motion } from "framer-motion";
import { format, addDays, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Sparkles, X, User, Clock, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Appointment = {
  id: number;
  hour: number;
  duration: number;
  client: string;
  service: string;
  status: "confirmed" | "pending" | "cancelled";
  dayOffset: number;
};

const mockAppointments: Appointment[] = [
  { id: 1, hour: 9, duration: 1, client: "Ana Silva", service: "Corte + Escova", status: "confirmed", dayOffset: 0 },
  { id: 2, hour: 10, duration: 1, client: "Carlos Mendes", service: "Barba", status: "confirmed", dayOffset: 0 },
  { id: 3, hour: 14, duration: 2, client: "Julia Santos", service: "Coloração", status: "pending", dayOffset: 1 },
  { id: 4, hour: 11, duration: 1, client: "Pedro Lima", service: "Corte Masculino", status: "confirmed", dayOffset: 2 },
  { id: 5, hour: 15, duration: 1, client: "Mariana Costa", service: "Hidratação", status: "confirmed", dayOffset: 3 },
  { id: 6, hour: 9, duration: 1, client: "Rafael Oliveira", service: "Corte + Barba", status: "pending", dayOffset: 4 },
  { id: 7, hour: 16, duration: 1, client: "Lucia Ferreira", service: "Manicure", status: "confirmed", dayOffset: 4 },
];

const aiSuggestions = [
  { dayOffset: 1, hour: 10, label: "Sugerido pela IA" },
  { dayOffset: 3, hour: 13, label: "Horário ideal" },
];

const hours = Array.from({ length: 10 }, (_, i) => i + 8);

const statusColors: Record<string, string> = {
  confirmed: "bg-primary/20 border-primary/30 text-primary",
  pending: "bg-accent/20 border-accent/30 text-accent",
  cancelled: "bg-destructive/20 border-destructive/30 text-destructive",
};

const Agenda = () => {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selected, setSelected] = useState<Appointment | null>(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <motion.div
      className="p-6 flex flex-col h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif text-foreground">Agenda</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie seus horários</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setWeekStart(addDays(weekStart, -7))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground font-medium min-w-[180px] text-center">
            {format(weekStart, "dd MMM", { locale: ptBR })} — {format(addDays(weekStart, 6), "dd MMM yyyy", { locale: ptBR })}
          </span>
          <Button variant="ghost" size="icon" onClick={() => setWeekStart(addDays(weekStart, 7))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Calendar grid */}
        <div className="flex-1 glass-card overflow-auto">
          <div className="grid grid-cols-[60px_repeat(7,1fr)] min-w-[700px]">
            {/* Header */}
            <div className="border-b border-border p-2" />
            {weekDays.map((day, i) => (
              <div key={i} className="border-b border-l border-border p-2 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">
                  {format(day, "EEE", { locale: ptBR })}
                </p>
                <p className="text-sm font-medium text-foreground">{format(day, "dd")}</p>
              </div>
            ))}

            {/* Time rows */}
            {hours.map((hour) => (
              <>
                <div key={`h-${hour}`} className="border-b border-border p-2 text-right pr-3">
                  <span className="text-[10px] text-muted-foreground">
                    {String(hour).padStart(2, "0")}:00
                  </span>
                </div>
                {weekDays.map((_, dayIdx) => {
                  const appt = mockAppointments.find(
                    (a) => a.dayOffset === dayIdx && a.hour === hour
                  );
                  const aiSlot = aiSuggestions.find(
                    (s) => s.dayOffset === dayIdx && s.hour === hour
                  );

                  return (
                    <div
                      key={`${hour}-${dayIdx}`}
                      className="border-b border-l border-border p-1 min-h-[48px] relative hover:bg-secondary/30 transition-colors cursor-pointer"
                      onClick={() => appt && setSelected(appt)}
                    >
                      {appt && (
                        <div
                          className={`rounded-md px-2 py-1 text-[10px] border ${statusColors[appt.status]} truncate`}
                        >
                          <p className="font-medium truncate">{appt.client}</p>
                          <p className="opacity-70 truncate">{appt.service}</p>
                        </div>
                      )}
                      {aiSlot && !appt && (
                        <div className="rounded-md px-2 py-1 text-[10px] border border-dashed border-primary/40 bg-primary/5 text-primary flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {aiSlot.label}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>

        {/* Side panel */}
        {selected && (
          <motion.div
            className="w-80 glass-card p-5 shrink-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-foreground">Detalhes</h3>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelected(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{selected.client}</p>
                  <p className="text-xs text-muted-foreground">Cliente desde Jan 2024</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Scissors className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{selected.service}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">
                    {String(selected.hour).padStart(2, "0")}:00 — {String(selected.hour + selected.duration).padStart(2, "0")}:00
                  </span>
                </div>
              </div>

              <Badge
                variant="outline"
                className={`${statusColors[selected.status]} text-xs`}
              >
                {selected.status === "confirmed" ? "Confirmado" : selected.status === "pending" ? "Pendente" : "Cancelado"}
              </Badge>

              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Histórico</p>
                <div className="space-y-1.5">
                  {["Corte — 15 Fev", "Escova — 02 Fev", "Corte — 18 Jan"].map((h, i) => (
                    <p key={i} className="text-xs text-secondary-foreground">{h}</p>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Agenda;

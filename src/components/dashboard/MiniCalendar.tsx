import { useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function MiniCalendar() {
  const [current, setCurrent] = useState(new Date());

  const { data: busyDays = [], isLoading } = useQuery({
    queryKey: ['busy-days', format(current, "yyyy-MM")],
    queryFn: async () => {
      const monthStart = startOfMonth(current).toISOString();
      const monthEnd = endOfMonth(current).toISOString();

      const { data, error } = await supabase
        .from('appointments')
        .select('scheduled_at')
        .gte('scheduled_at', monthStart)
        .lte('scheduled_at', monthEnd)
        .neq('status', 'cancelled');

      if (error) throw error;

      // Get unique days from appointments
      const uniqueDays = new Set(data.map(a => new Date(a.scheduled_at).getDate()));
      return Array.from(uniqueDays);
    }
  });

  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const start = startOfWeek(monthStart, { weekStartsOn: 1 });
  const end = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

  if (isLoading) {
    return (
      <div className="glass-card p-5 h-[340px] flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg text-foreground capitalize">
          {format(current, "MMMM yyyy", { locale: ptBR })}
        </h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setCurrent(subMonths(current, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setCurrent(addMonths(current, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {["S", "T", "Q", "Q", "S", "S", "D"].map((d, i) => (
          <div key={i} className="text-[10px] text-muted-foreground font-medium pb-2">
            {d}
          </div>
        ))}
        {days.map((day) => {
          const inMonth = isSameMonth(day, current);
          const today = isToday(day);
          const busy = busyDays.includes(day.getDate()) && inMonth;

          return (
            <div
              key={day.toISOString()}
              className={`relative w-8 h-8 flex items-center justify-center rounded-md text-xs cursor-pointer transition-colors mx-auto
                ${!inMonth ? "text-muted-foreground/30" : "text-foreground"}
                ${today ? "bg-primary text-primary-foreground font-bold" : "hover:bg-secondary"}
              `}
            >
              {format(day, "d")}
              {busy && !today && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

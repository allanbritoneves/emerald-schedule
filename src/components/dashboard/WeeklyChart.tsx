import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format, subDays, eachDayOfInterval, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2 } from "lucide-react";

export function WeeklyChart() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['weekly-stats'],
    queryFn: async () => {
      const end = new Date();
      const start = subDays(end, 6);

      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('scheduled_at, status')
        .gte('scheduled_at', start.toISOString())
        .lte('scheduled_at', end.toISOString());

      if (error) throw error;

      const days = eachDayOfInterval({ start, end });

      return days.map(day => {
        const dayAppts = appointments.filter(a => isSameDay(new Date(a.scheduled_at), day));
        return {
          day: format(day, "eee", { locale: ptBR }),
          agendamentos: dayAppts.filter(a => a.status === 'confirmed').length,
          cancelamentos: dayAppts.filter(a => a.status === 'cancelled').length,
        };
      });
    }
  });

  if (isLoading) {
    return (
      <div className="glass-card p-5 h-[340px] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    );
  }
  return (
    <div className="glass-card p-5">
      <h3 className="font-serif text-lg text-foreground mb-4">
        Agendamentos da Semana
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 12% 18%)" vertical={false} />
          <XAxis
            dataKey="day"
            stroke="hsl(220 10% 55%)"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="hsl(220 10% 55%)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(220 14% 11%)",
              border: "1px solid hsl(220 12% 18%)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="agendamentos"
            stroke="hsl(160 100% 39%)"
            strokeWidth={2}
            dot={{ r: 4, fill: "hsl(160 100% 39%)" }}
            name="Agendamentos"
          />
          <Line
            type="monotone"
            dataKey="cancelamentos"
            stroke="hsl(0 72% 51%)"
            strokeWidth={2}
            dot={{ r: 4, fill: "hsl(0 72% 51%)" }}
            name="Cancelamentos"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

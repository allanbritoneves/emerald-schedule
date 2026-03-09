import { CalendarDays, TrendingUp, DollarSign, UserPlus, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { startOfDay, endOfDay, startOfMonth, startOfWeek } from "date-fns";

export function MetricCards() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const todayStart = startOfDay(new Date()).toISOString();
      const todayEnd = endOfDay(new Date()).toISOString();
      const monthStart = startOfMonth(new Date()).toISOString();
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString();

      // Today's appointments count
      const { count: todayCount, error: todayError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('scheduled_at', todayStart)
        .lte('scheduled_at', todayEnd)
        .neq('status', 'cancelled');

      // Month revenue (confirmed appointments * 120)
      const { count: monthConfirmedCount, error: monthError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('scheduled_at', monthStart)
        .eq('status', 'confirmed');

      // New clients this week
      const { count: newClientsCount, error: clientsError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekStart);

      if (todayError || monthError || clientsError) throw new Error("Erro ao carregar métricas");

      const revenue = (monthConfirmedCount || 0) * 120;
      const occupancy = Math.min(100, Math.round(((todayCount || 0) / 10) * 100)); // Assuming 10 slots per day

      return [
        {
          label: "Agendamentos Hoje",
          value: (todayCount || 0).toString(),
          change: "atualizado agora",
          icon: CalendarDays,
          trend: "neutral" as const,
        },
        {
          label: "Taxa de Ocupação",
          value: `${occupancy}%`,
          change: "baseado em 10 slots",
          icon: TrendingUp,
          trend: occupancy > 50 ? "up" as const : "neutral" as const,
        },
        {
          label: "Receita do Mês",
          value: `R$ ${revenue.toLocaleString('pt-BR')}`,
          change: "apenas confirmados",
          icon: DollarSign,
          trend: "up" as const,
        },
        {
          label: "Novos Clientes",
          value: (newClientsCount || 0).toString(),
          change: "esta semana",
          icon: UserPlus,
          trend: (newClientsCount || 0) > 0 ? "up" as const : "neutral" as const,
        },
      ];
    },
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-5 animate-pulse h-[120px] flex flex-col justify-center items-center">
            <Loader2 className="w-5 h-5 text-muted-foreground animate-spin mb-2" />
            <div className="h-4 w-24 bg-secondary rounded" />
          </div>
        ))}
      </div>
    );
  }

  const displayMetrics = metrics || [];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {displayMetrics.map((m) => (
        <div key={m.label} className="glass-card-hover p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
              {m.label}
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <m.icon className="w-4 h-4 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{m.value}</p>
          <p className="text-[10px] text-primary/80 mt-1 font-medium">{m.change}</p>
        </div>
      ))}
    </div>
  );
}

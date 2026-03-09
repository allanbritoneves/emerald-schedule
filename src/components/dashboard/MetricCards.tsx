import { CalendarDays, TrendingUp, DollarSign, UserPlus } from "lucide-react";

const metrics = [
  {
    label: "Agendamentos Hoje",
    value: "12",
    change: "+3 vs ontem",
    icon: CalendarDays,
    trend: "up" as const,
  },
  {
    label: "Taxa de Ocupação",
    value: "78%",
    change: "+5% vs semana",
    icon: TrendingUp,
    trend: "up" as const,
  },
  {
    label: "Receita do Mês",
    value: "R$ 14.850",
    change: "+12% vs mês anterior",
    icon: DollarSign,
    trend: "up" as const,
  },
  {
    label: "Novos Clientes",
    value: "8",
    change: "esta semana",
    icon: UserPlus,
    trend: "neutral" as const,
  },
];

export function MetricCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => (
        <div key={m.label} className="glass-card-hover p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {m.label}
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <m.icon className="w-4 h-4 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-foreground">{m.value}</p>
          <p className="text-xs text-primary mt-1">{m.change}</p>
        </div>
      ))}
    </div>
  );
}

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

const data = [
  { day: "Seg", agendamentos: 8, cancelamentos: 1 },
  { day: "Ter", agendamentos: 12, cancelamentos: 2 },
  { day: "Qua", agendamentos: 10, cancelamentos: 1 },
  { day: "Qui", agendamentos: 15, cancelamentos: 3 },
  { day: "Sex", agendamentos: 18, cancelamentos: 2 },
  { day: "Sáb", agendamentos: 22, cancelamentos: 1 },
  { day: "Dom", agendamentos: 5, cancelamentos: 0 },
];

export function WeeklyChart() {
  return (
    <div className="glass-card p-5">
      <h3 className="font-serif text-lg text-foreground mb-4">
        Agendamentos da Semana
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 12% 18%)" />
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

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Clock, Flame, Link2, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const heatmapData = [
  [1, 2, 3, 5, 4, 3, 1],
  [2, 3, 5, 5, 5, 4, 1],
  [1, 2, 4, 5, 3, 2, 0],
  [2, 3, 5, 4, 4, 3, 1],
  [1, 2, 3, 3, 2, 1, 0],
  [3, 4, 5, 5, 5, 4, 2],
  [2, 3, 4, 4, 3, 2, 1],
  [1, 1, 2, 3, 2, 1, 0],
  [1, 2, 3, 4, 3, 2, 1],
  [0, 1, 2, 3, 2, 1, 0],
];

const dayLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const hourLabels = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

const intensityClasses = [
  "bg-secondary",
  "bg-primary/10",
  "bg-primary/25",
  "bg-primary/40",
  "bg-primary/60",
  "bg-primary/80",
];

const Settings = () => {
  const [aiEnabled, setAiEnabled] = useState(true);
  const [interval, setInterval] = useState([15]);
  const [overbooking, setOverbooking] = useState(false);
  const [waitlist, setWaitlist] = useState(true);

  return (
    <motion.div
      className="p-6 space-y-6 max-w-4xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div>
        <h1 className="text-2xl font-serif text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">Agenda inteligente e preferências</p>
      </div>

      {/* AI Toggle */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Sugestões de IA</p>
              <p className="text-xs text-muted-foreground">
                Sugerir automaticamente os melhores horários para agendamentos
              </p>
            </div>
          </div>
          <Switch checked={aiEnabled} onCheckedChange={setAiEnabled} />
        </div>
      </div>

      {/* Interval */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <div>
            <Label className="text-foreground">Intervalo entre atendimentos</Label>
            <p className="text-xs text-muted-foreground">{interval[0]} minutos</p>
          </div>
        </div>
        <Slider
          value={interval}
          onValueChange={setInterval}
          min={5}
          max={60}
          step={5}
          className="w-full"
        />
        <div className="flex justify-between mt-2">
          <span className="text-[10px] text-muted-foreground">5 min</span>
          <span className="text-[10px] text-muted-foreground">60 min</span>
        </div>
      </div>

      {/* Heatmap */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <Flame className="w-5 h-5 text-muted-foreground" />
          <div>
            <Label className="text-foreground">Horários de Pico</Label>
            <p className="text-xs text-muted-foreground">Mapa de calor da semana</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-1 min-w-[500px]">
            <div />
            {dayLabels.map((d) => (
              <div key={d} className="text-[10px] text-muted-foreground text-center font-medium pb-1">
                {d}
              </div>
            ))}
            {heatmapData.map((row, ri) => (
              <>
                <div key={`label-${ri}`} className="text-[10px] text-muted-foreground text-right pr-2 flex items-center justify-end">
                  {hourLabels[ri]}
                </div>
                {row.map((val, ci) => (
                  <div
                    key={`${ri}-${ci}`}
                    className={`h-7 rounded-sm ${intensityClasses[val]} transition-colors`}
                    title={`${hourLabels[ri]} ${dayLabels[ci]}: nível ${val}`}
                  />
                ))}
              </>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <span className="text-[10px] text-muted-foreground">Baixo</span>
          {intensityClasses.map((cls, i) => (
            <div key={i} className={`w-4 h-3 rounded-sm ${cls}`} />
          ))}
          <span className="text-[10px] text-muted-foreground">Alto</span>
        </div>
      </div>

      {/* Google Calendar */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Link2 className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">Google Calendar</p>
              <p className="text-xs text-muted-foreground">Sincronize seus agendamentos</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="text-xs">
            Conectar
          </Button>
        </div>
      </div>

      {/* Overbooking & Waitlist */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">Overbooking</p>
              <p className="text-xs text-muted-foreground">Permitir agendamentos além da capacidade</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {overbooking && <Badge variant="outline" className="status-pending text-[10px]">Ativo</Badge>}
            <Switch checked={overbooking} onCheckedChange={setOverbooking} />
          </div>
        </div>

        <div className="border-t border-border pt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">Lista de Espera</p>
              <p className="text-xs text-muted-foreground">Clientes podem entrar na fila quando lotado</p>
            </div>
          </div>
          <Switch checked={waitlist} onCheckedChange={setWaitlist} />
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Star, CalendarPlus, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Client = {
  id: number;
  name: string;
  initials: string;
  email: string;
  visits: number;
  totalSpent: string;
  nextAppointment: string | null;
  history: string[];
};

const mockClients: Client[] = [
  { id: 1, name: "Ana Silva", initials: "AS", email: "ana@email.com", visits: 24, totalSpent: "R$ 3.200", nextAppointment: "Hoje, 09:00", history: ["Corte + Escova — 01 Mar", "Hidratação — 15 Fev", "Corte — 01 Fev"] },
  { id: 2, name: "Carlos Mendes", initials: "CM", email: "carlos@email.com", visits: 15, totalSpent: "R$ 1.800", nextAppointment: "Amanhã, 14:00", history: ["Barba — 28 Fev", "Corte + Barba — 14 Fev"] },
  { id: 3, name: "Julia Santos", initials: "JS", email: "julia@email.com", visits: 8, totalSpent: "R$ 960", nextAppointment: null, history: ["Coloração — 25 Fev", "Corte — 10 Fev"] },
  { id: 4, name: "Pedro Lima", initials: "PL", email: "pedro@email.com", visits: 32, totalSpent: "R$ 4.100", nextAppointment: "Sex, 11:00", history: ["Corte Masculino — 02 Mar", "Barba — 16 Fev", "Corte — 02 Fev"] },
  { id: 5, name: "Mariana Costa", initials: "MC", email: "mariana@email.com", visits: 5, totalSpent: "R$ 650", nextAppointment: null, history: ["Manicure — 20 Fev"] },
  { id: 6, name: "Rafael Oliveira", initials: "RO", email: "rafael@email.com", visits: 19, totalSpent: "R$ 2.400", nextAppointment: "Seg, 09:00", history: ["Corte + Barba — 27 Fev", "Corte — 13 Fev"] },
];

const VIP_THRESHOLD = 15;

const Clients = () => {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = mockClients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mockClients.length} clientes cadastrados
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <CalendarPlus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-secondary border-border"
        />
      </div>

      <div className="glass-card overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_120px_120px_140px_100px] gap-4 px-5 py-3 border-b border-border text-xs text-muted-foreground uppercase tracking-wider font-medium">
          <span>Cliente</span>
          <span>Visitas</span>
          <span>Gasto Total</span>
          <span>Próx. Agendamento</span>
          <span />
        </div>

        {/* Rows */}
        {filtered.map((client) => {
          const isVip = client.visits >= VIP_THRESHOLD;
          const isExpanded = expanded === client.id;

          return (
            <div key={client.id} className="border-b border-border last:border-0">
              <div
                className="grid grid-cols-[1fr_120px_120px_140px_100px] gap-4 px-5 py-4 items-center hover:bg-secondary/30 transition-colors cursor-pointer"
                onClick={() => setExpanded(isExpanded ? null : client.id)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {client.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {client.name}
                      </span>
                      {isVip && (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-accent/10 text-accent border-accent/20">
                          <Star className="w-2.5 h-2.5 mr-0.5 fill-accent" />
                          VIP
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{client.email}</span>
                  </div>
                </div>
                <span className="text-sm text-foreground">{client.visits}</span>
                <span className="text-sm text-foreground">{client.totalSpent}</span>
                <span className="text-sm text-foreground">
                  {client.nextAppointment || <span className="text-muted-foreground">—</span>}
                </span>
                <div className="flex items-center gap-1">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <motion.div
                  className="px-5 pb-4 pt-1"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="bg-secondary/50 rounded-lg p-4 flex items-start gap-6">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Histórico Recente</p>
                      <div className="space-y-1">
                        {client.history.map((h, i) => (
                          <p key={i} className="text-xs text-secondary-foreground">{h}</p>
                        ))}
                      </div>
                    </div>
                    <div className="ml-auto">
                      <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs">
                        <CalendarPlus className="w-3.5 h-3.5 mr-1.5" />
                        Agendar agora
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-muted-foreground text-sm">Nenhum cliente encontrado</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Clients;

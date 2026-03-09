import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Star, CalendarPlus, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

type Client = {
  id: string;
  name: string;
  initials: string;
  email: string;
  visits: number;
  totalSpent: string;
  nextAppointment: string | null;
  history: string[];
};

const VIP_THRESHOLD = 15;

const Clients = () => {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  // States for New Client Modal
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");

  // States for Schedule Appointment Modal
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedClientForSchedule, setSelectedClientForSchedule] = useState<{ id: string, name: string } | null>(null);
  const [appointmentService, setAppointmentService] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");

  const queryClient = useQueryClient();

  const addClientMutation = useMutation({
    mutationFn: async (newClient: { name: string; email: string }) => {
      const { data, error } = await supabase
        .from("clients")
        .insert([newClient])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["clients-simple"] });
      setIsDialogOpen(false);
      setNewClientName("");
      setNewClientEmail("");
      toast.success("Cliente cadastrado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao cadastrar cliente: " + error.message);
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["clients-simple"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      toast.success("Cliente excluído com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir cliente: " + error.message);
    },
  });

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) {
      toast.error("O nome do cliente é obrigatório");
      return;
    }
    addClientMutation.mutate({ name: newClientName, email: newClientEmail });
  };

  const addAppointmentMutation = useMutation({
    mutationFn: async (newAppt: { client_id: string; service_name: string; scheduled_at: string; duration_minutes: number }) => {
      const { data, error } = await supabase
        .from("appointments")
        .insert([newAppt])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setIsScheduleDialogOpen(false);
      setAppointmentService("");
      setAppointmentDate("");
      setAppointmentTime("");
      toast.success("Agendamento criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar agendamento: " + error.message);
    },
  });

  const handleScheduleAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientForSchedule) return;
    if (!appointmentService.trim() || !appointmentDate || !appointmentTime) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    // Combine date and time
    const [year, month, day] = appointmentDate.split('-');
    const [hours, minutes] = appointmentTime.split(':');
    const scheduledAt = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));

    addAppointmentMutation.mutate({
      client_id: selectedClientForSchedule.id,
      service_name: appointmentService,
      scheduled_at: scheduledAt.toISOString(),
      duration_minutes: 60 // Padrão: 1 hora
    });
  };

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          id, name, email,
          appointments ( id, service_name, scheduled_at, duration_minutes, status )
        `);

      if (error) throw error;

      return data.map(c => {
        const initials = c.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

        const appts = c.appointments || [];
        const pastAppts = appts.filter((a: any) => new Date(a.scheduled_at) < new Date() && a.status === 'confirmed');
        const futureAppts = appts.filter((a: any) => new Date(a.scheduled_at) >= new Date() && a.status !== 'cancelled')
          .sort((a: any, b: any) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

        const visits = pastAppts.length;
        const totalSpent = "R$ " + (visits * 120);

        let nextAppointment = null;
        if (futureAppts.length > 0) {
          const nextDate = new Date(futureAppts[0].scheduled_at);
          nextAppointment = nextDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
        }

        const history = pastAppts.sort((a: any, b: any) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()).slice(0, 3).map((a: any) => {
          return `${a.service_name} — ${new Date(a.scheduled_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`;
        });

        return {
          id: c.id,
          name: c.name,
          initials,
          email: c.email || '',
          visits,
          totalSpent,
          nextAppointment,
          history
        };
      });
    }
  });

  const filtered = clients.filter((c: Client) =>
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
            {isLoading ? "Carregando..." : `${clients.length} clientes cadastrados`}
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <CalendarPlus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleAddClient}>
              <DialogHeader>
                <DialogTitle>Novo Cliente</DialogTitle>
                <DialogDescription>
                  Adicione um novo cliente na sua base de dados. Clique em salvar quando terminar.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nome
                  </Label>
                  <Input
                    id="name"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className="col-span-3"
                    disabled={addClientMutation.isPending}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="Opcional"
                    className="col-span-3"
                    disabled={addClientMutation.isPending}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={addClientMutation.isPending}>
                  {addClientMutation.isPending ? "Salvando..." : "Salvar mudanças"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
                    <div className="ml-auto flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-destructive text-destructive hover:bg-destructive/10 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Tem certeza que deseja excluir ${client.name}? Todos os agendamentos vinculados também serão removidos.`)) {
                            deleteClientMutation.mutate(client.id);
                          }
                        }}
                        disabled={deleteClientMutation.isPending}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                        Excluir
                      </Button>
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClientForSchedule({ id: client.id, name: client.name });
                          setIsScheduleDialogOpen(true);
                        }}
                      >
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

      {/* Schedule Appointment Modal */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleScheduleAppointment}>
            <DialogHeader>
              <DialogTitle>Novo Agendamento</DialogTitle>
              <DialogDescription>
                Agendando horário para <strong className="text-foreground">{selectedClientForSchedule?.name}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="service" className="text-right">
                  Serviço
                </Label>
                <Input
                  id="service"
                  value={appointmentService}
                  onChange={(e) => setAppointmentService(e.target.value)}
                  placeholder="Ex: Corte Masculino"
                  className="col-span-3"
                  disabled={addAppointmentMutation.isPending}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Data
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="col-span-3"
                  disabled={addAppointmentMutation.isPending}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="time" className="text-right">
                  Horário
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="col-span-3"
                  disabled={addAppointmentMutation.isPending}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsScheduleDialogOpen(false)} disabled={addAppointmentMutation.isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={addAppointmentMutation.isPending}>
                {addAppointmentMutation.isPending ? "Confirmando..." : "Confirmar Agendamento"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Clients;

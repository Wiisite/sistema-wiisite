import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, ChevronRight, Edit2, MapPin, Plus, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const eventTypeMap = {
  meeting: "Reunião",
  visit: "Visita",
  call: "Ligação",
  other: "Outro",
};

const eventTypeColors: Record<string, string> = {
  meeting: "bg-blue-500",
  visit: "bg-green-500",
  call: "bg-purple-500",
  other: "bg-gray-500",
  task: "bg-amber-500",
  payable: "bg-red-500",
  receivable: "bg-emerald-500",
  recurring: "bg-orange-500",
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [viewEventOpen, setViewEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [viewDateOpen, setViewDateOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "meeting",
    startTime: "",
    endTime: "",
    customerId: "",
    projectId: "",
    location: "",
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  const endDate = new Date(lastDay);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

  const { data: events, refetch } = trpc.calendar.events.useQuery({
    startDate,
    endDate,
  });

  const { data: financialAlerts } = trpc.calendar.financialAlerts.useQuery({
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
  });

  const { data: customers } = trpc.customers.list.useQuery();
  const { data: projects } = trpc.projects.list.useQuery();

  const createMutation = trpc.calendar.create.useMutation({
    onSuccess: () => {
      toast.success("Evento criado com sucesso!");
      refetch();
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao criar evento: " + error.message);
    },
  });

  const updateMutation = trpc.calendar.update.useMutation({
    onSuccess: () => {
      toast.success("Evento atualizado com sucesso!");
      refetch();
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar evento: " + error.message);
    },
  });

  const deleteMutation = trpc.calendar.delete.useMutation({
    onSuccess: () => {
      toast.success("Evento excluído com sucesso!");
      refetch();
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao excluir evento: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      eventType: "meeting",
      startTime: "",
      endTime: "",
      customerId: "",
      projectId: "",
      location: "",
    });
    setEditingEvent(null);
    setSelectedDate(null);
  };

  const handleDateClick = (date: Date) => {
    // Criar nova data preservando apenas ano, mês e dia (sem timezone issues)
    const cleanDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
    setSelectedDate(cleanDate);
    const timeStr = new Date().toTimeString().slice(0, 5);
    setFormData({
      ...formData,
      startTime: timeStr,
      endTime: timeStr,
    });
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const baseDate = selectedDate || new Date();
    const [startHour, startMin] = formData.startTime.split(":").map(Number);
    const [endHour, endMin] = formData.endTime.split(":").map(Number);

    // Criar datas usando ano, mês, dia explicitamente para evitar problemas de timezone
    const startDate = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      startHour,
      startMin,
      0
    );

    const endDate = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      endHour,
      endMin,
      0
    );

    const data = {
      title: formData.title,
      description: formData.description,
      eventType: formData.eventType as any,
      startDate,
      endDate,
      customerId: formData.customerId && formData.customerId !== "" ? parseInt(formData.customerId) : undefined,
      projectId: formData.projectId && formData.projectId !== "" ? parseInt(formData.projectId) : undefined,
      location: formData.location,
    };

    if (editingEvent) {
      updateMutation.mutate({ id: Number(editingEvent.id), data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (event: any) => {
    setEditingEvent(event);
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    setSelectedDate(start);
    setFormData({
      title: event.title || "",
      description: event.description || "",
      eventType: event.eventType || "meeting",
      startTime: start.toTimeString().slice(0, 5),
      endTime: end.toTimeString().slice(0, 5),
      customerId: event.customerId?.toString() || "",
      projectId: event.projectId?.toString() || "",
      location: event.location || "",
    });
    setOpen(true);
  };

  const handleDelete = () => {
    if (editingEvent && confirm("Deseja realmente excluir este evento?")) {
      deleteMutation.mutate({ id: Number(editingEvent.id) });
    }
  };

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const calendarDays = useMemo(() => {
    const days = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [startDate, endDate]);

  const getEventsForDate = (date: Date) => {
    if (!events) return [];
    return events.filter((event: any) => {
      const eventDate = new Date(event.startDate);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendário</h1>
            <p className="text-muted-foreground">
              Gerencie visitas, reuniões e compromissos
            </p>
          </div>
          <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEvent ? "Editar Evento" : "Novo Evento"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      placeholder="Ex: Reunião com cliente"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventType">Tipo *</Label>
                    <Select
                      value={formData.eventType}
                      onValueChange={(value) => setFormData({ ...formData, eventType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(eventTypeMap).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Local</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Ex: Escritório do cliente"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="eventDate">Data do Evento *</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          const [year, month, day] = e.target.value.split('-').map(Number);
                          setSelectedDate(new Date(year, month - 1, day, 12, 0, 0));
                        }
                      }}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Horário Início *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">Horário Fim *</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerId">Cliente</Label>
                    <Select
                      value={formData.customerId}
                      onValueChange={(value) => setFormData({ ...formData, customerId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers?.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projectId">Projeto</Label>
                    <Select
                      value={formData.projectId}
                      onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um projeto" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects?.map((row) => (
                          <SelectItem key={row.project.id} value={row.project.id.toString()}>
                            {row.project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-between">
                  {editingEvent && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </Button>
                  )}
                  <div className="flex gap-2 ml-auto">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {editingEvent ? "Atualizar" : "Criar"}
                    </Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {monthNames[month]} {year}
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
              <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
                {day}
              </div>
            ))}
            {calendarDays.map((date, index) => {
              const isCurrentMonth = date.getMonth() === month;
              const isToday =
                date.getDate() === new Date().getDate() &&
                date.getMonth() === new Date().getMonth() &&
                date.getFullYear() === new Date().getFullYear();
              const dayEvents = getEventsForDate(date);

              return (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors ${
                    !isCurrentMonth ? "bg-muted/30" : ""
                  } ${isToday ? "border-primary border-2" : ""}`}
                  onClick={() => handleDateClick(date)}
                >
                  <div className={`text-sm font-medium mb-1 ${!isCurrentMonth ? "text-muted-foreground" : ""}`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event: any) => {
                      const eventColor = eventTypeColors[event.type] || eventTypeColors[event.eventType] || "bg-gray-500";
                      
                      return (
                        <div
                          key={event.id}
                          className={`text-xs px-2 py-1 rounded text-white truncate cursor-pointer hover:opacity-80 ${eventColor}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                            setViewDate(date);
                            setViewEventOpen(true);
                          }}
                        >
                          {event.type === 'event' && new Date(event.startDate).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          {event.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <div 
                        className="text-xs text-muted-foreground px-2 cursor-pointer hover:text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewDate(date);
                          setViewEventOpen(true);
                          setSelectedEvent(null);
                        }}
                      >
                        +{dayEvents.length - 2} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Dialog para visualizar evento e compromissos da data */}
      <Dialog open={viewEventOpen} onOpenChange={setViewEventOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {viewDate ? `Compromissos - ${viewDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}` : 'Detalhes'}
            </DialogTitle>
          </DialogHeader>
          
          {/* Lista de todos os compromissos da data */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {viewDate && getEventsForDate(viewDate).map((event: any) => {
              const eventColor = eventTypeColors[event.type] || eventTypeColors[event.eventType] || "bg-gray-500";
              const isSelected = selectedEvent?.id === event.id;
              
              return (
                <div 
                  key={event.id} 
                  className={`p-3 rounded-lg border ${isSelected ? 'ring-2 ring-primary' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-3 h-3 rounded-full ${eventColor}`}></span>
                        <span className="font-medium">{event.title}</span>
                      </div>
                      
                      {event.description && (
                        <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                      )}
                      
                      <div className="text-xs text-muted-foreground space-y-1">
                        {event.type === 'event' && (
                          <>
                            <p>⏰ {new Date(event.startDate).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} - {new Date(event.endDate).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
                            {event.location && <p>📍 {event.location}</p>}
                            {event.customer && <p>👤 Cliente: {event.customer.name}</p>}
                            {event.project && <p>📁 Projeto: {event.project.name}</p>}
                          </>
                        )}
                        {event.type === 'task' && (
                          <p>📋 Tarefa - Status: {event.status}</p>
                        )}
                        {event.type === 'payable' && (
                          <p>💰 Valor: R$ {parseFloat(event.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        )}
                        {event.type === 'receivable' && (
                          <p>💵 Valor: R$ {parseFloat(event.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        )}
                      </div>
                    </div>
                    
                    {event.type === 'event' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setViewEventOpen(false);
                          handleEdit(event);
                        }}
                      >
                        <Edit2 className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            
            {viewDate && getEventsForDate(viewDate).length === 0 && (
              <p className="text-center text-muted-foreground py-4">Nenhum compromisso nesta data</p>
            )}
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setViewEventOpen(false)}>
              Fechar
            </Button>
            <Button onClick={() => {
              setViewEventOpen(false);
              if (viewDate) {
                handleDateClick(viewDate);
              }
            }}>
              <Plus className="h-4 w-4 mr-1" />
              Novo Evento
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Avisos Financeiros */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Contas a Pagar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <TrendingDown className="h-5 w-5" />
              Contas a Pagar - {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {financialAlerts?.payables && financialAlerts.payables.length > 0 ? (
              <div className="space-y-3">
                {financialAlerts.payables.map((item: any) => (
                  <div key={item.accountPayable.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{item.supplier?.name || 'Sem fornecedor'}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.category?.name} • Vence em {new Date(item.accountPayable.dueDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <p className="font-semibold text-red-600">
                      R$ {parseFloat(item.accountPayable.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhuma conta a pagar neste mês</p>
            )}
          </CardContent>
        </Card>

        {/* Contas a Receber */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <TrendingUp className="h-5 w-5" />
              Contas a Receber - {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {financialAlerts?.receivables && financialAlerts.receivables.length > 0 ? (
              <div className="space-y-3">
                {financialAlerts.receivables.map((item: any) => (
                  <div key={item.accountReceivable.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{item.customer?.name || 'Sem cliente'}</p>
                      <p className="text-sm text-muted-foreground">
                        Pedido #{item.order?.id} • Vence em {new Date(item.accountReceivable.dueDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <p className="font-semibold text-green-600">
                      R$ {parseFloat(item.accountReceivable.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhuma conta a receber neste mês</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

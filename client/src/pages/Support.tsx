import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle2, Clock, MessageSquare, Plus, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type TicketStatus = "open" | "in_progress" | "waiting_customer" | "resolved" | "closed";
type TicketPriority = "low" | "medium" | "high" | "urgent";
type TicketCategory = "bug" | "adjustment" | "content" | "financial" | "other";

const statusConfig: Record<TicketStatus, { label: string; color: string; icon: any }> = {
  open: { label: "Aberto", color: "bg-blue-100 text-blue-700", icon: AlertCircle },
  in_progress: { label: "Em Andamento", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  waiting_customer: { label: "Aguardando Cliente", color: "bg-orange-100 text-orange-700", icon: User },
  resolved: { label: "Resolvido", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  closed: { label: "Fechado", color: "bg-gray-100 text-gray-700", icon: CheckCircle2 },
};

const priorityColors: Record<TicketPriority, string> = {
  low: "bg-gray-200 text-gray-700",
  medium: "bg-blue-200 text-blue-700",
  high: "bg-orange-200 text-orange-700",
  urgent: "bg-red-200 text-red-700",
};

const categoryLabels: Record<TicketCategory, string> = {
  bug: "Bug",
  adjustment: "Ajuste",
  content: "Conteúdo",
  financial: "Financeiro",
  other: "Outro",
};

export default function Support() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [formData, setFormData] = useState({
    customerId: "",
    subject: "",
    description: "",
    category: "other" as TicketCategory,
    priority: "medium" as TicketPriority,
    sla: "24h" as "4h" | "24h" | "72h",
  });

  const { data: tickets, refetch } = trpc.tickets.list.useQuery();
  const { data: customers } = trpc.customers.list.useQuery();
  const { data: comments, refetch: refetchComments } = trpc.tickets.comments.useQuery(
    { ticketId: selectedTicket! },
    { enabled: !!selectedTicket }
  );

  const createMutation = trpc.tickets.create.useMutation({
    onSuccess: () => {
      toast.success("Chamado criado com sucesso!");
      refetch();
      setIsDialogOpen(false);
      setFormData({
        customerId: "",
        subject: "",
        description: "",
        category: "other",
        priority: "medium",
        sla: "24h",
      });
    },
    onError: (error) => {
      toast.error(`Erro ao criar chamado: ${error.message}`);
    },
  });

  const updateMutation = trpc.tickets.update.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  const createCommentMutation = trpc.tickets.createComment.useMutation({
    onSuccess: () => {
      toast.success("Comentário adicionado!");
      refetchComments();
      setCommentText("");
    },
    onError: (error) => {
      toast.error(`Erro ao adicionar comentário: ${error.message}`);
    },
  });

  const handleCreate = () => {
    if (!formData.customerId || !formData.subject.trim() || !formData.description.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    createMutation.mutate({
      customerId: parseInt(formData.customerId),
      subject: formData.subject,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      sla: formData.sla,
    });
  };

  const handleStatusChange = (ticketId: number, newStatus: TicketStatus) => {
    updateMutation.mutate({
      id: ticketId,
      data: {
        status: newStatus,
        resolvedDate: newStatus === "resolved" ? new Date() : undefined,
        closedDate: newStatus === "closed" ? new Date() : undefined,
      },
    });
  };

  const handleAddComment = () => {
    if (!selectedTicket || !commentText.trim()) return;
    createCommentMutation.mutate({
      ticketId: selectedTicket,
      comment: commentText,
      isInternal: 0,
    });
  };

  const ticketsByStatus = (tickets || []).reduce((acc, item) => {
    const status = item.ticket.status as TicketStatus;
    if (!acc[status]) acc[status] = [];
    acc[status].push(item);
    return acc;
  }, {} as Record<TicketStatus, typeof tickets>);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Suporte / Chamados</h1>
            <p className="text-muted-foreground">Gerencie tickets de suporte com SLA</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Chamado
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Novo Chamado</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customerId">Cliente *</Label>
                  <Select value={formData.customerId} onValueChange={(value) => setFormData({ ...formData, customerId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {(customers || []).map((customer) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject">Assunto *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Descreva brevemente o problema"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva detalhadamente o problema..."
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value as TicketCategory })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bug">Bug</SelectItem>
                        <SelectItem value="adjustment">Ajuste</SelectItem>
                        <SelectItem value="content">Conteúdo</SelectItem>
                        <SelectItem value="financial">Financeiro</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData({ ...formData, priority: value as TicketPriority })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sla">SLA</Label>
                    <Select value={formData.sla} onValueChange={(value: "4h" | "24h" | "72h") => setFormData({ ...formData, sla: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4h">4 horas</SelectItem>
                        <SelectItem value="24h">24 horas</SelectItem>
                        <SelectItem value="72h">72 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleCreate} className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Criando..." : "Criar Chamado"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="open" className="space-y-4">
          <TabsList>
            <TabsTrigger value="open">Abertos ({ticketsByStatus.open?.length || 0})</TabsTrigger>
            <TabsTrigger value="in_progress">Em Andamento ({ticketsByStatus.in_progress?.length || 0})</TabsTrigger>
            <TabsTrigger value="waiting_customer">Aguardando ({ticketsByStatus.waiting_customer?.length || 0})</TabsTrigger>
            <TabsTrigger value="resolved">Resolvidos ({ticketsByStatus.resolved?.length || 0})</TabsTrigger>
            <TabsTrigger value="closed">Fechados ({ticketsByStatus.closed?.length || 0})</TabsTrigger>
          </TabsList>

          {(["open", "in_progress", "waiting_customer", "resolved", "closed"] as TicketStatus[]).map((status) => (
            <TabsContent key={status} value={status} className="space-y-4">
              {(ticketsByStatus[status] || []).map((item) => {
                const config = statusConfig[status];
                const Icon = config.icon;

                return (
                  <Card key={item.ticket.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{item.ticket.subject}</CardTitle>
                          <CardDescription>
                            Cliente: {item.customer?.name || "N/A"} | Criado em:{" "}
                            {new Date(item.ticket.createdAt).toLocaleString("pt-BR")}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${config.color} flex items-center gap-1`}>
                            <Icon className="h-3 w-3" />
                            {config.label}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{item.ticket.description}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[item.ticket.priority as TicketPriority]}`}>
                          {item.ticket.priority === "low" && "Baixa"}
                          {item.ticket.priority === "medium" && "Média"}
                          {item.ticket.priority === "high" && "Alta"}
                          {item.ticket.priority === "urgent" && "Urgente"}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                          {categoryLabels[item.ticket.category as TicketCategory]}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                          SLA: {item.ticket.sla}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {status !== "closed" && (
                          <Select
                            value={status}
                            onValueChange={(newStatus) => handleStatusChange(item.ticket.id, newStatus as TicketStatus)}
                          >
                            <SelectTrigger className="w-[200px]">
                              <SelectValue placeholder="Alterar status..." />
                            </SelectTrigger>
                            <SelectContent>
                              {(["open", "in_progress", "waiting_customer", "resolved", "closed"] as TicketStatus[])
                                .filter((s) => s !== status)
                                .map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {statusConfig[s].label}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTicket(item.ticket.id)}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Ver Comentários
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {(ticketsByStatus[status] || []).length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Nenhum chamado neste status
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {selectedTicket && (
          <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Comentários do Chamado</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {(comments || []).map((item) => (
                  <Card key={item.comment.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-semibold">
                          {item.creator?.name || "Usuário"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.comment.createdAt).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <p className="text-sm">{item.comment.comment}</p>
                    </CardContent>
                  </Card>
                ))}
                {(comments || []).length === 0 && (
                  <p className="text-center text-muted-foreground py-4">Nenhum comentário ainda</p>
                )}
                <div className="space-y-2">
                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Adicione um comentário..."
                    rows={3}
                  />
                  <Button onClick={handleAddComment} disabled={createCommentMutation.isPending || !commentText.trim()}>
                    {createCommentMutation.isPending ? "Enviando..." : "Adicionar Comentário"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}

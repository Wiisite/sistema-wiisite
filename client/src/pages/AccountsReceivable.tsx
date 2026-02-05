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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Edit, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const statusMap = {
  pending: "Pendente",
  received: "Recebido",
  overdue: "Vencido",
  cancelled: "Cancelado",
};

const statusColors = {
  pending: "status-pending",
  received: "status-received",
  overdue: "status-overdue",
  cancelled: "status-cancelled",
};

export default function AccountsReceivable() {
  const [open, setOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"list" | "monthly">("list");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear] = useState(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "received">("all");
  const [formData, setFormData] = useState({
    customerId: "",
    orderId: "",
    description: "",
    amount: "",
    dueDate: "",
    notes: "",
    installments: "1", // Número de parcelas
  });

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const { data: accounts, isLoading, refetch } = trpc.accountsReceivable.list.useQuery();
  const { data: customers } = trpc.customers.list.useQuery();
  const { data: orders } = trpc.orders.list.useQuery();

  const createMutation = trpc.accountsReceivable.create.useMutation({
    onSuccess: () => {
      toast.success("Conta a receber criada com sucesso!");
      refetch();
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao criar conta: " + error.message);
    },
  });

  const updateMutation = trpc.accountsReceivable.update.useMutation({
    onSuccess: () => {
      toast.success("Conta atualizada com sucesso!");
      refetch();
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar conta: " + error.message);
    },
  });

  const markAsReceivedMutation = trpc.accountsReceivable.markAsReceived.useMutation({
    onSuccess: () => {
      toast.success("Conta marcada como recebida!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao marcar como recebida: " + error.message);
    },
  });

  const deleteMutation = trpc.accountsReceivable.delete.useMutation({
    onSuccess: () => {
      toast.success("Conta excluída com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao excluir conta: " + error.message);
    },
  });

  const deleteAllMutation = trpc.accountsReceivable.deleteAll.useMutation({
    onSuccess: () => {
      toast.success("Todas as contas a receber foram excluídas!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao excluir contas: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      customerId: "",
      orderId: "",
      description: "",
      amount: "",
      dueDate: "",
      notes: "",
      installments: "1",
    });
    setEditingAccount(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      customerId: parseInt(formData.customerId),
      orderId: formData.orderId ? parseInt(formData.orderId) : undefined,
      description: formData.description,
      amount: formData.amount,
      dueDate: new Date(formData.dueDate),
      notes: formData.notes,
      installments: parseInt(formData.installments) || 1,
    };

    if (editingAccount) {
      updateMutation.mutate({ id: editingAccount.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (account: any) => {
    setEditingAccount(account);
    setFormData({
      customerId: account.customerId?.toString() || "",
      orderId: account.orderId?.toString() || "",
      description: account.description || "",
      amount: account.amount || "",
      dueDate: account.dueDate ? new Date(account.dueDate).toISOString().split("T")[0] : "",
      notes: account.notes || "",
      installments: "1", // Edição não permite alterar parcelas
    });
    setOpen(true);
  };

  const handleMarkAsReceived = (id: number) => {
    if (confirm("Marcar esta conta como recebida?")) {
      markAsReceivedMutation.mutate({ id, receivedDate: new Date() });
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(price));
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  // Filtrar contas por mês (para visão mensal)
  const getAccountsForMonth = (month: number) => {
    if (!accounts) return [];
    return accounts.filter(row => {
      const dueDate = new Date(row.account.dueDate);
      return dueDate.getMonth() === month && dueDate.getFullYear() === selectedYear;
    });
  };

  // Contas do mês atual (para visão lista)
  const currentMonthAccounts = accounts?.filter(row => {
    const dueDate = new Date(row.account.dueDate);
    const now = new Date();
    return dueDate.getMonth() === now.getMonth() && dueDate.getFullYear() === now.getFullYear();
  }) || [];

  // Contas do mês selecionado (para visão mensal)
  const monthlyAccounts = getAccountsForMonth(selectedMonth);
  
  // Aplicar filtro de status
  const filteredMonthlyAccounts = monthlyAccounts.filter(row => {
    if (statusFilter === "all") return true;
    return row.account.status === statusFilter;
  });

  // Calcular totais do mês
  const monthlyTotals = {
    pending: monthlyAccounts.filter(r => r.account.status === "pending").reduce((sum, r) => sum + parseFloat(r.account.amount), 0),
    received: monthlyAccounts.filter(r => r.account.status === "received").reduce((sum, r) => sum + parseFloat(r.account.amount), 0),
    total: monthlyAccounts.reduce((sum, r) => sum + parseFloat(r.account.amount), 0),
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contas a Receber</h1>
            <p className="text-muted-foreground">
              Gerencie suas receitas e recebimentos de clientes
            </p>
          </div>
          <div className="flex gap-2">
            {/* Botões Lista/Mensal */}
            <div className="flex border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                className="rounded-none"
                onClick={() => setViewMode("list")}
              >
                Lista
              </Button>
              <Button
                variant={viewMode === "monthly" ? "default" : "ghost"}
                className="rounded-none"
                onClick={() => setViewMode("monthly")}
              >
                Mensal
              </Button>
            </div>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm("ATENÇÃO: Tem certeza que deseja excluir TODAS as contas a receber? Esta ação não pode ser desfeita!")) {
                  deleteAllMutation.mutate();
                }
              }}
              disabled={!accounts || accounts.length === 0 || deleteAllMutation.isPending}
            >
              <X className="mr-2 h-4 w-4" />
              Excluir Todos
            </Button>
            <Dialog open={open} onOpenChange={(isOpen) => {
              setOpen(isOpen);
              if (!isOpen) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Conta
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAccount ? "Editar Conta a Receber" : "Nova Conta a Receber"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerId">Cliente *</Label>
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
                    <Label htmlFor="orderId">Pedido (opcional)</Label>
                    <Select
                      value={formData.orderId}
                      onValueChange={(value) => setFormData({ ...formData, orderId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um pedido" />
                      </SelectTrigger>
                      <SelectContent>
                        {orders?.map((row) => (
                          <SelectItem key={row.order.id} value={row.order.id.toString()}>
                            {row.order.orderNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="description">Descrição *</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Valor Total *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>
                  {!editingAccount && (
                    <div className="space-y-2">
                      <Label htmlFor="installments">Número de Parcelas *</Label>
                      <Input
                        id="installments"
                        type="number"
                        min="1"
                        max="120"
                        value={formData.installments}
                        onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
                        required
                        placeholder="Ex: 12"
                      />
                      <p className="text-xs text-muted-foreground">
                        {parseInt(formData.installments) > 1 && formData.amount ? 
                          `${formData.installments}x de R$ ${(parseFloat(formData.amount) / parseInt(formData.installments)).toFixed(2)}` 
                          : "Informe o valor e número de parcelas"}
                      </p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Data do Primeiro Vencimento *</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingAccount ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Visão Mensal - Tabs de meses */}
        {viewMode === "monthly" && (
          <div className="flex gap-1 overflow-x-auto pb-2">
            {months.map((month, index) => (
              <Button
                key={index}
                variant={selectedMonth === index ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMonth(index)}
                className="whitespace-nowrap"
              >
                {(index + 1).toString().padStart(2, "0")}/{selectedYear}
              </Button>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {viewMode === "list" 
                  ? `Contas a Receber - ${months[new Date().getMonth()]} de ${new Date().getFullYear()}`
                  : `${months[selectedMonth]} De ${selectedYear}`
                }
              </CardTitle>
              {viewMode === "monthly" && (
                <div className="flex items-center gap-4 text-sm">
                  <span>Pendente <span className="text-yellow-600 font-semibold">{formatPrice(monthlyTotals.pending.toString())}</span></span>
                  <span>Recebido <span className="text-green-600 font-semibold">{formatPrice(monthlyTotals.received.toString())}</span></span>
                  <span>Total <span className="font-semibold">{formatPrice(monthlyTotals.total.toString())}</span></span>
                </div>
              )}
            </div>
            {viewMode === "monthly" && (
              <div className="flex gap-2 mt-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                >
                  Todos
                </Button>
                <Button
                  variant={statusFilter === "pending" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("pending")}
                >
                  Pendentes
                </Button>
                <Button
                  variant={statusFilter === "received" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("received")}
                >
                  Recebidos
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando contas...
              </div>
            ) : (viewMode === "list" ? currentMonthAccounts : filteredMonthlyAccounts).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma conta encontrada para este período.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Pedido</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(viewMode === "list" ? currentMonthAccounts : filteredMonthlyAccounts).map((row) => (
                      <TableRow key={row.account.id}>
                        <TableCell className="font-medium">{row.account.description}</TableCell>
                        <TableCell>{row.customer?.name || "-"}</TableCell>
                        <TableCell>{row.order?.orderNumber || "-"}</TableCell>
                        <TableCell>{formatPrice(row.account.amount)}</TableCell>
                        <TableCell>{formatDate(row.account.dueDate)}</TableCell>
                        <TableCell>
                          <span className={`status-badge ${statusColors[row.account.status]}`}>
                            {statusMap[row.account.status]}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {row.account.status === "pending" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleMarkAsReceived(row.account.id)}
                                title="Marcar como recebido"
                              >
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(row.account)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm("Tem certeza que deseja excluir esta conta?")) {
                                  deleteMutation.mutate({ id: row.account.id });
                                }
                              }}
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

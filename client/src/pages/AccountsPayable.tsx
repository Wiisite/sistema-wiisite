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
  paid: "Pago",
  overdue: "Vencido",
  cancelled: "Cancelado",
};

const statusColors = {
  pending: "status-pending",
  paid: "status-paid",
  overdue: "status-overdue",
  cancelled: "status-cancelled",
};

export default function AccountsPayable() {
  const [open, setOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"list" | "monthly">("list");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear] = useState(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "paid">("all");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: "",
    description: "",
    amount: "",
    dueDate: "",
    notes: "",
    installments: "1",
  });

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const { data: accounts, isLoading, refetch } = trpc.accountsPayable.list.useQuery();
  const { data: suppliers } = trpc.suppliers.list.useQuery();
  const { data: categories, refetch: refetchCategories } = trpc.financialCategories.list.useQuery({ type: "expense" });

  const createCategoryMutation = trpc.financialCategories.create.useMutation({
    onSuccess: (result: any) => {
      toast.success("Categoria criada!");
      refetchCategories();
      setNewCategoryName("");
      setShowNewCategory(false);
    },
    onError: (error) => {
      toast.error("Erro ao criar categoria: " + error.message);
    },
  });

  const createMutation = trpc.accountsPayable.create.useMutation({
    onSuccess: () => {
      toast.success("Conta a pagar criada com sucesso!");
      refetch();
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao criar conta: " + error.message);
    },
  });

  const updateMutation = trpc.accountsPayable.update.useMutation({
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

  const markAsPaidMutation = trpc.accountsPayable.markAsPaid.useMutation({
    onSuccess: () => {
      toast.success("Conta marcada como paga!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao marcar como paga: " + error.message);
    },
  });

  const deleteMutation = trpc.accountsPayable.delete.useMutation({
    onSuccess: () => {
      toast.success("Conta excluída com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao excluir conta: " + error.message);
    },
  });

  const deleteAllMutation = trpc.accountsPayable.deleteAll.useMutation({
    onSuccess: () => {
      toast.success("Todas as contas a pagar foram excluídas!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao excluir contas: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      categoryId: "",
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
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
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
      categoryId: account.categoryId?.toString() || "",
      description: account.description || "",
      amount: account.amount || "",
      dueDate: account.dueDate ? new Date(account.dueDate).toISOString().split("T")[0] : "",
      notes: account.notes || "",
      installments: "1",
    });
    setOpen(true);
  };

  const handleMarkAsPaid = (id: number) => {
    if (confirm("Marcar esta conta como paga?")) {
      markAsPaidMutation.mutate({ id, paymentDate: new Date() });
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
    paid: monthlyAccounts.filter(r => r.account.status === "paid").reduce((sum, r) => sum + parseFloat(r.account.amount), 0),
    total: monthlyAccounts.reduce((sum, r) => sum + parseFloat(r.account.amount), 0),
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contas a Pagar</h1>
            <p className="text-muted-foreground">
              Gerencie suas despesas e pagamentos a fornecedores
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
                if (confirm("ATENÇÃO: Tem certeza que deseja excluir TODAS as contas a pagar? Esta ação não pode ser desfeita!")) {
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
                  {editingAccount ? "Editar Conta a Pagar" : "Nova Conta a Pagar"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Categoria</Label>
                    <div className="flex gap-2">
                      <Select
                        value={formData.categoryId}
                        onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => setShowNewCategory(!showNewCategory)}
                        title="Nova categoria"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {showNewCategory && (
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="Nome da nova categoria"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (newCategoryName.trim()) {
                                createCategoryMutation.mutate({ name: newCategoryName.trim(), type: "expense" });
                              }
                            }
                          }}
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            if (newCategoryName.trim()) {
                              createCategoryMutation.mutate({ name: newCategoryName.trim(), type: "expense" });
                            }
                          }}
                          disabled={createCategoryMutation.isPending || !newCategoryName.trim()}
                        >
                          Salvar
                        </Button>
                      </div>
                    )}
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
                  <div className="space-y-2">
                    <Label htmlFor="installments">Número de Parcelas</Label>
                    <Input
                      id="installments"
                      type="number"
                      min="1"
                      max="120"
                      value={formData.installments}
                      onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
                      
                    />
                    {parseInt(formData.installments) > 1 && formData.amount && (
                      <p className="text-sm text-muted-foreground">
                        {parseInt(formData.installments)}x de R$ {(parseFloat(formData.amount) / parseInt(formData.installments)).toFixed(2)}
                      </p>
                    )}
                  </div>
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
                  ? `Contas a Pagar - ${months[new Date().getMonth()]} de ${new Date().getFullYear()}`
                  : `${months[selectedMonth]} De ${selectedYear}`
                }
              </CardTitle>
              {viewMode === "monthly" && (
                <div className="flex items-center gap-4 text-sm">
                  <span>Pendente <span className="text-yellow-600 font-semibold">{formatPrice(monthlyTotals.pending.toString())}</span></span>
                  <span>Pago <span className="text-green-600 font-semibold">{formatPrice(monthlyTotals.paid.toString())}</span></span>
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
                  variant={statusFilter === "paid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("paid")}
                >
                  Pagos
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
                      <TableHead>Categoria</TableHead>
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
                        <TableCell>{row.category?.name || "-"}</TableCell>
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
                                onClick={() => handleMarkAsPaid(row.account.id)}
                                title="Marcar como pago"
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

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
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Plus, X, Zap, Droplet, Phone, Wifi, Home, Shield, Code, Wrench, MoreHorizontal, Edit2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const categoryMap = {
  electricity: { label: "Energia Elétrica", icon: Zap, color: "bg-yellow-500" },
  water: { label: "Água", icon: Droplet, color: "bg-blue-500" },
  phone: { label: "Telefone", icon: Phone, color: "bg-green-500" },
  internet: { label: "Internet", icon: Wifi, color: "bg-purple-500" },
  rent: { label: "Aluguel", icon: Home, color: "bg-orange-500" },
  insurance: { label: "Seguro", icon: Shield, color: "bg-red-500" },
  software: { label: "Software", icon: Code, color: "bg-indigo-500" },
  maintenance: { label: "Manutenção", icon: Wrench, color: "bg-gray-500" },
  other: { label: "Outro", icon: MoreHorizontal, color: "bg-gray-400" },
};

const frequencyMap = {
  monthly: "Mensal",
  quarterly: "Trimestral",
  yearly: "Anual",
};

const statusMap = {
  active: { label: "Ativo", color: "bg-green-500" },
  paused: { label: "Pausado", color: "bg-yellow-500" },
  cancelled: { label: "Cancelado", color: "bg-red-500" },
};

export default function RecurringExpenses() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    category: "other",
    supplierId: "",
    amount: "",
    frequency: "monthly",
    dayOfMonth: "1",
    startDate: "",
    endDate: "",
    notes: "",
  });

  const { data: expenses, refetch } = trpc.recurringExpenses.list.useQuery();
  const { data: suppliers } = trpc.suppliers.list.useQuery();

  // Extrair categorias customizadas das despesas existentes
  const existingCustomCategories = expenses
    ?.map((e: any) => e.expense.category)
    .filter((c: string) => !(c in categoryMap))
    .filter((c: string, i: number, arr: string[]) => arr.indexOf(c) === i) || [];
  const allCustomCategories = [...new Set([...existingCustomCategories, ...customCategories])];

  const createMutation = trpc.recurringExpenses.create.useMutation({
    onSuccess: () => {
      toast.success("Despesa recorrente criada com sucesso!");
      setIsDialogOpen(false);
      refetch();
      setFormData({
        name: "",
        category: "other",
        supplierId: "",
        amount: "",
        frequency: "monthly",
        dayOfMonth: "1",
        startDate: "",
        endDate: "",
        notes: "",
      });
      setEditingExpense(null);
    },
    onError: (error) => {
      toast.error("Erro ao criar despesa: " + error.message);
    },
  });

  const updateMutation = trpc.recurringExpenses.update.useMutation({
    onSuccess: () => {
      toast.success("Despesa recorrente atualizada com sucesso!");
      setIsDialogOpen(false);
      refetch();
      setFormData({
        name: "",
        category: "other",
        supplierId: "",
        amount: "",
        frequency: "monthly",
        dayOfMonth: "1",
        startDate: "",
        endDate: "",
        notes: "",
      });
      setEditingExpense(null);
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar despesa: " + error.message);
    },
  });

  const deleteMutation = trpc.recurringExpenses.delete.useMutation({
    onSuccess: () => {
      toast.success("Despesa excluída com sucesso!");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir despesa: ${error.message}`);
    },
  });

  const deleteAllMutation = trpc.recurringExpenses.deleteAll.useMutation({
    onSuccess: () => {
      toast.success("Todas as despesas recorrentes foram excluídas!");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir despesas: ${error.message}`);
    },
  });

  const generateBillsMutation = trpc.recurringExpenses.generateMonthlyBills.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.generated} contas geradas com sucesso! ${data.skipped} já existiam.`);
    },
    onError: (error: any) => {
      toast.error(`Erro ao gerar contas: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: formData.name,
      category: formData.category,
      supplierId: formData.supplierId ? parseInt(formData.supplierId) : undefined,
      amount: formData.amount,
      frequency: formData.frequency as "monthly" | "quarterly" | "yearly",
      dayOfMonth: parseInt(formData.dayOfMonth),
      startDate: new Date(formData.startDate),
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      notes: formData.notes,
    };

    if (editingExpense) {
      updateMutation.mutate({ id: editingExpense.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (expense: any) => {
    setEditingExpense(expense);
    setFormData({
      name: expense.name || "",
      category: expense.category || "other",
      supplierId: expense.supplierId?.toString() || "",
      amount: expense.amount || "",
      frequency: expense.frequency || "monthly",
      dayOfMonth: expense.dayOfMonth?.toString() || "1",
      startDate: expense.startDate ? new Date(expense.startDate).toISOString().split("T")[0] : "",
      endDate: expense.endDate ? new Date(expense.endDate).toISOString().split("T")[0] : "",
      notes: expense.notes || "",
    });
    setIsDialogOpen(true);
  };

  const formatPrice = (value: string | null) => {
    if (!value) return "R$ 0,00";
    return `R$ ${parseFloat(value).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Despesas Operacionais Recorrentes</h1>
            <p className="text-muted-foreground">
              Gerencie contas fixas mensais, trimestrais e anuais
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => {
                if (confirm("Gerar contas a pagar para todas as despesas recorrentes ativas do mês atual?")) {
                  generateBillsMutation.mutate(undefined);
                }
              }}
              disabled={generateBillsMutation.isPending || !expenses || expenses.length === 0}
            >
              <Zap className="mr-2 h-4 w-4" />
              {generateBillsMutation.isPending ? "Gerando..." : "Gerar Contas do Mês"}
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                if (confirm("ATENÇÃO: Tem certeza que deseja excluir TODAS as despesas recorrentes? Esta ação não pode ser desfeita!")) {
                  deleteAllMutation.mutate();
                }
              }}
              disabled={deleteAllMutation.isPending || !expenses || expenses.length === 0}
            >
              <X className="mr-2 h-4 w-4" />
              {deleteAllMutation.isPending ? "Excluindo..." : "Excluir Todos"}
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Despesa Recorrente
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingExpense ? "Editar Despesa Recorrente" : "Criar Despesa Recorrente"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">Nome da Despesa *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Ex: Conta de Luz - Escritório"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoria *</Label>
                    <div className="flex gap-2">
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData({ ...formData, category: value })
                        }
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(categoryMap).map(([key, { label, icon: Icon }]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {label}
                              </div>
                            </SelectItem>
                          ))}
                          {allCustomCategories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              <div className="flex items-center gap-2">
                                <MoreHorizontal className="h-4 w-4" />
                                {cat}
                              </div>
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
                                const name = newCategoryName.trim();
                                setCustomCategories(prev => [...prev, name]);
                                setFormData({ ...formData, category: name });
                                setNewCategoryName("");
                                setShowNewCategory(false);
                              }
                            }
                          }}
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            if (newCategoryName.trim()) {
                              const name = newCategoryName.trim();
                              setCustomCategories(prev => [...prev, name]);
                              setFormData({ ...formData, category: name });
                              setNewCategoryName("");
                              setShowNewCategory(false);
                            }
                          }}
                          disabled={!newCategoryName.trim()}
                        >
                          Adicionar
                        </Button>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="supplierId">Fornecedor</Label>
                    <Select
                      value={formData.supplierId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, supplierId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers?.map((s: any) => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="amount">Valor *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="frequency">Frequência *</Label>
                    <Select
                      value={formData.frequency}
                      onValueChange={(value) =>
                        setFormData({ ...formData, frequency: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(frequencyMap).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dayOfMonth">Dia do Vencimento *</Label>
                    <Input
                      id="dayOfMonth"
                      type="number"
                      min="1"
                      max="31"
                      value={formData.dayOfMonth}
                      onChange={(e) =>
                        setFormData({ ...formData, dayOfMonth: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="startDate">Data de Início *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Data de Término</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Criando..." : "Criar Despesa"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Cards de Resumo por Categoria */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(categoryMap).slice(0, 5).map(([key, { label, icon: Icon, color }]) => {
            const categoryExpenses = expenses?.filter(
              (e: any) => e.expense.category === key && e.expense.status === "active"
            ) || [];
            const total = categoryExpenses.reduce(
              (sum: number, e: any) => sum + parseFloat(e.expense.amount || "0"),
              0
            );
            return (
              <Card key={key}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${color} text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{label}</p>
                      <p className="text-lg font-bold">
                        {formatPrice(total.toFixed(2))}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {categoryExpenses.length} ativa(s)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabela de Despesas */}
        <Card>
          <CardHeader>
            <CardTitle>Todas as Despesas Recorrentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Frequência</TableHead>
                  <TableHead>Dia Venc.</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses && expenses.length > 0 ? expenses.map((item: any) => {
                  const category = categoryMap[item.expense.category as keyof typeof categoryMap] || { label: item.expense.category, icon: MoreHorizontal, color: "bg-gray-400" };
                  const Icon = category.icon;
                  return (
                    <TableRow key={item.expense.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded ${category.color} text-white`}>
                            <Icon className="h-3 w-3" />
                          </div>
                          <span className="text-sm">{category.label}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{item.expense.name}</TableCell>
                      <TableCell>{item.supplier?.name || "-"}</TableCell>
                      <TableCell>{formatPrice(item.expense.amount)}</TableCell>
                      <TableCell>
                        {frequencyMap[item.expense.frequency as keyof typeof frequencyMap]}
                      </TableCell>
                      <TableCell>{item.expense.dayOfMonth}</TableCell>
                      <TableCell>{formatDate(item.expense.startDate)}</TableCell>
                      <TableCell>
                        <Badge
                          className={`${statusMap[item.expense.status as keyof typeof statusMap].color} text-white`}
                        >
                          {statusMap[item.expense.status as keyof typeof statusMap].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item.expense)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm("Tem certeza que deseja excluir esta despesa recorrente?")) {
                                deleteMutation.mutate({ id: item.expense.id });
                              }
                            }}
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                }) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      Nenhuma despesa recorrente encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

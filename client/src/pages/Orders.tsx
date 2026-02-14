import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import {
  Plus,
  Trash2,
  DollarSign,
  TrendingUp,
  Filter,
  FileText,
  Edit2,
  Check,
  X,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";

const statusMap: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  in_production: "Em Produção",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const statusColorMap: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  in_production: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function Orders() {
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    customerId: "",
    orderNumber: "",
    items: [{ productId: "", quantity: "", unitPrice: "", subtotal: "" }],
    notes: "",
    laborHours: 0,
    laborRate: 0,
    materialCost: 0,
    thirdPartyCost: 0,
    otherDirectCosts: 0,
    indirectCostsTotal: 0,
    profitMargin: 50,
    simplesRate: 10,
    installments: 1,
  });

  const { data: orders, isLoading, refetch } = trpc.orders.list.useQuery();
  const { data: customers } = trpc.customers.list.useQuery();
  const { data: products } = trpc.products.list.useQuery({ activeOnly: true });

  const createMutation = trpc.orders.create.useMutation({
    onSuccess: () => {
      toast.success("Pedido criado com sucesso!");
      refetch();
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao criar pedido: " + error.message);
    },
  });

  const updateMutation = trpc.orders.update.useMutation({
    onSuccess: () => {
      toast.success("Pedido atualizado com sucesso!");
      refetch();
      resetForm();
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar pedido: " + error.message);
    },
  });

  const updateStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar status: " + error.message);
    },
  });

  const deleteMutation = trpc.orders.delete.useMutation({
    onSuccess: () => {
      toast.success("Pedido excluído com sucesso!");
      refetch();
    },
    onError: (error: any) => {
      toast.error("Erro ao excluir pedido: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      customerId: "",
      orderNumber: "",
      items: [{ productId: "", quantity: "", unitPrice: "", subtotal: "" }],
      notes: "",
      laborHours: 0,
      laborRate: 0,
      materialCost: 0,
      thirdPartyCost: 0,
      otherDirectCosts: 0,
      indirectCostsTotal: 0,
      profitMargin: 50,
      simplesRate: 10,
      installments: 1,
    });
    setShowForm(false);
    setEditingOrder(null);
  };

  // Cálculos automáticos
  const calculated = useMemo(() => {
    const calculatedLaborCost = formData.laborHours * formData.laborRate;
    const totalDirectCosts = calculatedLaborCost + formData.materialCost + formData.thirdPartyCost + formData.otherDirectCosts;
    const totalCosts = totalDirectCosts + formData.indirectCostsTotal;
    const grossValue = totalCosts === 0 ? 0 : formData.profitMargin >= 100 ? totalCosts : totalCosts / (1 - formData.profitMargin / 100);
    const simplesAmount = grossValue * (formData.simplesRate / 100);
    const netProfit = grossValue - totalCosts - simplesAmount;
    return { totalDirectCosts, totalCosts, grossValue, simplesAmount, netProfit, finalPrice: grossValue };
  }, [formData.laborHours, formData.laborRate, formData.materialCost, formData.thirdPartyCost, formData.otherDirectCosts, formData.indirectCostsTotal, formData.profitMargin, formData.simplesRate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(parseFloat(price));
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: "", quantity: "", unitPrice: "", subtotal: "" }],
    });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === "productId") {
      const product = products?.find((p) => p.id === parseInt(value));
      if (product) {
        newItems[index].unitPrice = product.price;
      }
    }

    if (field === "quantity" || field === "unitPrice") {
      const qty = parseFloat(newItems[index].quantity || "0");
      const price = parseFloat(newItems[index].unitPrice || "0");
      newItems[index].subtotal = (qty * price).toFixed(2);
    }

    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + parseFloat(item.subtotal || "0"), 0).toFixed(2);
  };

  const handleSubmit = () => {
    if (!formData.customerId) {
      toast.error("Selecione um cliente");
      return;
    }
    if (formData.items.some((item) => !item.productId)) {
      toast.error("Selecione um produto para cada item");
      return;
    }

    const totalAmount = calculateTotal();
    const data = {
      customerId: parseInt(formData.customerId),
      orderNumber: formData.orderNumber,
      items: formData.items.map((item) => ({
        productId: parseInt(item.productId),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      })),
      totalAmount,
      notes: formData.notes,
    };

    if (editingOrder) {
      updateMutation.mutate({ id: editingOrder.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (row: any) => {
    setEditingOrder(row.order);

    if (row.items && row.items.length > 0) {
      setFormData({
        customerId: row.order.customerId ? row.order.customerId.toString() : "",
        orderNumber: row.order.orderNumber,
        items: row.items.map((item: any) => ({
          productId: item.item.productId.toString(),
          quantity: item.item.quantity,
          unitPrice: item.item.unitPrice,
          subtotal: item.item.subtotal,
        })),
        notes: row.order.notes || "",
        laborHours: 0,
        laborRate: 0,
        materialCost: 0,
        thirdPartyCost: 0,
        otherDirectCosts: 0,
        indirectCostsTotal: 0,
        profitMargin: 50,
        simplesRate: 10,
        installments: 1,
      });
    } else {
      setFormData({
        customerId: row.order.customerId ? row.order.customerId.toString() : "",
        orderNumber: row.order.orderNumber,
        items: [{ productId: "", quantity: "", unitPrice: "", subtotal: "" }],
        notes: row.order.notes || "",
        laborHours: 0,
        laborRate: 0,
        materialCost: 0,
        thirdPartyCost: 0,
        otherDirectCosts: 0,
        indirectCostsTotal: 0,
        profitMargin: 50,
        simplesRate: 10,
        installments: 1,
      });
    }

    setShowForm(true);
  };

  // Filtrar pedidos
  const filteredOrders = orders?.filter((row: any) => {
    if (statusFilter === "all") return true;
    return row.order.status === statusFilter;
  });

  // Estatísticas
  const stats = {
    total: orders?.length || 0,
    pending: orders?.filter((r: any) => r.order.status === "pending").length || 0,
    approved: orders?.filter((r: any) => r.order.status === "approved").length || 0,
    in_production: orders?.filter((r: any) => r.order.status === "in_production").length || 0,
    completed: orders?.filter((r: any) => r.order.status === "completed").length || 0,
    cancelled: orders?.filter((r: any) => r.order.status === "cancelled").length || 0,
  };

  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Pedidos</h1>
            <p className="text-muted-foreground">
              Gerencie pedidos de vendas e acompanhe o pipeline
            </p>
          </div>
          <Button onClick={() => {
            if (!editingOrder) {
              const year = new Date().getFullYear();
              const count = orders?.length || 0;
              const nextNumber = `PED-${year}-${String(count + 1).padStart(3, '0')}`;
              setFormData(prev => ({ ...prev, orderNumber: nextNumber }));
            }
            setShowForm(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Pedido
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Estatísticas */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Estatísticas
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="font-bold text-lg">{stats.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pendentes</span>
                  <span className="font-semibold text-yellow-600">{stats.pending}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Aprovados</span>
                  <span className="font-semibold text-green-600">{stats.approved}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Em Produção</span>
                  <span className="font-semibold text-blue-600">{stats.in_production}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Concluídos</span>
                  <span className="font-semibold text-emerald-600">{stats.completed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cancelados</span>
                  <span className="font-semibold text-red-600">{stats.cancelled}</span>
                </div>
              </div>
            </Card>

            {/* Filtros */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtrar por Status
              </h3>
              <div className="space-y-2">
                {[
                  { value: "all", label: `Todos (${stats.total})` },
                  { value: "pending", label: `Pendentes (${stats.pending})` },
                  { value: "approved", label: `Aprovados (${stats.approved})` },
                  { value: "in_production", label: `Em Produção (${stats.in_production})` },
                  { value: "completed", label: `Concluídos (${stats.completed})` },
                  { value: "cancelled", label: `Cancelados (${stats.cancelled})` },
                ].map((opt) => (
                  <Button
                    key={opt.value}
                    variant={statusFilter === opt.value ? "default" : "outline"}
                    className="w-full justify-start"
                    size="sm"
                    onClick={() => setStatusFilter(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </Card>
          </div>

          {/* Conteúdo Principal */}
          <div className="lg:col-span-3 space-y-6">

            {/* Formulário */}
            {showForm && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {editingOrder ? "Editar Pedido" : "Novo Pedido"}
                </h2>

                <div className="grid gap-4">
                  {/* Informações Básicas */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Número do Pedido *</Label>
                      <Input
                        value={formData.orderNumber}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                    <div>
                      <Label>Cliente *</Label>
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
                  </div>

                  {/* Itens do Pedido */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Itens do Pedido *</h3>
                      <Button type="button" variant="outline" size="sm" onClick={addItem}>
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Item
                      </Button>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-muted/50 text-sm font-semibold text-muted-foreground border-b">
                        <div className="col-span-5">Produto</div>
                        <div className="col-span-2 text-center">Qtd</div>
                        <div className="col-span-2 text-right">Preço Unit.</div>
                        <div className="col-span-2 text-right">Subtotal</div>
                        <div className="col-span-1"></div>
                      </div>

                      {formData.items.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-3 px-4 py-3 border-b last:border-b-0 items-center">
                          <div className="col-span-5">
                            <Select
                              value={item.productId}
                              onValueChange={(value) => updateItem(index, "productId", value)}
                            >
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Selecione um produto" />
                              </SelectTrigger>
                              <SelectContent>
                                {products?.map((product) => (
                                  <SelectItem key={product.id} value={product.id.toString()}>
                                    {product.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-2">
                            <Input
                              type="number"
                              step="1"
                              min="1"
                              className="h-10 text-center"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, "quantity", e.target.value)}
                            />
                          </div>
                          <div className="col-span-2">
                            <Input
                              type="number"
                              step="0.01"
                              className="h-10 text-right"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                            />
                          </div>
                          <div className="col-span-2 text-right font-semibold text-sm pr-2">
                            {formatPrice(item.subtotal || "0")}
                          </div>
                          <div className="col-span-1 text-center">
                            {formData.items.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => removeItem(index)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}

                      <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-muted/50 border-t font-semibold">
                        <div className="col-span-9 text-right">Total dos Itens:</div>
                        <div className="col-span-2 text-right text-lg">
                          {formatPrice(calculateTotal())}
                        </div>
                        <div className="col-span-1"></div>
                      </div>
                    </div>
                  </div>

                  {/* Custos Diretos */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Custos Diretos</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label>Horas de Trabalho</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.laborHours}
                          onChange={(e) => setFormData({ ...formData, laborHours: parseFloat(e.target.value) || 0 })}
                          placeholder="Ex: 40"
                        />
                      </div>
                      <div>
                        <Label>Valor por Hora (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.laborRate}
                          onChange={(e) => setFormData({ ...formData, laborRate: parseFloat(e.target.value) || 0 })}
                          placeholder="Ex: 50.00"
                        />
                      </div>
                      <div>
                        <Label>Mão de Obra Total (R$)</Label>
                        <Input
                          type="number"
                          value={(formData.laborHours * formData.laborRate).toFixed(2)}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <div>
                        <Label>Materiais (R$)</Label>
                        <Input
                          type="number"
                          value={formData.materialCost}
                          onChange={(e) => setFormData({ ...formData, materialCost: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label>Terceiros (R$)</Label>
                        <Input
                          type="number"
                          value={formData.thirdPartyCost}
                          onChange={(e) => setFormData({ ...formData, thirdPartyCost: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label>Outros Custos Diretos (R$)</Label>
                        <Input
                          type="number"
                          value={formData.otherDirectCosts}
                          onChange={(e) => setFormData({ ...formData, otherDirectCosts: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Custos Indiretos */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Custos Indiretos (Rateados)</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Total de Custos Indiretos (R$)</Label>
                        <Input
                          type="number"
                          value={formData.indirectCostsTotal}
                          onChange={(e) => setFormData({ ...formData, indirectCostsTotal: parseFloat(e.target.value) || 0 })}
                          placeholder="Aluguel, internet, sistemas, etc."
                        />
                      </div>
                      <div>
                        <Label>Margem de Lucro (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={formData.profitMargin}
                          onChange={(e) => setFormData({ ...formData, profitMargin: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Alíquota Simples Nacional */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Imposto - Simples Nacional (Anexo III)</h3>
                      <span className="text-xs text-muted-foreground">Alíquota padrão: 10%</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Alíquota Simples Nacional (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.simplesRate}
                          onChange={(e) => setFormData({ ...formData, simplesRate: parseFloat(e.target.value) || 0 })}
                          placeholder="Ex: 10"
                        />
                      </div>
                      <div className="flex items-end">
                        <p className="text-sm text-muted-foreground pb-2">
                          Imposto estimado: <span className="font-semibold text-orange-600">{formatCurrency(calculated.simplesAmount)}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Demonstrativo Financeiro */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Demonstrativo Financeiro</h3>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <Card className="p-4 bg-gray-50 dark:bg-gray-900">
                        <p className="text-muted-foreground mb-1">Custos Totais</p>
                        <p className="text-2xl font-bold">{formatCurrency(calculated.totalCosts)}</p>
                      </Card>
                      <Card className="p-4 bg-orange-50 dark:bg-orange-950/20">
                        <p className="text-muted-foreground mb-1">Simples Nacional ({formData.simplesRate}%)</p>
                        <p className="text-2xl font-bold text-orange-600">{formatCurrency(calculated.simplesAmount)}</p>
                      </Card>
                      <Card className="p-4 bg-green-50 dark:bg-green-950/20">
                        <p className="text-muted-foreground mb-1">Lucro Líquido</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(calculated.netProfit)}</p>
                      </Card>
                    </div>

                    <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Preço Final de Venda</p>
                          <p className="text-3xl font-bold text-purple-600">{formatCurrency(calculated.finalPrice)}</p>
                        </div>
                        <DollarSign className="h-12 w-12 text-purple-400" />
                      </div>
                    </div>

                    {/* Parcelas */}
                    <div className="mt-4 p-4 bg-white dark:bg-gray-900 border rounded-lg">
                      <Label className="text-sm font-semibold mb-3 block">Condição de Pagamento</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { value: 1, label: "À Vista" },
                          { value: 3, label: "3x" },
                          { value: 6, label: "6x" },
                          { value: 12, label: "12x" },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, installments: option.value })}
                            className={`p-3 rounded-lg border-2 text-center transition-all ${
                              formData.installments === option.value
                                ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 font-semibold"
                                : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                            }`}
                          >
                            <p className="text-sm font-medium">{option.label}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {option.value === 1
                                ? formatCurrency(calculated.finalPrice)
                                : `${option.value}x ${formatCurrency(calculated.finalPrice / option.value)}`}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Detalhamento */}
                    <details className="mt-4">
                      <summary className="cursor-pointer font-semibold text-sm">
                        Ver detalhamento completo
                      </summary>
                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Custos Diretos:</span>
                          <span className="font-semibold">{formatCurrency(calculated.totalDirectCosts)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Custos Indiretos:</span>
                          <span className="font-semibold">{formatCurrency(formData.indirectCostsTotal)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span>Custo Total:</span>
                          <span className="font-semibold">{formatCurrency(calculated.totalCosts)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Valor Bruto (com margem {formData.profitMargin}%):</span>
                          <span className="font-semibold">{formatCurrency(calculated.grossValue)}</span>
                        </div>
                        <div className="flex justify-between text-orange-600">
                          <span>Simples Nacional ({formData.simplesRate}%):</span>
                          <span className="font-semibold">-{formatCurrency(calculated.simplesAmount)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 text-green-600">
                          <span className="font-semibold">Lucro Líquido Final:</span>
                          <span className="font-bold">{formatCurrency(calculated.netProfit)}</span>
                        </div>
                      </div>
                    </details>
                  </div>

                  {/* Observações */}
                  <div className="border-t pt-4">
                    <Label>Observações</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Anotações internas"
                      rows={2}
                    />
                  </div>

                  {/* Botões */}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSubmit}
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {editingOrder ? "Atualizar Pedido" : "Criar Pedido"}
                    </Button>
                    <Button variant="outline" onClick={resetForm}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Lista de Pedidos */}
            <div className="grid gap-4">
              {filteredOrders?.map((row: any) => (
                <Card key={row.order.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{row.order.orderNumber}</h3>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${statusColorMap[row.order.status] || "bg-gray-100 text-gray-800"}`}>
                          {statusMap[row.order.status] || row.order.status}
                        </span>
                      </div>
                      {row.customer && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Cliente: {row.customer.name}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Data: {formatDate(row.order.orderDate)}
                      </p>
                      {row.order.notes && (
                        <p className="text-sm text-muted-foreground mt-1 italic">
                          {row.order.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">
                        {formatPrice(row.order.totalAmount)}
                      </p>
                      <div className="flex flex-row flex-wrap gap-2 mt-3 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(row)}
                        >
                          <Edit2 className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/orders/${row.order.id}/print`, '_blank')}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                        {row.order.status === "pending" && (
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              if (confirm("Deseja aprovar este pedido?")) {
                                updateStatusMutation.mutate({ id: row.order.id, status: "approved" });
                              }
                            }}
                            disabled={updateStatusMutation.isPending}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Aprovar
                          </Button>
                        )}
                        {row.order.status === "approved" && (
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => {
                              if (confirm("Deseja iniciar a produção deste pedido?")) {
                                updateStatusMutation.mutate({ id: row.order.id, status: "in_production" });
                              }
                            }}
                            disabled={updateStatusMutation.isPending}
                          >
                            <Package className="h-4 w-4 mr-1" />
                            Produção
                          </Button>
                        )}
                        {row.order.status === "in_production" && (
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => {
                              if (confirm("Deseja marcar este pedido como concluído?")) {
                                updateStatusMutation.mutate({ id: row.order.id, status: "completed" });
                              }
                            }}
                            disabled={updateStatusMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Concluir
                          </Button>
                        )}
                        {row.order.status !== "cancelled" && row.order.status !== "completed" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              if (confirm("Deseja cancelar este pedido?")) {
                                updateStatusMutation.mutate({ id: row.order.id, status: "cancelled" });
                              }
                            }}
                            disabled={updateStatusMutation.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancelar
                          </Button>
                        )}
                        {(row.order.status === "cancelled" || row.order.status === "completed") && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              if (confirm("Tem certeza que deseja excluir este pedido?")) {
                                deleteMutation.mutate({ id: row.order.id });
                              }
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Excluir
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {filteredOrders?.length === 0 && !showForm && (
                <Card className="p-12 text-center">
                  <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {statusFilter === "all"
                      ? "Nenhum pedido cadastrado ainda."
                      : "Nenhum pedido com este status."}
                  </p>
                  {statusFilter === "all" && (
                    <Button className="mt-4" onClick={() => {
                      const year = new Date().getFullYear();
                      const count = orders?.length || 0;
                      const nextNumber = `PED-${year}-${String(count + 1).padStart(3, '0')}`;
                      setFormData(prev => ({ ...prev, orderNumber: nextNumber }));
                      setShowForm(true);
                    }}>
                      Criar Primeiro Pedido
                    </Button>
                  )}
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

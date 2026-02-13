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
import { Edit, FileText, Plus, Trash2, DollarSign } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

const statusMap = {
  pending: "Pendente",
  approved: "Aprovado",
  in_production: "Em Produção",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const statusColors = {
  pending: "status-pending",
  approved: "status-approved",
  in_production: "status-in-production",
  completed: "status-completed",
  cancelled: "status-cancelled",
};

export default function Orders() {
  const [open, setOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [formData, setFormData] = useState({
    customerId: "",
    orderNumber: "",
    items: [{ productId: "", quantity: "", unitPrice: "", subtotal: "" }],
    notes: "",
    // Custos
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
      setOpen(false);
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
      setOpen(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleStatusChange = (orderId: number, status: "pending" | "approved" | "in_production" | "completed" | "cancelled") => {
    updateStatusMutation.mutate({ id: orderId, status });
  };

  const handleEdit = (row: any) => {
    setEditingOrder(row.order);
    
    // Se o pedido tem items, popular o formulário
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
      });
    } else {
      // Se não tem items, usar dados básicos
      setFormData({
        customerId: row.order.customerId ? row.order.customerId.toString() : "",
        orderNumber: row.order.orderNumber,
        items: [{ productId: "", quantity: "", unitPrice: "", subtotal: "" }],
        notes: row.order.notes || "",
      });
    }
    
    setOpen(true);
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

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
            <p className="text-muted-foreground">
              Gerencie pedidos de vendas e acompanhe o pipeline
            </p>
          </div>
          <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                if (!editingOrder) {
                  const year = new Date().getFullYear();
                  const count = orders?.length || 0;
                  const nextNumber = `PED-${year}-${String(count + 1).padStart(3, '0')}`;
                  setFormData(prev => ({ ...prev, orderNumber: nextNumber }));
                }
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Pedido
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[98vw] max-w-[1600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingOrder ? "Editar Pedido" : "Novo Pedido"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderNumber">Número do Pedido *</Label>
                    <Input
                      id="orderNumber"
                      value={formData.orderNumber}
                      onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                      required
                      readOnly
                      className="bg-muted"
                    />
                  </div>
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
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-base">Itens do Pedido *</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Item
                    </Button>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-muted/50 text-sm font-semibold text-muted-foreground border-b">
                      <div className="col-span-5">Produto</div>
                      <div className="col-span-2 text-center">Quantidade</div>
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
                      <div className="col-span-9 text-right">Total:</div>
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
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label>Horas de Trabalho</Label>
                      <Input type="number" step="0.01" value={formData.laborHours} onChange={(e) => setFormData({ ...formData, laborHours: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div className="space-y-1">
                      <Label>Valor por Hora (R$)</Label>
                      <Input type="number" step="0.01" value={formData.laborRate} onChange={(e) => setFormData({ ...formData, laborRate: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div className="space-y-1">
                      <Label>Mão de Obra Total (R$)</Label>
                      <Input type="number" value={(formData.laborHours * formData.laborRate).toFixed(2)} disabled className="bg-muted" />
                    </div>
                    <div className="space-y-1">
                      <Label>Materiais (R$)</Label>
                      <Input type="number" value={formData.materialCost} onChange={(e) => setFormData({ ...formData, materialCost: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div className="space-y-1">
                      <Label>Terceiros (R$)</Label>
                      <Input type="number" value={formData.thirdPartyCost} onChange={(e) => setFormData({ ...formData, thirdPartyCost: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div className="space-y-1">
                      <Label>Outros Custos Diretos (R$)</Label>
                      <Input type="number" value={formData.otherDirectCosts} onChange={(e) => setFormData({ ...formData, otherDirectCosts: parseFloat(e.target.value) || 0 })} />
                    </div>
                  </div>
                </div>

                {/* Custos Indiretos */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Custos Indiretos (Rateados)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Total de Custos Indiretos (R$)</Label>
                      <Input type="number" value={formData.indirectCostsTotal} onChange={(e) => setFormData({ ...formData, indirectCostsTotal: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div className="space-y-1">
                      <Label>Margem de Lucro (%)</Label>
                      <Input type="number" step="0.1" value={formData.profitMargin} onChange={(e) => setFormData({ ...formData, profitMargin: parseFloat(e.target.value) || 0 })} />
                    </div>
                  </div>
                </div>

                {/* Imposto Simples Nacional */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Imposto - Simples Nacional (Anexo III)</h3>
                    <span className="text-xs text-muted-foreground">Alíquota padrão: 10%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Alíquota Simples Nacional (%)</Label>
                      <Input type="number" step="0.01" value={formData.simplesRate} onChange={(e) => setFormData({ ...formData, simplesRate: parseFloat(e.target.value) || 0 })} />
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
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <Card className="p-4 bg-gray-50">
                      <p className="text-muted-foreground mb-1">Custos Totais</p>
                      <p className="text-2xl font-bold">{formatCurrency(calculated.totalCosts)}</p>
                    </Card>
                    <Card className="p-4 bg-orange-50">
                      <p className="text-muted-foreground mb-1">Simples Nacional ({formData.simplesRate}%)</p>
                      <p className="text-2xl font-bold text-orange-600">{formatCurrency(calculated.simplesAmount)}</p>
                    </Card>
                    <Card className="p-4 bg-green-50">
                      <p className="text-muted-foreground mb-1">Lucro Líquido</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(calculated.netProfit)}</p>
                    </Card>
                  </div>

                  <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Preço Final de Venda</p>
                        <p className="text-3xl font-bold text-purple-600">{formatCurrency(calculated.finalPrice)}</p>
                      </div>
                      <DollarSign className="h-12 w-12 text-purple-400" />
                    </div>
                  </div>

                  {/* Parcelas */}
                  <div className="mt-4 p-4 bg-white border rounded-lg">
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
                              ? "border-purple-500 bg-purple-50 text-purple-700 font-semibold"
                              : "border-gray-200 hover:border-purple-300"
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {editingOrder ? "Atualizar Pedido" : "Criar Pedido"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando pedidos...
              </div>
            ) : !orders || orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum pedido cadastrado. Clique em "Novo Pedido" para começar.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((row) => (
                      <TableRow key={row.order.id}>
                        <TableCell className="font-medium">{row.order.orderNumber}</TableCell>
                        <TableCell>{row.customer?.name || "-"}</TableCell>
                        <TableCell>{formatDate(row.order.orderDate)}</TableCell>
                        <TableCell>{formatPrice(row.order.totalAmount)}</TableCell>
                        <TableCell>
                          <Select
                            value={row.order.status}
                            onValueChange={(value: "pending" | "approved" | "in_production" | "completed" | "cancelled") => handleStatusChange(row.order.id, value)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue>
                                <span className={`status-badge ${statusColors[row.order.status]}`}>
                                  {statusMap[row.order.status]}
                                </span>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(statusMap).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => window.open(`/orders/${row.order.id}/print`, '_blank')}
                              title="Ver PDF"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEdit(row)}
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {row.order.status === 'cancelled' && (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  if (confirm('Tem certeza que deseja excluir este pedido cancelado?')) {
                                    deleteMutation.mutate({ id: row.order.id });
                                  }
                                }}
                                title="Excluir"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
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

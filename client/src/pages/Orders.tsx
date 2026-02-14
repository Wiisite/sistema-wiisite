import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  Trash2,
  DollarSign,
  TrendingUp,
  Filter,
  FileText,
  Check,
  Package,
  CheckCircle,
  XCircle,
  ShoppingCart,
  Eye,
  ChevronDown,
  ChevronUp,
  Loader2,
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
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedBudget, setExpandedBudget] = useState<number | null>(null);

  const { data: orders, refetch } = trpc.orders.list.useQuery();

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

  const formatCurrency = (value: number | string) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value));
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
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
              Gerencie pedidos e acompanhe o pipeline. Pedidos são criados a partir de orçamentos aprovados.
            </p>
          </div>
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
          <div className="lg:col-span-3 space-y-4">
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
                      {formatCurrency(row.order.totalAmount)}
                    </p>
                    <div className="flex flex-row flex-wrap gap-2 mt-3 justify-end">
                      {row.order.budgetId && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setExpandedBudget(expandedBudget === row.order.id ? null : row.order.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Orçamento
                          {expandedBudget === row.order.id ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                        </Button>
                      )}
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

                {/* Dados do Orçamento expandido */}
                {expandedBudget === row.order.id && row.order.budgetId && (
                  <BudgetDetail budgetId={row.order.budgetId} />
                )}
              </Card>
            ))}

            {filteredOrders?.length === 0 && (
              <Card className="p-12 text-center">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {statusFilter === "all"
                    ? "Nenhum pedido ainda. Crie um orçamento e converta em pedido."
                    : "Nenhum pedido com este status."}
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Componente para exibir dados do orçamento de origem
function BudgetDetail({ budgetId }: { budgetId: number }) {
  const { data: budget, isLoading } = trpc.budgets.getById.useQuery({ id: budgetId });
  const { data: items } = trpc.budgets.getItems.useQuery({ budgetId });

  const formatCurrency = (value: number | string) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value));
  };

  if (isLoading) {
    return (
      <div className="mt-4 pt-4 border-t flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
        <span className="text-muted-foreground">Carregando orçamento...</span>
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="mt-4 pt-4 border-t">
        <p className="text-sm text-muted-foreground">Orçamento não encontrado.</p>
      </div>
    );
  }

  const b = budget.budget;

  return (
    <div className="mt-4 pt-4 border-t space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Eye className="h-4 w-4 text-purple-600" />
        <h4 className="font-semibold text-purple-600">Dados do Orçamento — {b.budgetNumber}</h4>
      </div>

      {/* Info básica */}
      <div className="grid md:grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Título:</span>
          <p className="font-medium">{b.title}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Cliente:</span>
          <p className="font-medium">{b.customerName || budget.customer?.name || "—"}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Status:</span>
          <p className="font-medium capitalize">{b.status}</p>
        </div>
      </div>

      {b.description && (
        <div className="text-sm">
          <span className="text-muted-foreground">Descrição:</span>
          <p className="font-medium">{b.description}</p>
        </div>
      )}

      {/* Itens/Serviços */}
      {items && items.length > 0 && (
        <div>
          <h5 className="text-sm font-semibold mb-2">Itens / Serviços</h5>
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-muted/50 text-xs font-semibold text-muted-foreground border-b">
              <div className="col-span-6">Descrição</div>
              <div className="col-span-2 text-center">Qtd</div>
              <div className="col-span-2 text-right">Preço Unit.</div>
              <div className="col-span-2 text-right">Subtotal</div>
            </div>
            {items.map((item: any) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 px-3 py-2 border-b last:border-0 text-sm">
                <div className="col-span-6">{item.description}</div>
                <div className="col-span-2 text-center">{item.quantity}</div>
                <div className="col-span-2 text-right">{formatCurrency(item.unitPrice || 0)}</div>
                <div className="col-span-2 text-right font-medium">{formatCurrency(item.totalPrice || 0)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Demonstrativo Financeiro */}
      <div className="grid md:grid-cols-4 gap-3 text-sm">
        <Card className="p-3 bg-gray-50 dark:bg-gray-900">
          <p className="text-xs text-muted-foreground">Mão de Obra</p>
          <p className="text-lg font-bold">{formatCurrency(b.laborCost || 0)}</p>
        </Card>
        <Card className="p-3 bg-gray-50 dark:bg-gray-900">
          <p className="text-xs text-muted-foreground">Materiais</p>
          <p className="text-lg font-bold">{formatCurrency(b.materialCost || 0)}</p>
        </Card>
        <Card className="p-3 bg-gray-50 dark:bg-gray-900">
          <p className="text-xs text-muted-foreground">Custos Indiretos</p>
          <p className="text-lg font-bold">{formatCurrency(b.indirectCostsTotal || 0)}</p>
        </Card>
        <Card className="p-3 bg-purple-50 dark:bg-purple-950/20">
          <p className="text-xs text-muted-foreground">Valor Final</p>
          <p className="text-lg font-bold text-purple-600">{formatCurrency(b.grossValue || b.totalAmount || 0)}</p>
        </Card>
      </div>

      {/* Detalhes extras */}
      <div className="grid md:grid-cols-3 gap-3 text-sm">
        {Number(b.profitMargin) > 0 && (
          <div className="flex justify-between border rounded-lg p-2">
            <span className="text-muted-foreground">Margem de Lucro:</span>
            <span className="font-semibold">{Number(b.profitMargin).toFixed(1)}%</span>
          </div>
        )}
        {Number(b.cbsRate) > 0 && (
          <div className="flex justify-between border rounded-lg p-2">
            <span className="text-muted-foreground">Simples Nacional:</span>
            <span className="font-semibold">{Number(b.cbsRate).toFixed(1)}%</span>
          </div>
        )}
        {Number(b.installments) > 1 && (
          <div className="flex justify-between border rounded-lg p-2">
            <span className="text-muted-foreground">Parcelas:</span>
            <span className="font-semibold">{b.installments}x</span>
          </div>
        )}
      </div>

      {b.notes && (
        <div className="text-sm bg-muted/50 rounded-lg p-3">
          <span className="text-muted-foreground">Observações:</span>
          <p className="mt-1">{b.notes}</p>
        </div>
      )}
    </div>
  );
}

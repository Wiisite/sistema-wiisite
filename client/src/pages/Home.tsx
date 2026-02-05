import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle, DollarSign, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function Home() {
  const currentYear = new Date().getFullYear();
  
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();
  const { data: cashFlow, isLoading: cashFlowLoading, error: cashFlowError } = trpc.dashboard.cashFlow.useQuery({ year: currentYear });
  const { data: paymentsDue, refetch: refetchPaymentsDue } = trpc.dashboard.paymentsDueToday.useQuery();
  const { data: recurringExpensesDue, refetch: refetchRecurringExpenses } = trpc.dashboard.recurringExpensesDueToday.useQuery();

  const markAsPaidMutation = trpc.recurringExpenses.markAsPaid.useMutation({
    onSuccess: () => {
      toast.success("Despesa marcada como paga!");
      refetchRecurringExpenses();
    },
    onError: (error: any) => {
      toast.error(`Erro ao marcar como paga: ${error.message}`);
    },
  });

  const handleMarkAsPaid = (expenseId: number, expenseName: string) => {
    if (confirm(`Confirmar pagamento de "${expenseName}"?`)) {
      markAsPaidMutation.mutate({ id: expenseId });
    }
  };

  const markAccountAsPaidMutation = trpc.accountsPayable.markAsPaid.useMutation({
    onSuccess: () => {
      toast.success("Conta marcada como paga!");
      refetchPaymentsDue();
    },
    onError: (error: any) => {
      toast.error(`Erro ao marcar como paga: ${error.message}`);
    },
  });

  const handleMarkAccountAsPaid = (accountId: number, accountDescription: string) => {
    if (confirm(`Confirmar pagamento de "${accountDescription}"?`)) {
      markAccountAsPaidMutation.mutate({ id: accountId, paymentDate: new Date() });
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  const chartData = (cashFlow && !cashFlowError) ? cashFlow.map((item) => ({
    month: monthNames[item.month - 1],
    Receitas: item.income,
    Despesas: item.expense,
    Saldo: item.balance,
  })) : [];

  const balance = (stats?.accountsReceivable.pending || 0) - (stats?.accountsPayable.pending || 0);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do seu negócio
          </p>
        </div>

        {statsLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Carregando indicadores...
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPrice(stats?.totalSales || 0)}</div>
                  <p className="text-xs text-muted-foreground">Pedidos concluídos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Contas a Receber</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatPrice(stats?.accountsReceivable.pending || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Pendentes de recebimento</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Contas a Pagar</CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {formatPrice(stats?.accountsPayable.pending || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Pendentes de pagamento</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatPrice(balance)}
                  </div>
                  <p className="text-xs text-muted-foreground">A receber - A pagar</p>
                </CardContent>
              </Card>
            </div>

            {/* Alerta de Pagamentos Vencendo Hoje */}
            {paymentsDue && paymentsDue.count > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <CardTitle className="text-lg text-orange-900">
                      Pagamentos Vencendo Hoje
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Total a Pagar</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {formatPrice(paymentsDue.totalAmount)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Quantidade</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {paymentsDue.count}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-orange-900">Contas:</p>
                      {paymentsDue.accounts.slice(0, 5).map((row: any) => (
                        <div key={row.account.id} className="flex justify-between items-center gap-2 p-2 bg-white rounded text-sm">
                          <div className="flex-1">
                            <p className="font-medium">{row.account.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {row.supplier?.name || "Sem fornecedor"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-orange-600">
                              {formatPrice(parseFloat(row.account.amount))}
                            </p>
                            <button
                              onClick={() => handleMarkAccountAsPaid(row.account.id, row.account.description)}
                              disabled={markAccountAsPaidMutation.isPending}
                              className="p-1.5 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
                              title="Marcar como pago"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {paymentsDue.count > 5 && (
                        <p className="text-xs text-center text-muted-foreground pt-2">
                          + {paymentsDue.count - 5} outras contas
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Alerta de Despesas Recorrentes Vencendo Hoje */}
            {recurringExpensesDue && recurringExpensesDue.count > 0 && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg text-blue-900">
                      Despesas Recorrentes Vencendo Hoje
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Total a Pagar</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatPrice(recurringExpensesDue.totalAmount)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Quantidade</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {recurringExpensesDue.count}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-blue-900">Despesas:</p>
                      {recurringExpensesDue.expenses.slice(0, 5).map((row: any) => (
                        <div key={row.expense.id} className="flex justify-between items-center gap-2 p-2 bg-white rounded text-sm">
                          <div className="flex-1">
                            <p className="font-medium">{row.expense.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {row.supplier?.name || "Sem fornecedor"} • {row.expense.frequency === 'monthly' ? 'Mensal' : row.expense.frequency === 'quarterly' ? 'Trimestral' : 'Anual'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-blue-600">
                              {formatPrice(parseFloat(row.expense.amount))}
                            </p>
                            <button
                              onClick={() => handleMarkAsPaid(row.expense.id, row.expense.name)}
                              disabled={markAsPaidMutation.isPending}
                              className="p-1.5 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
                              title="Marcar como pago"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {recurringExpensesDue.count > 5 && (
                        <p className="text-xs text-center text-muted-foreground pt-2">
                          + {recurringExpensesDue.count - 5} outras despesas
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {cashFlowLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Carregando gráficos...
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Fluxo de Caixa Mensal ({currentYear})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                          formatter={(value: number) => formatPrice(value)}
                          contentStyle={{
                            backgroundColor: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "var(--radius)",
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="Receitas"
                          stroke="hsl(var(--chart-1))"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="Despesas"
                          stroke="hsl(var(--chart-5))"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="Saldo"
                          stroke="hsl(var(--chart-3))"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Receitas vs Despesas ({currentYear})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                          formatter={(value: number) => formatPrice(value)}
                          contentStyle={{
                            backgroundColor: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "var(--radius)",
                          }}
                        />
                        <Legend />
                        <Bar dataKey="Receitas" fill="hsl(var(--chart-2))" />
                        <Bar dataKey="Despesas" fill="hsl(var(--chart-5))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

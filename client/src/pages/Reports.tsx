import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Download, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type ReportType = "sales" | "payable" | "receivable" | "financial" | "recurring";

export default function Reports() {
  const [reportType, setReportType] = useState<ReportType>("sales");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: orders } = trpc.orders.list.useQuery({
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
  });

  const { data: accountsPayable } = trpc.accountsPayable.list.useQuery({
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
  });

  const { data: accountsReceivable } = trpc.accountsReceivable.list.useQuery({
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
  });

  const { data: recurringExpenses } = trpc.recurringExpenses.list.useQuery();

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(price));
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const exportToCSV = () => {
    let csvContent = "";
    let filename = "";

    switch (reportType) {
      case "sales":
        filename = "relatorio_vendas.csv";
        csvContent = "Número,Cliente,Data,Total,Status\n";
        orders?.forEach((row) => {
          csvContent += `${row.order.orderNumber},${row.customer?.name || "-"},${formatDate(row.order.orderDate)},${row.order.totalAmount},${row.order.status}\n`;
        });
        break;

      case "payable":
        filename = "relatorio_contas_pagar.csv";
        csvContent = "Descrição,Fornecedor,Categoria,Valor,Vencimento,Status\n";
        accountsPayable?.forEach((row) => {
          csvContent += `${row.account.description},${row.supplier?.name || "-"},${row.category?.name || "-"},${row.account.amount},${formatDate(row.account.dueDate)},${row.account.status}\n`;
        });
        break;

      case "receivable":
        filename = "relatorio_contas_receber.csv";
        csvContent = "Descrição,Cliente,Pedido,Valor,Vencimento,Status\n";
        accountsReceivable?.forEach((row) => {
          csvContent += `${row.account.description},${row.customer?.name || "-"},${row.order?.orderNumber || "-"},${row.account.amount},${formatDate(row.account.dueDate)},${row.account.status}\n`;
        });
        break;

      case "financial":
        filename = "relatorio_financeiro.csv";
        const totalReceivable = accountsReceivable?.reduce((sum, row) => sum + parseFloat(row.account.amount), 0) || 0;
        const totalPayable = accountsPayable?.reduce((sum, row) => sum + parseFloat(row.account.amount), 0) || 0;
        const totalSales = orders?.reduce((sum, row) => sum + parseFloat(row.order.totalAmount), 0) || 0;
        
        csvContent = "Relatório Financeiro Consolidado\n\n";
        csvContent += "Indicador,Valor\n";
        csvContent += `Total de Vendas,${totalSales.toFixed(2)}\n`;
        csvContent += `Total a Receber,${totalReceivable.toFixed(2)}\n`;
        csvContent += `Total a Pagar,${totalPayable.toFixed(2)}\n`;
        csvContent += `Saldo,${(totalReceivable - totalPayable).toFixed(2)}\n`;
        break;

      case "recurring":
        filename = "relatorio_despesas_recorrentes.csv";
        csvContent = "Nome,Categoria,Valor,Frequência,Dia do Mês,Status\n";
        recurringExpenses?.forEach((row) => {
          csvContent += `${row.expense.name},${row.expense.category},${row.expense.amount},${row.expense.frequency},${row.expense.dayOfMonth},${row.expense.status}\n`;
        });
        break;
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Relatório exportado com sucesso!");
  };

  const getReportData = () => {
    switch (reportType) {
      case "sales":
        return {
          title: "Relatório de Vendas",
          description: "Listagem de todos os pedidos no período selecionado",
          count: orders?.length || 0,
          total: orders?.reduce((sum, row) => sum + parseFloat(row.order.totalAmount), 0) || 0,
        };
      case "payable":
        return {
          title: "Relatório de Contas a Pagar",
          description: "Listagem de todas as contas a pagar no período selecionado",
          count: accountsPayable?.length || 0,
          total: accountsPayable?.reduce((sum, row) => sum + parseFloat(row.account.amount), 0) || 0,
        };
      case "receivable":
        return {
          title: "Relatório de Contas a Receber",
          description: "Listagem de todas as contas a receber no período selecionado",
          count: accountsReceivable?.length || 0,
          total: accountsReceivable?.reduce((sum, row) => sum + parseFloat(row.account.amount), 0) || 0,
        };
      case "financial":
        const totalReceivable = accountsReceivable?.reduce((sum, row) => sum + parseFloat(row.account.amount), 0) || 0;
        const totalPayable = accountsPayable?.reduce((sum, row) => sum + parseFloat(row.account.amount), 0) || 0;
        return {
          title: "Relatório Financeiro Consolidado",
          description: "Visão geral das finanças no período selecionado",
          count: (orders?.length || 0) + (accountsPayable?.length || 0) + (accountsReceivable?.length || 0),
          total: totalReceivable - totalPayable,
        };
      case "recurring":
        return {
          title: "Relatório de Despesas Recorrentes",
          description: "Listagem de todas as despesas recorrentes cadastradas",
          count: recurringExpenses?.length || 0,
          total: recurringExpenses?.reduce((sum, row) => sum + parseFloat(row.expense.amount.toString()), 0) || 0,
        };
    }
  };

  const reportData = getReportData();

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Gere e exporte relatórios do sistema
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuração do Relatório</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="reportType">Tipo de Relatório</Label>
                <Select value={reportType} onValueChange={(value: ReportType) => setReportType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Relatório de Vendas</SelectItem>
                    <SelectItem value="payable">Contas a Pagar</SelectItem>
                    <SelectItem value="receivable">Contas a Receber</SelectItem>
                    <SelectItem value="financial">Relatório Financeiro</SelectItem>
                    <SelectItem value="recurring">Despesas Recorrentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Data Inicial</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Data Final</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{reportData.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{reportData.description}</p>
            </div>
            <Button onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Registros</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData.count}</div>
                  <p className="text-xs text-muted-foreground">
                    {startDate && endDate
                      ? `De ${new Date(startDate).toLocaleDateString("pt-BR")} até ${new Date(endDate).toLocaleDateString("pt-BR")}`
                      : "Todos os períodos"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {reportType === "financial" ? "Saldo" : "Valor Total"}
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${reportType === "financial" && reportData.total < 0 ? "text-red-600" : ""}`}>
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(reportData.total)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {reportType === "payable" && "Total a pagar"}
                    {reportType === "receivable" && "Total a receber"}
                    {reportType === "sales" && "Total de vendas"}
                    {reportType === "financial" && "Saldo (a receber - a pagar)"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Instruções:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Selecione o tipo de relatório desejado</li>
                <li>• Opcionalmente, defina um período específico usando as datas</li>
                <li>• Clique em "Exportar CSV" para baixar o relatório</li>
                <li>• O arquivo CSV pode ser aberto no Excel ou Google Sheets</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

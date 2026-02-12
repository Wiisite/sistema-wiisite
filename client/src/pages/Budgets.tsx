import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, DollarSign, TrendingUp, AlertCircle, FileText, ShoppingCart, Edit2, Send, Check, X, Filter, MessageCircle, FolderKanban, Search, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useViaCep } from "@/hooks/useViaCep";

export default function Budgets() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    customerId: undefined as number | undefined,
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerDocument: "",
    customerAddress: "",
    customerNeighborhood: "",
    customerCity: "",
    customerState: "",
    customerZipCode: "",
    laborCost: 0,
    laborHours: 40,
    laborRate: 50,
    materialCost: 90,
    thirdPartyCost: 0,
    otherDirectCosts: 0,
    indirectCostsTotal: 0,
    profitMargin: 50,
    notes: "",
    installments: 1, // 1 = à vista, 3, 6, 12
    // Impostos editáveis (pré-preenchidos das configurações)
    cbsRate: 0,
    ibsRate: 0,
    irpjRate: 0,
    csllRate: 0,
  });

  const [calculated, setCalculated] = useState({
    totalDirectCosts: 0,
    totalCosts: 0,
    grossValue: 0,
    cbsAmount: 0,
    ibsAmount: 0,
    totalConsumptionTaxes: 0,
    netRevenue: 0,
    profitBeforeTaxes: 0,
    irpjAmount: 0,
    csllAmount: 0,
    netProfit: 0,
    finalPrice: 0,
  });

  const { data: budgets, refetch } = trpc.budgets.list.useQuery();
  const { data: customers } = trpc.customers.list.useQuery();
  const { data: products } = trpc.products.list.useQuery();
  const { data: taxSettings } = trpc.taxSettings.useQuery();
  const { data: templates } = trpc.budgetTemplates.list.useQuery();
  const [selectedProducts, setSelectedProducts] = useState<Array<{ productId: number; quantity: number; price: number }>>([]);
  
  // Hook para busca de CEP
  const { fetchAddress, isLoading: isLoadingCep } = useViaCep();

  // Função para buscar endereço pelo CEP
  const handleCepSearch = async () => {
    const address = await fetchAddress(formData.customerZipCode);
    if (address) {
      setFormData(prev => ({
        ...prev,
        customerAddress: address.address,
        customerNeighborhood: address.neighborhood,
        customerCity: address.city,
        customerState: address.state,
        customerZipCode: address.zipCode,
      }));
      toast.success("Endereço encontrado!");
    } else {
      toast.error("CEP não encontrado");
    }
  };

  // Pré-preencher impostos quando taxSettings carregar
  useEffect(() => {
    if (taxSettings && formData.cbsRate === 0 && formData.ibsRate === 0) {
      setFormData(prev => ({
        ...prev,
        cbsRate: Number(taxSettings.cbsRate) || 0,
        ibsRate: Number(taxSettings.ibsRate) || 0,
        irpjRate: Number(taxSettings.irpjRate) || 0,
        csllRate: Number(taxSettings.csllRate) || 0,
      }));
    }
  }, [taxSettings]);

  const exportPDFMutation = trpc.budgets.exportPDF.useMutation({
    onSuccess: (data) => {
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${data.pdf}`;
      link.download = data.filename;
      link.click();
      toast.success("PDF gerado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao gerar PDF");
    },
  });

  const [, setLocation] = useLocation();

  const createMutation = trpc.budgets.create.useMutation({
    onSuccess: () => {
      toast.success("Orçamento criado com sucesso!");
      refetch();
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const updateMutation = trpc.budgets.update.useMutation({
    onSuccess: () => {
      toast.success("Orçamento atualizado com sucesso!");
      refetch();
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const convertToOrderMutation = trpc.budgets.convertToOrder.useMutation({
    onSuccess: (data) => {
      toast.success(`Pedido ${data.orderNumber} criado com sucesso!`);
      refetch();
      setLocation("/orders");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao converter orçamento");
    },
  });

  const createProjectMutation = trpc.budgets.createProject.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetch();
      setLocation("/projects");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar projeto");
    },
  });

  const whatsappMutation = trpc.budgets.generatePDFForWhatsApp.useMutation({
    onSuccess: (data) => {
      const message = `Ol\u00e1 ${data.customerName}! Segue o or\u00e7amento ${data.budgetNumber} solicitado. Qualquer d\u00favida estou \u00e0 disposi\u00e7\u00e3o!\n\nPDF: ${data.url}`;
      
      // Formatar n\u00famero do telefone (remover caracteres especiais)
      let whatsappUrl;
      if (data.customerPhone) {
        const phoneNumber = data.customerPhone.replace(/\D/g, ''); // Remove tudo que n\u00e3o \u00e9 d\u00edgito
        whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      } else {
        whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      }
      
      window.open(whatsappUrl, "_blank");
      toast.success("Abrindo WhatsApp...");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao gerar PDF");
    },
  });

  const updateStatusMutation = trpc.budgets.update.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar status: ${error.message}`);
    },
  });

  const deleteMutation = trpc.budgets.delete.useMutation({
    onSuccess: () => {
      toast.success("Or\u00e7amento exclu\u00eddo com sucesso!");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir or\u00e7amento: ${error.message}`);
    },
  });

  const deleteAllMutation = trpc.budgets.deleteAll.useMutation({
    onSuccess: () => {
      toast.success("Todos os or\u00e7amentos foram exclu\u00eddos!");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir or\u00e7amentos: ${error.message}`);
    },
  });

  // Recalcular automaticamente quando os campos mudarem
  useEffect(() => {
    // Calcular laborCost automaticamente
    const calculatedLaborCost = formData.laborHours * formData.laborRate;

    const totalDirectCosts =
      calculatedLaborCost +
      formData.materialCost +
      formData.thirdPartyCost +
      formData.otherDirectCosts;

    const totalCosts = totalDirectCosts + formData.indirectCostsTotal;
    const grossValue = formData.profitMargin >= 100 ? totalCosts : totalCosts / (1 - formData.profitMargin / 100);

    // Usar impostos do formulário (editáveis)
    const cbsAmount = grossValue * (formData.cbsRate / 100);
    const ibsAmount = grossValue * (formData.ibsRate / 100);
    const totalConsumptionTaxes = cbsAmount + ibsAmount;

    const netRevenue = grossValue - totalConsumptionTaxes;
    const profitBeforeTaxes = netRevenue - totalCosts;

    const irpjAmount = profitBeforeTaxes * (formData.irpjRate / 100);
    const csllAmount = profitBeforeTaxes * (formData.csllRate / 100);
    const netProfit = profitBeforeTaxes - irpjAmount - csllAmount;

    setCalculated({
      totalDirectCosts,
      totalCosts,
      grossValue,
      cbsAmount,
      ibsAmount,
      totalConsumptionTaxes,
      netRevenue,
      profitBeforeTaxes,
      irpjAmount,
      csllAmount,
      netProfit,
      finalPrice: grossValue,
    });
  }, [formData]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      customerId: undefined,
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerDocument: "",
      customerAddress: "",
      customerNeighborhood: "",
      customerCity: "",
      customerState: "",
      customerZipCode: "",
      laborCost: 0,
      laborHours: 40,
      laborRate: 80,
      materialCost: 0,
      thirdPartyCost: 0,
      otherDirectCosts: 0,
      indirectCostsTotal: 0,
      profitMargin: 50,
      notes: "",
      // Resetar impostos para valores das configurações
      cbsRate: Number(taxSettings?.cbsRate) || 0,
      ibsRate: Number(taxSettings?.ibsRate) || 0,
      irpjRate: Number(taxSettings?.irpjRate) || 0,
      csllRate: Number(taxSettings?.csllRate) || 0,
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!formData.title) {
      toast.error("Título é obrigatório");
      return;
    }

    // Calcular laborCost antes de enviar
    const dataToSubmit = {
      ...formData,
      laborCost: formData.laborHours * formData.laborRate,
      selectedProducts: selectedProducts,
    };

    if (editingId) {
      const { selectedProducts: _, ...updateData } = dataToSubmit;
      updateMutation.mutate({
        id: editingId,
        ...updateData,
      });
    } else {
      createMutation.mutate(dataToSubmit);
    }
  };

  const handleEdit = (budget: any) => {
    setFormData({
      title: budget.title,
      description: budget.description || "",
      customerId: budget.customerId || undefined,
      customerName: budget.customerName || "",
      customerEmail: budget.customerEmail || "",
      customerPhone: budget.customerPhone || "",
      customerDocument: budget.customerDocument || "",
      customerAddress: budget.customerAddress || "",
      customerNeighborhood: budget.customerNeighborhood || "",
      customerCity: budget.customerCity || "",
      customerState: budget.customerState || "",
      customerZipCode: budget.customerZipCode || "",
      laborCost: Number(budget.laborCost),
      laborHours: Number(budget.laborHours),
      laborRate: Number(budget.laborRate || 0),
      materialCost: Number(budget.materialCost),
      thirdPartyCost: Number(budget.thirdPartyCost),
      otherDirectCosts: Number(budget.otherDirectCosts),
      indirectCostsTotal: Number(budget.indirectCostsTotal),
      profitMargin: Number(budget.profitMargin),
      notes: budget.notes || "",
      installments: budget.installments || 1,
      // Impostos do orçamento ou das configurações
      cbsRate: Number(budget.cbsRate) || Number(taxSettings?.cbsRate) || 0,
      ibsRate: Number(budget.ibsRate) || Number(taxSettings?.ibsRate) || 0,
      irpjRate: Number(budget.irpjRate) || Number(taxSettings?.irpjRate) || 0,
      csllRate: Number(budget.csllRate) || Number(taxSettings?.csllRate) || 0,
    });
    setEditingId(budget.id);
    setShowForm(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Filtrar orçamentos
  const filteredBudgets = budgets?.filter((row: any) => {
    if (statusFilter === "all") return true;
    return row.budget.status === statusFilter;
  });

  // Calcular estatísticas
  const stats = {
    total: budgets?.length || 0,
    draft: budgets?.filter((r: any) => r.budget.status === "draft").length || 0,
    sent: budgets?.filter((r: any) => r.budget.status === "sent").length || 0,
    approved: budgets?.filter((r: any) => r.budget.status === "approved").length || 0,
    rejected: budgets?.filter((r: any) => r.budget.status === "rejected").length || 0,
  };

  return (
    <DashboardLayout>
      <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Orçamentos</h1>
          <p className="text-muted-foreground">
            Cálculo automático com CBS/IBS
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="destructive"
            onClick={() => {
              if (confirm("ATENÇÃO: Tem certeza que deseja excluir TODOS os orçamentos? Esta ação não pode ser desfeita!")) {
                deleteAllMutation.mutate();
              }
            }}
            disabled={deleteAllMutation.isPending || !budgets || budgets.length === 0}
          >
            <X className="mr-2 h-4 w-4" />
            {deleteAllMutation.isPending ? "Excluindo..." : "Excluir Todos"}
          </Button>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Orçamento
          </Button>
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
                <span className="text-sm text-muted-foreground">Rascunhos</span>
                <span className="font-semibold">{stats.draft}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Enviados</span>
                <span className="font-semibold text-blue-600">{stats.sent}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Aprovados</span>
                <span className="font-semibold text-green-600">{stats.approved}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Rejeitados</span>
                <span className="font-semibold text-red-600">{stats.rejected}</span>
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
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                className="w-full justify-start"
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                Todos ({stats.total})
              </Button>
              <Button
                variant={statusFilter === "draft" ? "default" : "outline"}
                className="w-full justify-start"
                size="sm"
                onClick={() => setStatusFilter("draft")}
              >
                Rascunhos ({stats.draft})
              </Button>
              <Button
                variant={statusFilter === "sent" ? "default" : "outline"}
                className="w-full justify-start"
                size="sm"
                onClick={() => setStatusFilter("sent")}
              >
                Enviados ({stats.sent})
              </Button>
              <Button
                variant={statusFilter === "approved" ? "default" : "outline"}
                className="w-full justify-start"
                size="sm"
                onClick={() => setStatusFilter("approved")}
              >
                Aprovados ({stats.approved})
              </Button>
              <Button
                variant={statusFilter === "rejected" ? "default" : "outline"}
                className="w-full justify-start"
                size="sm"
                onClick={() => setStatusFilter("rejected")}
              >
                Rejeitados ({stats.rejected})
              </Button>
            </div>
          </Card>
        </div>

        {/* Conteúdo Principal */}
        <div className="lg:col-span-3 space-y-6">

      {/* Configurações Fiscais */}
      {taxSettings && (
        <Card className="p-4 mb-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                Configurações Fiscais Ativas
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                <div>
                  <span className="text-muted-foreground">CBS:</span>{" "}
                  <span className="font-semibold">{taxSettings.cbsRate}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">IBS:</span>{" "}
                  <span className="font-semibold">{taxSettings.ibsRate}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">IRPJ:</span>{" "}
                  <span className="font-semibold">{taxSettings.irpjRate}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">CSLL:</span>{" "}
                  <span className="font-semibold">{taxSettings.csllRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Formulário */}
      {showForm && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Novo Orçamento</h2>

          <div className="grid gap-4">
            {/* Informações Básicas */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Título *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Nome do orçamento"
                />
              </div>
              <div>
                <Label>Nome da Empresa</Label>
                <Input
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customerName: e.target.value,
                      customerId: undefined,
                    })
                  }
                  placeholder="Digite o nome da empresa"
                />
              </div>
            </div>

            {/* Dados de Contato da Empresa */}
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, customerEmail: e.target.value })
                  }
                  placeholder="email@empresa.com"
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  value={formData.customerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, customerPhone: e.target.value })
                  }
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <Label>CPF/CNPJ</Label>
                <Input
                  value={formData.customerDocument}
                  onChange={(e) =>
                    setFormData({ ...formData, customerDocument: e.target.value })
                  }
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div>
                <Label>CEP</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.customerZipCode}
                    onChange={(e) =>
                      setFormData({ ...formData, customerZipCode: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCepSearch();
                      }
                    }}
                    placeholder="00000-000"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCepSearch}
                    disabled={isLoadingCep || formData.customerZipCode.length < 8}
                    title="Buscar endereço pelo CEP"
                  >
                    {isLoadingCep ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Endereço Completo */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Endereço</Label>
                <Input
                  value={formData.customerAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, customerAddress: e.target.value })
                  }
                  placeholder="Rua, número, complemento"
                />
              </div>
              <div>
                <Label>Bairro</Label>
                <Input
                  value={formData.customerNeighborhood}
                  onChange={(e) =>
                    setFormData({ ...formData, customerNeighborhood: e.target.value })
                  }
                  placeholder="Bairro"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Cidade</Label>
                <Input
                  value={formData.customerCity}
                  onChange={(e) =>
                    setFormData({ ...formData, customerCity: e.target.value })
                  }
                  placeholder="Cidade"
                />
              </div>
              <div>
                <Label>Estado</Label>
                <Input
                  value={formData.customerState}
                  onChange={(e) =>
                    setFormData({ ...formData, customerState: e.target.value.toUpperCase().slice(0, 2) })
                  }
                  placeholder="UF"
                  maxLength={2}
                />
              </div>
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Detalhes do orçamento"
                rows={2}
              />
            </div>

            {/* Template Selector */}
            {templates && templates.length > 0 && (
              <div className="border-t pt-4">
                <Label>Usar Template (Opcional)</Label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (value) {
                      const template = templates.find(t => t.id === parseInt(value));
                      if (template) {
                        setFormData({
                          ...formData,
                          laborCost: Number(template.laborCost),
                          laborHours: Number(template.laborHours),
                          materialCost: Number(template.materialCost),
                          thirdPartyCost: Number(template.thirdPartyCost),
                          otherDirectCosts: Number(template.otherDirectCosts),
                          indirectCostsTotal: Number(template.indirectCostsTotal),
                          profitMargin: Number(template.profitMargin),
                        });
                        toast.success(`Template "${template.name}" carregado!`);
                      }
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id.toString()}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Seleção de Produtos/Serviços */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Produtos/Serviços</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (value) {
                        const product = products?.find(p => p.id === parseInt(value));
                        if (product) {
                          const exists = selectedProducts.find(sp => sp.productId === product.id);
                          if (!exists) {
                            setSelectedProducts([...selectedProducts, {
                              productId: product.id,
                              quantity: 1,
                              price: Number(product.price)
                            }]);
                          }
                        }
                      }
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Adicionar produto/serviço..." />
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
                
                {selectedProducts.length > 0 && (
                  <div className="border rounded-lg p-3 space-y-2">
                    {selectedProducts.map((sp, index) => {
                      const product = products?.find(p => p.id === sp.productId);
                      return (
                        <div key={sp.productId} className="flex items-center gap-3 bg-gray-50 p-2 rounded">
                          <span className="flex-1 text-sm">{product?.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newProducts = selectedProducts.filter((_, i) => i !== index);
                              setSelectedProducts(newProducts);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
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
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        laborHours: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="Ex: 40"
                  />
                </div>
                <div>
                  <Label>Valor por Hora (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.laborRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        laborRate: parseFloat(e.target.value) || 0,
                      })
                    }
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
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        materialCost: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Terceiros (R$)</Label>
                  <Input
                    type="number"
                    value={formData.thirdPartyCost}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        thirdPartyCost: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Outros Custos Diretos (R$)</Label>
                  <Input
                    type="number"
                    value={formData.otherDirectCosts}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        otherDirectCosts: parseFloat(e.target.value) || 0,
                      })
                    }
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
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        indirectCostsTotal: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="Aluguel, internet, sistemas, etc."
                  />
                </div>
                <div>
                  <Label>Margem de Lucro (%)</Label>
                  <Input
                    type="number"
                    value={formData.profitMargin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profitMargin: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                  {taxSettings &&
                    formData.profitMargin <
                      Number(taxSettings.minimumMargin) && (
                      <p className="text-sm text-orange-600 mt-1">
                        ⚠️ Margem abaixo do mínimo recomendado (
                        {taxSettings.minimumMargin}%)
                      </p>
                    )}
                </div>
              </div>
            </div>

            {/* Alíquotas de Impostos (Editáveis) */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Alíquotas de Impostos</h3>
                <span className="text-xs text-muted-foreground">
                  Pré-preenchido das configurações fiscais - edite se necessário
                </span>
              </div>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <Label>CBS (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.cbsRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cbsRate: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="Ex: 8.8"
                  />
                </div>
                <div>
                  <Label>IBS (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.ibsRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ibsRate: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="Ex: 17.7"
                  />
                </div>
                <div>
                  <Label>IRPJ (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.irpjRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        irpjRate: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="Ex: 15"
                  />
                </div>
                <div>
                  <Label>CSLL (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.csllRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        csllRate: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="Ex: 9"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Total impostos sobre consumo: {(formData.cbsRate + formData.ibsRate).toFixed(2)}% | 
                Total impostos sobre lucro: {(formData.irpjRate + formData.csllRate).toFixed(2)}%
              </p>
            </div>

            {/* Demonstrativo */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Demonstrativo Financeiro</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <Card className="p-4 bg-gray-50 dark:bg-gray-900">
                  <p className="text-muted-foreground mb-1">Custos Totais</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(calculated.totalCosts)}
                  </p>
                </Card>
                <Card className="p-4 bg-blue-50 dark:bg-blue-950/20">
                  <p className="text-muted-foreground mb-1">
                    Impostos (CBS+IBS)
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(calculated.totalConsumptionTaxes)}
                  </p>
                </Card>
                <Card className="p-4 bg-green-50 dark:bg-green-950/20">
                  <p className="text-muted-foreground mb-1">Lucro Líquido</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(calculated.netProfit)}
                  </p>
                </Card>
              </div>

              <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Preço Final de Venda
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {formatCurrency(calculated.finalPrice)}
                    </p>
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
                    <span className="font-semibold">
                      {formatCurrency(calculated.totalDirectCosts)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Custos Indiretos:</span>
                    <span className="font-semibold">
                      {formatCurrency(formData.indirectCostsTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Custo Total:</span>
                    <span className="font-semibold">
                      {formatCurrency(calculated.totalCosts)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valor Bruto (com margem):</span>
                    <span className="font-semibold">
                      {formatCurrency(calculated.grossValue)}
                    </span>
                  </div>
                  <div className="flex justify-between text-blue-600">
                    <span>CBS ({formData.cbsRate}%):</span>
                    <span className="font-semibold">
                      {formatCurrency(calculated.cbsAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-blue-600">
                    <span>IBS ({formData.ibsRate}%):</span>
                    <span className="font-semibold">
                      {formatCurrency(calculated.ibsAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Receita Líquida:</span>
                    <span className="font-semibold">
                      {formatCurrency(calculated.netRevenue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lucro antes IRPJ/CSLL:</span>
                    <span className="font-semibold">
                      {formatCurrency(calculated.profitBeforeTaxes)}
                    </span>
                  </div>
                  <div className="flex justify-between text-orange-600">
                    <span>IRPJ ({formData.irpjRate}%):</span>
                    <span className="font-semibold">
                      {formatCurrency(calculated.irpjAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-orange-600">
                    <span>CSLL ({formData.csllRate}%):</span>
                    <span className="font-semibold">
                      {formatCurrency(calculated.csllAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-green-600">
                    <span className="font-semibold">Lucro Líquido Final:</span>
                    <span className="font-bold">
                      {formatCurrency(calculated.netProfit)}
                    </span>
                  </div>
                </div>
              </details>
            </div>

            <div>
              <Label>Observações</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Anotações internas"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending}
              >
                Salvar Orçamento
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Lista de Orçamentos */}
      <div className="grid gap-4">
        {filteredBudgets?.map((row: any) => (
          <Card key={row.budget.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{row.budget.title}</h3>
                {row.customer && (
                  <p className="text-sm text-muted-foreground">
                    Cliente: {row.customer.name}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  {row.budget.description}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(Number(row.budget.finalPrice))}
                </p>
                <p className="text-sm text-muted-foreground">
                  {row.budget.installments && row.budget.installments > 1
                    ? `${row.budget.installments}x ${formatCurrency(Number(row.budget.finalPrice) / row.budget.installments)}`
                    : "À Vista"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Lucro: {formatCurrency(Number(row.budget.netProfit))}
                </p>
                <div className="flex flex-col gap-1">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      row.budget.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : row.budget.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : row.budget.status === "sent"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {row.budget.status === "draft" && "Rascunho"}
                    {row.budget.status === "sent" && "Enviado"}
                    {row.budget.status === "approved" && "Aprovado"}
                    {row.budget.status === "rejected" && "Rejeitado"}
                  </span>
                  {row.order && row.order.status === "cancelled" && (
                    <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-orange-100 text-orange-800">
                      Pedido Cancelado
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  {row.budget.status === "draft" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => handleEdit(row.budget)}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          if (confirm("Deseja marcar este or\u00e7amento como enviado?")) {
                            updateStatusMutation.mutate({ id: row.budget.id, status: "sent" });
                          }
                        }}
                        disabled={updateStatusMutation.isPending}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Marcar como Enviado
                      </Button>
                    </>
                  )}
                  {row.budget.status === "sent" && (
                    <>
                      <Button
                        size="sm"
                        variant="default"
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          if (confirm("Deseja aprovar este or\u00e7amento?")) {
                            updateStatusMutation.mutate({ id: row.budget.id, status: "approved" });
                          }
                        }}
                        disabled={updateStatusMutation.isPending}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="w-full"
                        onClick={() => {
                          if (confirm("Deseja rejeitar este or\u00e7amento?")) {
                            updateStatusMutation.mutate({ id: row.budget.id, status: "rejected" });
                          }
                        }}
                        disabled={updateStatusMutation.isPending}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Rejeitar
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => exportPDFMutation.mutate({ id: row.budget.id })}
                    disabled={exportPDFMutation.isPending}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {exportPDFMutation.isPending ? "Gerando..." : "Exportar PDF"}
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => whatsappMutation.mutate({ id: row.budget.id })}
                    disabled={whatsappMutation.isPending}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {whatsappMutation.isPending ? "Gerando..." : "Enviar via WhatsApp"}
                  </Button>
                  {row.budget.status === "approved" && (
                    <>
                      <Button
                        size="sm"
                        variant="default"
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          if (confirm("Deseja converter este orçamento em pedido?")) {
                            convertToOrderMutation.mutate({ id: row.budget.id });
                          }
                        }}
                        disabled={convertToOrderMutation.isPending}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {convertToOrderMutation.isPending ? "Convertendo..." : "Converter em Pedido"}
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => {
                          if (confirm("Deseja criar um projeto a partir deste orçamento?")) {
                            createProjectMutation.mutate({ id: row.budget.id });
                          }
                        }}
                        disabled={createProjectMutation.isPending}
                      >
                        <FolderKanban className="h-4 w-4 mr-2" />
                        {createProjectMutation.isPending ? "Criando..." : "Criar Projeto"}
                      </Button>
                    </>
                  )}
                  {(row.budget.status === "rejected" || (row.order && row.order.status === "cancelled")) && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => handleEdit(row.budget)}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="w-full"
                        onClick={() => {
                          const message = row.budget.status === "rejected" 
                            ? "Tem certeza que deseja excluir este or\u00e7amento rejeitado?"
                            : "Tem certeza que deseja excluir este or\u00e7amento com pedido cancelado?";
                          if (confirm(message)) {
                            deleteMutation.mutate({ id: row.budget.id });
                          }
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <X className="h-4 w-4 mr-2" />
                        {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}

        {filteredBudgets?.length === 0 && !showForm && (
          <Card className="p-12 text-center">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {statusFilter === "all" 
                ? "Nenhum orçamento criado ainda."
                : "Nenhum orçamento com este status."}
            </p>
            {statusFilter === "all" && (
              <Button className="mt-4" onClick={() => setShowForm(true)}>
                Criar Primeiro Orçamento
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

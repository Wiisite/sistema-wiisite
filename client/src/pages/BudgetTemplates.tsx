import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";

export default function BudgetTemplates() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    laborCost: 0,
    laborHours: 0,
    materialCost: 0,
    thirdPartyCost: 0,
    otherDirectCosts: 0,
    indirectCostsTotal: 0,
    profitMargin: 20,
  });

  const { data: templates, refetch } = trpc.budgetTemplates.list.useQuery();

  const createMutation = trpc.budgetTemplates.create.useMutation({
    onSuccess: () => {
      toast.success("Template criado com sucesso!");
      refetch();
      resetForm();
    },
    onError: () => {
      toast.error("Erro ao criar template");
    },
  });

  const updateMutation = trpc.budgetTemplates.update.useMutation({
    onSuccess: () => {
      toast.success("Template atualizado com sucesso!");
      refetch();
      resetForm();
    },
    onError: () => {
      toast.error("Erro ao atualizar template");
    },
  });

  const deleteMutation = trpc.budgetTemplates.delete.useMutation({
    onSuccess: () => {
      toast.success("Template excluído com sucesso!");
      refetch();
    },
    onError: () => {
      toast.error("Erro ao excluir template");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      laborCost: 0,
      laborHours: 0,
      materialCost: 0,
      thirdPartyCost: 0,
      otherDirectCosts: 0,
      indirectCostsTotal: 0,
      profitMargin: 20,
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!formData.name) {
      toast.error("Nome do template é obrigatório");
      return;
    }

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (template: any) => {
    setFormData({
      name: template.name,
      description: template.description || "",
      laborCost: Number(template.laborCost),
      laborHours: Number(template.laborHours),
      materialCost: Number(template.materialCost),
      thirdPartyCost: Number(template.thirdPartyCost),
      otherDirectCosts: Number(template.otherDirectCosts),
      indirectCostsTotal: Number(template.indirectCostsTotal),
      profitMargin: Number(template.profitMargin),
    });
    setEditingId(template.id);
    setShowForm(true);
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o template "${name}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Templates de Orçamento</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie templates com configurações padrão para agilizar a criação de orçamentos
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Template
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {editingId ? "Editar Template" : "Novo Template"}
            </h2>
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Nome do Template *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ex: Serviço de Consultoria"
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descrição opcional"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Custos Diretos Padrão</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Mão de Obra (R$)</Label>
                  <Input
                    type="number"
                    value={formData.laborCost}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        laborCost: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Horas de Trabalho</Label>
                  <Input
                    type="number"
                    value={formData.laborHours}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        laborHours: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Material (R$)</Label>
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
                <div>
                  <Label>Custos Indiretos (R$)</Label>
                  <Input
                    type="number"
                    value={formData.indirectCostsTotal}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        indirectCostsTotal: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Margem de Lucro</h3>
              <div className="max-w-xs">
                <Label>Margem (%)</Label>
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
              </div>
            </div>

            <div className="flex gap-2 justify-end border-t pt-4">
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} className="gap-2">
                <Save className="w-4 h-4" />
                {editingId ? "Atualizar" : "Criar"} Template
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {templates && templates.length === 0 && !showForm && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              Nenhum template cadastrado. Crie seu primeiro template para agilizar a criação de orçamentos.
            </p>
          </Card>
        )}

        {templates?.map((template) => (
          <Card key={template.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{template.name}</h3>
                {template.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {template.description}
                  </p>
                )}

                <div className="grid md:grid-cols-3 gap-4 mt-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Mão de Obra:</span>{" "}
                    <span className="font-medium">
                      R$ {Number(template.laborCost).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Horas:</span>{" "}
                    <span className="font-medium">
                      {Number(template.laborHours).toFixed(2)}h
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Material:</span>{" "}
                    <span className="font-medium">
                      R$ {Number(template.materialCost).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Terceiros:</span>{" "}
                    <span className="font-medium">
                      R$ {Number(template.thirdPartyCost).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Outros Diretos:</span>{" "}
                    <span className="font-medium">
                      R$ {Number(template.otherDirectCosts).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Indiretos:</span>{" "}
                    <span className="font-medium">
                      R$ {Number(template.indirectCostsTotal).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Margem:</span>{" "}
                    <span className="font-medium">
                      {Number(template.profitMargin).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(template)}
                  className="gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(template.id, template.name)}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

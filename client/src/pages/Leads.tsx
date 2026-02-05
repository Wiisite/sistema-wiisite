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
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Building2, Mail, Phone, Plus, User, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const stageMap = {
  new: "Novo",
  contacted: "Contatado",
  qualified: "Qualificado",
  proposal: "Proposta",
  negotiation: "Negociação",
  won: "Ganho",
  lost: "Perdido",
};

const stageColors = {
  new: "bg-gray-500",
  contacted: "bg-blue-500",
  qualified: "bg-cyan-500",
  proposal: "bg-yellow-500",
  negotiation: "bg-orange-500",
  won: "bg-green-500",
  lost: "bg-red-500",
};

const sourceMap = {
  website: "Website",
  referral: "Indicação",
  cold_call: "Cold Call",
  social_media: "Redes Sociais",
  event: "Evento",
  other: "Outro",
};

export default function Leads() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string | undefined>();
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    source: "website",
    estimatedValue: "",
    notes: "",
  });

  const { data: leads, refetch } = trpc.leads.list.useQuery({
    stage: selectedStage,
  });

  const createMutation = trpc.leads.create.useMutation({
    onSuccess: () => {
      toast.success("Lead criado com sucesso!");
      setIsDialogOpen(false);
      refetch();
      setFormData({
        name: "",
        company: "",
        email: "",
        phone: "",
        source: "website",
        estimatedValue: "",
        notes: "",
      });
    },
    onError: (error) => {
      toast.error("Erro ao criar lead: " + error.message);
    },
  });

  const updateMutation = trpc.leads.update.useMutation({
    onSuccess: () => {
      toast.success("Lead atualizado!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar lead: " + error.message);
    },
  });

  const deleteAllMutation = trpc.leads.deleteAll.useMutation({
    onSuccess: () => {
      toast.success("Todos os leads foram exclu\u00eddos!");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir leads: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      stage: "new",
      source: formData.source as any,
    });
  };

  const handleStageChange = (leadId: number, newStage: string) => {
    updateMutation.mutate({
      id: leadId,
      data: { stage: newStage as any },
    });
  };

  // Group leads by stage for Kanban view
  const leadsByStage = Object.keys(stageMap).reduce((acc, stage) => {
    acc[stage] = leads?.filter((l) => l.lead.stage === stage) || [];
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">CRM / Leads</h1>
            <p className="text-muted-foreground">
              Gerencie seu pipeline de vendas
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="destructive"
              onClick={() => {
                if (confirm("ATENÇÃO: Tem certeza que deseja excluir TODOS os leads? Esta ação não pode ser desfeita!")) {
                  deleteAllMutation.mutate();
                }
              }}
              disabled={deleteAllMutation.isPending || !leads || leads.length === 0}
            >
              <X className="mr-2 h-4 w-4" />
              {deleteAllMutation.isPending ? "Excluindo..." : "Excluir Todos"}
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Lead
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Lead</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Empresa</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="source">Origem *</Label>
                    <Select
                      value={formData.source}
                      onValueChange={(value) =>
                        setFormData({ ...formData, source: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(sourceMap).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="estimatedValue">Valor Estimado</Label>
                    <Input
                      id="estimatedValue"
                      type="number"
                      step="0.01"
                      value={formData.estimatedValue}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          estimatedValue: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div>
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
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Criando..." : "Criar Lead"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Pipeline Kanban */}
        <div className="grid grid-cols-7 gap-6 overflow-x-auto pb-4">
          {Object.entries(stageMap).map(([stage, label]) => (
            <div key={stage} className="min-w-[250px]">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span>{label}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full text-white ${stageColors[stage as keyof typeof stageColors]}`}
                    >
                      {leadsByStage[stage]?.length || 0}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {leadsByStage[stage]?.map((item: any) => (
                    <Card
                      key={item.lead.id}
                      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-sm">
                              {item.lead.name}
                            </p>
                            {item.lead.company && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {item.lead.company}
                              </p>
                            )}
                          </div>
                        </div>
                        {item.lead.estimatedValue && (
                          <p className="text-sm font-semibold text-green-600">
                            R${" "}
                            {parseFloat(item.lead.estimatedValue).toLocaleString(
                              "pt-BR",
                              { minimumFractionDigits: 2 }
                            )}
                          </p>
                        )}
                        <div className="space-y-1">
                          {item.lead.email && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {item.lead.email}
                            </p>
                          )}
                          {item.lead.phone && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {item.lead.phone}
                            </p>
                          )}
                        </div>
                        {item.assignedUser && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {item.assignedUser.name}
                          </p>
                        )}
                        <Select
                          value={item.lead.stage}
                          onValueChange={(value) =>
                            handleStageChange(item.lead.id, value)
                          }
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(stageMap).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

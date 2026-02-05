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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Calendar, CheckSquare, Clock, DollarSign, Edit2, GripVertical, Plus, Square, Trash2, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { toast } from "sonner";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type ProjectStatus = "project" | "development" | "design" | "review" | "launched" | "cancelled";

const statusConfig: Record<ProjectStatus, { label: string; color: string }> = {
  project: { label: "Projeto", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  development: { label: "Desenvolvimento", color: "bg-blue-100 text-blue-700 border-blue-200" },
  design: { label: "Design", color: "bg-purple-100 text-purple-700 border-purple-200" },
  review: { label: "Revisão", color: "bg-orange-100 text-orange-700 border-orange-200" },
  launched: { label: "Lançado", color: "bg-green-100 text-green-700 border-green-200" },
  cancelled: { label: "Cancelado", color: "bg-gray-100 text-gray-700 border-gray-200" },
};

interface ProjectCardProps {
  row: any;
  onEdit: (project: any) => void;
  onDelete: (projectId: number) => void;
  onOpenChecklist?: (row: any) => void;
  isDragging?: boolean;
}

function ProjectCard({ row, onEdit, onDelete, onOpenChecklist, isDragging }: ProjectCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: row.project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging || isDragging ? 0.5 : 1,
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
    <Card ref={setNodeRef} style={style} className="hover:shadow-md transition-shadow text-xs">
      <CardHeader className="p-2 pb-1">
        <div className="flex items-center justify-between gap-1">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="h-3 w-3 text-muted-foreground" />
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusConfig[row.project.status as ProjectStatus].color}`}
          >
            {statusConfig[row.project.status as ProjectStatus].label}
          </span>
          <div className="flex gap-0.5">
            {onOpenChecklist && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenChecklist(row);
                }}
                title="Checklist"
              >
                <CheckSquare className="h-3 w-3 text-blue-600" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(row.project);
              }}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir o projeto "{row.project.name}"? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => {
                      onDelete(row.project.id);
                      setDeleteDialogOpen(false);
                    }}
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <CardTitle className="text-sm mt-1 leading-tight">{row.project.name}</CardTitle>
        {row.customer && <p className="text-[10px] text-muted-foreground">{row.customer.name}</p>}
      </CardHeader>
      <CardContent className="p-2 pt-1 space-y-2">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{row.project.progress}%</span>
          </div>
          <Progress value={row.project.progress} className="h-1.5" />
        </div>
        <div className="flex items-center justify-between pt-1 border-t text-[10px]">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatDate(row.project.deadline)}</span>
          </div>
          <div className="flex items-center gap-1 font-semibold">
            <DollarSign className="h-3 w-3" />
            <span>{formatPrice(row.project.value)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DroppableColumn({ status, children }: { status: ProjectStatus; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 p-3 space-y-3 bg-muted/20 min-h-[300px] rounded-b-lg transition-colors ${
        isOver ? "bg-primary/10 ring-2 ring-primary" : ""
      }`}
    >
      {children}
    </div>
  );
}

export default function Projects() {
  const [open, setOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    customerId: "",
    status: "project",
    progress: "0",
    value: "",
    deadline: "",
    meetingDate: "",
    approvalDate: "",
    reviewDate: "",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const { data: projects, isLoading, refetch } = trpc.projects.list.useQuery();
  const { data: customers } = trpc.customers.list.useQuery();

  const createMutation = trpc.projects.create.useMutation({
    onSuccess: () => {
      toast.success("Projeto criado com sucesso!");
      refetch();
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao criar projeto: " + error.message);
    },
  });

  const updateMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      toast.success("Projeto atualizado com sucesso!");
      refetch();
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar projeto: " + error.message);
    },
  });

  const deleteMutation = trpc.projects.delete.useMutation({
    onSuccess: () => {
      toast.success("Projeto excluído com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao excluir projeto: " + error.message);
    },
  });

  // Checklist queries e mutations
  const { data: checklists, refetch: refetchChecklists } = trpc.projects.getChecklists.useQuery(
    { projectId: selectedProject?.project?.id || 0 },
    { enabled: !!selectedProject?.project?.id }
  );

  const createChecklistMutation = trpc.projects.createChecklist.useMutation({
    onSuccess: () => {
      refetchChecklists();
      setNewChecklistItem("");
    },
    onError: (error) => {
      toast.error("Erro ao criar item: " + error.message);
    },
  });

  const updateChecklistMutation = trpc.projects.updateChecklist.useMutation({
    onSuccess: () => {
      refetchChecklists();
      updateProgressMutation.mutate({ projectId: selectedProject?.project?.id });
    },
    onError: (error) => {
      toast.error("Erro ao atualizar item: " + error.message);
    },
  });

  const deleteChecklistMutation = trpc.projects.deleteChecklist.useMutation({
    onSuccess: () => {
      refetchChecklists();
      updateProgressMutation.mutate({ projectId: selectedProject?.project?.id });
    },
    onError: (error) => {
      toast.error("Erro ao excluir item: " + error.message);
    },
  });

  const updateProgressMutation = trpc.projects.updateProgress.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      customerId: "",
      status: "project",
      progress: "0",
      value: "",
      deadline: "",
      meetingDate: "",
      approvalDate: "",
      reviewDate: "",
    });
    setEditingProject(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: formData.name,
      description: formData.description,
      customerId: formData.customerId && formData.customerId !== "" ? parseInt(formData.customerId) : undefined,
      status: formData.status as any,
      progress: parseInt(formData.progress),
      value: formData.value,
      deadline: new Date(formData.deadline),
      meetingDate: formData.meetingDate ? new Date(formData.meetingDate) : undefined,
      approvalDate: formData.approvalDate ? new Date(formData.approvalDate) : undefined,
      reviewDate: formData.reviewDate ? new Date(formData.reviewDate) : undefined,
    };

    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (project: any) => {
    setEditingProject(project);
    setFormData({
      name: project.name || "",
      description: project.description || "",
      customerId: project.customerId?.toString() || "",
      status: project.status || "development",
      progress: project.progress?.toString() || "0",
      value: project.value || "",
      deadline: project.deadline ? new Date(project.deadline).toISOString().split("T")[0] : "",
      meetingDate: project.meetingDate ? new Date(project.meetingDate).toISOString().split("T")[0] : "",
      approvalDate: project.approvalDate ? new Date(project.approvalDate).toISOString().split("T")[0] : "",
      reviewDate: project.reviewDate ? new Date(project.reviewDate).toISOString().split("T")[0] : "",
    });
    setOpen(true);
  };

  const handleDelete = (projectId: number) => {
    deleteMutation.mutate({ id: projectId });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const projectId = active.id as number;
    let newStatus: ProjectStatus | null = null;

    console.log('=== DEBUG DRAG-AND-DROP ===');
    console.log('Project ID:', projectId);
    console.log('Over ID:', over.id);
    console.log('Type of over.id:', typeof over.id);

    const validStatuses: ProjectStatus[] = ["project", "development", "design", "review", "launched", "cancelled"];

    // Se over.id é uma string e é um status válido, usar diretamente
    if (typeof over.id === 'string' && validStatuses.includes(over.id as ProjectStatus)) {
      newStatus = over.id as ProjectStatus;
      console.log('Over.id é um status válido:', newStatus);
    }
    // Se over.id é um número (ID de projeto), buscar o status desse projeto
    else if (typeof over.id === 'number' || !isNaN(Number(over.id))) {
      const targetProject = (projects || []).find((row) => row.project.id === Number(over.id));
      if (targetProject) {
        newStatus = targetProject.project.status as ProjectStatus;
        console.log('Over.id é um projeto, usando status desse projeto:', newStatus);
      }
    }

    if (!newStatus) {
      console.error('Não foi possível determinar o status de destino');
      toast.error('Erro ao mover projeto');
      return;
    }

    const currentProject = (projects || []).find((row) => row.project.id === projectId);
    if (!currentProject) return;

    const currentStatus = currentProject.project.status as ProjectStatus;
    console.log('Current Status:', currentStatus);

    if (currentStatus !== newStatus) {
      console.log('Sending mutation with:', { id: projectId, status: newStatus });
      updateMutation.mutate({
        id: projectId,
        status: newStatus,
      });
    }
  };

  const projectsByStatus = (projects || []).reduce((acc, row) => {
    const status = row.project.status as ProjectStatus;
    if (!acc[status]) acc[status] = [];
    acc[status].push(row);
    return acc;
  }, {} as Record<ProjectStatus, typeof projects>);

  const activeProject = activeId ? (projects || []).find((row) => row.project.id === activeId) : null;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestão de Projetos</h1>
            <p className="text-muted-foreground">Arraste projetos entre as colunas para mudar o status</p>
          </div>
          <Dialog
            open={open}
            onOpenChange={(isOpen) => {
              setOpen(isOpen);
              if (!isOpen) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="mr-2 h-4 w-4" />
                Novo Projeto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProject ? "Editar Projeto" : "Novo Projeto"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="name">Nome do Projeto *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="Ex: Redesign E-commerce de Moda"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      placeholder="Descreva o projeto..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerId">Cliente</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="progress">Progresso de Conclusão (%) *</Label>
                    <Input
                      id="progress"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.progress}
                      onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="value">Valor (R$) *</Label>
                    <Input
                      id="value"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="deadline">Prazo *</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meetingDate">Data da Reunião</Label>
                    <Input
                      id="meetingDate"
                      type="date"
                      value={formData.meetingDate}
                      onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="approvalDate">Data da Aprovação</Label>
                    <Input
                      id="approvalDate"
                      type="date"
                      value={formData.approvalDate}
                      onChange={(e) => setFormData({ ...formData, approvalDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reviewDate">Data da Revisão</Label>
                    <Input
                      id="reviewDate"
                      type="date"
                      value={formData.reviewDate}
                      onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingProject ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando projetos...</div>
        ) : !projects || projects.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum projeto cadastrado. Clique em "Novo Projeto" para começar.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {(["project", "development", "design", "review", "launched", "cancelled"] as ProjectStatus[]).map((status) => {
                const config = statusConfig[status];
                const statusProjects = projectsByStatus[status] || [];

                return (
                  <Card key={status} className="flex flex-col">
                    <CardHeader className={`${config.color} border-b-2`}>
                      <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                        {config.label}
                        <span className="ml-auto text-xs">({statusProjects.length})</span>
                      </CardTitle>
                    </CardHeader>
                    <SortableContext
                      id={status}
                      items={statusProjects.map((row) => row.project.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <DroppableColumn status={status}>
                        {statusProjects.map((row) => (
                          <ProjectCard key={row.project.id} row={row} onEdit={handleEdit} onDelete={handleDelete} onOpenChecklist={(row) => { setSelectedProject(row); setChecklistOpen(true); }} />
                        ))}
                        {statusProjects.length === 0 && (
                          <p className="text-xs text-center text-muted-foreground py-8">
                            Arraste projetos aqui
                          </p>
                        )}
                      </DroppableColumn>
                    </SortableContext>
                  </Card>
                );
              })}
            </div>

            <DragOverlay>{activeProject ? <ProjectCard row={activeProject} onEdit={handleEdit} onDelete={handleDelete} isDragging /> : null}</DragOverlay>
          </DndContext>
        )}

        {/* Dialog de Checklist */}
        <Dialog open={checklistOpen} onOpenChange={setChecklistOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                Checklist - {selectedProject?.project?.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Progresso */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progresso</span>
                  <span className="font-semibold">{selectedProject?.project?.progress || 0}%</span>
                </div>
                <Progress value={selectedProject?.project?.progress || 0} className="h-2" />
              </div>

              {/* Lista de itens */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {checklists && checklists.length > 0 ? (
                  checklists.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg border hover:bg-muted/50">
                      <Checkbox
                        checked={item.completed === 1}
                        onCheckedChange={(checked) => {
                          updateChecklistMutation.mutate({
                            id: item.id,
                            completed: checked ? 1 : 0,
                          });
                        }}
                      />
                      <span className={`flex-1 text-sm ${item.completed === 1 ? 'line-through text-muted-foreground' : ''}`}>
                        {item.title}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => deleteChecklistMutation.mutate({ id: item.id })}
                      >
                        <X className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum item no checklist. Adicione itens abaixo.
                  </p>
                )}
              </div>

              {/* Adicionar novo item */}
              <div className="flex gap-2">
                <Input
                  placeholder="Novo item do checklist..."
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newChecklistItem.trim()) {
                      createChecklistMutation.mutate({
                        projectId: selectedProject?.project?.id,
                        title: newChecklistItem.trim(),
                      });
                    }
                  }}
                />
                <Button
                  onClick={() => {
                    if (newChecklistItem.trim()) {
                      createChecklistMutation.mutate({
                        projectId: selectedProject?.project?.id,
                        title: newChecklistItem.trim(),
                      });
                    }
                  }}
                  disabled={!newChecklistItem.trim() || createChecklistMutation.isPending}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

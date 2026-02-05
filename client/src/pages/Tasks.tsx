import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { AlertCircle, Calendar, CheckCircle2, CheckSquare, Clock, GripVertical, ListTodo, Plus, Edit2, Trash2, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
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

type TaskStatus = "todo" | "in_progress" | "review" | "done" | "cancelled";
type TaskPriority = "low" | "medium" | "high" | "urgent";

const statusConfig: Record<TaskStatus, { label: string; icon: any; color: string }> = {
  todo: { label: "A Fazer", icon: ListTodo, color: "bg-gray-100 text-gray-700 border-gray-300" },
  in_progress: { label: "Em Progresso", icon: Clock, color: "bg-blue-100 text-blue-700 border-blue-300" },
  review: { label: "Em Revisão", icon: AlertCircle, color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  done: { label: "Concluído", icon: CheckCircle2, color: "bg-green-100 text-green-700 border-green-300" },
  cancelled: { label: "Cancelado", icon: AlertCircle, color: "bg-red-100 text-red-700 border-red-300" },
};

const priorityColors: Record<TaskPriority, string> = {
  low: "bg-gray-200 text-gray-700",
  medium: "bg-blue-200 text-blue-700",
  high: "bg-orange-200 text-orange-700",
  urgent: "bg-red-200 text-red-700",
};

interface TaskCardProps {
  item: any;
  onEdit: (task: any) => void;
  onDelete: (taskId: number) => void;
  onOpenChecklist?: (item: any) => void;
  isDragging?: boolean;
}

function TaskCard({ item, onEdit, onDelete, onOpenChecklist, isDragging }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: item.task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging || isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="p-3 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
    >
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <div {...attributes} {...listeners} className="mt-1 cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 space-y-2">
            <h4 className="font-semibold text-sm line-clamp-2">{item.task.title}</h4>
            {item.task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">{item.task.description}</p>
            )}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[item.task.priority as TaskPriority]}`}
                >
                  {item.task.priority === "low" && "Baixa"}
                  {item.task.priority === "medium" && "Média"}
                  {item.task.priority === "high" && "Alta"}
                  {item.task.priority === "urgent" && "Urgente"}
                </span>
                {item.task.dueDate && (
                  <span className="text-xs flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(item.task.dueDate).toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {onOpenChecklist && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenChecklist(item);
                    }}
                    title="Checklist"
                  >
                    <CheckSquare className="h-3 w-3 text-blue-600" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(item.task);
                  }}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.task.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function DroppableColumn({ status, children }: { status: TaskStatus; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 p-3 space-y-2 bg-muted/20 min-h-[200px] rounded-b-lg transition-colors ${
        isOver ? "bg-primary/10 ring-2 ring-primary" : ""
      }`}
    >
      {children}
    </div>
  );
}

export default function Tasks() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as TaskPriority,
    dueDate: "",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const { data: tasks, refetch } = trpc.tasks.list.useQuery();

  const createMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      toast.success("Tarefa criada com sucesso!");
      refetch();
      setIsDialogOpen(false);
      setFormData({ title: "", description: "", priority: "medium", dueDate: "" });
    },
    onError: (error) => {
      toast.error(`Erro ao criar tarefa: ${error.message}`);
    },
  });

  const updateMutation = trpc.tasks.update.useMutation({
    onSuccess: () => {
      toast.success(editingTask ? "Tarefa atualizada com sucesso!" : "Tarefa movida com sucesso!");
      refetch();
      setEditingTask(null);
    },
    onError: (error) => {
      toast.error(`Erro ao ${editingTask ? "atualizar" : "mover"} tarefa: ${error.message}`);
    },
  });

  const deleteMutation = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      toast.success("Tarefa excluída com sucesso!");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir tarefa: ${error.message}`);
    },
  });

  // Checklist queries e mutations
  const { data: checklists, refetch: refetchChecklists } = trpc.tasks.getChecklists.useQuery(
    { taskId: selectedTask?.task?.id || 0 },
    { enabled: !!selectedTask?.task?.id }
  );

  const { data: checklistProgress, refetch: refetchProgress } = trpc.tasks.getChecklistProgress.useQuery(
    { taskId: selectedTask?.task?.id || 0 },
    { enabled: !!selectedTask?.task?.id }
  );

  const createChecklistMutation = trpc.tasks.createChecklist.useMutation({
    onSuccess: () => {
      refetchChecklists();
      refetchProgress();
      setNewChecklistItem("");
    },
    onError: (error) => {
      toast.error("Erro ao criar item: " + error.message);
    },
  });

  const updateChecklistMutation = trpc.tasks.updateChecklist.useMutation({
    onSuccess: () => {
      refetchChecklists();
      refetchProgress();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar item: " + error.message);
    },
  });

  const deleteChecklistMutation = trpc.tasks.deleteChecklist.useMutation({
    onSuccess: () => {
      refetchChecklists();
      refetchProgress();
    },
    onError: (error) => {
      toast.error("Erro ao excluir item: " + error.message);
    },
  });

  const handleCreate = () => {
    if (!formData.title.trim()) {
      toast.error("Título é obrigatório");
      return;
    }

    // Corrigir problema de timezone - criar data com hora meio-dia para evitar mudança de dia
    let dueDate: Date | undefined;
    if (formData.dueDate) {
      const [year, month, day] = formData.dueDate.split('-').map(Number);
      dueDate = new Date(year, month - 1, day, 12, 0, 0);
    }

    if (editingTask) {
      updateMutation.mutate({
        id: editingTask.id,
        data: {
          title: formData.title,
          description: formData.description || undefined,
          priority: formData.priority,
          dueDate,
        },
      });
      setIsDialogOpen(false);
      setFormData({ title: "", description: "", priority: "medium", dueDate: "" });
      setEditingTask(null);
    } else {
      createMutation.mutate({
        title: formData.title,
        description: formData.description || undefined,
        priority: formData.priority,
        dueDate,
      });
    }
  };

  const handleEdit = (task: any) => {
    setEditingTask(task);
    setFormData({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "medium",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (taskId: number) => {
    if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
      deleteMutation.mutate({ id: taskId });
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id as number;
    let newStatus = over.id as string;

    // Validar se o newStatus é um status válido
    const validStatuses: TaskStatus[] = ["todo", "in_progress", "review", "done", "cancelled"];
    
    // Se over.id não é um status válido, é porque foi solto sobre uma tarefa
    // Nesse caso, precisamos encontrar o status da tarefa sobre a qual foi solto
    if (!validStatuses.includes(newStatus as TaskStatus)) {
      const targetTask = (tasks || []).find((item) => item.task.id === parseInt(newStatus));
      if (targetTask) {
        newStatus = targetTask.task.status as string;
      } else {
        console.error("Não foi possível determinar o status da coluna");
        return;
      }
    }

    // Encontrar a tarefa atual
    const currentTask = (tasks || []).find((item) => item.task.id === taskId);
    if (!currentTask) return;

    const currentStatus = currentTask.task.status as TaskStatus;

    // Se mudou de coluna, atualizar o status
    if (currentStatus !== newStatus) {
      updateMutation.mutate({
        id: taskId,
        data: {
          status: newStatus as TaskStatus,
          completedDate: newStatus === "done" ? new Date() : undefined,
        },
      });
    }
  };

  const tasksByStatus = (tasks || []).reduce((acc, item) => {
    const status = item.task.status as TaskStatus;
    if (!acc[status]) acc[status] = [];
    acc[status].push(item);
    return acc;
  }, {} as Record<TaskStatus, typeof tasks>);

  const activeTask = activeId ? (tasks || []).find((item) => item.task.id === activeId) : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tarefas</h1>
            <p className="text-muted-foreground">Arraste e solte tarefas entre as colunas</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Tarefa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Digite o título da tarefa"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva a tarefa..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value as TaskPriority })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dueDate">Data de Vencimento</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
                <Button onClick={handleCreate} className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Criando..." : "Criar Tarefa"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {(["todo", "in_progress", "review", "done", "cancelled"] as TaskStatus[]).map((status) => {
              const config = statusConfig[status];
              const Icon = config.icon;
              const statusTasks = tasksByStatus[status] || [];

              return (
                <Card key={status} className="flex flex-col">
                  <CardHeader className={`${config.color} border-b-2`}>
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                      <Icon className="h-4 w-4" />
                      {config.label}
                      <span className="ml-auto text-xs">({statusTasks.length})</span>
                    </CardTitle>
                  </CardHeader>
                  <SortableContext
                    id={status}
                    items={statusTasks.map((item) => item.task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <DroppableColumn status={status}>
                      {statusTasks.map((item) => (
                        <TaskCard key={item.task.id} item={item} onEdit={handleEdit} onDelete={handleDelete} onOpenChecklist={(item) => { setSelectedTask(item); setChecklistOpen(true); }} />
                      ))}
                      {statusTasks.length === 0 && (
                        <p className="text-xs text-center text-muted-foreground py-8">
                          Arraste tarefas aqui
                        </p>
                      )}
                    </DroppableColumn>
                  </SortableContext>
                </Card>
              );
            })}
          </div>

          <DragOverlay>
            {activeTask ? <TaskCard item={activeTask} onEdit={handleEdit} onDelete={handleDelete} isDragging /> : null}
          </DragOverlay>
        </DndContext>

        {/* Dialog de Checklist */}
        <Dialog open={checklistOpen} onOpenChange={setChecklistOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                Checklist - {selectedTask?.task?.title}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Progresso */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progresso</span>
                  <span className="font-semibold">{checklistProgress?.progress || 0}%</span>
                </div>
                <Progress value={checklistProgress?.progress || 0} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  {checklistProgress?.completed || 0} de {checklistProgress?.total || 0} itens concluídos
                </p>
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
                        taskId: selectedTask?.task?.id,
                        title: newChecklistItem.trim(),
                      });
                    }
                  }}
                />
                <Button
                  onClick={() => {
                    if (newChecklistItem.trim()) {
                      createChecklistMutation.mutate({
                        taskId: selectedTask?.task?.id,
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

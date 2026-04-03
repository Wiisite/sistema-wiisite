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
import { AlertCircle, Calendar, CheckCircle2, CheckSquare, Clock, GripVertical, ListTodo, Plus, Edit2, Trash2, X, StickyNote } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { toast } from "sonner";
import { CSS } from "@dnd-kit/utilities";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";

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
      className={`p-4 hover:shadow-lg transition-all cursor-pointer active:cursor-grabbing group relative border-l-4 ${
        item.task.priority === 'urgent' ? 'border-l-red-500' : 
        item.task.priority === 'high' ? 'border-l-orange-500' : 
        item.task.priority === 'medium' ? 'border-l-blue-500' : 'border-l-slate-300'
      } ${isSortableDragging ? 'z-50' : ''}`}
      onClick={() => onEdit(item.task)}
      {...attributes}
      {...listeners}
    >
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start gap-2">
          <h4 className="font-bold text-sm leading-tight flex-1">{item.task.title}</h4>
          <div className="flex items-center gap-1 shrink-0 bg-white/50 dark:bg-slate-900/50 p-0.5 rounded backdrop-blur-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            {onOpenChecklist && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenChecklist(item);
                }}
                title="Checklist"
              >
                <CheckSquare className="h-4 w-4 text-blue-600" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item.task);
              }}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-white hover:bg-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.task.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {item.task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{item.task.description}</p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${priorityColors[item.task.priority as TaskPriority]}`}>
            {item.task.priority === "low" && "Baixa"}
            {item.task.priority === "medium" && "Média"}
            {item.task.priority === "high" && "Alta"}
            {item.task.priority === "urgent" && "Urgente"}
          </span>

          <div className="flex items-center gap-2">
            {item.task.startDate && (
              <span className="text-[10px] flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3 w-3 text-blue-500" />
                {new Date(item.task.startDate).toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit' })}
              </span>
            )}
            {item.task.dueDate && (
              <span className="text-[10px] flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3 w-3 text-red-500" />
                {new Date(item.task.dueDate).toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit' })}
              </span>
            )}
          </div>
        </div>

        {item.checklistTotal > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-muted-foreground flex items-center gap-1">
                <CheckSquare className="h-3 w-3" />
                Checklist
              </span>
              <span className="font-semibold">{item.checklistCompleted}/{item.checklistTotal}</span>
            </div>
            <Progress 
              value={Math.round((item.checklistCompleted / item.checklistTotal) * 100)} 
              className="h-1.5" 
            />
          </div>
        )}

        {item.task.notes && (
          <div className="mt-1 p-2 bg-yellow-50 dark:bg-yellow-950/10 border border-yellow-200/50 dark:border-yellow-800/30 rounded text-[10px] text-yellow-800 dark:text-yellow-300">
            <div className="flex items-start gap-1">
              <StickyNote className="h-3 w-3 mt-0.5 shrink-0 opacity-70" />
              <p className="line-clamp-2 whitespace-pre-line">{item.task.notes}</p>
            </div>
          </div>
        )}
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
    startDate: "",
    dueDate: "",
    notes: "",
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
      setFormData({ title: "", description: "", priority: "medium", startDate: "", dueDate: "", notes: "" });
    },
    onError: (error) => {
      toast.error(`Erro ao criar tarefa: ${error.message}`);
    },
  });

  const utils = trpc.useUtils();

  const updateMutation = trpc.tasks.update.useMutation({
    onMutate: async ({ id, data }) => {
      // Cancelar refetches em andamento para não sobrescrever o estado otimista
      await utils.tasks.list.cancel();

      // Salvar o estado anterior
      const previousTasks = utils.tasks.list.getData();

      // Atualizar o cache otimisticamente
      if (previousTasks && data.status) {
        utils.tasks.list.setData(undefined, (old: any) => {
          if (!old) return old;
          return old.map((item: any) => 
            item.task.id === id 
              ? { ...item, task: { ...item.task, status: data.status, completedDate: data.status === "done" ? new Date() : item.task.completedDate } }
              : item
          );
        });
      }

      return { previousTasks };
    },
    onError: (err, newTodo, context) => {
      // Reverter se houver erro
      if (context?.previousTasks) {
        utils.tasks.list.setData(undefined, context.previousTasks);
      }
      toast.error(`Erro ao ${editingTask ? "atualizar" : "mover"} tarefa: ${err.message}`);
    },
    onSuccess: () => {
      toast.success(editingTask ? "Tarefa atualizada com sucesso!" : "Tarefa movida com sucesso!");
    },
    onSettled: () => {
      // Sempre refetch no final para garantir sincronia
      utils.tasks.list.invalidate();
      setEditingTask(null);
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
    let startDate: Date | undefined;
    if (formData.startDate) {
      const [year, month, day] = formData.startDate.split('-').map(Number);
      startDate = new Date(year, month - 1, day, 12, 0, 0);
    }
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
          startDate,
          dueDate,
          notes: formData.notes || undefined,
        },
      });
      setIsDialogOpen(false);
      setFormData({ title: "", description: "", priority: "medium", startDate: "", dueDate: "", notes: "" });
      setEditingTask(null);
    } else {
      createMutation.mutate({
        title: formData.title,
        description: formData.description || undefined,
        priority: formData.priority,
        startDate,
        dueDate,
        notes: formData.notes || undefined,
      });
    }
  };

  const handleEdit = (task: any) => {
    setEditingTask(task);
    setFormData({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "medium",
      startDate: task.startDate ? new Date(task.startDate).toISOString().split("T")[0] : "",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
      notes: task.notes || "",
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

  const findContainer = (id: string | number) => {
    const validStatuses: TaskStatus[] = ["todo", "in_progress", "review", "done", "cancelled"];
    if (validStatuses.includes(id as TaskStatus)) return id as TaskStatus;

    const item = (tasks || []).find((item) => item.task.id === (typeof id === 'string' ? parseInt(id) : id));
    return item?.task.status as TaskStatus;
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Encontrar os containers
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    // Mover o item entre containers no cache otimista
    utils.tasks.list.setData(undefined, (old: any) => {
      if (!old) return old;
      return old.map((item: any) =>
        item.task.id === activeId
          ? { ...item, task: { ...item.task, status: overContainer } }
          : item
      );
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id as number;
    const overId = over.id;

    const activeContainer = findContainer(taskId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer) return;

    // Se mudou de container ou de posição, persistir no servidor
    // Por enquanto persistimos apenas a mudança de status
    if (activeContainer !== overContainer) {
      updateMutation.mutate({
        id: taskId,
        data: {
          status: overContainer,
          completedDate: overContainer === "done" ? new Date() : undefined,
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Data Inicial</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Data Final</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Bloco de Notas</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Anotações da tarefa..."
                    rows={3}
                  />
                </div>
                <Button onClick={handleCreate} className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingTask ? (updateMutation.isPending ? "Atualizando..." : "Atualizar Tarefa") : (createMutation.isPending ? "Criando..." : "Criar Tarefa")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
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

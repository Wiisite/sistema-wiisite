import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, Plus, X, Trash2, Pencil, Check } from "lucide-react";
import { toast } from "sonner";

const NOTE_COLORS = [
  { value: "yellow", bg: "bg-yellow-100 dark:bg-yellow-900/40", border: "border-yellow-300 dark:border-yellow-700", text: "text-yellow-900 dark:text-yellow-100" },
  { value: "blue", bg: "bg-blue-100 dark:bg-blue-900/40", border: "border-blue-300 dark:border-blue-700", text: "text-blue-900 dark:text-blue-100" },
  { value: "green", bg: "bg-green-100 dark:bg-green-900/40", border: "border-green-300 dark:border-green-700", text: "text-green-900 dark:text-green-100" },
  { value: "pink", bg: "bg-pink-100 dark:bg-pink-900/40", border: "border-pink-300 dark:border-pink-700", text: "text-pink-900 dark:text-pink-100" },
  { value: "purple", bg: "bg-purple-100 dark:bg-purple-900/40", border: "border-purple-300 dark:border-purple-700", text: "text-purple-900 dark:text-purple-100" },
  { value: "orange", bg: "bg-orange-100 dark:bg-orange-900/40", border: "border-orange-300 dark:border-orange-700", text: "text-orange-900 dark:text-orange-100" },
];

function getColorClasses(color: string) {
  return NOTE_COLORS.find((c) => c.value === color) || NOTE_COLORS[0];
}

export default function StickyNotesPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newColor, setNewColor] = useState("yellow");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  const { data: notes, refetch } = trpc.stickyNotes.list.useQuery(undefined, {
    enabled: isOpen,
  });

  const createMutation = trpc.stickyNotes.create.useMutation({
    onSuccess: () => {
      refetch();
      setNewContent("");
      toast.success("Nota criada!");
    },
    onError: (err) => toast.error("Erro ao criar nota: " + err.message),
  });

  const updateMutation = trpc.stickyNotes.update.useMutation({
    onSuccess: () => {
      refetch();
      setEditingId(null);
      setEditContent("");
      toast.success("Nota atualizada!");
    },
    onError: (err) => toast.error("Erro ao atualizar: " + err.message),
  });

  const deleteMutation = trpc.stickyNotes.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Nota excluída!");
    },
    onError: (err) => toast.error("Erro ao excluir: " + err.message),
  });

  const handleCreate = () => {
    if (!newContent.trim()) return;
    createMutation.mutate({ content: newContent.trim(), color: newColor });
  };

  const handleUpdate = (id: number) => {
    if (!editContent.trim()) return;
    updateMutation.mutate({ id, content: editContent.trim() });
  };

  const handleDelete = (id: number) => {
    if (confirm("Excluir esta nota?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-yellow-400 hover:bg-yellow-500 dark:bg-yellow-500 dark:hover:bg-yellow-600 shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
        title="Bloco de Notas"
      >
        <StickyNote className="h-6 w-6 text-yellow-900 group-hover:scale-110 transition-transform" />
        {notes && notes.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {notes.length}
          </span>
        )}
      </button>

      {/* Painel lateral */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Painel */}
          <div className="fixed right-0 top-0 h-full w-[380px] max-w-[90vw] bg-background border-l shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-yellow-50 dark:bg-yellow-950/20">
              <div className="flex items-center gap-2">
                <StickyNote className="h-5 w-5 text-yellow-600" />
                <h2 className="font-semibold text-lg">Bloco de Notas</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Nova nota */}
            <div className="p-4 border-b space-y-3">
              <Textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Escreva uma nova nota..."
                rows={3}
                className="resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    handleCreate();
                  }
                }}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {NOTE_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setNewColor(c.value)}
                      className={`h-6 w-6 rounded-full border-2 transition-all ${c.bg} ${
                        newColor === c.value
                          ? "ring-2 ring-offset-1 ring-primary scale-110"
                          : "opacity-70 hover:opacity-100"
                      }`}
                      title={c.value}
                    />
                  ))}
                </div>
                <Button
                  size="sm"
                  onClick={handleCreate}
                  disabled={!newContent.trim() || createMutation.isPending}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Ctrl+Enter para salvar rápido</p>
            </div>

            {/* Lista de notas */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {!notes || notes.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <StickyNote className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Nenhuma nota ainda</p>
                  <p className="text-xs mt-1">Crie uma nota acima para começar</p>
                </div>
              ) : (
                notes.map((note: any) => {
                  const colors = getColorClasses(note.color);
                  const isEditing = editingId === note.id;

                  return (
                    <div
                      key={note.id}
                      className={`rounded-lg border p-3 ${colors.bg} ${colors.border} ${colors.text} transition-all`}
                    >
                      {isEditing ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={3}
                            className="resize-none bg-white/50 dark:bg-black/20"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                                handleUpdate(note.id);
                              }
                              if (e.key === "Escape") {
                                setEditingId(null);
                              }
                            }}
                          />
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingId(null)}
                              className="h-7 text-xs"
                            >
                              Cancelar
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleUpdate(note.id)}
                              disabled={!editContent.trim() || updateMutation.isPending}
                              className="h-7 text-xs"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Salvar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm whitespace-pre-line leading-relaxed">{note.content}</p>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-current/10">
                            <span className="text-xs opacity-60">
                              {new Date(note.updatedAt).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setEditingId(note.id);
                                  setEditContent(note.content);
                                }}
                                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                title="Editar"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(note.id)}
                                className="p-1 rounded hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors text-red-600 dark:text-red-400"
                                title="Excluir"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

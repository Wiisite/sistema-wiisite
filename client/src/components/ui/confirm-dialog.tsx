import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";
import { Button } from "./button";
import { Loader2, AlertTriangle, Trash2, Info } from "lucide-react";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "warning";
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

/**
 * Confirmation dialog for destructive or important actions
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default",
  onConfirm,
  isLoading = false,
}: ConfirmDialogProps) {
  const [isPending, setIsPending] = React.useState(false);

  const handleConfirm = async () => {
    setIsPending(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setIsPending(false);
    }
  };

  const loading = isLoading || isPending;

  const Icon = variant === "destructive" ? Trash2 : variant === "warning" ? AlertTriangle : Info;
  const iconColor = variant === "destructive" ? "text-destructive" : variant === "warning" ? "text-yellow-500" : "text-primary";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full bg-muted ${iconColor}`}>
              <Icon className="h-5 w-5" />
            </div>
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant={variant === "destructive" ? "destructive" : "default"}
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirmText}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Hook for managing confirm dialog state
 */
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [config, setConfig] = React.useState<Omit<ConfirmDialogProps, "open" | "onOpenChange"> | null>(null);

  const confirm = React.useCallback(
    (options: Omit<ConfirmDialogProps, "open" | "onOpenChange">) => {
      setConfig(options);
      setIsOpen(true);
    },
    []
  );

  const close = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const ConfirmDialogComponent = React.useCallback(() => {
    if (!config) return null;
    return (
      <ConfirmDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        {...config}
      />
    );
  }, [isOpen, config]);

  return {
    confirm,
    close,
    isOpen,
    ConfirmDialog: ConfirmDialogComponent,
  };
}

/**
 * Preset confirm dialogs for common actions
 */
export const confirmPresets = {
  delete: (itemName: string, onConfirm: () => void | Promise<void>) => ({
    title: "Excluir item",
    description: `Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`,
    confirmText: "Excluir",
    cancelText: "Cancelar",
    variant: "destructive" as const,
    onConfirm,
  }),

  deleteMultiple: (count: number, onConfirm: () => void | Promise<void>) => ({
    title: "Excluir itens",
    description: `Tem certeza que deseja excluir ${count} itens selecionados? Esta ação não pode ser desfeita.`,
    confirmText: "Excluir todos",
    cancelText: "Cancelar",
    variant: "destructive" as const,
    onConfirm,
  }),

  cancel: (itemName: string, onConfirm: () => void | Promise<void>) => ({
    title: "Cancelar item",
    description: `Tem certeza que deseja cancelar "${itemName}"?`,
    confirmText: "Cancelar item",
    cancelText: "Voltar",
    variant: "warning" as const,
    onConfirm,
  }),

  unsavedChanges: (onConfirm: () => void | Promise<void>) => ({
    title: "Alterações não salvas",
    description: "Você tem alterações não salvas. Deseja sair sem salvar?",
    confirmText: "Sair sem salvar",
    cancelText: "Continuar editando",
    variant: "warning" as const,
    onConfirm,
  }),

  logout: (onConfirm: () => void | Promise<void>) => ({
    title: "Sair do sistema",
    description: "Tem certeza que deseja sair do sistema?",
    confirmText: "Sair",
    cancelText: "Cancelar",
    variant: "default" as const,
    onConfirm,
  }),
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  onDelete: () => Promise<unknown>;
  invalidateKey: string;
  label?: string;
  confirmText?: string;
  successMessage?: string;
  /** Only the owner of the row sees the delete button. */
  ownerId?: string | null;
};

export function DeleteButton({
  onDelete,
  invalidateKey,
  label = "Delete",
  confirmText = "Delete this permanently?",
  successMessage = "Deleted 🗑️",
  ownerId,
}: Props) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const mutation = useMutation({
    mutationFn: onDelete,
    onSuccess: async () => {
      toast.success(successMessage);
      await queryClient.invalidateQueries({ queryKey: [invalidateKey] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!user || (ownerId && ownerId !== user.id)) return null;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={mutation.isPending}
      onClick={() => {
        if (window.confirm(confirmText)) mutation.mutate();
      }}
      className="press-btn inline-flex items-center gap-1.5 rounded-md border-2 border-border bg-card px-2.5 py-1.5 text-sm font-semibold text-brick disabled:opacity-50 active:press-btn-active"
    >
      {mutation.isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Trash2 className="size-4" />
      )}
    </button>
  );
}

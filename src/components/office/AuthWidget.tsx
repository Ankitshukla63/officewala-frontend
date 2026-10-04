import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export function AuthWidget() {
  const { user, displayName, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (loading) return null;

  if (!user) {
    return (
      <Link
        to="/auth"
        className="press-btn rounded-md bg-brick px-3 py-1.5 text-sm font-semibold text-primary-foreground"
      >
        Sign in
      </Link>
    );
  }

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    signOut();
    toast.success("Laptop band ✅");
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="sticker-label bg-forest text-primary-foreground">🫡 {displayName}</span>
      <button
        type="button"
        onClick={handleSignOut}
        aria-label="Sign out"
        title="Sign out"
        className="press-btn inline-flex items-center gap-1.5 rounded-md border-2 border-border bg-card px-2.5 py-1.5 text-sm font-semibold text-brick"
      >
        <LogOut className="size-4" />
      </button>
    </div>
  );
}

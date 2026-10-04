import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { signIn, signUp, saveToken } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

const inputClass =
  "w-full rounded-md border-2 border-border bg-background px-3 py-2 text-base";

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" as any, replace: true });
  }, [user, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const res = await signUp(email, password, displayName.trim() || email.split("@")[0]);
        saveToken(res.token);
        toast.success("Welcome aboard 🫡");
      } else {
        const res = await signIn(email, password);
        saveToken(res.token);
        toast.success("Welcome back ☕");
      }
      window.location.href = "/";
    } catch (error: any) {
      let msg = error.response?.data?.message || error.message || "Something went wrong";
      if (msg.toLowerCase().includes("weak") || msg.toLowerCase().includes("at least 8")) {
        msg =
          "Ye password thoda chhota ya common hai 😅 — minimum 8 characters use karo.";
      }
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <header className="mb-6 text-center">
        <h1 className="font-display text-4xl leading-tight sm:text-5xl">
          {mode === "signin" ? "PUNCH IN ☕" : "JOIN THE OFFICE 🫡"}
        </h1>
        <p className="mt-2 font-hand text-2xl text-brick">
          Apna account banao, apni office story post karo.
        </p>
      </header>

      <div className="paint-panel p-6">
        <form className="grid gap-3" onSubmit={submit}>
          {mode === "signup" && (
            <label className="grid gap-1 text-sm font-semibold">
              Display name
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={60}
                placeholder="Ankit"
                className={inputClass}
              />
            </label>
          )}
          <label className="grid gap-1 text-sm font-semibold">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className={inputClass}
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            Password
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                className={`${inputClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-ink"
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
            {mode === "signup" && (
              <span className="text-xs font-normal text-muted-foreground">
                Minimum 8 characters — koi common password (jaise "password123") nahi chalega.
                Letters + numbers + symbol use karo.
              </span>
            )}
          </label>
          <button
            type="submit"
            disabled={busy}
            className="press-btn mt-1 inline-flex items-center justify-center gap-2 rounded-md bg-brick px-4 py-2.5 font-semibold text-primary-foreground disabled:opacity-60"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {mode === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm">
          {mode === "signin" ? "Naya user?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="font-semibold text-brick underline"
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        <Link to="/" className="underline">
          ← Back to the office
        </Link>
      </p>
    </div>
  );
}

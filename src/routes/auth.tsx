import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { signIn, signUp, saveToken } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { mode?: "signin" | "signup" } => ({
    mode: search.mode === "signin" ? "signin" : "signup",
  }),
  component: AuthPage,
});

const LAST_EMAIL_KEY = "ow_last_email";

const inputClass =
  "w-full rounded-md border-2 border-border bg-background px-3 py-2 text-base outline-none transition-colors focus:border-brick focus:ring-2 focus:ring-brick/20";

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/auth" });
  const [mode, setMode] = useState<"signin" | "signup">(search.mode || "signup");
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem(LAST_EMAIL_KEY) || "";
    } catch {
      return "";
    }
  });
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    let created = false;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.appendChild(meta);
      created = true;
    }
    const previous = meta.content;
    meta.content = "noindex, follow";

    return () => {
      if (created && meta) {
        meta.remove();
      } else if (meta) {
        meta.content = previous || "index, follow";
      }
    };
  }, []);

  useEffect(() => {
    if (search.mode) {
      setMode(search.mode);
    }
  }, [search.mode]);

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/" as any, replace: true });
    }
  }, [user, loading, navigate]);

  const changeMode = (nextMode: "signin" | "signup") => {
    setMode(nextMode);
    navigate({ search: (prev: any) => ({ ...prev, mode: nextMode }), replace: true });
  };

  const getFriendlyErrorMessage = (error: any): string => {
    const data = error?.response?.data;
    const rawMsg = data?.message || error?.message || "";
    const lower = rawMsg.toLowerCase();

    if (data?.data && typeof data.data === "object") {
      const fieldErrors = Object.values(data.data);
      if (fieldErrors.length > 0) {
        const first = String(fieldErrors[0]);
        if (first.toLowerCase().includes("at least 8")) {
          return "Password minimum 8 characters ka hona chahiye.";
        }
        return first;
      }
    }

    if (lower.includes("invalid credentials")) {
      return "Email ya password match nahi kar raha. Ek baar check kar lo.";
    }
    if (lower.includes("already registered") || lower.includes("exists")) {
      return "Ye email pehle se registered hai! Punch In try karo.";
    }
    if (lower.includes("weak") || lower.includes("at least 8")) {
      return "Password minimum 8 characters ka hona chahiye.";
    }
    if (lower.includes("network") || error.code === "ERR_NETWORK") {
      return "Backend se connection nahi ho pa raha. Server status check karein.";
    }

    return rawMsg || "Kuch gadbad ho gayi. Thodi der baad try karo.";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      toast.error("Email enter karna zaroori hai.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password minimum 8 characters ka hona chahiye.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const fallbackName = displayName.trim() || cleanEmail.split("@")[0] || "Warrior";
        const res = await signUp(cleanEmail, password, fallbackName);
        saveToken(res.token);
        try {
          localStorage.setItem(LAST_EMAIL_KEY, cleanEmail);
        } catch {
          /* ignore */
        }
        toast.success("Welcome aboard! Account ban gaya.");
      } else {
        const res = await signIn(cleanEmail, password);
        saveToken(res.token);
        try {
          localStorage.setItem(LAST_EMAIL_KEY, cleanEmail);
        } catch {
          /* ignore */
        }
        toast.success("Punch-in successful. Welcome back!");
      }
      window.location.href = "/";
    } catch (error: any) {
      toast.error(getFriendlyErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6 sm:py-10">
      {/* Nav pill switcher in native site style */}
      <div className="mb-4 flex justify-center gap-2">
        <button
          type="button"
          onClick={() => changeMode("signin")}
          className={`rounded-md border-2 border-border px-4 py-1.5 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${
            mode === "signin"
              ? "bg-brick text-primary-foreground shadow-sm"
              : "bg-card text-ink hover:bg-muted"
          }`}
        >
          Punch In
        </button>
        <button
          type="button"
          onClick={() => changeMode("signup")}
          className={`rounded-md border-2 border-border px-4 py-1.5 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${
            mode === "signup"
              ? "bg-brick text-primary-foreground shadow-sm"
              : "bg-card text-ink hover:bg-muted"
          }`}
        >
          New Joining
        </button>
      </div>

      {/* Main paint panel card */}
      <div className="paint-panel p-5 sm:p-6">
        <form className="grid gap-3" onSubmit={submit}>
          {mode === "signup" && (
            <label className="grid gap-1 text-sm font-semibold">
              <div className="flex items-center justify-between">
                <span>Display Name</span>
                <span className="text-xs font-normal text-muted-foreground">Optional</span>
              </div>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={60}
                placeholder="e.g. Sharma ji / Ankit"
                className={inputClass}
              />
            </label>
          )}

          <label className="grid gap-1 text-sm font-semibold">
            <span>Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="office.warrior@company.com"
              className={inputClass}
            />
          </label>

          <label className="grid gap-1 text-sm font-semibold">
            <span>Password</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                placeholder="••••••••"
                className={`${inputClass} pr-11 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground transition-colors hover:text-ink"
              >
                {showPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={busy}
            className="press-btn mt-1 inline-flex items-center justify-center gap-2 rounded-md bg-brick px-4 py-2.5 font-display text-xl text-primary-foreground disabled:opacity-60 active:press-btn-active"
          >
            {busy && <Loader2 className="size-5 animate-spin" />}
            <span>{mode === "signin" ? "PUNCH IN" : "CREATE ACCOUNT"}</span>
          </button>
        </form>

        <div className="mt-4 border-t-2 border-dashed border-border pt-3 text-center text-sm">
          {mode === "signin" ? (
            <p className="text-muted-foreground">
              Naya employee ho?{" "}
              <button
                type="button"
                onClick={() => changeMode("signup")}
                className="font-bold text-brick underline underline-offset-2 hover:opacity-85"
              >
                Sign up / Nayi Joining
              </button>
            </p>
          ) : (
            <p className="text-muted-foreground">
              Pehle se account hai?{" "}
              <button
                type="button"
                onClick={() => changeMode("signin")}
                className="font-bold text-brick underline underline-offset-2 hover:opacity-85"
              >
                Punch In karo
              </button>
            </p>
          )}
        </div>
      </div>

      <p className="mt-3 text-center text-sm font-semibold">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-ink underline underline-offset-2"
        >
          <ArrowLeft className="size-4" />
          <span>Back to the office</span>
        </Link>
      </p>
    </div>
  );
}

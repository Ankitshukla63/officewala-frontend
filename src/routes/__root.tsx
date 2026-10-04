import {
  Outlet,
  Link,
  createRootRoute,
  useRouter,
  useRouterState,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Toaster } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { AuthWidget } from "@/components/office/AuthWidget";
import { BossAlert } from "@/components/office/BossAlert";
import { NAV_LINKS } from "@/lib/categories";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="paint-panel max-w-md p-8 text-center">
        <h1 className="font-display text-6xl">404</h1>
        <h2 className="mt-3 font-display text-2xl">This page took a chai break</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="press-btn inline-flex rounded-md bg-brick px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="paint-panel max-w-md p-8 text-center">
        <h1 className="font-display text-2xl">Server ne mana kar diya 😅</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. Try again or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="press-btn rounded-md bg-brick px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Try again
          </button>
          <a
            href="/"
            className="press-btn rounded-md bg-mustard px-4 py-2 text-sm font-semibold text-ink"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b-3 border-border bg-mustard">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="leading-none">
          <span className="flex items-center gap-2">
            <img
              src="/office-wala-logo.svg"
              alt=""
              aria-hidden="true"
              className="size-10 rounded-xl border-2 border-border shadow-sm sm:size-12"
            />
            <span className="font-display text-2xl text-ink sm:text-3xl">OFFICE WALA</span>
          </span>
          <span className="block font-hand text-lg text-brick">Corporate Life FM</span>
        </Link>

        <nav className="hidden flex-wrap items-center gap-1.5 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-md border-2 border-border bg-card px-2.5 py-1 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
              activeProps={{ className: "bg-brick text-primary-foreground" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden lg:block">
            <AuthWidget />
          </div>
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="press-btn rounded-md bg-card p-2 text-ink lg:hidden"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      {open && (
        <nav className="grid grid-cols-2 gap-2 border-t-2 border-border px-4 pb-4 pt-3 lg:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="rounded-md border-2 border-border bg-card px-3 py-2 text-center text-sm font-semibold text-ink"
            >
              {link.label}
            </Link>
          ))}
          <div className="col-span-2 flex justify-center pt-1">
            <AuthWidget />
          </div>
        </nav>
      )}
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-12 border-t-3 border-border bg-forest px-4 py-8 text-primary-foreground">
      <div className="mx-auto max-w-4xl text-center">
        <p className="font-display text-3xl">☕ OFFICE WALA</p>
        <p className="font-hand text-2xl text-mustard">Corporate Life, One Clip at a Time 😂</p>

        <div className="mx-auto mt-5 max-w-xl border-y-2 border-mustard/60 py-3 text-sm font-semibold">
          <p className="flex flex-wrap justify-center gap-x-2 gap-y-1">
            <Link to="/manager">Manager</Link> • <Link to="/meetings">Meetings</Link> •{" "}
            <Link to="/deadline">Deadline</Link> • <Link to="/client">Client</Link>
          </p>
          <p className="mt-1 flex flex-wrap justify-center gap-x-2 gap-y-1">
            <Link to="/chai">Chai Break</Link> • <Link to="/wfh">WFH</Link> •{" "}
            <Link to={"/friday" as any}>Friday</Link> • <Link to="/random">Random Clips</Link>
          </p>
        </div>

        <p className="mt-4 font-hand text-2xl text-mustard">
          "Kaam khatam nahi hua... bas laptop band kiya hai." 😎
        </p>
        <p className="mt-3 text-xs opacity-80">
          © 2026 OFFICE WALA • Made for all the corporate warriors 🫡
        </p>
      </div>
    </footer>
  );
}

function AuthGate() {
  const { user, loading } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  const isAuthPage = pathname === "/auth";
  const isPublicPage = pathname.startsWith("/wireless-upload");

  useEffect(() => {
    if (!loading && !user && !isAuthPage && !isPublicPage) {
      navigate({ to: "/auth" as any, replace: true });
    }
  }, [loading, user, isAuthPage, isPublicPage, navigate]);

  if (isAuthPage || isPublicPage) return <Outlet />;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="font-hand text-3xl text-brick">Chai bann rahi hai... ☕</p>
      </div>
    );
  }

  if (!user) return null;

  return <Outlet />;
}

function RootComponent() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <AuthGate />
      </main>
      <SiteFooter />
      <BossAlert />
      <Toaster position="top-center" />
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

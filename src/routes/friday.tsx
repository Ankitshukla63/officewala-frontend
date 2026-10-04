import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { fridayQuery } from "@/lib/queries";
import { useAuth } from "@/hooks/useAuth";
import { DeleteButton } from "@/components/office/DeleteButton";
import { createFridayPost, deleteFridayPost } from "@/lib/friday";
import { uploadToBucket } from "@/lib/upload";

export const Route = createFileRoute("/friday")({
  validateSearch: (search: Record<string, unknown>): { page?: number } => ({
    page: Math.max(1, Number(search["page"]) || 1),
  }),
  errorComponent: ({ error }) => (
    <p role="alert" className="p-8 text-center">
      {(error as Error).message}
    </p>
  ),
  notFoundComponent: () => <p className="p-8 text-center">No Friday photos yet.</p>,
  component: FridayPage,
});

function FridayPage() {
  const search = Route.useSearch();
  const page = search.page ?? 1;
  const navigate = useNavigate({ from: "/friday" });
  const { data } = useSuspenseQuery(fridayQuery(page));

  const goTo = (next: number) =>
    navigate({ search: (prev: any) => ({ ...prev, page: next }) });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <header className="mb-6 text-center">
        <h1 className="font-display text-4xl leading-tight sm:text-6xl">🎉 IT'S FRIDAY!</h1>
        <p className="mt-2 font-hand text-2xl text-brick">Show us your Friday mood.</p>
      </header>

      <div className="mb-8 text-center">
        <AddFridayPhoto page={page} />
      </div>

      {data.items.length === 0 ? (
        <div className="paint-panel p-10 text-center">
          <p className="font-display text-2xl">No Friday photos yet 😂</p>
          <p className="mt-1 text-muted-foreground">Be the first corporate warrior to post.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.items.map((post) => (
            <figure key={post.id} className="paint-panel-sm rotate-[-0.6deg] p-3 even:rotate-[0.7deg]">
              {post.image_url ? (
                <img
                  src={post.image_url}
                  alt={post.caption ?? "Friday office photo"}
                  loading="lazy"
                  className="aspect-square w-full rounded-sm border-2 border-border object-cover"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center rounded-sm bg-muted text-3xl">
                  🎉
                </div>
              )}
              <figcaption className="pt-2">
                <p className="font-display text-lg leading-tight">{post.user_name}</p>
                <p className="font-hand text-xl text-brick">{post.caption}</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                  <DeleteButton
                    ownerId={post.user_id}
                    invalidateKey="friday"
                    label="Delete this Friday photo"
                    confirmText="Delete this Friday photo? This cannot be undone."
                    successMessage="Friday photo removed 🗑️"
                    onDelete={() => deleteFridayPost(post.id)}
                  />
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      {data.pageCount > 1 && (
        <nav className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => goTo(page - 1)}
            className="press-btn rounded-md bg-mustard px-3 py-1.5 font-semibold text-ink disabled:opacity-40"
          >
            ← Previous
          </button>
          {Array.from({ length: data.pageCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i + 1)}
              className={`press-btn size-9 rounded-md font-semibold ${
                page === i + 1 ? "bg-brick text-primary-foreground" : "bg-card text-ink"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            type="button"
            disabled={page >= data.pageCount}
            onClick={() => goTo(page + 1)}
            className="press-btn rounded-md bg-mustard px-3 py-1.5 font-semibold text-ink disabled:opacity-40"
          >
            Next →
          </button>
        </nav>
      )}
    </div>
  );
}

function AddFridayPhoto({ page }: { page: number }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!photo) throw new Error("Please choose a photo");
      const ref = await uploadToBucket("friday-photos", photo);
      return createFridayPost({ image_url: ref, caption: caption.trim() || null });
    },
    onSuccess: async () => {
      toast.success("Friday mood posted 🎉");
      setOpen(false);
      setPhoto(null);
      setCaption("");
      await queryClient.invalidateQueries({ queryKey: ["friday"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!user) {
    return (
      <div>
        <Link
          to="/auth"
          className="press-btn inline-block rounded-md bg-tangerine px-5 py-2.5 font-semibold text-ink active:press-btn-active"
        >
          SIGN IN TO POST 🔐
        </Link>
        <p className="mt-2 text-sm text-muted-foreground">
          Apni Friday photo post karne ke liye sign in karo.
        </p>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="press-btn rounded-md bg-tangerine px-5 py-2.5 font-semibold text-ink active:press-btn-active"
        >
          + ADD YOUR FRIDAY PHOTO
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-auto border-3 border-border bg-card">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Your Friday Mood 🎉</DialogTitle>
          <DialogDescription>
            {page > 1 ? "New posts appear on page 1." : "It appears in the feed right away."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-3 text-left"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <label className="grid gap-1 text-sm font-semibold">
            Photo
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              className="rounded-md border-2 border-border bg-background px-3 py-2 font-normal"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            Caption
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={300}
              className="rounded-md border-2 border-border bg-background px-3 py-2 font-normal"
              placeholder="Finally Friday! 🎉"
            />
          </label>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="press-btn mt-1 inline-flex items-center justify-center gap-2 rounded-md bg-forest px-4 py-2.5 font-semibold text-primary-foreground disabled:opacity-60"
          >
            {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
            POST FRIDAY MOOD 🎉
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState, type ReactNode } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Play } from "lucide-react";
import { VideoPlayer } from "./VideoPlayer";
import { DeleteButton } from "./DeleteButton";
import { deleteVideo } from "@/lib/videos";
import { videosQuery } from "@/lib/queries";
import { CATEGORY_LABEL, formatTimeRange, type Clip } from "@/lib/categories";

export type Variant = "notebook" | "folder" | "doc" | "cards";

type Props = {
  category: string;
  heading: string;
  subtitle: string;
  variant: Variant;
  paged?: boolean;
  extra?: ReactNode;
  emptyLabel?: string;
  showClientName?: boolean;
};

const SHELL: Record<Variant, string> = {
  notebook: "notebook-paper p-4 sm:p-5",
  folder: "paint-panel-sm bg-mustard/40 p-4",
  doc: "doc-paper p-4",
  cards: "paint-panel-sm p-4",
};

export function CategoryPage({
  category,
  heading,
  subtitle,
  variant,
  paged,
  extra,
  emptyLabel,
  showClientName,
}: Props) {
  const { data: clips } = useSuspenseQuery(videosQuery(category));
  const playable = clips.filter((clip) => Boolean(clip.video_url));
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const currentIndex = Math.max(
    0,
    playable.findIndex((c) => c.id === playingId),
  );
  const current: Clip | null = playable[currentIndex] ?? playable[0] ?? null;
  const visible = paged ? clips.slice(page, page + 1) : clips;
  const step = (delta: number) => {
    if (playable.length === 0) return;
    const next = (currentIndex + delta + playable.length) % playable.length;
    setPlayingId(playable[next]!.id);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <header className="mb-6 text-center">
        <h1 className="font-display text-4xl leading-tight sm:text-6xl">{heading}</h1>
        <p className="mt-2 font-hand text-2xl text-brick">{subtitle}</p>
      </header>

      {extra}

      <div className="mb-8">
        <VideoPlayer clip={current} onPrev={() => step(-1)} onNext={() => step(1)} />
      </div>

      {clips.length === 0 ? (
        <div className="paint-panel p-10 text-center">
          <p className="font-display text-2xl">{emptyLabel ?? "No office drama loaded yet 😂"}</p>
          <p className="mt-1 text-muted-foreground">Nothing filed under this category yet.</p>
        </div>
      ) : (
        <>
          <div
            className={
              paged
                ? "grid grid-cols-1 gap-4"
                : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            }
          >
            {visible.map((clip) => {
              const meta = formatTimeRange(clip);
              return (
                <article
                  key={clip.id}
                  className={`${SHELL[variant]} page-turn flex flex-col gap-2 ${paged ? "min-h-64" : ""}`}
                >
                  {variant === "folder" && (
                    <span className="stamp-urgent self-start text-[10px]">Urgent</span>
                  )}
                  {showClientName && clip.client_name && (
                    <p className="text-xs font-bold uppercase tracking-widest text-brick">
                      Client: {clip.client_name}
                    </p>
                  )}
                  <h2
                    className={`font-display text-2xl leading-tight ${variant === "doc" ? "uppercase" : ""}`}
                  >
                    {clip.title}
                  </h2>

                  {meta && (
                    <p className="sticker-label self-start bg-forest text-primary-foreground">
                      {meta}
                    </p>
                  )}

                  {clip.image_url && (
                    <img
                      src={clip.image_url}
                      alt={clip.title}
                      loading="lazy"
                      className="max-h-56 w-full rounded-md border-2 border-border object-cover"
                    />
                  )}

                  {clip.description && (
                    <p className="text-sm text-muted-foreground">{clip.description}</p>
                  )}
                  {clip.notes && (
                    <p
                      className={`text-sm ${variant === "notebook" ? "font-hand text-xl text-ink" : "text-muted-foreground"}`}
                    >
                      {clip.notes}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                    <span className="sticker-label bg-mustard text-ink">
                      {CATEGORY_LABEL[clip.category] ?? clip.category}
                      {clip.author_name ? ` • ${clip.author_name}` : ""}
                    </span>
                    <div className="flex items-center gap-2">
                      {clip.video_url ? (
                        <button
                          type="button"
                          onClick={() => {
                            setPlayingId(clip.id);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="press-btn inline-flex items-center gap-1.5 rounded-md bg-brick px-3 py-1.5 text-sm font-semibold text-primary-foreground active:press-btn-active"
                        >
                          <Play className="size-4" /> Play
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-muted-foreground">
                          Notes only 📝
                        </span>
                      )}
                      <DeleteButton
                        ownerId={clip.user_id}
                        invalidateKey="videos"
                        label={`Delete ${clip.title}`}
                        confirmText={`Delete "${clip.title}"? This cannot be undone.`}
                        successMessage="Deleted from the wall 🗑️"
                        onDelete={async () => {
                          await deleteVideo(clip.id);
                          if (playingId === clip.id) setPlayingId(null);
                        }}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {paged && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="press-btn rounded-md bg-mustard px-4 py-2 font-semibold text-ink disabled:opacity-40 active:press-btn-active"
              >
                ← Previous page
              </button>
              <span className="font-hand text-xl">
                Page {page + 1} of {clips.length}
              </span>
              <button
                type="button"
                disabled={page >= clips.length - 1}
                onClick={() => setPage((p) => Math.min(clips.length - 1, p + 1))}
                className="press-btn rounded-md bg-mustard px-4 py-2 font-semibold text-ink disabled:opacity-40 active:press-btn-active"
              >
                Next page →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

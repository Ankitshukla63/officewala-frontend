import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { VideoPlayer } from "@/components/office/VideoPlayer";
import { getRandomVideo } from "@/lib/videos";
import { CATEGORY_LABEL, type Clip } from "@/lib/categories";

export const Route = createFileRoute("/random")({
  component: RandomPage,
});

function RandomPage() {
  const [clip, setClip] = useState<Clip | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roll = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getRandomVideo();
      await new Promise((r) => setTimeout(r, 700));
      setClip(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <header className="mb-6 text-center">
        <h1 className="font-display text-4xl leading-tight sm:text-5xl">
          🎲 CORPORATE REALITY GENERATOR
        </h1>
        <p className="mt-2 font-hand text-2xl text-brick">
          One button. Infinite office trauma. 😂
        </p>
      </header>

      <div className="mb-8 text-center">
        <button
          type="button"
          onClick={roll}
          disabled={loading}
          className="press-btn inline-flex items-center gap-2 rounded-xl bg-brick px-7 py-4 font-display text-2xl text-primary-foreground disabled:opacity-70 active:press-btn-active"
        >
          {loading && <Loader2 className="size-6 animate-spin" />}
          {loading ? "Rolling the dice..." : "GIVE ME A RANDOM CLIP"}
        </button>
      </div>

      {error && (
        <p role="alert" className="paint-panel-sm mb-6 p-4 text-center text-brick">
          {error}
        </p>
      )}

      {clip && !loading && (
        <div className="paint-panel-sm mb-4 p-4 text-center">
          <p className="font-display text-xl">Today's Corporate Reality 😂</p>
          <p className="font-hand text-2xl text-brick">
            {CATEGORY_LABEL[clip.category] ?? clip.category}: "{clip.title}"
          </p>
        </div>
      )}

      <VideoPlayer clip={clip} loading={loading} onNext={roll} onPrev={roll} />
    </div>
  );
}

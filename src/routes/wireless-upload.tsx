import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { uploadToBucket } from "@/lib/upload";

const PENDING_MANAGER_KEY = "ow_pending_manager_moment";

export const Route = createFileRoute("/wireless-upload")({
  validateSearch: (search: Record<string, unknown>) => ({
    bucket: typeof search.bucket === "string" ? search.bucket : "videos",
    category: typeof search.category === "string" ? search.category : "chai",
  }),
  component: WirelessUploadPage,
});

function WirelessUploadPage() {
  const { bucket, category } = Route.useSearch();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!file) {
      toast.error("Please choose a video file");
      return;
    }

    try {
      setSubmitting(true);
      const videoUrl = await uploadToBucket(bucket, file);

      const draft = {
        title: title.trim(),
        notes: notes.trim() || null,
        video_url: videoUrl,
        category,
        created_at: new Date().toISOString(),
      };

      localStorage.setItem(PENDING_MANAGER_KEY, JSON.stringify(draft));
      toast.success("Ready for manager diary — save it from the Manager page");
      setTitle("");
      setNotes("");
      setFile(null);
      navigate({ to: "/manager" as any });
    } catch (error) {
      console.error(error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="paint-panel p-6 text-left">
        <p className="sticker-label bg-brick text-primary-foreground">WIRELESS UPLOAD</p>
        <h1 className="mt-4 font-display text-4xl">Upload from another phone 📱</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a video clip on your mobile, and it will be added to the Office Wala library.
        </p>

        <form className="mt-6 grid gap-3" onSubmit={handleSubmit}>
          <label className="grid gap-1 text-sm font-semibold">
            Title
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Late-night client call meltdown"
              className="rounded-md border-2 border-border bg-background px-3 py-2 font-normal text-base"
              required
            />
          </label>

          <label className="grid gap-1 text-sm font-semibold">
            Notes
            <textarea
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional context or office chaos details"
              className="rounded-md border-2 border-border bg-background px-3 py-2 font-normal text-base"
            />
          </label>

          <label className="grid gap-1 text-sm font-semibold">
            Video file
            <input
              type="file"
              accept="video/*"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="rounded-md border-2 border-border bg-background px-3 py-2 font-normal text-base"
              required
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="press-btn mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-forest px-4 py-3 font-semibold text-primary-foreground disabled:opacity-60"
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {submitting ? "Uploading..." : "Upload clip"}
          </button>
        </form>
      </div>
    </div>
  );
}

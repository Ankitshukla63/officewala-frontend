import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { CategoryPage } from "@/components/office/CategoryPage";
import { AddClipDialog } from "@/components/office/AddClipDialog";
import { createVideo } from "@/lib/videos";

const PENDING_MANAGER_KEY = "ow_pending_manager_moment";

type PendingManagerMoment = {
  title: string;
  notes: string | null;
  video_url: string | null;
  category: string;
  created_at: string;
};

export const Route = createFileRoute("/manager")({
  errorComponent: ({ error }) => <p role="alert" className="p-8 text-center">{(error as Error).message}</p>,
  notFoundComponent: () => <p className="p-8 text-center">No diary pages yet.</p>,
  component: function ManagerPage() {
    const queryClient = useQueryClient();
    const [pending, setPending] = useState<PendingManagerMoment | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
      try {
        const raw = localStorage.getItem(PENDING_MANAGER_KEY);
        if (!raw) {
          setPending(null);
          return;
        }

        const next = JSON.parse(raw) as PendingManagerMoment;
        setPending(next);
      } catch {
        setPending(null);
        localStorage.removeItem(PENDING_MANAGER_KEY);
      }
    }, []);

    const clearPending = () => {
      setPending(null);
      localStorage.removeItem(PENDING_MANAGER_KEY);
    };

    const savePending = async () => {
      if (!pending) return;

      try {
        setSaving(true);
        await createVideo({
          title: pending.title,
          description: null,
          notes: pending.notes,
          video_url: pending.video_url,
          thumbnail_url: null,
          image_url: null,
          event_date: null,
          start_time: null,
          end_time: null,
          client_name: null,
          category: "manager",
        });
        clearPending();
        toast.success("Manager moment saved to diary 📓");
        await queryClient.invalidateQueries({ queryKey: ["videos"] });
      } catch (error) {
        console.error(error);
        toast.error("Could not save manager moment");
      } finally {
        setSaving(false);
      }
    };

    return (
      <CategoryPage
        category="manager"
        heading="MANAGER'S DIARY"
        subtitle="Things My Manager Said 😂"
        variant="notebook"
        paged
        emptyLabel="The diary is empty 😂"
        extra={
          <>
            {pending && (
              <div className="paint-panel mb-6 p-4 text-left">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-brick">
                      Pending upload from phone
                    </p>
                    <h2 className="mt-1 font-display text-2xl">{pending.title}</h2>
                    {pending.notes && <p className="mt-1 text-sm text-muted-foreground">{pending.notes}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={savePending}
                      disabled={saving}
                      className="press-btn rounded-md bg-forest px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60 active:press-btn-active"
                    >
                      {saving ? "Saving..." : "Save to diary"}
                    </button>
                    <button
                      type="button"
                      onClick={clearPending}
                      className="press-btn rounded-md bg-mustard px-4 py-2 text-sm font-semibold text-ink active:press-btn-active"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            <AddClipDialog
              category="manager"
              tone="mustard"
              buttonLabel="+ ADD MANAGER MOMENT"
              dialogTitle="New Manager Moment 👨‍💼"
              dialogDescription="What did the manager say this time? Title is enough — video is optional."
              submitLabel="SAVE TO DIARY 📓"
              successMessage="Added to the manager diary 📓"
              notesLabel="What the manager said"
              notesPlaceholder="Can we have a quick call? Need this by EOD..."
            />
          </>
        }
      />
    );
  },
});

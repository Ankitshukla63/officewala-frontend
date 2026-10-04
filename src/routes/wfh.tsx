import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/office/CategoryPage";
import { AddClipDialog } from "@/components/office/AddClipDialog";

const STATUS = [
  { label: "Laptop", value: "ON", dot: "bg-forest" },
  { label: "Teams", value: "Available", dot: "bg-forest" },
  { label: "Employee", value: "On Bed", dot: "bg-brick" },
  { label: "Camera", value: "Network issue", dot: "bg-brick" },
];

export const Route = createFileRoute("/wfh")({
  errorComponent: ({ error }) => <p role="alert" className="p-8 text-center">{(error as Error).message}</p>,
  notFoundComponent: () => <p className="p-8 text-center">Nothing here.</p>,
  component: () => (
    <CategoryPage
      category="wfh"
      heading="🏠 WORK FROM HOME"
      subtitle="Everyone's dream. 😂"
      variant="cards"
      emptyLabel="Employee unreachable 😂"
      extra={
        <>
          <div className="paint-panel mx-auto mb-6 grid max-w-3xl grid-cols-2 gap-3 p-4 sm:grid-cols-4">
            {STATUS.map((s) => (
              <div key={s.label} className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
                <span className={`size-2.5 rounded-full ${s.dot}`} />
                <span className="text-sm font-semibold">
                  {s.label}: <span className="font-normal">{s.value}</span>
                </span>
              </div>
            ))}
          </div>
          <AddClipDialog
            category="wfh"
            tone="mustard"
            buttonLabel="+ ADD WFH MOMENT"
            dialogTitle="New WFH Moment 🏠"
            dialogDescription="Photo, video, or just the story — all optional except the title."
            submitLabel="SAVE MOMENT 🏠"
            successMessage="WFH moment saved 🏠"
            withPhoto
            notesLabel="Notes"
            notesPlaceholder="Camera was off because... reasons."
          />
        </>
      }
    />
  ),
});

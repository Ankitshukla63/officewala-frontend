import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/office/CategoryPage";
import { AddClipDialog } from "@/components/office/AddClipDialog";
import type { Field } from "@/components/office/UploadEntryDialog";

const MEETING_FIELDS: Field[] = [
  { name: "event_date", label: "Date", kind: "date" },
  { name: "start_time", label: "Start time", kind: "time" },
  { name: "end_time", label: "End time", kind: "time" },
];

export const Route = createFileRoute("/meetings")({
  errorComponent: ({ error }) => <p role="alert" className="p-8 text-center">{(error as Error).message}</p>,
  notFoundComponent: () => <p className="p-8 text-center">No meeting notes yet.</p>,
  component: () => (
    <CategoryPage
      category="meetings"
      heading="MEETING NOTES"
      subtitle="This meeting could have been an email."
      variant="notebook"
      emptyLabel="No meeting notes taken 😂"
      extra={
        <AddClipDialog
          category="meetings"
          tone="forest"
          buttonLabel="+ ADD MEETING NOTE"
          dialogTitle="New Meeting Note 📓"
          dialogDescription="Log the meeting — date, timings, what happened. Video is optional."
          submitLabel="SAVE NOTE 📝"
          successMessage="Meeting note saved 📝"
          extraFields={MEETING_FIELDS}
          notesLabel="What happened in the meeting"
          notesPlaceholder="Discussed for 60 minutes. Decided to schedule another meeting."
        />
      }
    />
  ),
});

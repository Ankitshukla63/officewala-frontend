import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/office/CategoryPage";
import { AddClipDialog } from "@/components/office/AddClipDialog";
import type { Field } from "@/components/office/UploadEntryDialog";

const CLIENT_FIELDS: Field[] = [
  { name: "client_name", label: "Client name", kind: "text", placeholder: "Sharma Enterprises" },
];

export const Route = createFileRoute("/client")({
  errorComponent: ({ error }) => <p role="alert" className="p-8 text-center">{(error as Error).message}</p>,
  notFoundComponent: () => <p className="p-8 text-center">No requests filed.</p>,
  component: () => (
    <CategoryPage
      category="client"
      heading="CLIENT REQUEST"
      subtitle="&quot;Just one small change...&quot;"
      variant="doc"
      showClientName
      emptyLabel="No client file opened yet 😂"
      extra={
        <div className="mx-auto mb-2 max-w-2xl">
          <div className="doc-paper mb-6 p-4 text-sm">
            <p className="font-semibold uppercase tracking-widest text-brick">
              Requirement Document / Rev. 47
            </p>
            <p className="mt-1 text-muted-foreground">
              Subject: Minor tweak (estimated 5 minutes) • Priority: Highest • Deadline: Yesterday
            </p>
          </div>
          <AddClipDialog
            category="client"
            tone="tangerine"
            buttonLabel="+ ADD CLIENT REQUEST"
            dialogTitle="New Client Request 💼"
            dialogDescription="File the latest requirement. Title is enough — video is optional."
            submitLabel="FILE REQUEST 🗂️"
            successMessage="Client request filed 🗂️"
            extraFields={CLIENT_FIELDS}
            notesLabel="Requirement / change note"
            notesPlaceholder="Can the logo be bigger? And also smaller at the same time?"
          />
        </div>
      }
    />
  ),
});

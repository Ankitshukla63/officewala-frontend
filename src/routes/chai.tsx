import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/office/CategoryPage";
import { AddClipDialog } from "@/components/office/AddClipDialog";

export const Route = createFileRoute("/chai")({
  errorComponent: ({ error }) => <p role="alert" className="p-8 text-center">{(error as Error).message}</p>,
  notFoundComponent: () => <p className="p-8 text-center">No chai yet.</p>,
  component: () => (
    <CategoryPage
      category="chai"
      heading="☕ CHAI BREAK"
      subtitle="5 minutes break... somehow became 45 minutes. 😂"
      variant="cards"
      emptyLabel="Kettle is empty 😂"
      extra={
        <AddClipDialog
          category="chai"
          tone="brick"
          buttonLabel="+ ADD NEW CHAI BREAK"
          dialogTitle="New Chai Break ☕"
          dialogDescription="Upload your own office chai moment. It shows up instantly."
          submitLabel="SAVE CHAI ☕"
          successMessage="Chai saved ☕"
          notesLabel="Description"
          notesPlaceholder="What happened at the chai tapri?"
        />
      }
    />
  ),
});

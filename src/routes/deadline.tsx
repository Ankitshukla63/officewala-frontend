import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { UploadEntryDialog, type Field } from "@/components/office/UploadEntryDialog";
import { DeleteButton } from "@/components/office/DeleteButton";
import { createDeadlineNote, deleteDeadlineNote } from "@/lib/deadline";
import { deadlineNotesQuery } from "@/lib/queries";

const FIELDS: Field[] = [
  { name: "title", label: "Title", kind: "text", required: true, placeholder: "Client demo slides" },
  { name: "due_date", label: "Due date", kind: "date" },
  { name: "note", label: "Deadline note", kind: "textarea", placeholder: "What exactly is due?" },
  {
    name: "funny_line",
    label: "Funny line",
    kind: "textarea",
    placeholder: "Tomorrow means today, EOD means midnight.",
  },
];

export const Route = createFileRoute("/deadline")({
  errorComponent: ({ error }) => <p role="alert" className="p-8 text-center">{(error as Error).message}</p>,
  notFoundComponent: () => <p className="p-8 text-center">No files yet.</p>,
  component: DeadlinePage,
});

function DeadlinePage() {
  const { data: notes } = useSuspenseQuery(deadlineNotesQuery());

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <header className="mb-6 text-center">
        <h1 className="font-display text-4xl leading-tight sm:text-6xl">DEADLINE FILES</h1>
        <p className="mt-2 font-hand text-2xl text-brick">
          Everything is urgent. Everything is EOD.
        </p>
      </header>

      <UploadEntryDialog
        buttonLabel="+ ADD DEADLINE NOTE"
        dialogTitle="New Deadline Note ⏰"
        dialogDescription="Pin another impossible timeline to the wall. Title is enough."
        submitLabel="PIN TO WALL 📌"
        successMessage="Deadline pinned to the wall 📌"
        fields={FIELDS}
        invalidateKey="deadline-notes"
        tone="brick"
        onSubmit={async (values) => {
          return createDeadlineNote({
            title: values["title"]!.trim(),
            note: values["note"]?.trim() || null,
            funny_line: values["funny_line"]?.trim() || null,
            due_date: values["due_date"] || null,
          });
        }}
      />

      {notes.length === 0 ? (
        <div className="paint-panel p-10 text-center">
          <p className="font-display text-2xl">No files on the desk 😂</p>
          <p className="mt-1 text-muted-foreground">
            Enjoy the calm — the next deadline is typing.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note, i) => (
            <article
              key={note.id}
              className={`paint-panel-sm page-turn relative flex flex-col gap-2 bg-mustard/40 p-4 pt-6 ${
                i % 2 === 0 ? "rotate-[-0.8deg]" : "rotate-[0.8deg]"
              }`}
            >
              <span className="stamp-urgent absolute -top-2 right-3 text-[10px]">Urgent</span>
              <h2 className="font-display text-2xl leading-tight">{note.title}</h2>
              {note.due_date && (
                <p className="sticker-label self-start bg-brick text-primary-foreground">
                  Due:{" "}
                  {new Date(`${note.due_date}T00:00:00`).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
              {note.note && <p className="text-sm text-muted-foreground">{note.note}</p>}
              {note.funny_line && (
                <p className="border-t-2 border-dashed border-border pt-2 font-hand text-xl text-brick">
                  “{note.funny_line}”
                </p>
              )}
              <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                <span className="text-xs font-semibold text-muted-foreground">
                  {note.author_name ? `— ${note.author_name}` : ""}
                </span>
                <DeleteButton
                  ownerId={note.user_id}
                  invalidateKey="deadline-notes"
                  label={`Delete ${note.title}`}
                  confirmText={`Delete "${note.title}"? This cannot be undone.`}
                  successMessage="Deadline slip torn up 🗑️"
                  onDelete={() => deleteDeadlineNote(note.id)}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

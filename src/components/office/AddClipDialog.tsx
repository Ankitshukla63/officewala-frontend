import { UploadEntryDialog, type Field } from "./UploadEntryDialog";
import { createVideo } from "@/lib/videos";
import { uploadToBucket } from "@/lib/upload";
import type { CategoryId } from "@/lib/categories";

type Props = {
  category: CategoryId;
  buttonLabel: string;
  dialogTitle: string;
  dialogDescription: string;
  submitLabel: string;
  successMessage: string;
  extraFields?: Field[];
  withPhoto?: boolean;
  tone?: "brick" | "mustard" | "forest" | "tangerine";
  notesLabel?: string;
  notesPlaceholder?: string;
};

export function AddClipDialog({
  category,
  buttonLabel,
  dialogTitle,
  dialogDescription,
  submitLabel,
  successMessage,
  extraFields = [],
  withPhoto,
  tone = "brick",
  notesLabel = "Notes",
  notesPlaceholder,
}: Props) {
  const fields: Field[] = [
    { name: "title", label: "Title", kind: "text", required: true, placeholder: "Give it a name" },
    ...extraFields,
    {
      name: "notes",
      label: notesLabel,
      kind: "textarea",
      ...(notesPlaceholder ? { placeholder: notesPlaceholder } : {}),
    },
    { name: "video", label: "Video (optional)", kind: "video" },
    ...(withPhoto ? [{ name: "photo", label: "Photo (optional)", kind: "image" } as Field] : []),
    { name: "thumbnail", label: "Thumbnail (optional)", kind: "image" },
  ];

  return (
    <UploadEntryDialog
      buttonLabel={buttonLabel}
      dialogTitle={dialogTitle}
      dialogDescription={dialogDescription}
      submitLabel={submitLabel}
      successMessage={successMessage}
      fields={fields}
      invalidateKey="videos"
      tone={tone}
      wirelessCategory={category}
      onSubmit={async (values, files) => {
        const videoFile = files["video"] ?? null;
        const thumbFile = files["thumbnail"] ?? null;
        const photoFile = files["photo"] ?? null;

        const videoRef = videoFile ? await uploadToBucket("videos", videoFile) : null;
        const thumbRef = thumbFile ? await uploadToBucket("thumbnails", thumbFile) : null;
        const photoRef = photoFile ? await uploadToBucket("friday-photos", photoFile) : null;

        return createVideo({
          title: values["title"]!.trim(),
          description: values["description"]?.trim() || null,
          notes: values["notes"]?.trim() || null,
          video_url: videoRef,
          thumbnail_url: thumbRef,
          image_url: photoRef,
          event_date: values["event_date"] || null,
          start_time: values["start_time"] || null,
          end_time: values["end_time"] || null,
          client_name: values["client_name"]?.trim() || null,
          category,
        });
      }}
    />
  );
}

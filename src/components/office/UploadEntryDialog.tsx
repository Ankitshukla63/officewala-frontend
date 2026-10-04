import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Smartphone, Copy } from "lucide-react";
import { Link } from "@tanstack/react-router";
import QRCode from "react-qr-code";
import { useAuth } from "@/hooks/useAuth";
import { buildWirelessUploadUrl } from "@/lib/network";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type FieldKind = "text" | "textarea" | "date" | "time" | "video" | "image";

export type Field = {
  name: string;
  label: string;
  kind: FieldKind;
  placeholder?: string;
  required?: boolean;
};

type Props = {
  buttonLabel: string;
  dialogTitle: string;
  dialogDescription: string;
  submitLabel: string;
  fields: Field[];
  invalidateKey: string;
  successMessage: string;
  tone?: "brick" | "mustard" | "forest" | "tangerine";
  wirelessCategory?: string;
  onSubmit: (
    values: Record<string, string>,
    files: Record<string, File | null>,
  ) => Promise<unknown>;
};

const TONE: Record<string, string> = {
  brick: "bg-brick text-primary-foreground",
  mustard: "bg-mustard text-ink",
  forest: "bg-forest text-primary-foreground",
  tangerine: "bg-tangerine text-ink",
};

const inputClass =
  "rounded-md border-2 border-border bg-background px-3 py-2 font-normal text-base";

export function UploadEntryDialog({
  buttonLabel,
  dialogTitle,
  dialogDescription,
  submitLabel,
  fields,
  invalidateKey,
  successMessage,
  tone = "brick",
  wirelessCategory = "chai",
  onSubmit,
}: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const queryClient = useQueryClient();
  const hasVideoField = fields.some((field) => field.kind === "video");
  const wirelessUploadUrl = useMemo(
    () => buildWirelessUploadUrl("videos", wirelessCategory),
    [wirelessCategory],
  );

  const reset = () => {
    setValues({});
    setFiles({});
  };

  const mutation = useMutation({
    mutationFn: async () => {
      for (const field of fields) {
        if (field.required && field.kind !== "video" && field.kind !== "image") {
          if (!values[field.name]?.trim()) throw new Error(`${field.label} is required`);
        }
      }
      return onSubmit(values, files);
    },
    onSuccess: async () => {
      toast.success(successMessage);
      setOpen(false);
      reset();
      await queryClient.invalidateQueries({ queryKey: [invalidateKey] });
    },
    onError: (error: Error) => toast.error(error.message || "Something went wrong"),
  });

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(wirelessUploadUrl);
      toast.success("QR link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  if (!user) {
    return (
      <div className="mb-6 text-center">
        <Link
          to="/auth"
          className={`press-btn inline-block rounded-md px-5 py-2.5 font-semibold active:press-btn-active ${TONE[tone]}`}
        >
          SIGN IN TO ADD 🔐
        </Link>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in karke apna content add karo — delete bhi sirf tum kar sakte ho.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6 text-center">
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) reset();
        }}
      >
        <DialogTrigger asChild>
          <button
            type="button"
            className={`press-btn rounded-md px-5 py-2.5 font-semibold active:press-btn-active ${TONE[tone]}`}
          >
            {buttonLabel}
          </button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-auto border-3 border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>

          <form
            className="grid gap-3 text-left"
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
          >
            {hasVideoField && (
              <div className="rounded-xl border-2 border-dashed border-border bg-muted/40 p-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="size-4 text-brick" />
                  <p className="text-sm font-semibold">Wireless upload from another phone</p>
                </div>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="rounded-lg bg-white p-2 shadow-sm">
                    <QRCode value={wirelessUploadUrl} size={108} bgColor="#ffffff" fgColor="#1f2937" />
                  </div>
                  <div className="flex-1 text-sm text-muted-foreground">
                    <p>Open this QR on any phone on the same Wi‑Fi and upload directly.</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <a
                        href={wirelessUploadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-brick underline underline-offset-2"
                      >
                        Open upload page
                      </a>
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="inline-flex items-center gap-1 rounded-md border-2 border-border bg-background px-2 py-1 text-xs font-semibold"
                      >
                        <Copy className="size-3.5" /> Copy link
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {fields.map((field) => (
              <label key={field.name} className="grid gap-1 text-sm font-semibold">
                {field.label}
                {field.kind === "textarea" ? (
                  <textarea
                    rows={3}
                    value={values[field.name] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [field.name]: e.target.value }))
                    }
                    className={inputClass}
                  />
                ) : field.kind === "video" || field.kind === "image" ? (
                  <input
                    type="file"
                    accept={field.kind === "video" ? "video/*" : "image/*"}
                    onChange={(e) =>
                      setFiles((f) => ({ ...f, [field.name]: e.target.files?.[0] ?? null }))
                    }
                    className={inputClass}
                  />
                ) : (
                  <input
                    type={field.kind === "date" ? "date" : field.kind === "time" ? "time" : "text"}
                    value={values[field.name] ?? ""}
                    placeholder={field.placeholder}
                    required={field.required}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [field.name]: e.target.value }))
                    }
                    className={inputClass}
                  />
                )}
              </label>
            ))}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="press-btn mt-1 inline-flex items-center justify-center gap-2 rounded-md bg-forest px-4 py-2.5 font-semibold text-primary-foreground disabled:opacity-60"
            >
              {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
              {submitLabel}
            </button>
            <p className="text-center text-xs text-muted-foreground">
              Only the title is required — everything else is optional.
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

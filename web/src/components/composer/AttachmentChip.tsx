"use client";
import type { Attachment } from "@/lib/types";
import { X, FileText, Image as Img } from "lucide-react";

export function AttachmentChip({
  file,
  onRemove,
}: {
  file: Attachment;
  onRemove: (id: string) => void;
}) {
  const isImage = file.mime.startsWith("image/");
  return (
    <div className="flex items-center gap-2 rounded-md border bg-background/70 px-2 py-1 text-xs">
      {isImage ? <Img className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
      <span className="max-w-[160px] truncate">{file.name}</span>
      <button
        className="ml-1 rounded hover:bg-muted p-1"
        onClick={() => onRemove(file.id)}
        title="Remove"
        aria-label="Remove"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

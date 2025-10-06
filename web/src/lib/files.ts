// src/lib/files.ts
import type { Attachment } from "./types";

export const ACCEPT = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "text/csv",
  "image/png",
  "image/jpeg",
  "application/json",
];

export function filesToAttachments(files: FileList, currentDraftCount = 0): Attachment[] {
  const max = Math.max(0, 10 - currentDraftCount);
  const arr = Array.from(files).slice(0, max);
  return arr
    .filter((f) => ACCEPT.includes(f.type) || f.name.endsWith(".md") || f.name.endsWith(".csv"))
    .map((f) => ({
      id: `${Date.now()}_${f.name}_${Math.random().toString(36).slice(2, 6)}`,
      name: f.name,
      mime: f.type || "application/octet-stream",
      size: f.size,
    }));
}

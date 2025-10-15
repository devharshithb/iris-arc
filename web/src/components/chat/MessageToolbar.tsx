"use client";

import { useAppStore } from "@/lib/store";
import { Copy, Pencil, RefreshCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function MessageToolbar({
  messageId,
  role,
  textContent,
  onEditStart,
}: {
  messageId: string;
  role: "user" | "assistant" | "system" | "tool";
  textContent: string;
  onEditStart?: () => void;
}) {
  const { deleteMessage, deleteFromHere, regenerateMessage, stream } = useAppStore();

  const onCopy = async () => {
    try {
      // 1) Prefer rendered DOM text (exactly what user sees)
      let text = "";
      const el = document.getElementById(`msg-${messageId}`);
      if (el) {
        text = el.innerText.trim();
      }

      // 2) Fallback to provided plain content
      if (!text) {
        text = (textContent ?? "").toString().trim();
      }

      if (!text) {
        toast.error("Nothing to copy");
        return;
      }

      await navigator.clipboard.writeText(text);
      toast.success("Copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const onDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.altKey) {
      if (confirm("Delete this message and everything after it?")) {
        deleteFromHere?.(messageId);
        toast.success("Messages deleted from here");
      }
      return;
    }
    deleteMessage(messageId);
    toast.success("Message deleted");
  };

  const onRegenerate = () => {
    if (stream.isStreaming) return;
    regenerateMessage(messageId);
    toast.info("Regenerating response...");
  };

  return (
    <div className="absolute -top-3 right-2 hidden group-hover:flex gap-1 z-10">
      {/* Copy */}
      <button
        onClick={onCopy}
        className="rounded-md border px-2 py-1 text-xs hover:bg-white/10"
        style={{ backgroundColor: "var(--surface-chat)", borderColor: "var(--border-weak)" }}
        title="Copy message"
        aria-label="Copy message"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>

      {/* Edit (ONLY user prompts) */}
      {role === "user" && (
        <button
          onClick={onEditStart}
          className="rounded-md border px-2 py-1 text-xs hover:bg-white/10"
          style={{ backgroundColor: "var(--surface-chat)", borderColor: "var(--border-weak)" }}
          title="Edit message"
          aria-label="Edit message"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Regenerate (assistant only) */}
      {role === "assistant" && (
        <button
          onClick={onRegenerate}
          disabled={stream.isStreaming}
          className="rounded-md border px-2 py-1 text-xs hover:bg-white/10 disabled:opacity-50"
          style={{ backgroundColor: "var(--surface-chat)", borderColor: "var(--border-weak)" }}
          title={stream.isStreaming ? "Wait for generation to finish" : "Regenerate"}
          aria-label="Regenerate"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Delete (Alt+Click = delete from here) */}
      <button
        onClick={onDelete}
        className="rounded-md border px-2 py-1 text-xs hover:bg-white/10"
        style={{ backgroundColor: "var(--surface-chat)", borderColor: "var(--border-weak)" }}
        title="Delete (Alt + Click: delete from here)"
        aria-label="Delete"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

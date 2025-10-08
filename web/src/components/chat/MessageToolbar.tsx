"use client";

import { Copy, RefreshCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";

export default function MessageToolbar({
  messageId,
  role,
  textContent,
}: {
  messageId: string;
  role: "user" | "assistant" | "system" | "tool";
  textContent: string;
}) {
  const { deleteMessage, regenerateMessage, stream } = useAppStore();

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(textContent || "");
      toast.success("Copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <div className="absolute -top-3 right-2 hidden group-hover:flex gap-1 z-10">
      <button
        onClick={onCopy}
        className="rounded-md border px-2 py-1 text-xs hover:bg-white/10"
        style={{ backgroundColor: "var(--surface-chat)", borderColor: "var(--border-weak)" }}
        title="Copy message"
        aria-label="Copy message"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>

      {role === "assistant" && (
        <button
          onClick={() => !stream.isStreaming && regenerateMessage(messageId)}
          disabled={stream.isStreaming}
          className="rounded-md border px-2 py-1 text-xs hover:bg-white/10 disabled:opacity-50"
          style={{ backgroundColor: "var(--surface-chat)", borderColor: "var(--border-weak)" }}
          title={stream.isStreaming ? "Wait for generation to finish" : "Regenerate"}
          aria-label="Regenerate"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
        </button>
      )}

      <button
        onClick={() => deleteMessage(messageId)}
        className="rounded-md border px-2 py-1 text-xs hover:bg-white/10"
        style={{ backgroundColor: "var(--surface-chat)", borderColor: "var(--border-weak)" }}
        title="Delete"
        aria-label="Delete"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import { Search } from "lucide-react";

export default function SearchPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { searchChats, setCurrentThread } = useAppStore();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<ReturnType<typeof searchChats>>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQ("");
      setHits([]);
    }
  }, [open]);

  useEffect(() => {
    setHits(searchChats(q));
  }, [q, searchChats]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="mx-auto mt-24 w-full max-w-xl rounded-2xl border shadow-lg"
        style={{ background: "var(--surface-chat)", borderColor: "var(--border-weak)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: "var(--border-weak)" }}>
          <Search className="h-4 w-4 opacity-70" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search chats…"
            className="w-full bg-transparent outline-none py-1"
          />
          <kbd className="text-xs opacity-70">Esc</kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {hits.length === 0 ? (
            <div className="p-3 text-sm opacity-70">No results</div>
          ) : (
            hits.map((h) => (
              <button
                key={h.threadId}
                onClick={() => {
                  setCurrentThread(h.threadId);
                  onClose();
                }}
                className="w-full text-left rounded-md px-3 py-2 hover:bg-white/5 transition-colors"
              >
                <div className="text-sm font-medium">{h.threadTitle}</div>
                {h.snippet && (
                  <div className="text-xs opacity-70 mt-0.5">{h.snippet}</div>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

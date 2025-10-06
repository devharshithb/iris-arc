"use client";

import { useAppStore } from "@/lib/store";
import { ChevronDown, Sparkles } from "lucide-react";
import { useMemo } from "react";

/**
 * Chat header, left-aligned:
 * - Thread title on the left
 * - Model/agents button on the far right
 * (No sidebar toggle here — keeps sidebar visually separate.)
 */
export default function HeaderBar() {
  const { threads, currentThreadId, toggleRightRail } = useAppStore();
  const thread = useMemo(
    () => threads.find((t) => t.id === currentThreadId),
    [threads, currentThreadId]
  );

  return (
    <header className="h-14 border-b bg-[#212121] flex items-center px-3">
      {/* Left-aligned title */}
      <button className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5">
        <span className="font-semibold">{thread?.title || "New chat"}</span>
        <ChevronDown className="h-4 w-4 opacity-70" />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right controls */}
      <button
        onClick={toggleRightRail}
        className="rounded-md border px-2.5 py-1.5 text-sm hover:bg-white/5"
        title="Model / agents"
      >
        <Sparkles className="h-4 w-4" />
      </button>
    </header>
  );
}

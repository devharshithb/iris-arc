"use client";

import { useAppStore } from "@/lib/store";
import { Plus, Menu } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Sidebar
 * - Open background: #181818
 * - Collapsed background: #212121 (same as chat canvas)
 * - Animates internal content (opacity/width), outer width handled by parent layout/grid.
 * - Works fully in both states (new chat + select thread).
 */
export default function Sidebar() {
  const {
    leftSidebarOpen,
    toggleLeftSidebar,
    threads,
    currentThreadId,
    setCurrentThread,
    newThread,
  } = useAppStore();

  const bg = leftSidebarOpen ? "#181818" : "#212121";

  return (
    <aside
      className="h-dvh flex flex-col border-r transition-colors duration-300 ease-out"
      style={{ backgroundColor: bg, borderColor: "rgba(255,255,255,0.08)" }}
    >
      <TooltipProvider delayDuration={80}>
        {/* Top bar */}
        <div className="flex items-center gap-2 px-3 h-14 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <button
            onClick={toggleLeftSidebar}
            className="grid size-8 place-items-center rounded-md border hover:bg-white/10 transition-colors"
            title={leftSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            style={{ borderColor: "rgba(255,255,255,0.12)" }}
          >
            <Menu className="h-4 w-4" />
          </button>

          {/* New chat (full when open, icon+tooltip when collapsed) */}
          {leftSidebarOpen ? (
            <button
              onClick={() => setCurrentThread(newThread())}
              className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm hover:bg-white/10 transition-colors"
              title="New chat"
              style={{ borderColor: "rgba(255,255,255,0.12)" }}
            >
              <Plus className="h-4 w-4" />
              <span className="whitespace-nowrap">New chat</span>
            </button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setCurrentThread(newThread())}
                  className="ml-auto grid size-8 place-items-center rounded-md border hover:bg-white/10 transition-colors"
                  aria-label="New chat"
                  style={{ borderColor: "rgba(255,255,255,0.12)" }}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                New chat
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Threads */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {threads.map((t) => {
            const active = currentThreadId === t.id;

            if (leftSidebarOpen) {
              return (
                <button
                  key={t.id}
                  onClick={() => setCurrentThread(t.id)}
                  className={[
                    "w-full text-left rounded-md px-3 py-2 text-sm transition-colors",
                    active ? "bg-white/10" : "hover:bg-white/5",
                  ].join(" ")}
                  title={t.title || "New chat"}
                >
                  <span className="block truncate">{t.title || "New chat"}</span>
                </button>
              );
            }

            // Collapsed: show a subtle dot with tooltip
            return (
              <Tooltip key={t.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setCurrentThread(t.id)}
                    className={[
                      "w-full rounded-md py-2 grid place-items-center transition-colors",
                      active ? "bg-white/10" : "hover:bg-white/5",
                    ].join(" ")}
                    aria-label={t.title || "New chat"}
                    title={t.title || "New chat"}
                  >
                    <span
                      className="block h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: active ? "white" : "rgba(255,255,255,0.6)" }}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs max-w-[240px]">
                  <span className="block truncate">{t.title || "New chat"}</span>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className={[
            "border-t px-3 py-2 text-[11px] transition-opacity",
            leftSidebarOpen ? "opacity-60" : "opacity-0",
          ].join(" ")}
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          {leftSidebarOpen ? "Signed in (mock)" : "\u00A0"}
        </div>
      </TooltipProvider>
    </aside>
  );
}

"use client";

import { useAppStore } from "@/lib/store";
import { Plus, Menu } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence, useReducedMotion, easeOut } from "framer-motion";

/**
 * Sidebar
 * - Open bg: var(--surface-sidebar-open)
 * - Collapsed bg: var(--surface-sidebar-closed)
 * - Width is still owned by the parent grid (unchanged).
 * - Framer Motion:
 *    • Top bar + footer fade/slide on mount/open
 *    • Threads list items stagger in when opening
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

  const bg = leftSidebarOpen
    ? "var(--surface-sidebar-open)"
    : "var(--surface-sidebar-closed)";
  const prefersReduced = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : -6 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.18,
        ease: easeOut,
        when: "beforeChildren",
        staggerChildren: prefersReduced ? 0 : 0.025,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: prefersReduced ? 0 : -8 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.16, ease: easeOut } },
  };

  return (
    <aside
      className="h-dvh flex flex-col border-r transition-colors duration-300 ease-out"
      style={{ backgroundColor: bg, borderColor: "var(--border-weak)" }}
    >
      <TooltipProvider delayDuration={80}>
        {/* Top bar */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="flex items-center gap-2 px-3 h-14 border-b"
          style={{ borderColor: "var(--border-weak)" }}
        >
          <motion.button
            variants={itemVariants}
            onClick={toggleLeftSidebar}
            className="grid size-8 place-items-center rounded-md border hover:bg-white/10 transition-colors"
            title={leftSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            style={{ borderColor: "var(--border-weak)" }}
          >
            <Menu className="h-4 w-4" />
          </motion.button>

          <AnimatePresence initial={false} mode="popLayout">
            {leftSidebarOpen ? (
              <motion.button
                key="new-full"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: prefersReduced ? 0 : -6 }}
                onClick={() => setCurrentThread(newThread())}
                className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm hover:bg-white/10 transition-colors"
                title="New chat"
                style={{ borderColor: "var(--border-weak)" }}
              >
                <Plus className="h-4 w-4" />
                <span className="whitespace-nowrap">New chat</span>
              </motion.button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    key="new-icon"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: prefersReduced ? 0 : -6 }}
                    onClick={() => setCurrentThread(newThread())}
                    className="ml-auto grid size-8 place-items-center rounded-md border hover:bg-white/10 transition-colors"
                    aria-label="New chat"
                    style={{ borderColor: "var(--border-weak)" }}
                  >
                    <Plus className="h-4 w-4" />
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  New chat
                </TooltipContent>
              </Tooltip>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Threads */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          <AnimatePresence initial={false} mode="sync">
            {threads.map((t, idx) => {
              const active = currentThreadId === t.id;

              if (leftSidebarOpen) {
                return (
                  <motion.button
                    key={t.id}
                    layout
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0 }}
                    transition={{
                      delay: prefersReduced ? 0 : 0.02 * idx,
                      type: "tween",
                      duration: 0.16,
                    }}
                    onClick={() => setCurrentThread(t.id)}
                    className={[
                      "w-full text-left rounded-md px-3 py-2 text-sm transition-colors",
                      active ? "bg-white/10" : "hover:bg-white/5",
                    ].join(" ")}
                    title={t.title || "New chat"}
                  >
                    <span className="block truncate">{t.title || "New chat"}</span>
                  </motion.button>
                );
              }

              // Collapsed: dot with tooltip
              return (
                <Tooltip key={t.id}>
                  <TooltipTrigger asChild>
                    <motion.button
                      layout
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0 }}
                      transition={{
                        delay: prefersReduced ? 0 : 0.02 * idx,
                        type: "tween",
                        duration: 0.16,
                      }}
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
                        style={{
                          backgroundColor: active ? "white" : "rgba(255,255,255,0.6)",
                        }}
                      />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs max-w-[240px]">
                    <span className="block truncate">{t.title || "New chat"}</span>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: prefersReduced ? 0 : 4 }}
          animate={{ opacity: leftSidebarOpen ? 0.6 : 0, y: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="border-t px-3 py-2 text-[11px]"
          style={{ borderColor: "var(--border-weak)" }}
        >
          {leftSidebarOpen ? "Signed in (mock)" : "\u00A0"}
        </motion.div>
      </TooltipProvider>
    </aside>
  );
}

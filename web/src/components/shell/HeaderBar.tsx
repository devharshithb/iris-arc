"use client";

import { useAppStore } from "@/lib/store";
import { ChevronDown, Sparkles } from "lucide-react";
import { useMemo } from "react";
import ThemeToggle from "@/components/shell/ThemeToggle";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/**
 * HeaderBar with subtle motion
 * - Title fades/slides when the current thread changes
 * - Right controls fade in on mount
 * - Colors continue to come from theme vars
 */
export default function HeaderBar() {
  const { threads, currentThreadId, toggleRightRail } = useAppStore();
  const thread = useMemo(
    () => threads.find((t) => t.id === currentThreadId),
    [threads, currentThreadId]
  );

  const prefersReduced = useReducedMotion();

  return (
    <header
      className="h-14 border-b flex items-center px-3"
      style={{
        backgroundColor: "var(--surface-chat)",
        borderColor: "var(--border-weak)",
      }}
    >
      {/* Title (animate on thread change) */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.button
          key={thread?.id || "title-empty"}
          initial={{ opacity: 0, y: prefersReduced ? 0 : 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: prefersReduced ? 0 : -6 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5"
        >
          <span className="font-semibold">{thread?.title || "New chat"}</span>
          <ChevronDown className="h-4 w-4 opacity-70" />
        </motion.button>
      </AnimatePresence>

      <div className="flex-1" />

      {/* Right controls */}
      <motion.div
        initial={{ opacity: 0, y: prefersReduced ? 0 : -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: "easeOut", delay: 0.05 }}
        className="flex items-center gap-2"
      >
        <ThemeToggle />
        <button
          onClick={toggleRightRail}
          className="rounded-md border px-2.5 py-1.5 text-sm hover:bg-white/5"
          title="Model / agents"
        >
          <Sparkles className="h-4 w-4" />
        </button>
      </motion.div>
    </header>
  );
}

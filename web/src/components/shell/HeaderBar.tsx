"use client";

import { useAppStore } from "@/lib/store";
import { ChevronDown, Sparkles } from "lucide-react";
import { useMemo } from "react";
import ThemeToggle from "@/components/shell/ThemeToggle";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import ThreadMenu from "@/components/shell/ThreadMenu";

export default function HeaderBar() {
  const { threads, currentThreadId, toggleRightRail } = useAppStore();
  const thread = useMemo(
    () => threads.find((t) => t.id === currentThreadId),
    [threads, currentThreadId]
  );
  const prefersReduced = useReducedMotion();

  return (
    <header
      className="h-14 flex items-center px-3 select-none"
      style={{ backgroundColor: "var(--surface-chat)" }} // no border/divider
    >
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

      <motion.div
        initial={{ opacity: 0, y: prefersReduced ? 0 : -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: "easeOut", delay: 0.05 }}
        className="flex items-center gap-2"
      >
        <ThemeToggle />
        <button
          onClick={toggleRightRail}
          className="rounded-md px-2.5 py-1.5 text-sm hover:bg-white/5" // no border
          title="Model / agents"
        >
          <Sparkles className="h-4 w-4" />
        </button>
        <ThreadMenu /> {/* 3-dot trigger is borderless in its own file below */}
      </motion.div>
    </header>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MoreHorizontal,
  Folder,
  ArrowRightLeft,
  Archive,
  Flag,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

export default function ThreadMenu() {
  const { threads, currentThreadId, projects } = useAppStore();
  const thread = useMemo(
    () => threads.find((t) => t.id === currentThreadId),
    [threads, currentThreadId]
  );
  const currentProject = projects.find((p) => p.id === thread?.projectId);

  const [open, setOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (popRef.current?.contains(t) || btnRef.current?.contains(t) || submenuRef.current?.contains(t)) return;
      setOpen(false);
      setSubmenuOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && (setOpen(false), setSubmenuOpen(false));
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const onMoveToProject = (projectId?: string) => {
    setOpen(false);
    setSubmenuOpen(false);
    const name = projectId ? projects.find((p) => p.id === projectId)?.name || "Project" : "No project";
    toast.success(`Moved to: ${name}`);
  };
  const onRemoveFromProject = () => {
    setOpen(false);
    setSubmenuOpen(false);
    toast.success(`Removed from ${currentProject?.name}`);
  };
  const onArchive = () => (setOpen(false), setSubmenuOpen(false), toast("Archived (placeholder)"));
  const onReport = () => (setOpen(false), setSubmenuOpen(false), toast("Reported (placeholder)"));
  const onDelete = () => (setOpen(false), setSubmenuOpen(false), toast.error("Deleted (placeholder)"));

  return (
    <TooltipProvider delayDuration={80}>
      <div className="relative">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              ref={btnRef}
              onClick={() => setOpen((v) => !v)}
              className="rounded-md px-2.5 py-1.5 text-sm hover:bg-white/5" // borderless
              aria-haspopup="menu"
              aria-expanded={open}
              aria-controls="thread-menu"
              title="Thread menu"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">Thread menu</TooltipContent>
        </Tooltip>

        <AnimatePresence>
          {open && (
            <motion.div
              id="thread-menu"
              ref={popRef}
              initial={{ opacity: 0, scale: 0.98, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 4 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="absolute right-0 z-40 mt-2 w-64 rounded-lg border shadow-lg overflow-hidden"
              style={{ backgroundColor: "var(--surface-chat)", borderColor: "var(--border-weak)" }}
              role="menu"
            >
              <button
                onMouseEnter={() => setSubmenuOpen(true)}
                onMouseLeave={() => setSubmenuOpen(false)}
                onClick={() => setSubmenuOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-white/5"
                role="menuitem"
                aria-haspopup="menu"
                aria-expanded={submenuOpen}
              >
                <span className="flex items-center gap-2"><Folder className="h-4 w-4" />Move to project</span>
                <ChevronRight className="h-4 w-4 opacity-70" />
              </button>

              {currentProject && (
                <button
                  onClick={onRemoveFromProject}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5"
                  role="menuitem"
                  title={`Remove from ${currentProject.name}`}
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  Remove from {currentProject.name}
                </button>
              )}

              <div className="my-1 h-px" style={{ backgroundColor: "var(--border-weak)" }} aria-hidden />

              <button onClick={onArchive} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5" role="menuitem">
                <Archive className="h-4 w-4" />Archive
              </button>
              <button onClick={onReport} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5" role="menuitem">
                <Flag className="h-4 w-4" />Report conversation
              </button>
              <button onClick={onDelete} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 text-red-400" role="menuitem">
                <Trash2 className="h-4 w-4" />Delete
              </button>

              <AnimatePresence>
                {submenuOpen && (
                  <motion.div
                    ref={submenuRef}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ duration: 0.14, ease: "easeOut" }}
                    className="absolute top-2 left-full ml-2 w-56 rounded-lg border shadow-lg overflow-hidden"
                    style={{ backgroundColor: "var(--surface-chat)", borderColor: "var(--border-weak)" }}
                    role="menu"
                    onMouseEnter={() => setSubmenuOpen(true)}
                    onMouseLeave={() => setSubmenuOpen(false)}
                  >
                    {projects.length === 0 ? (
                      <div className="px-3 py-2 text-sm opacity-70">No projects yet</div>
                    ) : (
                      projects.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => onMoveToProject(p.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 text-left"
                          role="menuitem"
                        >
                          <Folder className="h-4 w-4" />
                          {p.name}
                        </button>
                      ))
                    )}
                    <div className="my-1 h-px" style={{ backgroundColor: "var(--border-weak)" }} aria-hidden />
                    <button
                      onClick={() => onMoveToProject(undefined)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 text-left"
                      role="menuitem"
                      title="Remove any project association"
                    >
                      <ArrowRightLeft className="h-4 w-4" />
                      None (no project)
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}

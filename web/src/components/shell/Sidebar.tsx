"use client";

import { useAppStore } from "@/lib/store";
import {
  Plus, Menu, Search, BookOpen, ScrollText, Bot,
  FolderPlus, Folder, Pencil, Trash2,
} from "lucide-react";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { motion, AnimatePresence, useReducedMotion, easeOut } from "framer-motion";
import { useState } from "react";
import SearchPanel from "@/components/shell/SearchPanel";
import ProjectPicker from "@/components/shell/ProjectPicker";

function Item({
  children, active, onClick, disabled,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "w-full text-left rounded-md px-2.5 py-2 text-sm transition-colors flex items-center gap-2",
        active ? "bg-white/10" : "hover:bg-white/5",
        disabled ? "opacity-60 cursor-not-allowed" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function Sidebar() {
  const {
    leftSidebarOpen, toggleLeftSidebar,
    threads, currentThreadId, setCurrentThread, newThread,
    projects, createProject, renameProject, deleteProject,
    setProjectFilter, currentProjectFilter,
  } = useAppStore();

  const bg = leftSidebarOpen ? "var(--surface-sidebar-open)" : "var(--surface-sidebar-closed)";
  const prefersReduced = useReducedMotion();
  const [searchOpen, setSearchOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : -6 },
    visible: {
      opacity: 1, y: 0,
      transition: { duration: 0.18, ease: easeOut, when: "beforeChildren", staggerChildren: prefersReduced ? 0 : 0.025 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, x: prefersReduced ? 0 : -8 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.16, ease: easeOut } },
  };

  const TopIconButton = ({
    title, onClick, children,
  }: { title: string; onClick?: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className="grid size-8 place-items-center rounded-md hover:bg-white/10 transition-colors"
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  );

  // filter threads by project (undefined = All)
  const filteredThreads = threads.filter((t) =>
    currentProjectFilter === undefined ? true : t.projectId === currentProjectFilter
  );

  return (
    <aside
      className="h-dvh flex flex-col border-r transition-colors duration-300 ease-out"
      style={{ backgroundColor: bg, borderColor: "var(--border-weak)" }} // keep outer right separator only
    >
      <TooltipProvider delayDuration={80}>
        <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />

        {/* Top bar — NO bottom divider */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="flex items-center gap-2 px-3 h-14"
        >
          <motion.div variants={itemVariants}>
            <TopIconButton
              title={leftSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              onClick={toggleLeftSidebar}
            >
              <Menu className="h-4 w-4" />
            </TopIconButton>
          </motion.div>
          {/* (No “New chat” in header) */}
        </motion.div>

        {/* Primary nav */}
        <div className="px-2 py-2">
          {leftSidebarOpen ? (
            <div className="space-y-1">
              <Item onClick={() => setCurrentThread(newThread(currentProjectFilter))}>
                <Plus className="h-4 w-4" />
                <span>New chat</span>
              </Item>
              <Item onClick={() => setSearchOpen(true)}>
                <Search className="h-4 w-4" />
                <span>Search chats</span>
              </Item>
              <Item onClick={() => toast("Library coming soon")}>
                <BookOpen className="h-4 w-4" />
                <span>Library</span>
              </Item>
              <Item onClick={() => toast("Codex coming soon")}>
                <ScrollText className="h-4 w-4" />
                <span>Codex</span>
              </Item>
              <Item onClick={() => toast("GPTs coming soon")}>
                <Bot className="h-4 w-4" />
                <span>GPTs</span>
              </Item>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              {[
                { icon: <Plus className="h-4 w-4" />, t: "New chat", cb: () => setCurrentThread(newThread(currentProjectFilter)) },
                { icon: <Search className="h-4 w-4" />, t: "Search chats", cb: () => setSearchOpen(true) },
                { icon: <BookOpen className="h-4 w-4" />, t: "Library" },
                { icon: <ScrollText className="h-4 w-4" />, t: "Codex" },
                { icon: <Bot className="h-4 w-4" />, t: "GPTs" },
              ].map((it) => (
                <Tooltip key={it.t}>
                  <TooltipTrigger asChild>
                    <TopIconButton
                      title={it.t}
                      onClick={() => (it.cb ? it.cb() : toast(`${it.t} coming soon`))}
                    >
                      {it.icon}
                    </TopIconButton>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">
                    {it.t}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          )}
        </div>

        {/* NO mid divider */}

        {/* Projects */}
        <div className="px-2 mt-2">
          {leftSidebarOpen ? (
            <>
              <div className="px-2 py-1 text-[11px] uppercase tracking-wide opacity-70 flex items-center justify-between">
                <span>Projects</span>
                <button
                  className="text-xs hover:underline"
                  onClick={() => {
                    const name = prompt("Project name")?.trim();
                    if (name) {
                      const id = createProject(name);
                      setProjectFilter(id);
                    }
                  }}
                >
                  New
                </button>
              </div>
              <div className="space-y-1">
                <Item active={currentProjectFilter === undefined} onClick={() => setProjectFilter(undefined)}>
                  <Folder className="h-4 w-4" />
                  <span>All</span>
                </Item>
                {projects.map((p) => (
                  <div key={p.id} className="flex items-center gap-1">
                    <Item active={currentProjectFilter === p.id} onClick={() => setProjectFilter(p.id)}>
                      <Folder className="h-4 w-4" />
                      <span className="truncate">{p.name}</span>
                    </Item>
                    <button
                      className="rounded-md p-1 hover:bg-white/10"
                      title="Rename"
                      onClick={() => {
                        const name = prompt("Rename project", p.name)?.trim();
                        if (name) renameProject(p.id, name);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      className="rounded-md p-1 hover:bg-white/10"
                      title="Delete"
                      onClick={() => {
                        if (confirm(`Delete project "${p.name}"? Threads will move to Unsorted.`)) {
                          deleteProject(p.id);
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="grid size-8 place-items-center rounded-md hover:bg-white/10 transition-colors"
                    title="New project"
                    onClick={() => {
                      const name = prompt("Project name")?.trim();
                      if (name) createProject(name);
                    }}
                  >
                    <FolderPlus className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  New project
                </TooltipContent>
              </Tooltip>
              {projects.slice(0, 8).map((p) => (
                <Tooltip key={p.id}>
                  <TooltipTrigger asChild>
                    <button
                      className="grid size-8 place-items-center rounded-md hover:bg-white/10 transition-colors"
                      title={p.name}
                      onClick={() => setProjectFilter(p.id)}
                    >
                      <Folder className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs max-w-[220px]">
                    <span className="truncate block">{p.name}</span>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          )}
        </div>

        {/* Chats (filtered list) */}
        <div className="px-2 mt-3 mb-2">
          {leftSidebarOpen && (
            <div className="px-2 py-1 text-[11px] uppercase tracking-wide opacity-70">
              {currentProjectFilter ? "Chats in project" : "Chats"}
            </div>
          )}
          <div className="space-y-1">
            {filteredThreads.map((t) => {
              const active = currentThreadId === t.id;
              if (leftSidebarOpen) {
                return (
                  <div key={t.id} className="rounded-md">
                    <button
                      onClick={() => setCurrentThread(t.id)}
                      className={[
                        "w-full text-left rounded-md px-3 py-2 text-sm transition-colors",
                        active ? "bg-white/10" : "hover:bg-white/5",
                      ].join(" ")}
                      title={t.title || "New chat"}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="block truncate">{t.title || "New chat"}</span>
                        <ProjectPicker threadId={t.id} />
                      </div>
                    </button>
                  </div>
                );
              }
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
        </div>

        {/* Footer — NO top divider */}
        <div className="mt-auto px-3 py-2 flex items-center gap-2">
          <div
            className="grid place-items-center rounded-full size-7"
            style={{ backgroundColor: "var(--surface-chat)", border: "1px solid var(--border-weak)" }}
          >
            <span className="text-[12px]">N</span>
          </div>
          {leftSidebarOpen ? <span className="text-[11px]">Signed in (mock)</span> : <span className="sr-only">Signed in</span>}
        </div>
      </TooltipProvider>
    </aside>
  );
}

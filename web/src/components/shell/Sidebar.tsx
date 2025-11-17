"use client";

import ConfirmDialog from "@/components/shell/ConfirmDialog"; // This line is already correct
import ProjectDialog from "@/components/shell/ProjectDialog";
import SearchPanel from "@/components/shell/SearchPanel";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Archive,
  ChevronDown,
  Folder,
  FolderPlus,
  HelpCircle,
  LogOut,
  Menu,
  MoreHorizontal,
  Move,
  Pencil,
  Plus,
  Search,
  Settings,
  Share2,
  Trash2,
  UserCircle,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppStore } from "@/lib/store";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  AnimatePresence,
  easeOut,
  motion,
  useReducedMotion,
} from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

/* ----------------------------- Portal Helper ----------------------------- */
function PortalFlyout({ children }: { children: React.ReactNode }) {
  if (typeof window === "undefined") return null;
  return createPortal(children, document.body);
}

/* ----------------------------- Small helper ----------------------------- */
function Item({
  children,
  active,
  onClick,
  disabled,
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

const PROJECTS_VISIBLE = 5;

/* -------------------------------------------------------------------------- */
/*                                   Sidebar                                  */
/* -------------------------------------------------------------------------- */
export default function Sidebar() {
  const {
    leftSidebarOpen,
    toggleLeftSidebar,
    threads,
    currentThreadId,
    setCurrentThread,
    newThread,
    projects,
    createProject,
    renameProject,
    deleteProject,
    setProjectFilter,
    currentProjectFilter,
    assignThreadToProject,
  } = useAppStore();

  const bg = leftSidebarOpen
    ? "var(--surface-sidebar-open)"
    : "var(--surface-sidebar-closed)";
  const prefersReduced = useReducedMotion();

  const [searchOpen, setSearchOpen] = useState(false);
  const [projectDlgOpen, setProjectDlgOpen] = useState(false);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [subMenuForMove, setSubMenuForMove] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [chatEditValue, setChatEditValue] = useState("");
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectEditValue, setProjectEditValue] = useState("");

  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [chatsExpanded, setChatsExpanded] = useState(true);
  const [showAllProjects, setShowAllProjects] = useState(false);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const { data: session } = useSession();

  const menuRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      let inside = false;
      for (const el of menuRefs.current.values()) {
        if (el && el.contains(e.target as Node)) {
          inside = true;
          break;
        }
      }
      if (!inside) {
        setOpenMenuId(null);
        setSubMenuForMove(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const IconButton = ({
    title,
    onClick,
    children,
  }: {
    title: string;
    onClick?: () => void;
    children: React.ReactNode;
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className="grid size-8 place-items-center rounded-md border 
          border-[color-mix(in_oklch,var(--text-primary),transparent_80%)] 
          hover:border-[color-mix(in_oklch,var(--text-primary),transparent_60%)] 
          hover:bg-[color-mix(in_oklch,var(--text-primary),transparent_95%)] 
          transition-colors"
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="text-xs">
        {title}
      </TooltipContent>
    </Tooltip>
  );


  /* ----------------------------- Handlers ----------------------------- */
  const handleNewChat = async () => {
    const id = await newThread(undefined);
    setCurrentThread(id);
  };

  const handleInlineChatRename = (id: string, value: string) => {
    const v = value.trim();
    if (!v) return setEditingChatId(null);
    useAppStore.setState((s) => ({
      threads: s.threads.map((t) =>
        t.id === id ? { ...t, title: v, updatedAt: Date.now() } : t
      ),
    }));
    setEditingChatId(null);
  };

  const handleInlineProjectRename = (id: string, value: string) => {
    const v = value.trim();
    if (!v) return setEditingProjectId(null);
    renameProject(id, v);
    setEditingProjectId(null);
  };

  const handleDeleteChat = (id: string) => {
    if (!confirm("Delete this chat permanently?")) return;
    useAppStore.setState((s) => ({
      threads: s.threads.filter((t) => t.id !== id),
    }));
    toast.success("Chat deleted");
  };

  const handleShareChat = () => toast("Share link (coming soon)");
  const handleArchiveChat = () => toast("Archived (coming soon)");

  /* ----------------------------- Derived ----------------------------- */
  const sortedThreads = useMemo(
    () => [...threads].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)),
    [threads]
  );
  const unassigned = sortedThreads.filter((t) => !t.projectId);
  const byProject: Record<string, typeof sortedThreads> = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const t of sortedThreads) {
      if (!t.projectId) continue;
      (map[t.projectId] ||= []).push(t);
    }
    return map as Record<string, typeof sortedThreads>;
  }, [sortedThreads]);

  const visibleProjects = showAllProjects ? projects : projects.slice(0, PROJECTS_VISIBLE);
  const hasMoreProjects = projects.length > PROJECTS_VISIBLE;

  const onDragEnd = async (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;
    const destId = destination.droppableId;
    const newProjectId =
      destId === "global" ? undefined : destId.startsWith("proj:") ? destId.slice(5) : undefined;
    
    try {
      await assignThreadToProject(draggableId, newProjectId);
      toast.success(
        newProjectId
          ? `Moved to ${projects.find((p) => p.id === newProjectId)?.name || "project"}`
          : "Moved to All Chats"
      );
    } catch (e) {
      console.error("Failed to move chat via drag and drop:", e);
      toast.error("Failed to move chat");
    }
  };

  return (
    <aside
      className="h-dvh flex flex-col border-r transition-colors duration-300 ease-out"
      style={{ backgroundColor: bg, borderColor: "var(--border-weak)" }}
    >
      <TooltipProvider delayDuration={80}>
        <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
        <ProjectDialog
          open={projectDlgOpen}
          onClose={() => setProjectDlgOpen(false)}
          onCreate={(n) => createProject(n)}
        />

        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className={leftSidebarOpen ? "flex items-center gap-2 px-3 h-14" : "grid place-items-center h-14 px-0"}
        >
          <IconButton
            title={leftSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            onClick={toggleLeftSidebar}
          >
            <Menu className="h-4 w-4" />
          </IconButton>
        </motion.div>

        {/* Main content */}
        {leftSidebarOpen ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="px-2 py-2 space-y-1">
              <Item onClick={handleNewChat}>
                <Plus className="h-4 w-4" /> <span>New chat</span>
              </Item>
              <Item onClick={() => setSearchOpen(true)}>
                <Search className="h-4 w-4" /> <span>Search chats</span>
              </Item>
            </div>

            {/* Projects */}
            <div className="px-2 mt-2">
              <div className="px-2 py-1 flex items-center justify-between text-[12.5px] uppercase tracking-wide opacity-70">
                <button
                  onClick={() => setProjectsExpanded(!projectsExpanded)}
                  className="flex items-center gap-1 select-none hover:opacity-100"
                >
                  <ChevronDown
                    className={`h-3 w-3 transition-transform ${projectsExpanded ? "rotate-0" : "-rotate-90"}`}
                  />
                  <span>Projects</span>
                </button>
              </div>
              <AnimatePresence initial={false}>
                {projectsExpanded && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ type: "spring", stiffness: 210, damping: 24 }}
                    className="space-y-1"
                  >
                    <Item onClick={() => setProjectDlgOpen(true)}>
                      <FolderPlus className="h-4 w-4" /> <span>New Project</span>
                    </Item>
                    {visibleProjects.map((p) => (
                      <ProjectBlock
                        key={p.id}
                        project={p}
                        chats={byProject[p.id] || []}
                        {...{
                          currentThreadId,
                          openMenuId,
                          subMenuForMove,
                          editingChatId,
                          chatEditValue,
                          setOpenMenuId,
                          setSubMenuForMove,
                          setEditingChatId,
                          setChatEditValue,
                          handleInlineChatRename,
                          handleInlineProjectRename,
                          assignThreadToProject,
                          handleShareChat,
                          handleArchiveChat,
                          handleDeleteChat,
                          toast,
                          projects,
                          setProjectDlgOpen,
                          setProjectFilter,
                          currentProjectFilter,
                          setConfirmDeleteOpen,
                          setProjectToDelete,
                          menuRefs,
                        }}
                      />
                    ))}
                    {hasMoreProjects && (
                      <button
                        onClick={() => setShowAllProjects(!showAllProjects)}
                        className="flex items-center gap-1 px-2 py-2 rounded-md hover:bg-white/5 text-sm opacity-70"
                      >
                        <MoreHorizontal className="h-4 w-4" />{" "}
                        {showAllProjects ? "See less" : "See more"}
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* All Chats */}
            <div className="px-2 mt-3 mb-2 flex-1 overflow-y-auto relative">
              <div className="px-2 py-1 flex items-center justify-between text-[12.5px] uppercase tracking-wide opacity-70">
                <button
                  onClick={() => setChatsExpanded(!chatsExpanded)}
                  className="flex items-center gap-1 select-none hover:opacity-100"
                >
                  <ChevronDown
                    className={`h-3 w-3 transition-transform ${chatsExpanded ? "rotate-0" : "-rotate-90"}`}
                  />
                  <span>All Chats</span>
                </button>
              </div>
              <AnimatePresence initial={false}>
                {chatsExpanded && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ type: "spring", stiffness: 210, damping: 24 }}
                    className="space-y-1"
                  >
                    <Droppable droppableId="global" type="CHAT">
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="space-y-1 min-h-[30px]"
                          style={{
                            borderRadius: 8,
                            outline: snapshot.isDraggingOver ? "1px dashed var(--border-weak)" : undefined,
                            padding: snapshot.isDraggingOver ? "4px" : undefined,
                          }}
                        >
                          {unassigned.length === 0 && (
                            <div className="text-xs text-white/40 italic px-3 py-2">
                              Drag chats here
                            </div>
                          )}
                          {unassigned.map((t, i) => (
                            <ChatRow
                              key={t.id}
                              t={t}
                              i={i}
                              {...{
                                currentThreadId,
                                openMenuId,
                                subMenuForMove,
                                editingChatId,
                                chatEditValue,
                                setOpenMenuId,
                                setSubMenuForMove,
                                setEditingChatId,
                                setChatEditValue,
                                handleInlineChatRename,
                                assignThreadToProject,
                                handleShareChat,
                                handleArchiveChat,
                                handleDeleteChat,
                                toast,
                                projects,
                                setProjectDlgOpen,
                                menuRefs,
                                setCurrentThread,
                              }}
                            />
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </DragDropContext>
        ) : (
          // Collapsed: just the top quick actions. NO account control here.
          <div className="flex flex-col justify-between h-full">
            <div className="flex flex-col items-center gap-2 mt-4">
              <IconButton title="New chat" onClick={handleNewChat}>
                <Plus className="h-4 w-4" />
              </IconButton>
              <IconButton title="Search" onClick={() => setSearchOpen(true)}>
                <Search className="h-4 w-4" />
              </IconButton>
            </div>
          </div>
        )}

        {/* Confirm dialog */}
        <ConfirmDialog
          open={confirmDeleteOpen}
          title="Delete project?"
          message={
            <p>
              <strong>This will permanently delete all project files and chats.</strong> To save
              chats, move them first.
            </p>
          }
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={() => {
            if (projectToDelete) deleteProject(projectToDelete);
            setConfirmDeleteOpen(false);
            setProjectToDelete(null);
          }}
          onCancel={() => {
            setConfirmDeleteOpen(false);
            setProjectToDelete(null);
          }}
        />

        {/* --------------------- Single Bottom Account Menu --------------------- */}
        {leftSidebarOpen ? (
          // Expanded
          <div className="mt-auto border-t border-[var(--border-weak)] pt-1">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="w-full flex items-center justify-between gap-2 px-3 py-2 hover:bg-[color-mix(in_oklch,var(--text-primary),transparent_95%)] transition rounded-md">
                  <div className="flex items-center gap-2 truncate">
                    {session?.user?.image ? (
                      <img
                        src={session.user.image}
                        alt="profile"
                        className="w-7 h-7 rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[color-mix(in_oklch,var(--text-primary),transparent_90%)] grid place-items-center text-xs font-medium text-[var(--text-primary)]/80">
                        {session?.user?.name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                    )}
                    <div className="flex flex-col leading-tight text-left">
                      <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
                        {session?.user?.name ?? "Guest"}
                      </span>
                      <span className="text-[11.5px] opacity-70 truncate text-[var(--text-primary)]">
                        {session?.user?.email ?? ""}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-60 text-[var(--text-primary)]" />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={6}
                  className="z-[9999] w-56 rounded-lg border border-[var(--border-weak)] bg-[var(--surface-sidebar-open)] text-[var(--text-primary)] shadow-xl backdrop-blur-md p-1 text-sm"
                >
                  <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 hover:bg-[color-mix(in_oklch,var(--text-primary),transparent_92%)] rounded-md cursor-pointer">
                    <Settings className="h-4 w-4 opacity-80 text-[var(--text-primary)]" /> Settings
                  </DropdownMenu.Item>

                  <a
                    href="mailto:code.harshithb@gmail.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 hover:bg-[color-mix(in_oklch,var(--text-primary),transparent_92%)] rounded-md cursor-pointer"
                  >
                    ✉️ Contact Developer
                  </a>

                  <a
                    href="https://github.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 hover:bg-[color-mix(in_oklch,var(--text-primary),transparent_92%)] rounded-md cursor-pointer"
                  >
                    💻 View on GitHub
                  </a>

                  <DropdownMenu.Separator className="my-1 border-t border-[var(--border-weak)]" />

                  <DropdownMenu.Item
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-md cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        ) : (
          // Collapsed
          <div className="flex flex-col items-center mb-2 border-t border-[var(--border-weak)] pt-3">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  title="Account"
                  className="rounded-full bg-transparent hover:bg-[color-mix(in_oklch,var(--text-primary),transparent_90%)] p-1.5 transition"
                >
                  {session?.user?.image ? (
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="w-7 h-7 rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  ) : session?.user?.name ? (
                    <div className="w-7 h-7 rounded-full bg-[color-mix(in_oklch,var(--text-primary),transparent_90%)] grid place-items-center text-xs font-medium text-[var(--text-primary)]/80">
                      {session.user.name[0].toUpperCase()}
                    </div>
                  ) : (
                    <UserCircle className="h-6 w-6 opacity-80 text-[var(--text-primary)]" />
                  )}
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  side="top"
                  sideOffset={8}
                  className="z-[9999] w-56 rounded-lg border border-[var(--border-weak)] bg-[var(--surface-sidebar-open)] text-[var(--text-primary)] shadow-xl backdrop-blur-md p-1 text-sm"
                >
                  <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 hover:bg-[color-mix(in_oklch,var(--text-primary),transparent_92%)] rounded-md cursor-pointer">
                    <Settings className="h-4 w-4 opacity-80 text-[var(--text-primary)]" /> Settings
                  </DropdownMenu.Item>

                  <a
                    href="mailto:code.harshithb@gmail.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 hover:bg-[color-mix(in_oklch,var(--text-primary),transparent_92%)] rounded-md cursor-pointer"
                  >
                    ✉️ Contact Developer
                  </a>

                  <a
                    href="https://github.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 hover:bg-[color-mix(in_oklch,var(--text-primary),transparent_92%)] rounded-md cursor-pointer"
                  >
                    💻 View on GitHub
                  </a>

                  <DropdownMenu.Separator className="my-1 border-t border-[var(--border-weak)]" />

                  <DropdownMenu.Item
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-md cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        )}
      </TooltipProvider>
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/*                               ProjectBlock                                 */
/* -------------------------------------------------------------------------- */
function ProjectBlock({
  project,
  chats,
  currentThreadId,
  openMenuId,
  subMenuForMove,
  editingChatId,
  chatEditValue,
  setOpenMenuId,
  setSubMenuForMove,
  setEditingChatId,
  setChatEditValue,
  handleInlineChatRename,
  handleInlineProjectRename,
  assignThreadToProject,
  handleShareChat,
  handleArchiveChat,
  handleDeleteChat,
  toast,
  projects,
  setProjectDlgOpen,
  setProjectFilter,
  currentProjectFilter,
  setConfirmDeleteOpen,
  setProjectToDelete,
  menuRefs,
}: any) {
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectEditValue, setProjectEditValue] = useState(project.name);
  const menuOpen = openMenuId === project.id;
  const isEditing = editingProjectId === project.id;

  return (
    <motion.div layout className="group relative">
      <div
        className={`flex items-center justify-between rounded-md px-2.5 py-2 text-sm transition-colors ${currentProjectFilter === project.id ? "bg-white/10" : "hover:bg-white/5"
          }`}
      >
        {isEditing ? (
          <input
            value={projectEditValue}
            autoFocus
            onChange={(e) => setProjectEditValue(e.target.value)}
            onBlur={() => {
              if (projectEditValue.trim())
                handleInlineProjectRename(project.id, projectEditValue.trim());
              setEditingProjectId(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter")
                handleInlineProjectRename(project.id, projectEditValue.trim());
              else if (e.key === "Escape") setEditingProjectId(null);
            }}
            className="flex-1 rounded-md px-1 py-0.5 text-sm outline-none bg-blue-500/20 focus:bg-blue-500/30"
          />
        ) : (
          <button
            onClick={() => {
              setProjectFilter(project.id);
              setOpenMenuId(null);
            }}
            className="flex items-center gap-2 flex-1 text-left truncate"
          >
            <Folder className="h-4 w-4 shrink-0" />
            <span className="truncate">{project.name}</span>
          </button>
        )}
        <MoreHorizontal
          className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity ml-2 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setOpenMenuId(menuOpen ? null : project.id);
            setSubMenuForMove(null);
          }}
        />
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={(el) => {
              if (el) menuRefs.current.set(project.id, el);
              else menuRefs.current.delete(project.id);
            }}
            initial={{ opacity: 0, scale: 0.98, y: -2 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="absolute right-2 top-10 z-30 min-w-[180px] rounded-lg border shadow-lg backdrop-blur-md overflow-visible"
            style={{
              borderColor: "var(--border-weak)",
              backgroundColor: "var(--surface-chat)",
            }}
          >
            <button
              onClick={() => {
                setEditingProjectId(project.id);
                setProjectEditValue(project.name);
                setOpenMenuId(null);
              }}
              className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 w-full text-left text-sm"
            >
              <Pencil className="h-4 w-4" /> Rename project
            </button>
            <div className="border-t my-1" style={{ borderColor: "var(--border-weak)" }} />
            <button
              onClick={() => {
                setProjectToDelete(project.id);
                setConfirmDeleteOpen(true);
                setOpenMenuId(null);
              }}
              className="flex items-center gap-2 px-3 py-2 hover:bg-red-500/10 w-full text-left text-sm text-red-400"
            >
              <Trash2 className="h-4 w-4" /> Delete project
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Droppable droppableId={`proj:${project.id}`} type="CHAT">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="ml-6 mt-1 space-y-1"
            style={{
              borderRadius: 8,
              outline: snapshot.isDraggingOver ? "1px dashed var(--border-weak)" : undefined,
              padding: snapshot.isDraggingOver ? "4px" : undefined,
            }}
          >
            {chats.map((t: any, i: number) => (
              <ChatRow
                key={t.id}
                t={t}
                i={i}
                {...{
                  currentThreadId,
                  openMenuId,
                  subMenuForMove,
                  editingChatId,
                  chatEditValue,
                  setOpenMenuId,
                  setSubMenuForMove,
                  setEditingChatId,
                  setChatEditValue,
                  handleInlineChatRename,
                  assignThreadToProject,
                  handleShareChat,
                  handleArchiveChat,
                  handleDeleteChat,
                  toast,
                  projects,
                  setProjectDlgOpen,
                  menuRefs,
                }}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  ChatRow                                   */
/* -------------------------------------------------------------------------- */
function ChatRow({
  t,
  i,
  currentThreadId,
  openMenuId,
  subMenuForMove,
  editingChatId,
  chatEditValue,
  setOpenMenuId,
  setSubMenuForMove,
  setEditingChatId,
  setChatEditValue,
  handleInlineChatRename,
  assignThreadToProject,
  handleShareChat,
  handleArchiveChat,
  handleDeleteChat,
  toast,
  projects,
  setProjectDlgOpen,
  menuRefs,
  setCurrentThread,
}: any) {
  const [flyoutPos, setFlyoutPos] = useState<{ top: number; left: number } | null>(null);
  const active = currentThreadId === t.id;
  const chatMenuOpen = openMenuId === t.id;
  const isEditing = editingChatId === t.id;

  return (
    <Draggable draggableId={t.id} index={i}>
      {(drag) => (
        <div ref={drag.innerRef} {...drag.draggableProps} {...drag.dragHandleProps} className="group relative">
          <div
            className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${active ? "bg-white/10" : "hover:bg-white/5"
              }`}
          >
            {isEditing ? (
              <input
                value={chatEditValue}
                autoFocus
                onChange={(e) => setChatEditValue(e.target.value)}
                onBlur={() =>
                  chatEditValue.trim()
                    ? handleInlineChatRename(t.id, chatEditValue.trim())
                    : setEditingChatId(null)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleInlineChatRename(t.id, chatEditValue.trim());
                  else if (e.key === "Escape") setEditingChatId(null);
                }}
                className="flex-1 rounded-md px-1 py-0.5 text-sm outline-none bg-blue-500/20 focus:bg-blue-500/30"
              />
            ) : (
              <div
                className="flex-1 text-left truncate cursor-pointer"
                onClick={() => {
                  if (setCurrentThread) setCurrentThread(t.id);
                  setOpenMenuId(null);
                }}
              >
                {t.title || "New chat"}
              </div>
            )}

            <MoreHorizontal
              className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity ml-2 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(chatMenuOpen ? null : t.id);
                setSubMenuForMove(null);
              }}
            />
          </div>

          <AnimatePresence>
            {chatMenuOpen && (
              <motion.div
                ref={(el) => {
                  if (el) menuRefs.current.set(t.id, el);
                  else menuRefs.current.delete(t.id);
                }}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="absolute right-2 top-10 z-50 min-w-[220px] rounded-lg border shadow-lg backdrop-blur-md"
                style={{
                  borderColor: "var(--border-weak)",
                  backgroundColor: "var(--surface-chat)",
                }}
              >
                <button
                  onClick={() => {
                    setOpenMenuId(null);
                    handleShareChat();
                  }}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 text-sm w-full text-left"
                >
                  <Share2 className="h-4 w-4" /> Share
                </button>

                <button
                  onClick={() => {
                    setEditingChatId(t.id);
                    setChatEditValue(t.title || "");
                    setOpenMenuId(null);
                  }}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 text-sm w-full text-left"
                >
                  <Pencil className="h-4 w-4" /> Rename
                </button>

                {/* Move to project (Portal-based) */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      setFlyoutPos({ top: rect.top, left: rect.right + 8 });
                      setSubMenuForMove(subMenuForMove === t.id ? null : t.id);
                    }}
                    className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-white/10 text-sm w-full"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Move className="h-4 w-4" /> Move to project
                    </span>
                    <ChevronDown
                      className={`h-3 w-3 transition ${subMenuForMove === t.id ? "rotate-90" : ""}`}
                    />
                  </button>

                  {/* Remove from project */}
                  {t.projectId && (
                    <button
                      onClick={async () => {
                        try {
                          await assignThreadToProject(t.id, undefined);
                          setOpenMenuId(null);
                          toast.success("Removed from project");
                        } catch (e) {
                          console.error("Failed to remove from project:", e);
                          toast.error("Failed to remove from project");
                        }
                      }}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 text-sm w-full text-left"
                    >
                      ↩ Remove from project
                    </button>
                  )}

                  <AnimatePresence>
                    {subMenuForMove === t.id && flyoutPos && (
                      <PortalFlyout>
                        <motion.div
                          key="flyout"
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="fixed z-[9999] w-56 rounded-md border shadow-lg overflow-y-auto max-h-64 bg-[var(--surface-chat)]"
                          style={{
                            borderColor: "var(--border-weak)",
                            top: flyoutPos.top,
                            left: flyoutPos.left,
                          }}
                        >
                          <button
                            onClick={() => {
                              setProjectDlgOpen(true);
                              setSubMenuForMove(null);
                            }}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 text-sm w-full text-left"
                          >
                            <FolderPlus className="h-4 w-4" /> New project
                          </button>
                          <div className="border-t my-1" style={{ borderColor: "var(--border-weak)" }} />
                          {projects.map((p2: any) => (
                            <button
                              key={p2.id}
                              onClick={async () => {
                                try {
                                  await assignThreadToProject(t.id, p2.id);
                                  setOpenMenuId(null);
                                  setSubMenuForMove(null);
                                  toast.success(`Moved to ${p2.name}`);
                                } catch (e) {
                                  console.error("Failed to move to project:", e);
                                  toast.error("Failed to move chat");
                                }
                              }}
                              className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 text-sm w-full text-left"
                            >
                              <Folder className="h-4 w-4" />
                              {p2.name}
                            </button>
                          ))}
                        </motion.div>
                      </PortalFlyout>
                    )}
                  </AnimatePresence>
                </div>

                <div className="border-t my-1" style={{ borderColor: "var(--border-weak)" }} />

                <button
                  onClick={() => {
                    handleArchiveChat();
                    setOpenMenuId(null);
                  }}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 text-sm w-full text-left"
                >
                  <Archive className="h-4 w-4" /> Archive
                </button>

                <button
                  onClick={() => {
                    handleDeleteChat(t.id);
                    setOpenMenuId(null);
                  }}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-red-500/20 text-red-400 text-sm w-full text-left"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </Draggable>
  );
}
function newThread(undefined: undefined) {
  throw new Error("Function not implemented.");
}


"use client";

import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LogOut, Settings } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { useAppStore } from "@/lib/store";
import ConfirmDialog from "../ConfirmDialog";
import ProjectDialog from "../ProjectDialog";
import SearchPanel from "../SearchPanel";
import ChatList from "./ChatList";
import ProjectList from "./ProjectList";
import SidebarHeader from "./SidebarHeader";

import type { Chat, Project } from "./SidebarTypes";

export default function Sidebar() {
   const {
      leftSidebarOpen,
      toggleLeftSidebar,
      threads = [],
      currentThreadId,
      setCurrentThread,
      newThread,
      projects = [],
      createProject,
      renameProject,
      deleteProject,
      setProjectFilter,
      currentProjectFilter,
      assignThreadToProject,
   } = useAppStore();

   const [searchOpen, setSearchOpen] = useState(false);
   const [projectDlgOpen, setProjectDlgOpen] = useState(false);
   const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
   const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

   const [openMenuId, setOpenMenuId] = useState<string | null>(null);
   const [subMenuForMove, setSubMenuForMove] = useState<string | null>(null);
   const [editingChatId, setEditingChatId] = useState<string | null>(null);
   const [chatEditValue, setChatEditValue] = useState("");

   const { data: session } = useSession();
   const menuRefs = useRef<Map<string, HTMLDivElement>>(new Map());

   useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
         for (const el of menuRefs.current.values()) {
            if (el && el.contains(e.target as Node)) return;
         }
         setOpenMenuId(null);
         setSubMenuForMove(null);
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
   }, []);

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

   const handleDeleteChat = (id: string) => {
      useAppStore.setState((s) => ({
         threads: s.threads.filter((t) => t.id !== id),
      }));
      toast.success("Chat deleted successfully");
   };

   const sortedThreads = useMemo<Chat[]>(
      () => [...threads].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)),
      [threads]
   );

   const unassigned = sortedThreads.filter((t) => !t.projectId);

   const byProject: Record<string, Chat[]> = useMemo(() => {
      const map: Record<string, Chat[]> = {};
      for (const t of sortedThreads) {
         if (!t.projectId) continue;
         (map[t.projectId] ||= []).push(t);
      }
      return map;
   }, [sortedThreads]);

   const onDragEnd = (result: DropResult) => {
      const { destination, draggableId } = result;
      if (!destination) return;

      const destId = destination.droppableId;
      const newProjectId =
         destId === "global"
            ? undefined
            : destId.startsWith("proj:")
               ? destId.slice(5)
               : undefined;

      assignThreadToProject(draggableId, newProjectId);
      toast.success(
         newProjectId
            ? `Moved to ${projects.find((p: Project) => p.id === newProjectId)?.name || "project"
            }`
            : "Moved to All Chats"
      );
   };

   const handleNewChat = async () => {
      toast.loading("Creating chat...");
      const id = await newThread(undefined);
      setCurrentThread(id);
      toast.dismiss();
      toast.success("New chat ready!");
   };



   const bg = leftSidebarOpen
      ? "var(--surface-sidebar-open)"
      : "var(--surface-sidebar-closed)";

   return (
      <aside
         className="h-dvh flex flex-col border-r transition-colors duration-300 ease-out"
         style={{ backgroundColor: bg, borderColor: "var(--border-weak)" }}
      >
         <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
         <ProjectDialog
            open={projectDlgOpen}
            onClose={() => setProjectDlgOpen(false)}
            onCreate={(n: string) => createProject(n)}
         />

         <SidebarHeader
            leftSidebarOpen={leftSidebarOpen}
            toggleLeftSidebar={toggleLeftSidebar}
            handleNewChat={handleNewChat}
            setSearchOpen={setSearchOpen}
         />

         <DragDropContext onDragEnd={onDragEnd}>
            {leftSidebarOpen ? (
               <>
                  <ProjectList
                     projects={projects}
                     byProject={byProject}
                     openMenuId={openMenuId}
                     setOpenMenuId={setOpenMenuId}
                     subMenuForMove={subMenuForMove}
                     setSubMenuForMove={setSubMenuForMove}
                     renameProject={renameProject}
                     deleteProject={deleteProject}
                     setProjectFilter={setProjectFilter}
                     currentProjectFilter={currentProjectFilter}
                     setProjectDlgOpen={setProjectDlgOpen}
                     setConfirmDeleteOpen={setConfirmDeleteOpen}
                     setProjectToDelete={setProjectToDelete}
                     menuRefs={menuRefs}
                     currentThreadId={currentThreadId ?? null}
                     editingChatId={editingChatId}
                     chatEditValue={chatEditValue}
                     setEditingChatId={setEditingChatId}
                     setChatEditValue={setChatEditValue}
                     handleInlineChatRename={handleInlineChatRename}
                     assignThreadToProject={assignThreadToProject}
                     toast={toast}
                     setCurrentThread={setCurrentThread}
                     handleDeleteChat={handleDeleteChat}
                  />

                  <ChatList
                     unassigned={unassigned}
                     currentThreadId={currentThreadId ?? null}
                     setCurrentThread={setCurrentThread}
                     openMenuId={openMenuId}
                     setOpenMenuId={setOpenMenuId}
                     subMenuForMove={subMenuForMove}
                     setSubMenuForMove={setSubMenuForMove}
                     editingChatId={editingChatId}
                     setEditingChatId={setEditingChatId}
                     chatEditValue={chatEditValue}
                     setChatEditValue={setChatEditValue}
                     handleInlineChatRename={handleInlineChatRename}
                     assignThreadToProject={assignThreadToProject}
                     toast={toast}
                     projects={projects}
                     setProjectDlgOpen={setProjectDlgOpen}
                     menuRefs={menuRefs}
                     handleDeleteChat={handleDeleteChat}
                  />
               </>
            ) : (
               <div className="flex flex-col items-center mt-4 gap-3">
                  <button
                     title="New chat"
                     onClick={handleNewChat}
                     className="grid size-8 place-items-center rounded-md border border-[color-mix(in_oklch,var(--text-primary),transparent_80%)] hover:bg-[color-mix(in_oklch,var(--text-primary),transparent_95%)] transition-colors"
                  >
                     <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                     >
                        <path d="M12 5v14m7-7H5" />
                     </svg>
                  </button>

                  <button
                     title="Search chats"
                     onClick={() => setSearchOpen(true)}
                     className="grid size-8 place-items-center rounded-md border border-[color-mix(in_oklch,var(--text-primary),transparent_80%)] hover:bg-[color-mix(in_oklch,var(--text-primary),transparent_95%)] transition-colors"
                  >
                     <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                     >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                     </svg>
                  </button>
               </div>
            )}
         </DragDropContext>

         {/* confirm delete dialog */}
         <ConfirmDialog
            open={confirmDeleteOpen}
            title="Delete project?"
            message={
               <p>
                  <strong>This will permanently delete all project files and chats.</strong>{" "}
                  Move chats first to save them.
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

         {/* account bar */}
         <div className="mt-auto border-t border-[var(--border-weak)] pt-2 px-2 pb-3">
            {leftSidebarOpen ? (
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
                     </button>
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Portal>
                     <DropdownMenu.Content
                        align="end"
                        sideOffset={6}
                        className="z-[9999] w-56 rounded-lg border border-[var(--border-weak)] bg-[var(--surface-sidebar-open)] text-[var(--text-primary)] shadow-xl backdrop-blur-md p-1 text-sm"
                     >
                        {/* menu items unchanged */}
                        <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 hover:bg-[color-mix(in_oklch,var(--text-primary),transparent_92%)] rounded-md cursor-pointer">
                           <Settings className="h-4 w-4 opacity-80" /> Settings
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
            ) : (
               <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                     <button
                        title={session?.user?.name ?? "Account"}
                        className="grid size-9 place-items-center rounded-full hover:bg-[color-mix(in_oklch,var(--text-primary),transparent_95%)] transition relative -mb-1"
                     >
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
                     </button>
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Portal>
                     <DropdownMenu.Content
                        align="end"
                        sideOffset={6}
                        className="z-[9999] w-56 rounded-lg border border-[var(--border-weak)] bg-[var(--surface-sidebar-open)] text-[var(--text-primary)] shadow-xl backdrop-blur-md p-1 text-sm"
                     >
                        {/* same menu items */}
                        <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 hover:bg-[color-mix(in_oklch,var(--text-primary),transparent_92%)] rounded-md cursor-pointer">
                           <Settings className="h-4 w-4 opacity-80" /> Settings
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
            )}
         </div>

      </aside>
   );
}

"use client";

import { Droppable } from "@hello-pangea/dnd";
import { AnimatePresence, motion } from "framer-motion";
import { Folder, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import ChatRow from "./ChatRow";
import { ProjectBlockProps } from "./SidebarTypes";


// type ProjectBlockProps = {
//    project: any;
//    chats: any[];
//    openMenuId: string | null;
//    setOpenMenuId: (id: string | null) => void;
//    subMenuForMove: string | null;
//    setSubMenuForMove: (id: string | null) => void;
//    renameProject: (id: string, name: string) => void;
//    deleteProject: (id: string) => void;
//    setProjectFilter: (id: string | null | undefined) => void;
//    currentProjectFilter: string | null | undefined;
//    setConfirmDeleteOpen: (b: boolean) => void;
//    setProjectToDelete: (id: string | null) => void;
//    menuRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
//    currentThreadId: string | null | undefined;
//    editingChatId: string | null;
//    chatEditValue: string;
//    setEditingChatId: (id: string | null) => void;
//    setChatEditValue: (v: string) => void;
//    handleInlineChatRename: (id: string, value: string) => void;
//    assignThreadToProject: (tid: string, pid?: string) => void;
//    toast: any;
//    projects: any[];
//    setProjectDlgOpen: (b: boolean) => void;
//    setCurrentThread: (id: string) => void;
//    handleDeleteChat: (id: string) => void;
// };

export default function ProjectBlock({
   project,
   chats,
   openMenuId,
   setOpenMenuId,
   subMenuForMove,
   setSubMenuForMove,
   renameProject,
   deleteProject,
   setProjectFilter,
   currentProjectFilter,
   setConfirmDeleteOpen,
   setProjectToDelete,
   menuRefs,
   currentThreadId,
   editingChatId,
   chatEditValue,
   setEditingChatId,
   setChatEditValue,
   handleInlineChatRename,
   assignThreadToProject,
   toast,
   projects,
   setProjectDlgOpen,
   setCurrentThread,
   handleDeleteChat,
}: ProjectBlockProps) {
   const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
   const [projectEditValue, setProjectEditValue] = useState(project.name);
   const menuOpen = openMenuId === project.id;
   const isEditing = editingProjectId === project.id;

   return (
      <motion.div layout className="group relative">
         {/* ─── Project Header ─────────────────────────────── */}
         <div
            className={`flex items-center justify-between rounded-md px-2.5 py-2 text-sm transition-colors ${currentProjectFilter === project.id
               ? "bg-white/10"
               : "hover:bg-white/5"
               }`}
         >
            {isEditing ? (
               <input
                  value={projectEditValue}
                  autoFocus
                  onChange={(e) => setProjectEditValue(e.target.value)}
                  onBlur={() => {
                     if (projectEditValue.trim())
                        renameProject(project.id, projectEditValue.trim());
                     setEditingProjectId(null);
                  }}
                  onKeyDown={(e) => {
                     if (e.key === "Enter") {
                        if (projectEditValue.trim())
                           renameProject(project.id, projectEditValue.trim());
                        setEditingProjectId(null);
                     } else if (e.key === "Escape") setEditingProjectId(null);
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

         {/* ─── Project Menu ─────────────────────────────── */}
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

                  <div
                     className="border-t my-1"
                     style={{ borderColor: "var(--border-weak)" }}
                  />

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

         {/* ─── Chats Inside Project with Connectors ───────── */}
         <Droppable droppableId={`proj:${project.id}`} type="CHAT">
            {(provided, snapshot) => (
               <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="relative ml-2 mt-1 space-y-1"
                  style={{
                     borderRadius: 8,
                     outline: snapshot.isDraggingOver
                        ? "1px dashed var(--border-weak)"
                        : undefined,
                     padding: snapshot.isDraggingOver ? "4px" : undefined,
                  }}
               >
                  {chats.map((t: any, i: number) => (
                     <div className="relative pl-5" key={t.id}>
                        <ConnectorSvg isLast={i === chats.length - 1} />
                        <ChatRow
                           t={t}
                           i={i}
                           currentThreadId={currentThreadId}
                           openMenuId={openMenuId}
                           subMenuForMove={subMenuForMove}
                           editingChatId={editingChatId}
                           chatEditValue={chatEditValue}
                           setOpenMenuId={setOpenMenuId}
                           setSubMenuForMove={setSubMenuForMove}
                           setEditingChatId={setEditingChatId}
                           setChatEditValue={setChatEditValue}
                           handleInlineChatRename={handleInlineChatRename}
                           assignThreadToProject={assignThreadToProject}
                           handleDeleteChat={handleDeleteChat}
                           toast={toast}
                           projects={projects}
                           setProjectDlgOpen={setProjectDlgOpen}
                           menuRefs={menuRefs}
                           setCurrentThread={setCurrentThread}
                        />
                     </div>
                  ))}
                  {provided.placeholder}
               </div>
            )}
         </Droppable>
      </motion.div>
   );
}

/** Reddit-style curved connector */
function ConnectorSvg({ isLast }: { isLast: boolean }) {
   return (
      <svg
         className="absolute left-0 top-0"
         width="20"
         height="100%"
         viewBox="0 0 20 100"
         preserveAspectRatio="none"
         aria-hidden="true"
         style={{ pointerEvents: "none" }}
      >
         {!isLast && (
            <path
               d="M10 0 L10 100"
               stroke="currentColor"
               strokeOpacity="0.25"
               strokeWidth="2"
               fill="none"
            />
         )}
         <path
            d="M10 16 C10 16, 10 16, 12 16 S16 18, 16 20"
            stroke="currentColor"
            strokeOpacity="0.35"
            strokeWidth="2"
            fill="none"
         />
      </svg>
   );
}

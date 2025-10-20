"use client";

import { Draggable } from "@hello-pangea/dnd";
import { AnimatePresence, motion } from "framer-motion";
import {
   Archive,
   ChevronDown,
   Folder,
   FolderPlus,
   MoreHorizontal,
   Move,
   Pencil,
   Share2,
   Trash2,
} from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { ChatRowProps } from "./SidebarTypes";

function PortalFlyout({ children }: { children: React.ReactNode }) {
   if (typeof window === "undefined") return null;
   return createPortal(children, document.body);
}

// type ChatRowProps = {
//    t: any;
//    i: number;
//    currentThreadId: string | null | undefined;
//    openMenuId: string | null;
//    subMenuForMove: string | null;
//    editingChatId: string | null;
//    chatEditValue: string;
//    setOpenMenuId: (id: string | null) => void;
//    setSubMenuForMove: (id: string | null) => void;
//    setEditingChatId: (id: string | null) => void;
//    setChatEditValue: (v: string) => void;
//    handleInlineChatRename: (id: string, value: string) => void;
//    assignThreadToProject: (tid: string, pid?: string) => void;
//    handleDeleteChat: (id: string) => void; // ✅ added
//    toast: any;
//    projects: any[];
//    setProjectDlgOpen: (b: boolean) => void;
//    menuRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
//    setCurrentThread: (id: string) => void;
//    isInProject?: boolean;
//    isLastInProject?: boolean;
// };

export default function ChatRow({
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
   handleDeleteChat, // ✅ added
   toast,
   projects,
   setProjectDlgOpen,
   menuRefs,
   setCurrentThread,
}: ChatRowProps) {
   const [flyoutPos, setFlyoutPos] = useState<{ top: number; left: number } | null>(null);
   const active = currentThreadId === t.id;
   const chatMenuOpen = openMenuId === t.id;
   const isEditing = editingChatId === t.id;

   return (
      <Draggable draggableId={t.id} index={i}>
         {(drag) => (
            <div
               ref={drag.innerRef}
               {...drag.draggableProps}
               {...drag.dragHandleProps}
               className="group relative"
            >
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
                           if (e.key === "Enter")
                              handleInlineChatRename(t.id, chatEditValue.trim());
                           else if (e.key === "Escape") setEditingChatId(null);
                        }}
                        className="flex-1 rounded-md px-1 py-0.5 text-sm outline-none bg-blue-500/20 focus:bg-blue-500/30"
                     />
                  ) : (
                     <div
                        className="flex-1 text-left truncate cursor-pointer"
                        onClick={() => {
                           setCurrentThread(t.id);
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
                        className="absolute right-2 top-10 z-50 min-w-[220px] rounded-lg border shadow-lg backdrop-blur-md overflow-hidden"
                        style={{
                           borderColor: "var(--border-weak)",
                           backgroundColor: "var(--surface-chat)",
                        }}
                     >
                        <button
                           onClick={() => {
                              toast("Share link (coming soon)");
                              setOpenMenuId(null);
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
                                 className={`h-3 w-3 transition ${subMenuForMove === t.id ? "rotate-90" : ""
                                    }`}
                              />
                           </button>

                           {t.projectId && (
                              <button
                                 onClick={() => {
                                    assignThreadToProject(t.id, undefined);
                                    setOpenMenuId(null);
                                    toast.success("Removed from project");
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

                                       <div
                                          className="border-t my-1"
                                          style={{ borderColor: "var(--border-weak)" }}
                                       />

                                       {projects.map((p: any) => (
                                          <button
                                             key={p.id}
                                             onClick={() => {
                                                assignThreadToProject(t.id, p.id);
                                                setOpenMenuId(null);
                                                setSubMenuForMove(null);
                                                toast.success(`Moved to ${p.name}`);
                                             }}
                                             className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 text-sm w-full text-left"
                                          >
                                             <Folder className="h-4 w-4" /> {p.name}
                                          </button>
                                       ))}
                                    </motion.div>
                                 </PortalFlyout>
                              )}
                           </AnimatePresence>
                        </div>

                        <div
                           className="border-t my-1"
                           style={{ borderColor: "var(--border-weak)" }}
                        />

                        <button
                           onClick={() => {
                              toast("Archived (coming soon)");
                              setOpenMenuId(null);
                           }}
                           className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 text-sm w-full text-left"
                        >
                           <Archive className="h-4 w-4" /> Archive
                        </button>

                        {/* ✅ Delete Chat - now functional */}
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

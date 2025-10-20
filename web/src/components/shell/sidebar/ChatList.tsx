"use client";

import { Droppable } from "@hello-pangea/dnd";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import ChatRow from "./ChatRow";

type ChatListProps = {
   unassigned: any[];
   currentThreadId: string | null;
   setCurrentThread: (id: string) => void;
   openMenuId: string | null;
   setOpenMenuId: (id: string | null) => void;
   subMenuForMove: string | null;
   setSubMenuForMove: (id: string | null) => void;
   editingChatId: string | null;
   setEditingChatId: (id: string | null) => void;
   chatEditValue: string;
   setChatEditValue: (v: string) => void;
   handleInlineChatRename: (id: string, value: string) => void;
   assignThreadToProject: (tid: string, pid?: string) => void;
   handleDeleteChat: (id: string) => void; // ✅ added here
   toast: any;
   projects: any[];
   setProjectDlgOpen: (b: boolean) => void;
   menuRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
};

export default function ChatList({
   unassigned,
   currentThreadId,
   setCurrentThread,
   openMenuId,
   setOpenMenuId,
   subMenuForMove,
   setSubMenuForMove,
   editingChatId,
   setEditingChatId,
   chatEditValue,
   setChatEditValue,
   handleInlineChatRename,
   assignThreadToProject,
   handleDeleteChat,
   toast,
   projects,
   setProjectDlgOpen,
   menuRefs,
}: ChatListProps) {
   const [chatsExpanded, setChatsExpanded] = useState(true);

   return (
      <div className="px-2 mt-3 mb-2 flex-1 overflow-y-auto relative">
         <div className="px-2 py-1 flex items-center justify-between text-[12.5px] uppercase tracking-wide opacity-70">
            <button
               onClick={() => setChatsExpanded(!chatsExpanded)}
               className="flex items-center gap-1 select-none hover:opacity-100"
            >
               <ChevronDown
                  className={`h-3 w-3 transition-transform ${chatsExpanded ? "rotate-0" : "-rotate-90"
                     }`}
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
                              outline: snapshot.isDraggingOver
                                 ? "1px dashed var(--border-weak)"
                                 : undefined,
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
                                 currentThreadId={currentThreadId}
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
                                 handleDeleteChat={handleDeleteChat} // ✅ passed down
                                 toast={toast}
                                 projects={projects}
                                 setProjectDlgOpen={setProjectDlgOpen}
                                 menuRefs={menuRefs}
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
   );
}

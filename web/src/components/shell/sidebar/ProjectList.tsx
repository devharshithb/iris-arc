"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, FolderPlus, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import ProjectBlock from "./ProjectBlock";
import { ProjectListProps } from "./SidebarTypes";

// type ProjectListProps = {
//    projects?: any[];
//    byProject: Record<string, any[]>;
//    openMenuId: string | null;
//    setOpenMenuId: (id: string | null) => void;
//    subMenuForMove: string | null;
//    setSubMenuForMove: (id: string | null) => void;
//    renameProject: (id: string, name: string) => void;
//    deleteProject: (id: string) => void;
//    setProjectFilter: (id: string | null | undefined) => void;
//    currentProjectFilter: string | null | undefined;
//    setProjectDlgOpen: (b: boolean) => void;
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
//    setCurrentThread: (id: string) => void;
//    handleDeleteChat: (id: string) => void;
// };

export default function ProjectList({
   projects = [],
   byProject,
   openMenuId,
   setOpenMenuId,
   subMenuForMove,
   setSubMenuForMove,
   renameProject,
   deleteProject,
   setProjectFilter,
   currentProjectFilter,
   setProjectDlgOpen,
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
   setCurrentThread,
   handleDeleteChat,
}: ProjectListProps) {
   const [projectsExpanded, setProjectsExpanded] = useState(true);
   const [showAllProjects, setShowAllProjects] = useState(false);
   const PROJECTS_VISIBLE = 5;

   const safeProjects = Array.isArray(projects) ? projects : [];
   const visibleProjects = showAllProjects
      ? safeProjects
      : safeProjects.slice(0, PROJECTS_VISIBLE);
   const hasMoreProjects = safeProjects.length > PROJECTS_VISIBLE;

   return (
      <div className="px-2 mt-2">
         {/* Header */}
         <div className="px-2 py-1 flex items-center justify-between text-[12.5px] uppercase tracking-wide opacity-70">
            <button
               onClick={() => setProjectsExpanded(!projectsExpanded)}
               className="flex items-center gap-1 select-none hover:opacity-100"
            >
               <ChevronDown
                  className={`h-3 w-3 transition-transform ${projectsExpanded ? "rotate-0" : "-rotate-90"
                     }`}
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
                  {/* New Project */}
                  <button
                     onClick={() => setProjectDlgOpen(true)}
                     className="flex items-center gap-2 px-2.5 py-2 rounded-md hover:bg-white/5 text-sm w-full text-left"
                  >
                     <FolderPlus className="h-4 w-4" /> New Project
                  </button>

                  {/* Individual Projects */}
                  {visibleProjects.map((p) => (
                     <ProjectBlock
                        key={p.id}
                        project={p}
                        chats={byProject[p.id] || []}
                        {...{
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
                           projects: safeProjects,
                           setProjectDlgOpen,
                           setCurrentThread,
                           handleDeleteChat,
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
   );
}

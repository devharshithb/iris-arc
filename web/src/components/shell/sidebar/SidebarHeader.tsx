"use client";

import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from "@/components/ui/tooltip";
import { easeOut, motion } from "framer-motion";
import { Menu, Plus, Search } from "lucide-react";

type SidebarHeaderProps = {
   leftSidebarOpen: boolean;
   toggleLeftSidebar: () => void;
   handleNewChat: () => void;
   setSearchOpen: (v: boolean) => void;
};

export default function SidebarHeader({
   leftSidebarOpen,
   toggleLeftSidebar,
   handleNewChat,
   setSearchOpen,
}: SidebarHeaderProps) {
   const containerVariants = {
      hidden: { opacity: 0, y: -6 },
      visible: {
         opacity: 1,
         y: 0,
         transition: {
            duration: 0.18,
            ease: easeOut,
            when: "beforeChildren",
            staggerChildren: 0.025,
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

   return (
      <TooltipProvider delayDuration={80}>
         <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className={`flex items-center ${leftSidebarOpen ? "justify-between px-3" : "justify-center"
               } h-14`}
         >
            {/* Sidebar Toggle */}
            <IconButton
               title={leftSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
               onClick={toggleLeftSidebar}
            >
               <Menu className="h-4 w-4" />
            </IconButton>

            {/* Only show icons when sidebar is open */}
            {leftSidebarOpen && (
               <div className="flex items-center gap-2">
                  <IconButton title="New chat" onClick={handleNewChat}>
                     <Plus className="h-4 w-4" />
                  </IconButton>
                  <IconButton title="Search chats" onClick={() => setSearchOpen(true)}>
                     <Search className="h-4 w-4" />
                  </IconButton>
               </div>
            )}
         </motion.div>
      </TooltipProvider>
   );
}

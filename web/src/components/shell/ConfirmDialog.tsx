"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

interface ConfirmDialogProps {
   open: boolean;
   title: string;
   message: React.ReactNode;
   confirmLabel?: string;
   cancelLabel?: string;
   onConfirm: () => void;
   onCancel: () => void;
   forceTheme?: "light" | "dark"; // optional override
}

export default function ConfirmDialog({
   open,
   title,
   message,
   confirmLabel = "Delete",
   cancelLabel = "Cancel",
   onConfirm,
   onCancel,
   forceTheme,
}: ConfirmDialogProps) {
   useEffect(() => {
      const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
      if (open) document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
   }, [open, onCancel]);

   const isDark =
      forceTheme === "dark" ||
      (typeof document !== "undefined" &&
         document.documentElement.classList.contains("dark"));

   const theme = isDark
      ? {
         bg: "bg-neutral-900",
         text: "text-neutral-100",
         msg: "text-neutral-300",
         cancel:
            "bg-transparent border-neutral-700 text-neutral-200 hover:bg-neutral-800",
      }
      : {
         bg: "bg-white",
         text: "text-neutral-800",
         msg: "text-neutral-700",
         cancel:
            "bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100",
      };

   return (
      <AnimatePresence>
         {open && (
            <motion.div
               className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
            >
               <motion.div
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.96, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`rounded-lg shadow-xl w-[380px] p-5 ${theme.bg} ${theme.text}`}
               >
                  <h2 className="text-base font-semibold mb-2">{title}</h2>
                  <div className={`text-sm mb-5 ${theme.msg}`}>{message}</div>
                  <div className="flex justify-end gap-2">
                     <button
                        onClick={onCancel}
                        className={`px-4 py-1.5 rounded-md border text-sm transition-colors ${theme.cancel}`}
                     >
                        {cancelLabel}
                     </button>
                     <button
                        onClick={onConfirm}
                        className="px-4 py-1.5 rounded-md bg-red-600 text-white text-sm hover:bg-red-700 transition-colors"
                     >
                        {confirmLabel}
                     </button>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
   );
}

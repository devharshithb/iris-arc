"use client";

import { useEffect, useRef, useState } from "react";
import { Settings } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function SettingsPopover() {
  const { prefs, setReduceMotion, setShowTimestamps, setCompactMode } = useAppStore();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  // click outside to close
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (popRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  // optional: reflect reduceMotion on <html> for CSS hooks
  useEffect(() => {
    document.documentElement.toggleAttribute("data-reduce-motion", prefs.reduceMotion);
  }, [prefs.reduceMotion]);

  return (
    <TooltipProvider delayDuration={80}>
      <div className="relative">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              ref={btnRef}
              onClick={() => setOpen((v) => !v)}
              className="rounded-md border px-2.5 py-1.5 text-sm hover:bg-white/5"
              style={{ borderColor: "var(--border-weak)" }}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls="settings-popover"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">Settings</TooltipContent>
        </Tooltip>

        <AnimatePresence>
          {open && (
            <motion.div
              id="settings-popover"
              ref={popRef}
              initial={{ opacity: 0, scale: 0.98, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 4 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="absolute right-0 z-40 mt-2 w-64 rounded-lg border shadow-lg p-2"
              style={{
                backgroundColor: "var(--surface-chat)",
                borderColor: "var(--border-weak)",
              }}
              role="dialog"
            >
              <div className="px-2 py-1.5 text-xs font-semibold opacity-80">Preferences</div>

              <ToggleRow
                label="Reduce motion"
                hint="Minimize animations"
                checked={prefs.reduceMotion}
                onChange={setReduceMotion}
              />
              <ToggleRow
                label="Show timestamps"
                hint="Display time on messages"
                checked={prefs.showTimestamps}
                onChange={setShowTimestamps}
              />
              <ToggleRow
                label="Compact mode"
                hint="Slightly tighter spacing"
                checked={prefs.compactMode}
                onChange={setCompactMode}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className="flex items-start gap-2 rounded-md px-2 py-2 hover:bg-white/5 cursor-pointer"
      title={hint}
    >
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 rounded border"
        style={{ borderColor: "var(--border-weak)" }}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="text-sm leading-5">
        <div>{label}</div>
        {hint && <div className="text-xs opacity-65">{hint}</div>}
      </div>
    </label>
  );
}

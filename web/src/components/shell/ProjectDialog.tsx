"use client";

import { useEffect, useRef, useState } from "react";
import { X, Settings, GraduationCap, PenTool, HeartPulse, Plane, LineChart } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
};

const SUGGESTIONS: Array<{ label: string; icon: React.ReactNode }> = [
  { label: "Investing",  icon: <LineChart className="h-4 w-4" /> },
  { label: "Homework",   icon: <GraduationCap className="h-4 w-4" /> },
  { label: "Writing",    icon: <PenTool className="h-4 w-4" /> },
  { label: "Health",     icon: <HeartPulse className="h-4 w-4" /> },
  { label: "Travel",     icon: <Plane className="h-4 w-4" /> },
];

export default function ProjectDialog({ open, onClose, onCreate }: Props) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setName("");
    const t = setTimeout(() => inputRef.current?.focus(), 20);
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open, onClose]);

  if (!open) return null;

  const create = () => {
    const v = name.trim();
    if (!v) return;
    onCreate(v);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center px-4"
      aria-modal="true"
      role="dialog"
    >
      {/* scrim */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* panel */}
      <div
        className="relative w-full max-w-xl rounded-2xl shadow-xl"
        style={{ backgroundColor: "var(--surface-chat)", border: "1px solid var(--border-weak)" }}
      >
        {/* header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-lg font-semibold">Project name</div>
          <div className="flex items-center gap-2">
            <button className="rounded-md p-2 hover:bg-white/10" title="Settings (soon)">
              <Settings className="h-4 w-4" />
            </button>
            <button className="rounded-md p-2 hover:bg-white/10" title="Close" onClick={onClose} aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* body */}
        <div className="px-4 pb-4">
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => (e.key === "Enter" ? create() : null)}
            placeholder="e.g., Copenhagen Trip"
            className="w-full rounded-lg px-3 py-2 outline-none"
            style={{
              backgroundColor: "transparent",
              border: "1px solid var(--border-weak)",
            }}
          />

          {/* chips */}
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                onClick={() => setName(s.label)}
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm"
                style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid var(--border-weak)" }}
                title={s.label}
              >
                <span className="grid place-items-center rounded-full h-5 w-5 bg-black/30">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>

          {/* helper */}
          <div
            className="mt-4 rounded-xl px-3 py-2 text-sm opacity-90"
            style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid var(--border-weak)" }}
          >
            Projects keep chats, files, and custom instructions in one place. Use them for ongoing work, or just to keep things tidy.
          </div>
        </div>

        {/* footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3">
          <button className="rounded-md px-3 py-1.5 hover:bg-white/10" onClick={onClose}>
            Cancel
          </button>
          <button
            onClick={create}
            disabled={!name.trim()}
            className="rounded-full px-4 py-2 disabled:opacity-60"
            style={{ backgroundColor: "var(--bubble-user-bg)" }}
          >
            Create project
          </button>
        </div>
      </div>
    </div>
  );
}

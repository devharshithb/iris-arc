"use client";

import { useEffect } from "react";

type Handlers = {
  onCommandK?: () => void;
  onEsc?: () => void;
  onHelp?: () => void;
};

export function useGlobalHotkeys(handlers: Handlers) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const cmdOrCtrl = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl + K
      if (cmdOrCtrl && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        handlers.onCommandK?.();
        return;
      }
      // Esc
      if (e.key === "Escape") {
        handlers.onEsc?.();
        return;
      }
      // Cmd/Ctrl + /
      if (cmdOrCtrl && e.key === "/") {
        e.preventDefault();
        handlers.onHelp?.();
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handlers]);
}

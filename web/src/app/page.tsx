"use client";

import ChatList from "@/components/chat/ChatList";
import Composer from "@/components/composer/Composer";
import DropOverlay from "@/components/composer/DropOverlay";
import HeaderBar from "@/components/shell/HeaderBar";
import RightRail from "@/components/shell/RightRail";
import Sidebar from "@/components/shell/sidebar/Sidebar"; // ✅ direct file import (modular)
import { useGlobalHotkeys } from "@/lib/keys";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

/**
 * 🧠 Main Iris Arc Layout
 * Grid structure:
 * ┌──────────────────────────────────────────────┐
 * │ Sidebar | Chat + Composer | Optional RightRail │
 * └──────────────────────────────────────────────┘
 *
 * Smooth transitions between sidebar states,
 * keyboard shortcuts handled via `useGlobalHotkeys`.
 */
export default function Page() {
  // Keyboard shortcuts
  useGlobalHotkeys({
    onCommandK: () => toast("Launcher coming soon (Cmd/Ctrl+K)"),
    onEsc: () => toast("Stop generation (Esc) when streaming"),
    onHelp: () => toast("Keyboard help soon (Cmd/Ctrl+/)"),
  });

  const { leftSidebarOpen, rightRailOpen } = useAppStore();

  // 🧩 Layout proportions for sidebar and right rail
  const LEFT_PCT = leftSidebarOpen ? 17 : 3.5; // compact vs expanded
  const RIGHT_PX = rightRailOpen ? 320 : 0;

  const gridTemplateColumns = rightRailOpen
    ? `${LEFT_PCT}% calc(100% - ${LEFT_PCT}% - ${RIGHT_PX}px) ${RIGHT_PX}px`
    : `${LEFT_PCT}% calc(100% - ${LEFT_PCT}%)`;

  return (
    <div
      className="h-dvh relative transition-colors duration-300"
      style={{ backgroundColor: "var(--surface-chat)" }}
    >
      {/* 🧲 File Drop Overlay */}
      <DropOverlay />

      {/* Main grid layout */}
      <div
        className="grid h-full transition-[grid-template-columns] duration-300 ease-in-out"
        style={{
          gridTemplateColumns,
          willChange: "grid-template-columns",
        }}
      >
        {/* 🧭 Left Sidebar */}
        {/* temporarily satisfy Sidebar's required props with an any-cast; replace with real props later */}
        <Sidebar {...({} as any)} />

        {/* 💬 Chat Panel (Header + Messages + Composer) */}
        <section className="relative h-full flex flex-col overflow-hidden transition-[padding,margin] duration-300 ease-in-out">
          <HeaderBar />
          <ChatList />
          <Composer />
        </section>

        {/* 📊 Right Information Rail */}
        {rightRailOpen && <RightRail />}
      </div>
    </div>
  );
}

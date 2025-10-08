"use client";

import Sidebar from "@/components/shell/Sidebar";
import HeaderBar from "@/components/shell/HeaderBar";
import RightRail from "@/components/shell/RightRail";
import ChatList from "@/components/chat/ChatList";
import Composer from "@/components/composer/Composer";
import DropOverlay from "@/components/composer/DropOverlay";
import { useGlobalHotkeys } from "@/lib/keys";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";

/**
 * Percentage grid with animation:
 * - Open:  16.96% sidebar / 83.04% chat
 * - Closed: 3.35%  sidebar / 96.65% chat
 * Composer is INSIDE the chat column and will move with it.
 * Colors via CSS vars; original layout/behavior unchanged.
 */
export default function Page() {
  useGlobalHotkeys({
    onCommandK: () => toast("Launcher coming soon (Cmd/Ctrl+K)"),
    onEsc: () => toast("Stop generation (Esc) when streaming"),
    onHelp: () => toast("Keyboard help soon (Cmd/Ctrl+/)"),
  });

  const { leftSidebarOpen, rightRailOpen } = useAppStore();

  const LEFT_PCT = leftSidebarOpen ? 16.96 : 3.35;
  const RIGHT_PCT = rightRailOpen ? 0 : 0;
  const CENTER_PCT = Math.max(0, 100 - LEFT_PCT - RIGHT_PCT);

  const gridTemplateColumns =
    RIGHT_PCT > 0
      ? `${LEFT_PCT}% ${CENTER_PCT}% ${RIGHT_PCT}%`
      : `${LEFT_PCT}% ${CENTER_PCT}%`;

  return (
    <div className="h-dvh relative" style={{ backgroundColor: "var(--surface-chat)" }}>
      <DropOverlay />
      <div
        className="grid h-full transition-[grid-template-columns] duration-300 ease-in-out"
        style={{
          gridTemplateColumns,
          willChange: "grid-template-columns",
        }}
      >
        {/* Sidebar */}
        <Sidebar />

        {/* Chat column */}
        <section className="relative h-full flex flex-col overflow-hidden transition-[padding,margin] duration-300 ease-in-out">
          <HeaderBar />
          <ChatList />
          <Composer />
        </section>

        {/* Optional right rail */}
        {rightRailOpen && <RightRail />}
      </div>
    </div>
  );
}

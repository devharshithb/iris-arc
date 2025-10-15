"use client";

import ChatList from "@/components/chat/ChatList";
import Composer from "@/components/composer/Composer";
import DropOverlay from "@/components/composer/DropOverlay";
import HeaderBar from "@/components/shell/HeaderBar";
import RightRail from "@/components/shell/RightRail";
import Sidebar from "@/components/shell/Sidebar";
import { useGlobalHotkeys } from "@/lib/keys";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

/**
 * Main Iris Arc layout: Sidebar / Chat / RightRail
 * with smooth transitions and keyboard shortcuts.
 */
export default function Page() {
  useGlobalHotkeys({
    onCommandK: () => toast("Launcher coming soon (Cmd/Ctrl+K)"),
    onEsc: () => toast("Stop generation (Esc) when streaming"),
    onHelp: () => toast("Keyboard help soon (Cmd/Ctrl+/)"),
  });

  const { leftSidebarOpen, rightRailOpen } = useAppStore();

  const LEFT_PCT = leftSidebarOpen ? 16.96 : 3.35;
  const RIGHT_PX = rightRailOpen ? 320 : 0;

  const gridTemplateColumns = rightRailOpen
    ? `${LEFT_PCT}% calc(100% - ${LEFT_PCT}% - ${RIGHT_PX}px) ${RIGHT_PX}px`
    : `${LEFT_PCT}% calc(100% - ${LEFT_PCT}%)`;

  return (
    <div
      className="h-dvh relative transition-colors duration-300"
      style={{ backgroundColor: "var(--surface-chat)" }}
    >
      <DropOverlay />

      <div
        className="grid h-full transition-[grid-template-columns] duration-300 ease-in-out"
        style={{
          gridTemplateColumns,
          willChange: "grid-template-columns",
        }}
      >
        <Sidebar />
        <section className="relative h-full flex flex-col overflow-hidden transition-[padding,margin] duration-300 ease-in-out">
          <HeaderBar />
          <ChatList />
          <Composer />
        </section>
        {rightRailOpen && <RightRail />}
      </div>
    </div>
  );
}

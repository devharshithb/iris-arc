"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
// Use absolute alias so it doesn't matter where this file is moved
import ChatMessage from "@/components/chat/ChatMessage";

export default function ChatList() {
  const { currentThreadId, messages } = useAppStore();
  const list = currentThreadId ? (messages[currentThreadId] || []) : [];

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(true);
  const [showJump, setShowJump] = useState(false);

  // Track if user is near the bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
      setAtBottom(nearBottom);
      setShowJump(!nearBottom);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-scroll when new messages appear and user is at bottom
  useEffect(() => {
    if (atBottom) bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [list.length, atBottom]);

  return (
    <div className="relative flex-1 overflow-hidden">
      {/* Large bottom padding so the floating composer never covers text */}
      <div
        ref={scrollRef}
        className="h-full overflow-y-auto px-4 py-4 space-y-3 pb-[240px]"
      >
        {list.length === 0 ? (
          <div className="h-full grid place-items-center opacity-70">
            Start a new conversation…
          </div>
        ) : (
          list.map((m) => <ChatMessage key={m.id} msg={m} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Jump to latest pill */}
      {showJump && (
        <button
          onClick={() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
          }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 rounded-full border bg-background px-3 py-1 text-xs shadow hover:bg-muted"
          title="Jump to latest"
        >
          Jump to latest
        </button>
      )}
    </div>
  );
}

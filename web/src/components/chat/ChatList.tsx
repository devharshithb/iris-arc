"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import ChatMessage from "@/components/chat/ChatMessage";
import { ArrowDown } from "lucide-react";

/** Keep in sync with Composer width/padding */
const WIDTH_RATIO = 0.5026; // outer composer width ratio
const PAD_X = 20;           // inner horizontal padding per side (px-5 ≈ 20px)

/** Bottom spacing model (hard guarantee: nothing peeks under composer) */
const GAP_TO_BOTTOM = 30;    // composer offset from browser bottom
const FOOTER_BUFFER = 24;    // “IrisArc can make mistakes…” line
const PEEK_GUARD = 140;      // extra clearance beyond composer height
const BOTTOM_VIS_TOL = 8;    // px tolerance to consider “at bottom”

type TokenEvent = CustomEvent<{ index: number; batch: number }>;

export default function ChatList() {
  const { currentThreadId, setCanvasWidth, composerHeight } = useAppStore();
  const list = useAppStore((s) =>
    currentThreadId ? (s.messages[currentThreadId] || []) : []
  );

  const scrollerRef = useRef<HTMLDivElement>(null);
  const canvasRef   = useRef<HTMLDivElement>(null);

  const [screenW, setScreenW] = useState(0);
  const [showJump, setShowJump] = useState(false);

  // autoscroll only when pinned to bottom
  const pinnedRef = useRef(true);
  const prevHRef  = useRef(0);

  /* ---------- sizing ---------- */
  useEffect(() => {
    const onResize = () => setScreenW(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Match composer inner content width (outer – inner padding)
  const messageMaxWidth = Math.max(
    320,
    Math.floor(screenW * WIDTH_RATIO) - PAD_X * 2
  );

  /* ---------- share canvas width ---------- */
  useLayoutEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const measure = () => setCanvasWidth(el.getBoundingClientRect().width);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [setCanvasWidth]);

  /* ---------- bottom padding to CLEAR the composer ---------- */
  const compH = composerHeight || 127;
  // Absolute clearance so nothing ever shows beneath the composer:
  const bottomPadding = compH + GAP_TO_BOTTOM + FOOTER_BUFFER + PEEK_GUARD;
  const jumpButtonBottom = compH + GAP_TO_BOTTOM + FOOTER_BUFFER + 6;

  /* ---------- helpers ---------- */
  const isNearBottom = (el: HTMLElement) =>
    el.scrollHeight - el.scrollTop - el.clientHeight <= BOTTOM_VIS_TOL;

  const stickByDelta = (el: HTMLElement) => {
    const prev = prevHRef.current;
    const next = el.scrollHeight;
    const delta = next - prev;
    if (delta > 0) el.scrollTop += delta; // keep generating line fixed
    prevHRef.current = next;
  };

  /* ---------- base scroll listener ---------- */
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    prevHRef.current = el.scrollHeight;

    const onScroll = () => {
      const atBottom = isNearBottom(el);
      pinnedRef.current = atBottom;
      setShowJump(!atBottom);
      prevHRef.current = el.scrollHeight;
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  /* ---------- when list length changes ---------- */
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    if (pinnedRef.current) stickByDelta(el);
  }, [list.length]);

  /* ---------- batched autoscroll during streaming ---------- */
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onToken = (e: Event) => {
      const detail = (e as TokenEvent).detail;
      if (!pinnedRef.current) return;
      const every = detail?.batch ?? 8;
      const idx   = detail?.index ?? 1;
      if (idx % every !== 0) return;
      requestAnimationFrame(() => stickByDelta(el));
    };

    window.addEventListener("iris-token", onToken as EventListener);
    return () => window.removeEventListener("iris-token", onToken as EventListener);
  }, []);

  /* ---------- Jump-to-bottom ---------- */
  const jumpToLatest = () => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        pinnedRef.current = true;
        setShowJump(false);
        prevHRef.current = el.scrollHeight;
      });
    });
  };

  return (
    <div className="relative flex-1 overflow-hidden">
      <div ref={scrollerRef} className="h-full overflow-y-auto">
        <div
          ref={canvasRef}
          className="mx-auto w-full px-6 py-4 space-y-4"
          style={{ paddingBottom: bottomPadding }}
        >
          {list.length === 0 ? (
            <div className="h-[60vh] grid place-items-center opacity-70">
              Start a new conversation…
            </div>
          ) : (
            list.map((m) => (
              <ChatMessage key={m.id} msg={m} maxWidth={messageMaxWidth} />
            ))
          )}
        </div>
      </div>

      {showJump && (
        <button
          onClick={jumpToLatest}
          className="absolute left-1/2 -translate-x-1/2 grid place-items-center rounded-full"
          style={{
            bottom: jumpButtonBottom,
            width: 44,
            height: 44,
            backgroundColor: "#212121",
            boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
            border: "1px solid rgba(255,255,255,0.25)",
          }}
          title="Jump to latest"
          aria-label="Jump to latest"
        >
          <ArrowDown className="h-5 w-5 text-white" />
        </button>
      )}
    </div>
  );
}

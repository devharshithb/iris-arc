"use client";

import { create } from "zustand";
import type { Thread, Message, Attachment } from "./types";

/** Convenience */
const now = () => Date.now();
const rid = (p = "m") => `${p}${Math.random().toString(36).slice(2, 8)}`;

/** Streaming behavior knobs (mock) */
const STREAM_INTERVAL_MS = 35;   // token cadence
const STREAM_BATCH_SIZE = 8;     // UI throttles scroll updates using this value
const STREAM_TOKEN_CAP = 1200;   // hard cap so it never feels endless

type StreamState = {
  isStreaming: boolean;
  currentAssistantId?: string;
};

type State = {
  // data
  threads: Thread[];
  messages: Record<string, Message[]>;
  attachments: Record<string, Attachment>;
  draftFiles: Attachment[];

  // selection
  currentThreadId?: string;

  // UI layout
  leftSidebarOpen: boolean;
  rightRailOpen: boolean;
  canvasWidth: number;
  composerHeight: number;

  // streaming
  stream: StreamState;

  // actions
  setCurrentThread: (id: string) => void;
  newThread: () => string;
  sendUserMessage: (text: string) => void;

  // streaming (mock)
  startMockStream: (seedText?: string) => { stop: () => void };
  stopStream: () => void;

  // attachments
  addDraftFiles: (files: Attachment[]) => void;
  removeDraftFile: (id: string) => void;

  // layout setters
  toggleLeftSidebar: () => void;
  toggleRightRail: () => void;
  setCanvasWidth: (w: number) => void;
  setComposerHeight: (h: number) => void;

  // regenerate
  regenerateLast: () => void;

  // NEW: per-message actions
  deleteMessage: (id: string) => void;
  regenerateMessage: (id: string) => void;
};

const initialThread: Thread = {
  id: "t1",
  title: "New chat",
  createdAt: now(),
  updatedAt: now(),
  agentMode: "single",
  participants: ["assistant", "user"],
};

export const useAppStore = create<State>((set, get) => ({
  // data
  threads: [initialThread],
  messages: {
    t1: [
      {
        id: rid("a"),
        threadId: "t1",
        role: "assistant",
        createdAt: now(),
        parts: [{ kind: "text", text: "Hey! I’m Iris Arc. Ask me anything." }],
      },
    ],
  },
  attachments: {},
  draftFiles: [],

  // selection
  currentThreadId: "t1",

  // UI layout
  leftSidebarOpen: true,
  rightRailOpen: false,
  canvasWidth: 0,
  composerHeight: 127,

  // streaming
  stream: { isStreaming: false, currentAssistantId: undefined },

  // actions
  setCurrentThread: (id) => set({ currentThreadId: id }),

  newThread: () => {
    const t: Thread = {
      id: `t${Math.random().toString(36).slice(2, 8)}`,
      title: "New chat",
      createdAt: now(),
      updatedAt: now(),
      agentMode: "single",
      participants: ["assistant", "user"],
    };
    set((s) => ({
      threads: [t, ...s.threads],
      messages: { ...s.messages, [t.id]: [] },
      currentThreadId: t.id,
      draftFiles: [],
      stream: { isStreaming: false, currentAssistantId: undefined },
    }));
    return t.id;
  },

  sendUserMessage: (text: string) => {
    const tid = get().currentThreadId;
    if (!tid) return;

    const msg: Message = {
      id: rid("u"),
      threadId: tid,
      role: "user",
      createdAt: now(),
      parts: [{ kind: "text", text }],
    };

    set((s) => ({
      messages: { ...s.messages, [tid]: [...(s.messages[tid] || []), msg] },
      threads: s.threads.map((t) =>
        t.id === tid ? { ...t, updatedAt: now() } : t
      ),
      draftFiles: [],
    }));

    get().startMockStream(text);
  },

  // -------- MOCK STREAMING (short, structured, capped) --------
  startMockStream: (seedText?: string) => {
    const { stream } = get();
    if (stream.isStreaming) return { stop: get().stopStream };

    const tid = get().currentThreadId!;
    const assistantId = rid("a");

    const paragraphs = [
      seedText ? `You asked: "${seedText}"` : "Answering your question…",
      "Here’s a streaming response coming in tokens. You’ll see it grow line-by-line, while the latest line stays in place.",
      "• Point 1 — concise explanation.\n• Point 2 — a follow-up.\n• Point 3 — an example.",
      "```python\n# sample code\nfor i in range(3):\n    print('hello', i)\n```",
      "That’s the gist. If you want more detail, ask follow-ups and I’ll expand.",
      "— end —",
    ];

    const target = paragraphs.join("\n\n");
    const allTokens = target.split(/(\s+)/); // keep spaces
    const total = Math.min(allTokens.length, STREAM_TOKEN_CAP);

    // create empty assistant message
    set((s) => ({
      messages: {
        ...s.messages,
        [tid]: [
          ...(s.messages[tid] || []),
          {
            id: assistantId,
            threadId: tid,
            role: "assistant",
            createdAt: now(),
            parts: [{ kind: "text", text: "" }],
          },
        ],
      },
      stream: { isStreaming: true, currentAssistantId: assistantId },
    }));

    let i = 0;
    const tick = () => {
      const st = get().stream;
      if (!st.isStreaming || st.currentAssistantId !== assistantId) {
        return;
      }
      if (i >= total) {
        set({ stream: { isStreaming: false, currentAssistantId: undefined } });
        return;
      }

      const next = allTokens[i++];
      set((s) => {
        const list = s.messages[tid] || [];
        const msg = list.find((m) => m.id === assistantId);
        if (msg && msg.parts[0].kind === "text") {
          msg.parts[0].text += next;
        }
        return { messages: { ...s.messages, [tid]: [...list] } };
      });

      // single autoscroll event used by the UI (no duplicates)
      window.dispatchEvent(
        new CustomEvent("iris-token", { detail: { index: i, batch: STREAM_BATCH_SIZE } })
      );

      setTimeout(tick, STREAM_INTERVAL_MS);
    };
    setTimeout(tick, STREAM_INTERVAL_MS);

    const stop = () => set({ stream: { isStreaming: false, currentAssistantId: undefined } });
    return { stop };
  },

  stopStream: () => set({ stream: { isStreaming: false, currentAssistantId: undefined } }),

  // attachments
  addDraftFiles: (files) =>
    set((s) => ({
      draftFiles: [...s.draftFiles, ...files],
      attachments: {
        ...s.attachments,
        ...Object.fromEntries(files.map((f) => [f.id, f])),
      },
    })),
  removeDraftFile: (id) =>
    set((s) => ({ draftFiles: s.draftFiles.filter((f) => f.id !== id) })),

  // layout toggles
  toggleLeftSidebar: () => set((s) => ({ leftSidebarOpen: !s.leftSidebarOpen })),
  toggleRightRail: () => set((s) => ({ rightRailOpen: !s.rightRailOpen })),
  setCanvasWidth: (w) => set({ canvasWidth: w }),
  setComposerHeight: (h) => set({ composerHeight: h }),

  // regenerate mock (last assistant)
  regenerateLast: () => {
    const tid = get().currentThreadId!;
    const list = get().messages[tid] || [];
    const lastAssistant = [...list].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant) return;
    lastAssistant.parts = [{ kind: "text", text: "" }];
    set((s) => ({ messages: { ...s.messages, [tid]: [...list] } }));
    get().startMockStream("Regenerating…");
  },

  // -------- NEW per-message actions --------
  deleteMessage: (id) => {
    const tid = get().currentThreadId;
    if (!tid) return;
    set((s) => {
      const next = (s.messages[tid] || []).filter((m) => m.id !== id);
      return { messages: { ...s.messages, [tid]: next } };
    });
  },

  regenerateMessage: (id) => {
    const tid = get().currentThreadId!;
    const list = get().messages[tid] || [];
    const target = list.find((m) => m.id === id && m.role === "assistant");
    if (!target) return;
    target.parts = [{ kind: "text", text: "" }];
    set((s) => ({ messages: { ...s.messages, [tid]: [...list] } }));
    get().startMockStream("Regenerating…");
  },
}));

"use client";

import { create } from "zustand";
import type { Thread, Message, Attachment, Project } from "./types";

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

type SearchHit = {
  threadId: string;
  threadTitle: string;
  snippet?: string;
};

type State = {
  // data
  threads: Thread[];
  messages: Record<string, Message[]>;
  attachments: Record<string, Attachment>;
  draftFiles: Attachment[];

  // projects (folders)
  projects: Project[];
  currentProjectFilter?: string;

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
  newThread: (projectId?: string) => string;
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

  // regenerate + message ops
  regenerateLast: () => void;
  regenerateMessage: (messageId: string) => void;
  deleteMessage: (messageId: string) => void;
  deleteFromHere: (messageId: string) => void;

  // edit (user-only) -> triggers fresh assistant reply
  editMessage: (messageId: string, newText: string) => void;

  // projects/folders
  createProject: (name: string) => string;
  renameProject: (id: string, name: string) => void;
  deleteProject: (id: string) => void;
  assignThreadToProject: (threadId: string, projectId?: string) => void;
  setProjectFilter: (projectId?: string) => void;

  // search
  searchChats: (q: string) => SearchHit[];

    // prefs (tiny)
  prefs: {
    reduceMotion: boolean;
    showTimestamps: boolean;
    compactMode: boolean;
  };

  // prefs actions
  setReduceMotion: (v: boolean) => void;
  setShowTimestamps: (v: boolean) => void;
  setCompactMode: (v: boolean) => void;

};

const initialThread: Thread = {
  id: "t1",
  title: "New chat",
  createdAt: now(),
  updatedAt: now(),
  agentMode: "single",
  participants: ["assistant", "user"],
};

const initialProjects: Project[] = [
  { id: "p-default", name: "General", createdAt: now(), updatedAt: now() },
];

export const useAppStore = create<State>((set, get) => ({

    // prefs
  prefs: {
    reduceMotion: false,
    showTimestamps: false,
    compactMode: false,
  },

  setReduceMotion: (v) => set((s) => ({ prefs: { ...s.prefs, reduceMotion: v } })),
  setShowTimestamps: (v) => set((s) => ({ prefs: { ...s.prefs, showTimestamps: v } })),
  setCompactMode: (v) => set((s) => ({ prefs: { ...s.prefs, compactMode: v } })),

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

  // projects
  projects: initialProjects,
  currentProjectFilter: undefined,

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

  newThread: (projectId) => {
    const t: Thread = {
      id: `t${Math.random().toString(36).slice(2, 8)}`,
      title: "New chat",
      createdAt: now(),
      updatedAt: now(),
      agentMode: "single",
      participants: ["assistant", "user"],
      projectId,
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

  // regenerate last assistant
  regenerateLast: () => {
    const tid = get().currentThreadId!;
    const list = get().messages[tid] || [];
    const lastAssistant = [...list].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant) return;
    lastAssistant.parts = [{ kind: "text", text: "" }];
    set((s) => ({ messages: { ...s.messages, [tid]: [...list] } }));
    get().startMockStream("Regenerating…");
  },

  // regenerate from a specific assistant message
  regenerateMessage: (messageId) => {
    const tid = get().currentThreadId!;
    const all = get().messages[tid] || [];
    const idx = all.findIndex((m) => m.id === messageId);
    if (idx === -1) return;
    const target = all[idx];
    if (target.role !== "assistant") return;
    const upto = all.slice(0, idx); // keep messages before target
    set((s) => ({ messages: { ...s.messages, [tid]: upto } }));
    get().startMockStream("Regenerating…");
  },

  // deletions
  deleteMessage: (messageId) => {
    const tid = get().currentThreadId!;
    set((s) => {
      const list = s.messages[tid] || [];
      const next = list.filter((m) => m.id !== messageId);
      return { messages: { ...s.messages, [tid]: next } };
    });
  },

  deleteFromHere: (messageId) => {
    const tid = get().currentThreadId!;
    set((s) => {
      const list = s.messages[tid] || [];
      const idx = list.findIndex((m) => m.id === messageId);
      if (idx === -1) return {};
      const next = list.slice(0, idx);
      return { messages: { ...s.messages, [tid]: next } };
    });
  },

  // edit a USER message, then trigger a fresh assistant reply
  // Edit a USER message, then replace the following assistant with a fresh one
editMessage: (messageId, newText) => {
  const tid = get().currentThreadId!;
  let edited = false;
  let userIdx = -1;

  set((s) => {
    const list = s.messages[tid] || [];

    // locate the user message index
    userIdx = list.findIndex((m) => m.id === messageId);

    // update the user message text (guard role)
    const updatedList = list.map((m, i) => {
      if (i !== userIdx) return m;
      if (m.role !== "user") return m; // only user prompts are editable
      edited = true;

      // Update first text part or collapse to a single text part
      if (m.parts.length > 0 && m.parts[0].kind === "text") {
        const parts = [...m.parts];
        parts[0] = { kind: "text", text: newText };
        return { ...m, parts, updatedAt: Date.now() } as any;
      }
      return {
        ...m,
        parts: [{ kind: "text", text: newText }],
        updatedAt: Date.now(),
      } as any;
    });

    // If edited, hard rule: trim everything AFTER the edited user message
    // (removes the previous assistant reply and any later turns)
    const next = edited && userIdx >= 0
      ? updatedList.slice(0, userIdx + 1)
      : updatedList;

    return { messages: { ...s.messages, [tid]: next } };
  });

  // Stream a new assistant reply immediately after the edited user message
  if (edited) {
    get().startMockStream(newText);
  }
},


  // ------- Projects (folders) -------
  createProject: (name) => {
    const id = `p-${Math.random().toString(36).slice(2, 8)}`;
    const p: Project = { id, name, createdAt: now(), updatedAt: now() };
    set((s) => ({ projects: [p, ...s.projects] }));
    return id;
  },

  renameProject: (id, name) =>
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === id ? { ...p, name, updatedAt: now() } : p
      ),
    })),

  deleteProject: (id) =>
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      threads: s.threads.map((t) =>
        t.projectId === id ? { ...t, projectId: undefined } : t
      ),
      currentProjectFilter: s.currentProjectFilter === id ? undefined : s.currentProjectFilter,
    })),

  assignThreadToProject: (threadId, projectId) =>
    set((s) => ({
      threads: s.threads.map((t) =>
        t.id === threadId ? { ...t, projectId } : t
      ),
    })),

  setProjectFilter: (projectId) => set({ currentProjectFilter: projectId }),

  // ------- Search -------
  searchChats: (q) => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    const { threads, messages, currentProjectFilter } = get();

    // filter threads based on currentProjectFilter (if any)
    const filtered = currentProjectFilter
      ? threads.filter((t) => t.projectId === currentProjectFilter)
      : threads;

    const hits: SearchHit[] = [];
    for (const t of filtered) {
      const titleMatch = (t.title || "").toLowerCase().includes(needle);
      let snippet: string | undefined;

      if (!titleMatch) {
        const msgs = messages[t.id] || [];
        // find first message with a text part containing the needle
        for (const m of msgs) {
          for (const p of m.parts) {
            if (p.kind === "text") {
              const txt = p.text || "";
              const pos = txt.toLowerCase().indexOf(needle);
              if (pos >= 0) {
                snippet = sliceAround(txt, pos, 96);
                break;
              }
            }
          }
          if (snippet) break;
        }
      }

      if (titleMatch || snippet) {
        hits.push({
          threadId: t.id,
          threadTitle: t.title || "New chat",
          snippet,
        });
      }
    }
    return hits;
  },
}));

function sliceAround(text: string, index: number, max = 96) {
  const start = Math.max(0, index - Math.floor(max / 2));
  const end = Math.min(text.length, start + max);
  const slice = text.slice(start, end);
  return (start > 0 ? "…" : "") + slice + (end < text.length ? "…" : "");
}

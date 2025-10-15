"use client";

import { create } from "zustand";
import type { Attachment, Message, Project, Thread } from "./types";

/** Convenience */
const now = () => Date.now();
const rid = (p = "m") => `${p}${Math.random().toString(36).slice(2, 8)}`;

/** Streaming behavior knobs */
const STREAM_BATCH_SIZE = 8;
const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:8000";

type StreamState = {
  isStreaming: boolean;
  currentAssistantId?: string;
  controller?: AbortController;
};

type SearchHit = {
  threadId: string;
  threadTitle: string;
  snippet?: string;
};

type State = {
  threads: Thread[];
  messages: Record<string, Message[]>;
  attachments: Record<string, Attachment>;
  draftFiles: Attachment[];

  projects: Project[];
  currentProjectFilter?: string;
  currentThreadId?: string;

  leftSidebarOpen: boolean;
  rightRailOpen: boolean;
  canvasWidth: number;
  composerHeight: number;

  stream: StreamState;

  setCurrentThread: (id: string) => void;
  newThread: (projectId?: string) => string;
  sendUserMessage: (text: string) => void;

  // Real backend stream
  startStream: (seedText?: string) => Promise<{ stop: () => void }>;
  stopStream: () => void;

  addDraftFiles: (files: Attachment[]) => void;
  removeDraftFile: (id: string) => void;

  toggleLeftSidebar: () => void;
  toggleRightRail: () => void;
  setCanvasWidth: (w: number) => void;
  setComposerHeight: (h: number) => void;

  regenerateLast: () => void;
  regenerateMessage: (messageId: string) => void;
  deleteMessage: (messageId: string) => void;
  deleteFromHere: (messageId: string) => void;
  editMessage: (messageId: string, newText: string) => void;

  createProject: (name: string) => string;
  renameProject: (id: string, name: string) => void;
  deleteProject: (id: string) => void;
  assignThreadToProject: (threadId: string, projectId?: string) => void;
  setProjectFilter: (projectId?: string) => void;

  searchChats: (q: string) => SearchHit[];

  prefs: {
    reduceMotion: boolean;
    showTimestamps: boolean;
    compactMode: boolean;
  };
  setReduceMotion: (v: boolean) => void;
  setShowTimestamps: (v: boolean) => void;
  setCompactMode: (v: boolean) => void;
};

/** Initial defaults */
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
  // Prefs
  prefs: {
    reduceMotion: false,
    showTimestamps: false,
    compactMode: false,
  },
  setReduceMotion: (v) =>
    set((s) => ({ prefs: { ...s.prefs, reduceMotion: v } })),
  setShowTimestamps: (v) =>
    set((s) => ({ prefs: { ...s.prefs, showTimestamps: v } })),
  setCompactMode: (v) =>
    set((s) => ({ prefs: { ...s.prefs, compactMode: v } })),

  // Core data
  threads: [initialThread],
  messages: {
    t1: [
      {
        id: "a-welcome",
        threadId: "t1",
        role: "assistant",
        createdAt: now(),
        parts: [{ kind: "text", text: "Hey! I’m Iris Arc. Ask me anything." }],
      },
    ],
  },
  attachments: {},
  draftFiles: [],

  // Project mgmt
  projects: initialProjects,
  currentProjectFilter: undefined,
  currentThreadId: "t1",

  // Layout
  leftSidebarOpen: true,
  rightRailOpen: false,
  canvasWidth: 0,
  composerHeight: 127,

  // Streaming
  stream: { isStreaming: false, currentAssistantId: undefined, controller: undefined },

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

    get().startStream(text);
  },

  // -------- REAL STREAMING via FastAPI --------
  startStream: async (seedText?: string) => {
    const { stream } = get();
    if (stream.isStreaming) return { stop: get().stopStream };

    const tid = get().currentThreadId!;
    const assistantId = rid("a");
    const controller = new AbortController();

    // Create empty assistant message
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
      stream: { isStreaming: true, currentAssistantId: assistantId, controller },
    }));

    try {
      const response = await fetch(`${BASE_URL}/api/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: seedText || "" }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Streaming failed: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let tokenCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!value) continue;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk.replace(/\r/g, ""); // Clean CRs for Windows compat

        // Update the assistant message progressively
        set((s) => {
          const list = s.messages[tid] || [];
          const msg = list.find((m) => m.id === assistantId);
          if (msg && msg.parts[0].kind === "text") {
            msg.parts[0].text = buffer.replace(/\[Object Object\]/g, "");
          }
          return { messages: { ...s.messages, [tid]: [...list] } };
        });

        tokenCount += chunk.split(/\s+/).length;
        if (tokenCount % STREAM_BATCH_SIZE === 0) {
          window.dispatchEvent(
            new CustomEvent("iris-token", {
              detail: { index: tokenCount, batch: STREAM_BATCH_SIZE },
            })
          );
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Stream aborted by user.");
      } else {
        console.error("Stream error:", err);
        set((s) => ({
          messages: {
            ...s.messages,
            [tid]: [
              ...(s.messages[tid] || []),
              {
                id: rid("err"),
                threadId: tid,
                role: "system",
                createdAt: now(),
                parts: [
                  { kind: "text", text: "⚠️ Connection error. Please retry." },
                ],
              },
            ],
          },
        }));
      }
    } finally {
      set({ stream: { isStreaming: false, currentAssistantId: undefined } });
    }

    const stop = () => {
      const ctrl = get().stream.controller;
      if (ctrl) ctrl.abort();
      set({ stream: { isStreaming: false, currentAssistantId: undefined } });
    };
    return { stop };
  },

  stopStream: () => {
    const ctrl = get().stream.controller;
    if (ctrl) ctrl.abort();
    set({ stream: { isStreaming: false, currentAssistantId: undefined } });
  },

  // Attachments
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

  // Layout
  toggleLeftSidebar: () =>
    set((s) => ({ leftSidebarOpen: !s.leftSidebarOpen })),
  toggleRightRail: () => set((s) => ({ rightRailOpen: !s.rightRailOpen })),
  setCanvasWidth: (w) => set({ canvasWidth: w }),
  setComposerHeight: (h) => set({ composerHeight: h }),

  // Message ops
  regenerateLast: () => {
    const tid = get().currentThreadId!;
    const list = get().messages[tid] || [];
    const lastAssistant = [...list].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant) return;
    lastAssistant.parts = [{ kind: "text", text: "" }];
    set((s) => ({ messages: { ...s.messages, [tid]: [...list] } }));
    get().startStream("Regenerating…");
  },

  regenerateMessage: (messageId) => {
    const tid = get().currentThreadId!;
    const all = get().messages[tid] || [];
    const idx = all.findIndex((m) => m.id === messageId);
    if (idx === -1) return;
    const target = all[idx];
    if (target.role !== "assistant") return;
    const upto = all.slice(0, idx);
    set((s) => ({ messages: { ...s.messages, [tid]: upto } }));
    get().startStream("Regenerating…");
  },

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

  editMessage: (messageId, newText) => {
    const tid = get().currentThreadId!;
    let edited = false;
    let userIdx = -1;

    set((s) => {
      const list = s.messages[tid] || [];
      userIdx = list.findIndex((m) => m.id === messageId);
      const updatedList = list.map((m, i) => {
        if (i !== userIdx) return m;
        if (m.role !== "user") return m;
        edited = true;
        return {
          ...m,
          parts: [{ kind: "text", text: newText }],
          updatedAt: Date.now(),
        } as any;
      });
      const next =
        edited && userIdx >= 0 ? updatedList.slice(0, userIdx + 1) : updatedList;
      return { messages: { ...s.messages, [tid]: next } };
    });
    if (edited) get().startStream(newText);
  },

  // Projects
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
      currentProjectFilter:
        s.currentProjectFilter === id ? undefined : s.currentProjectFilter,
    })),

  assignThreadToProject: (threadId, projectId) =>
    set((s) => ({
      threads: s.threads.map((t) =>
        t.id === threadId ? { ...t, projectId } : t
      ),
    })),

  setProjectFilter: (projectId) => set({ currentProjectFilter: projectId }),

  // Search
  searchChats: (q) => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    const { threads, messages, currentProjectFilter } = get();
    const filtered = currentProjectFilter
      ? threads.filter((t) => t.projectId === currentProjectFilter)
      : threads;

    const hits: SearchHit[] = [];
    for (const t of filtered) {
      const titleMatch = (t.title || "").toLowerCase().includes(needle);
      let snippet: string | undefined;
      if (!titleMatch) {
        const msgs = messages[t.id] || [];
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
        hits.push({ threadId: t.id, threadTitle: t.title || "New chat", snippet });
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

"use client";

import { createJSONStorage, persist } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";

import {
  addAssistantMessage as apiAddAssistantMessage,
  addMessage as apiAddMessage,
  createChat as apiCreateChat,
  listChats as apiListChats,
  listMessages as apiListMessages,
} from "./chatApi";
import type { Attachment, Message, Project, Thread } from "./types";

/* -------------------------------------------------------------------------- */
/*                              Helper Utilities                              */
/* -------------------------------------------------------------------------- */
const now = () => Date.now();
const rid = (p = "m") => `${p}${Math.random().toString(36).slice(2, 8)}`;
const STREAM_BATCH_SIZE = 8;

/**
 * ✅ Backend base URL: includes /api automatically.
 * Make sure this matches your FastAPI mount (prefix="/api")
 */
const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://127.0.0.1:8000/api";

const PERSIST_ASSISTANT_ON_FINISH = true;

/* Helper for snippets */
function sliceAround(text: string, index: number, max = 96) {
  const start = Math.max(0, index - Math.floor(max / 2));
  const end = Math.min(text.length, start + max);
  const slice = text.slice(start, end);
  return (start > 0 ? "…" : "") + slice + (end < text.length ? "…" : "");
}

/* -------------------------------------------------------------------------- */
/*                                Type Decls                                  */
/* -------------------------------------------------------------------------- */
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

export type State = {
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

  /* ---------------- Auth & Persistence ---------------- */
  logout: () => void;

  /* ---------------- Backend Loaders ---------------- */
  bootstrapAfterLogin: () => Promise<void>;
  loadChatsFromServer: () => Promise<void>;
  loadMessagesFromServer: (threadId: string) => Promise<void>;

  /* ---------------- Chat Actions ---------------- */
  setCurrentThread: (id: string) => void;
  newThread: (projectId?: string) => Promise<string>;
  sendUserMessage: (text: string) => void;

  /* ---------------- Streaming ---------------- */
  startStream: (seedText?: string) => Promise<{ stop: () => void }>;
  stopStream: () => void;

  /* ---------------- UI & Layout ---------------- */
  addDraftFiles: (files: Attachment[]) => void;
  removeDraftFile: (id: string) => void;
  toggleLeftSidebar: () => void;
  toggleRightRail: () => void;
  setCanvasWidth: (w: number) => void;
  setComposerHeight: (h: number) => void;

  /* ---------------- Message Ops ---------------- */
  regenerateLast: () => void;
  regenerateMessage: (id: string) => void;
  deleteMessage: (id: string) => void;
  deleteFromHere: (id: string) => void;
  editMessage: (id: string, text: string) => void;

  /* ---------------- Project Ops ---------------- */
  createProject: (name: string) => string;
  renameProject: (id: string, name: string) => void;
  deleteProject: (id: string) => void;
  assignThreadToProject: (tid: string, pid?: string) => void;
  setProjectFilter: (pid?: string) => void;

  /* ---------------- Search ---------------- */
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

/* -------------------------------------------------------------------------- */
/*                               Initial State                                */
/* -------------------------------------------------------------------------- */
const initialThread: Thread = {
  id: "t1",
  title: "New Chat",
  createdAt: now(),
  updatedAt: now(),
  agentMode: "single",
  participants: ["assistant", "user"],
};

const initialProjects: Project[] = [
  { id: "p-default", name: "General", createdAt: now(), updatedAt: now() },
];

/* -------------------------------------------------------------------------- */
/*                           Stable Search Function                            */
/* -------------------------------------------------------------------------- */
function createSearchFn(get: () => State) {
  return (q: string): SearchHit[] => {
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
        for (const m of messages[t.id] || []) {
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
      if (titleMatch || snippet)
        hits.push({ threadId: t.id, threadTitle: t.title, snippet });
    }
    return hits;
  };
}

/* -------------------------------------------------------------------------- */
/*                              Zustand Store                                 */
/* -------------------------------------------------------------------------- */
export const useAppStore = createWithEqualityFn<State>()(
  persist(
    (set, get) => ({
      prefs: { reduceMotion: false, showTimestamps: false, compactMode: false },
      setReduceMotion: (v) =>
        set((s) => ({ prefs: { ...s.prefs, reduceMotion: v } })),
      setShowTimestamps: (v) =>
        set((s) => ({ prefs: { ...s.prefs, showTimestamps: v } })),
      setCompactMode: (v) =>
        set((s) => ({ prefs: { ...s.prefs, compactMode: v } })),

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
      projects: initialProjects,
      currentProjectFilter: undefined,
      currentThreadId: "t1",
      leftSidebarOpen: true,
      rightRailOpen: false,
      canvasWidth: 0,
      composerHeight: 127,
      stream: { isStreaming: false },

      /* ---------------- Auth & Logout ---------------- */
      logout: () => {
        console.log("🔒 Logging out → clearing tokens & store");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        useAppStore.persist.clearStorage(); // clear persisted Zustand
        set({
          threads: [initialThread],
          messages: { t1: [] },
          currentThreadId: "t1",
          projects: initialProjects,
        });
      },

      /* ---------------- Bootstrapping ---------------- */
      bootstrapAfterLogin: async () => {
        try {
          await get().loadChatsFromServer();
          const { threads } = get();
          if (!threads.length) {
            const created = await apiCreateChat("Chat 1");
            set({
              threads: [created],
              messages: { [created.id]: [] },
              currentThreadId: created.id,
            });
          } else {
            const active = threads[0];
            set({
              currentThreadId: active.id,
              messages: { [active.id]: [] },
            });
            try {
              await get().loadMessagesFromServer(active.id);
            } catch (e) {
              console.warn("No messages found for this chat:", e);
            }
          }
          set((s) => ({
            threads: s.threads.filter((t) => !t.id.startsWith("t")),
            messages: Object.fromEntries(
              Object.entries(s.messages).filter(([id]) => !id.startsWith("t"))
            ),
          }));
        } catch (e) {
          console.error("bootstrapAfterLogin failed:", e);
        }
      },

      loadChatsFromServer: async () => {
        const chats = await apiListChats();
        if (!chats.length) return;
        chats.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        set({ threads: chats, messages: {}, currentThreadId: chats[0]?.id });
      },

      loadMessagesFromServer: async (tid: string) => {
        const msgs = await apiListMessages(tid);
        set((s) => ({ messages: { ...s.messages, [tid]: msgs } }));
      },

      setCurrentThread: (id) => set({ currentThreadId: id }),

      /* ---------------- Chat Actions ---------------- */
      newThread: async (projectId) => {
        const title = `Chat ${(get().threads?.length || 0) + 1}`;
        let created: Thread;
        try {
          created = await apiCreateChat(title);
        } catch {
          created = {
            id: rid("t"),
            title,
            createdAt: now(),
            updatedAt: now(),
            agentMode: "single",
            participants: ["assistant", "user"],
          };
        }

        set((s) => ({
          threads: [created, ...s.threads.filter((t) => t.id !== "t1")],
          messages: { ...s.messages, [created.id]: [] },
          currentThreadId: created.id,
          draftFiles: [],
          stream: { isStreaming: false },
        }));
        if (projectId) get().assignThreadToProject(created.id, projectId);
        return created.id;
      },

      sendUserMessage: (text) => {
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
        }));
        if (!/^t[0-9a-z]+$/.test(tid))
          apiAddMessage(tid, text).catch((e) =>
            console.error("addMessage failed:", e)
          );
        get().startStream(text);
      },

      /* ---------------- Streaming ---------------- */
      startStream: async (seedText?: string) => {
        const { stream } = get();
        if (stream.isStreaming) return { stop: get().stopStream };

        const tid = get().currentThreadId!;
        const assistantId = rid("a");
        const controller = new AbortController();

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
          stream: {
            isStreaming: true,
            currentAssistantId: assistantId,
            controller,
          },
        }));

        let buffer = "";
        try {
          // ✅ Correct stream endpoint
          const res = await fetch(`${BASE_URL}/chat/stream`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: seedText || "" }),
            signal: controller.signal,
          });

          if (!res.ok || !res.body) throw new Error(res.statusText);
          const reader = res.body.getReader();
          const decoder = new TextDecoder("utf-8");
          let tokenCount = 0;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            buffer += chunk;
            set((s) => {
              const msgs = s.messages[tid] || [];
              const msg = msgs.find((m) => m.id === assistantId);
              if (msg?.parts?.[0]?.kind === "text") msg.parts[0].text = buffer;
              return { messages: { ...s.messages, [tid]: [...msgs] } };
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
        } catch (e) {
          console.error("Stream error:", e);
        } finally {
          set({ stream: { isStreaming: false } });
          if (PERSIST_ASSISTANT_ON_FINISH && buffer.trim()) {
            try {
              await apiAddAssistantMessage(tid, buffer);
            } catch (err) {
              console.warn("Persist assistant failed:", err);
            }
          }
        }

        const stop = () => {
          const ctrl = get().stream.controller;
          ctrl?.abort();
          set({ stream: { isStreaming: false } });
        };
        return { stop };
      },

      stopStream: () => {
        const ctrl = get().stream.controller;
        ctrl?.abort();
        set({ stream: { isStreaming: false } });
      },

      /* ---------------- UI Helpers ---------------- */
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
      toggleLeftSidebar: () =>
        set((s) => ({ leftSidebarOpen: !s.leftSidebarOpen })),
      toggleRightRail: () =>
        set((s) => ({ rightRailOpen: !s.rightRailOpen })),
      setCanvasWidth: (w) => set({ canvasWidth: w }),
      setComposerHeight: (h) => set({ composerHeight: h }),

      /* ---------------- Messages ---------------- */
      regenerateLast: () => {
        const tid = get().currentThreadId!;
        const list = get().messages[tid] || [];
        const last = [...list].reverse().find((m) => m.role === "assistant");
        if (!last) return;
        last.parts = [{ kind: "text", text: "" }];
        set((s) => ({ messages: { ...s.messages, [tid]: [...list] } }));
        get().startStream("Regenerating…");
      },
      regenerateMessage: (id) => {
        const tid = get().currentThreadId!;
        const list = get().messages[tid] || [];
        const idx = list.findIndex((m) => m.id === id);
        if (idx === -1) return;
        const target = list[idx];
        if (target.role !== "assistant") return;
        const next = list.slice(0, idx);
        set((s) => ({ messages: { ...s.messages, [tid]: next } }));
        get().startStream("Regenerating…");
      },
      deleteMessage: (id) => {
        const tid = get().currentThreadId!;
        set((s) => ({
          messages: {
            ...s.messages,
            [tid]: (s.messages[tid] || []).filter((m) => m.id !== id),
          },
        }));
      },
      deleteFromHere: (id) => {
        const tid = get().currentThreadId!;
        set((s) => {
          const list = s.messages[tid] || [];
          const idx = list.findIndex((m) => m.id === id);
          return idx === -1
            ? {}
            : { messages: { ...s.messages, [tid]: list.slice(0, idx) } };
        });
      },
      editMessage: (id, newText) => {
        const tid = get().currentThreadId!;
        set((s) => {
          const list = s.messages[tid] || [];
          const idx = list.findIndex(
            (m) => m.id === id && m.role === "user"
          );
          if (idx === -1) return {};
          const next = [...list];
          next[idx] = { ...next[idx], parts: [{ kind: "text", text: newText }] };
          return { messages: { ...s.messages, [tid]: next } };
        });
        get().startStream(newText);
      },

      /* ---------------- Projects ---------------- */
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
      assignThreadToProject: (tid, pid) =>
        set((s) => ({
          threads: s.threads.map((t) =>
            t.id === tid ? { ...t, projectId: pid } : t
          ),
        })),
      setProjectFilter: (pid) => set({ currentProjectFilter: pid }),

      /* ---------------- Search ---------------- */
      searchChats: () => [],
    }),
    {
      name: "irisarc-store",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({
        threads: state.threads,
        messages: state.messages,
        projects: state.projects,
        prefs: state.prefs,
        currentThreadId: state.currentThreadId,
      }),
    }
  ),
  shallow
);

/* Stable Search Attachment */
(useAppStore as any).setState((s: State) => ({
  ...s,
  searchChats: createSearchFn(useAppStore.getState),
}));

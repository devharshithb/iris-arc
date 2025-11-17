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
  updateChatProject as apiUpdateChatProject,
  renameChat as apiRenameChat,
  deleteChat as apiDeleteChat,
  listProjects as apiListProjects,
  createProject as apiCreateProject,
  renameProject as apiRenameProject,
  deleteProject as apiDeleteProject,
} from "./chatApi";
import type { Attachment, Message, Project, Thread } from "./types";
import { getSession } from "next-auth/react";

/* -------------------------------------------------------------------------- */
/*                              Helper Utilities                              */
/* -------------------------------------------------------------------------- */
const now = () => Date.now();
const rid = (p = "m") => `${p}${Math.random().toString(36).slice(2, 8)}`;
const STREAM_BATCH_SIZE = 8;

/**
 * ✅ Backend base URL for streaming endpoint
 */
const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://127.0.0.1:8000";

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
  loadProjectsFromServer: () => Promise<void>;
  syncProjectToServer: (projectId: string, name: string) => Promise<void>;

  /* ---------------- Chat Actions ---------------- */
  setCurrentThread: (id: string) => void;
  newThread: (projectId?: string) => Promise<string>;
  sendUserMessage: (text: string) => void;
  deleteChat: (id: string) => Promise<void>;

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
  renameProject: (id: string, name: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  assignThreadToProject: (tid: string, pid?: string) => Promise<void>;
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

// Empty initial projects - will be loaded from server
const initialProjects: Project[] = [];

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
        console.log("🔒 Logging out → clearing all state");
        
        // Get current user ID before clearing
        const userId = localStorage.getItem("current_user_id");
        
        // Clear the persisted store for this user
        if (userId) {
          const key = `irisarc-store-user-${userId}`;
          localStorage.removeItem(key);
          console.log(`[LOGOUT] Cleared store for user ${userId}`);
        }
        
        // Clear tokens and user ID
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("current_user_id");
        
        // Reset to initial state
        set({
          threads: [],
          messages: {},
          attachments: {},
          draftFiles: [],
          projects: [],
          currentProjectFilter: undefined,
          currentThreadId: undefined,
          leftSidebarOpen: true,
          rightRailOpen: false,
          stream: { isStreaming: false },
        });
      },

      /* ---------------- Bootstrapping ---------------- */
      bootstrapAfterLogin: async () => {
        try {
          console.log("[BOOTSTRAP] Starting...");
          
          const { messages: cachedMessages } = get();
          console.log(`[BOOTSTRAP] Found ${Object.keys(cachedMessages).length} cached chat messages`);
          
          // Load projects first
          try {
            await get().loadProjectsFromServer();
            console.log("[BOOTSTRAP] Projects loaded");
          } catch (e: any) {
            console.error("[BOOTSTRAP] Failed to load projects:", e.message);
            // Continue even if projects fail
          }
          
          // Load chats
          try {
            await get().loadChatsFromServer();
            console.log("[BOOTSTRAP] Chats loaded");
          } catch (e: any) {
            console.error("[BOOTSTRAP] Failed to load chats:", e.message);
            // Continue even if chats fail
          }
          
          const { threads, messages } = get();
          console.log(`[BOOTSTRAP] After loading: ${threads.length} threads, ${Object.keys(messages).length} message arrays`);
          
          if (!threads.length) {
            // Create first chat
            try {
              const created = await apiCreateChat("Chat 1");
              set({
                threads: [created],
                messages: { [created.id]: [] },
                currentThreadId: created.id,
              });
              console.log("[BOOTSTRAP] Created initial chat");
            } catch (e: any) {
              console.error("[BOOTSTRAP] Failed to create initial chat:", e.message);
            }
          } else {
            // Load messages for first chat only if not already cached
            const active = threads[0];
            set({
              currentThreadId: active.id,
            });
            
            if (!messages[active.id] || messages[active.id].length === 0) {
              console.log(`[BOOTSTRAP] Loading messages for active chat ${active.id}`);
              try {
                await get().loadMessagesFromServer(active.id);
                console.log("[BOOTSTRAP] Messages loaded for active chat");
              } catch (e) {
                console.warn("[BOOTSTRAP] No messages found for this chat:", e);
              }
            } else {
              console.log(`[BOOTSTRAP] Using cached messages for chat ${active.id} (${messages[active.id].length} messages)`);
            }
          }
          
          console.log("[BOOTSTRAP] Complete");
        } catch (e) {
          console.error("[BOOTSTRAP] Fatal error:", e);
        }
      },

      loadChatsFromServer: async () => {
        try {
          const chats = await apiListChats();
          if (!chats.length) {
            console.log("[LOAD_CHATS] No chats found on server");
            return; // Keep existing local chats if any
          }
          chats.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
          
          // Preserve existing messages when updating threads
          set((s) => ({ 
            threads: chats,
            // Keep existing messages
            messages: s.messages,
          }));
          
          console.log(`[LOAD_CHATS] Loaded ${chats.length} chats from server`);
        } catch (e: any) {
          console.error("[LOAD_CHATS] Error:", e.message);
          throw e;
        }
      },

      loadMessagesFromServer: async (tid: string) => {
        console.log(`[LOAD_MESSAGES] Loading messages for chat ${tid}`);
        const msgs = await apiListMessages(tid);
        console.log(`[LOAD_MESSAGES] Got ${msgs.length} messages from server`);
        set((s) => {
          const updated = { ...s.messages, [tid]: msgs };
          console.log(`[LOAD_MESSAGES] Message arrays after update: ${Object.keys(updated).length} chats`);
          return { messages: updated };
        });
      },

      loadProjectsFromServer: async () => {
        try {
          const projects = await apiListProjects();
          set({ projects });
          console.log(`[LOAD_PROJECTS] Loaded ${projects.length} projects from server`);
        } catch (e: any) {
          console.error("[LOAD_PROJECTS] Error:", e.message);
          throw e;
        }
      },

      syncProjectToServer: async (projectId: string, name: string) => {
        try {
          await apiCreateProject(projectId, name);
        } catch (e) {
          console.error("Failed to sync project to server:", e);
        }
      },

      setCurrentThread: (id) => {
        console.log(`[STORE] Switching to thread ${id}`);
        set({ currentThreadId: id });
        
        // Auto-load messages if not already loaded
        const { messages } = get();
        if (!messages[id] || messages[id].length === 0) {
          console.log(`[STORE] Auto-loading messages for thread ${id}`);
          get().loadMessagesFromServer(id).catch((e) => {
            console.error(`[STORE] Failed to load messages for thread ${id}:`, e);
          });
        } else {
          console.log(`[STORE] Using cached messages for thread ${id} (${messages[id].length} messages)`);
        }
      },

      /* ---------------- Chat Actions ---------------- */
      newThread: async (projectId) => {
        const title = `Chat ${(get().threads?.length || 0) + 1}`;
        let created: Thread;
        try {
          created = await apiCreateChat(title, projectId);
        } catch (e) {
          console.error("Failed to create chat on server:", e);
          throw e;
        }

        set((s) => ({
          threads: [created, ...s.threads],
          messages: { ...s.messages, [created.id]: [] },
          currentThreadId: created.id,
          draftFiles: [],
          stream: { isStreaming: false },
        }));
        return created.id;
      },

      deleteChat: async (id) => {
        try {
          await apiDeleteChat(id);
          set((s) => {
            const newThreads = s.threads.filter((t) => t.id !== id);
            const newMessages = { ...s.messages };
            delete newMessages[id];
            return {
              threads: newThreads,
              messages: newMessages,
              currentThreadId: s.currentThreadId === id ? newThreads[0]?.id : s.currentThreadId,
            };
          });
        } catch (e) {
          console.error("Failed to delete chat:", e);
          throw e;
        }
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
          const res = await fetch(`${BASE_URL}/api/chat/stream`, {
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
        // Sync to server
        get().syncProjectToServer(id, name);
        return id;
      },
      renameProject: async (id, name) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, name, updatedAt: now() } : p
          ),
        }));
        // Sync to server
        try {
          await apiRenameProject(id, name);
        } catch (e) {
          console.error("Failed to rename project on server:", e);
        }
      },
      deleteProject: async (id) => {
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          threads: s.threads.map((t) =>
            t.projectId === id ? { ...t, projectId: undefined } : t
          ),
          currentProjectFilter:
            s.currentProjectFilter === id ? undefined : s.currentProjectFilter,
        }));
        // Sync to server
        try {
          await apiDeleteProject(id);
        } catch (e) {
          console.error("Failed to delete project on server:", e);
        }
      },
      assignThreadToProject: async (tid, pid) => {
        console.log(`[STORE] assignThreadToProject called: tid=${tid}, pid=${pid}`);
        set((s) => ({
          threads: s.threads.map((t) =>
            t.id === tid ? { ...t, projectId: pid, updatedAt: Date.now() } : t
          ),
        }));
        // Sync to server
        try {
          console.log(`[STORE] Calling apiUpdateChatProject...`);
          await apiUpdateChatProject(tid, pid || null);
          console.log(`[STORE] Successfully updated chat project on server`);
        } catch (e) {
          console.error("[STORE] Failed to update chat project on server:", e);
          throw e; // Re-throw so caller can handle
        }
      },
      setProjectFilter: (pid) => set({ currentProjectFilter: pid }),

      /* ---------------- Search ---------------- */
      searchChats: () => [],
    }),
    {
      name: "irisarc-store",
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          // Synchronous storage - use clientside only
          if (typeof window === "undefined") return null;
          
          // Try to get userId from localStorage (set during login)
          const userId = localStorage.getItem("current_user_id");
          if (!userId) {
            console.warn("[STORE] No user ID found in localStorage");
            return null;
          }
          
          const key = `${name}-user-${userId}`;
          const item = localStorage.getItem(key);
          if (item) {
            console.log(`[STORE] Loaded state for user ${userId}`);
          }
          return item;
        },
        setItem: (name, value) => {
          if (typeof window === "undefined") return;
          
          const userId = localStorage.getItem("current_user_id");
          if (!userId) {
            console.warn("[STORE] No user ID found, cannot save state");
            return;
          }
          
          const key = `${name}-user-${userId}`;
          localStorage.setItem(key, value);
          console.log(`[STORE] Saved state for user ${userId}`);
        },
        removeItem: (name) => {
          if (typeof window === "undefined") return;
          
          const userId = localStorage.getItem("current_user_id");
          if (!userId) return;
          
          const key = `${name}-user-${userId}`;
          localStorage.removeItem(key);
          console.log(`[STORE] Removed state for user ${userId}`);
        },
      })),
      version: 3,
      migrate: (persistedState: any, version: number) => {
        console.log(`[STORE] Migrating from version ${version} to 3`);
        
        // If coming from version 2 or earlier, preserve what we can
        if (version < 3) {
          return {
            ...persistedState,
            threads: persistedState.threads || [],
            messages: persistedState.messages || {},
            projects: persistedState.projects || [],
            currentThreadId: persistedState.currentThreadId,
          };
        }
        
        return persistedState as any;
      },
      partialize: (state) => ({
        // Persist UI preferences AND data for offline/reload support
        prefs: state.prefs,
        leftSidebarOpen: state.leftSidebarOpen,
        rightRailOpen: state.rightRailOpen,
        composerHeight: state.composerHeight,
        currentProjectFilter: state.currentProjectFilter,
        threads: state.threads,
        messages: state.messages,
        projects: state.projects,
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

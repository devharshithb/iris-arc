"use client";

import type { Message, Thread } from "@/lib/types";

/* -------------------------------------------------------------------------- */
/*                            Backend Base Config                              */
/* -------------------------------------------------------------------------- */
const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://127.0.0.1:8000/api";


/**
 * Helper wrapper for fetch that automatically includes
 * Authorization header if token exists.
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  if (!token && typeof window !== "undefined") {
    console.warn("⚠️ No access token found in localStorage for endpoint:", endpoint);
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  // Handle expired or invalid tokens
  if (res.status === 401) {
    console.warn("⚠️ Unauthorized (401) — clearing local tokens.");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    // optional: redirect to login page
  }

  return res;
}

/* -------------------------------------------------------------------------- */
/*                           Backend ↔ Frontend Mappers                        */
/* -------------------------------------------------------------------------- */
function mapChat(c: any): Thread {
  return {
    id: String(c.id),
    title: c.title,
    createdAt: new Date(c.created_at).getTime(),
    updatedAt: new Date(c.updated_at).getTime(),
    agentMode: "single",
    participants: ["assistant", "user"],
  };
}

function mapMessage(m: any, chatId: string): Message {
  return {
    id: String(m.id),
    threadId: chatId,
    role: m.role,
    parts: [{ kind: "text", text: m.content }],
    createdAt: new Date(m.created_at).getTime(),
  };
}

/* -------------------------------------------------------------------------- */
/*                                   Chats                                     */
/* -------------------------------------------------------------------------- */
export async function listChats(): Promise<Thread[]> {
  const r = await apiFetch("/chats");
  if (!r.ok) throw new Error(`listChats failed: ${r.status}`);
  const data = await r.json();
  return (data.items ?? []).map(mapChat);
}

export async function createChat(title = "New Chat"): Promise<Thread> {
  const r = await apiFetch("/chats", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
  if (!r.ok) throw new Error(`createChat failed: ${r.status}`);
  const c = await r.json();
  return mapChat(c);
}

export async function renameChat(id: string, title: string): Promise<void> {
  const r = await apiFetch(`/chats/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ title }),
  });
  if (!r.ok) throw new Error(`renameChat failed: ${r.status}`);
}

export async function deleteChat(id: string): Promise<void> {
  const r = await apiFetch(`/chats/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error(`deleteChat failed: ${r.status}`);
}

/* -------------------------------------------------------------------------- */
/*                                  Messages                                   */
/* -------------------------------------------------------------------------- */
export async function listMessages(chatId: string): Promise<Message[]> {
  const r = await apiFetch(`/chats/${chatId}/messages`);
  if (!r.ok) throw new Error(`listMessages failed: ${r.status}`);
  const data = await r.json();
  return (data.items ?? []).map((m: any) => mapMessage(m, chatId));
}

export async function addMessage(
  chatId: string,
  content: string
): Promise<Message> {
  const r = await apiFetch(`/chats/${chatId}/messages`, {
    method: "POST",
    body: JSON.stringify({ role: "user", content }),
  });

  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`addMessage failed: ${r.status} - ${txt}`);
  }

  const data = await r.json();
  return mapMessage(data, chatId);
}

export async function addAssistantMessage(
  chatId: string,
  content: string
): Promise<Message> {
  const r = await apiFetch(`/chats/${chatId}/messages`, {
    method: "POST",
    body: JSON.stringify({ role: "assistant", content }),
  });

  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`addAssistantMessage failed: ${r.status} - ${txt}`);
  }

  const data = await r.json();
  return mapMessage(data, chatId);
}

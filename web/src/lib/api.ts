"use client";

import { getSession } from "next-auth/react";
const BASE =
  (process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://127.0.0.1:8000")



/**
 * Centralized fetch wrapper for IrisArc backend
 * - Attaches Bearer token automatically
 * - Retries once if token expired (401/403)
 * - Waits for NextAuth session to restore after refresh
 */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const getTokens = async () => {
    const session = await getSession();
    const access = (session as any)?.backend?.accessToken ?? null;
    const refresh = (session as any)?.backend?.refreshToken ?? null;
    return { access, refresh };
  };

  // Wait for session restoration (up to ~2s)
  let { access, refresh } = await getTokens();
  if (!access) {
    for (let i = 0; i < 5; i++) {
      await new Promise((r) => setTimeout(r, 400));
      const t = await getTokens();
      if (t.access) {
        access = t.access;
        refresh = t.refresh;
        break;
      }
    }
  }

  const withAuth = (headers: HeadersInit = {}) =>
    access ? { ...headers, Authorization: `Bearer ${access}` } : headers;

  // 🔹 First request
  const res1 = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
      ...withAuth(init.headers),
    },
  });

  if (res1.ok) return res1;

  // 🔹 Retry on 401/403 if refresh token available
  if ((res1.status === 401 || res1.status === 403) && refresh) {
    try {
      const r = await fetch(`${BASE}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refresh }),
      });
      if (!r.ok) return res1;

      const data = await r.json();
      const newAccess = data.access_token as string;

      // Broadcast new token to any listener (like Zustand)
      window.dispatchEvent(
        new CustomEvent("iris-token-refreshed", { detail: { access: newAccess } })
      );

      // 🔁 Retry original request
      const res2 = await fetch(`${BASE}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(init.headers || {}),
          Authorization: `Bearer ${newAccess}`,
        },
      });
      return res2;
    } catch (err) {
      console.warn("[apiFetch] token refresh failed:", err);
      return res1;
    }
  }

  return res1;
}

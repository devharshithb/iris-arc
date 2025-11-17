"use client";

import { useAppStore } from "@/lib/store";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

/**
 * AppBootstrapper
 * ----------------
 * Automatically syncs NextAuth tokens → localStorage → Zustand store.
 * Ensures backend bootstrap runs only once when authenticated.
 */
export default function AppBootstrapper() {
   const { data: session, status } = useSession();
   const bootstrappedRef = useRef(false);

   useEffect(() => {
      if (status === "authenticated" && session && !bootstrappedRef.current) {
         // Accept both custom .backend tokens or direct token fields
         const backend = (session as any)?.backend ?? session;
         const accessToken =
            backend?.accessToken || backend?.access_token || undefined;
         const refreshToken =
            backend?.refreshToken || backend?.refresh_token || undefined;
         const userId = (session.user as any)?.id;

         // Only bootstrap if we have a valid access token
         if (!accessToken) {
            console.warn("⚠️ Session authenticated but no access token found");
            return;
         }

         if (accessToken) localStorage.setItem("access_token", accessToken);
         if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
         
         // Store user ID for user-scoped localStorage
         if (userId) {
            localStorage.setItem("current_user_id", String(userId));
            console.log(`[AUTH] Set current_user_id to ${userId}`);
         }

         console.log("🔐 Tokens synced to localStorage");
         console.log("🔄 Bootstrapping chats from backend…");

         // Mark as bootstrapped before calling to prevent double-calls
         bootstrappedRef.current = true;

         // Run bootstrap with a small delay to ensure session is fully ready
         setTimeout(() => {
            useAppStore.getState().bootstrapAfterLogin().catch((e) => {
               console.error("Bootstrap failed:", e);
               bootstrappedRef.current = false; // Reset on failure so it can retry
            });
         }, 100);
      }
   }, [status, session]);

   // Reset flag on logout
   useEffect(() => {
      if (status === "unauthenticated") {
         bootstrappedRef.current = false;
         // Clear user ID on logout
         localStorage.removeItem("current_user_id");
      }
   }, [status]);

   return null;
}

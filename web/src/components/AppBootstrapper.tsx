"use client";

import { useAppStore } from "@/lib/store";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

/**
 * AppBootstrapper
 * ----------------
 * Automatically syncs NextAuth tokens → localStorage → Zustand store.
 * Ensures backend bootstrap runs only once when authenticated.
 * 
 * Fixes race condition where tokens weren't available before API calls.
 */
export default function AppBootstrapper() {
   const { data: session, status } = useSession();
   const hasBootstrapped = useRef(false);

   useEffect(() => {
      if (status === "authenticated" && !hasBootstrapped.current) {
         // Accept both custom .backend tokens or direct token fields
         const backend = (session as any)?.backend ?? session;
         const accessToken =
            backend?.accessToken || backend?.access_token || undefined;
         const refreshToken =
            backend?.refreshToken || backend?.refresh_token || undefined;

         if (!accessToken) {
            console.warn("⚠️ No access token found in session, skipping bootstrap");
            return;
         }

         // Synchronously write tokens to localStorage BEFORE calling bootstrap
         localStorage.setItem("access_token", accessToken);
         if (refreshToken) {
            localStorage.setItem("refresh_token", refreshToken);
         }

         console.log("🔐 Tokens synced to localStorage");
         console.log("🔄 Bootstrapping chats from backend…");

         // Mark as bootstrapped before calling to prevent duplicate runs
         hasBootstrapped.current = true;

         // Small delay to ensure localStorage write is complete
         setTimeout(() => {
            useAppStore.getState().bootstrapAfterLogin();
         }, 0);
      }
      
      // Reset bootstrap flag when user logs out
      if (status === "unauthenticated") {
         hasBootstrapped.current = false;
      }
   }, [status, session]);

   return null;
}
// Test

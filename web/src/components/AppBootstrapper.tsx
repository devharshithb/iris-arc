"use client";

import { useAppStore } from "@/lib/store";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

/**
 * AppBootstrapper
 * ----------------
 * Automatically syncs NextAuth tokens → localStorage → Zustand store.
 * Ensures backend bootstrap runs only once when authenticated.
 */
export default function AppBootstrapper() {
   const { data: session, status } = useSession();

   useEffect(() => {
      if (status === "authenticated") {
         // Accept both custom .backend tokens or direct token fields
         const backend = (session as any)?.backend ?? session;
         const accessToken =
            backend?.accessToken || backend?.access_token || undefined;
         const refreshToken =
            backend?.refreshToken || backend?.refresh_token || undefined;

         if (accessToken) localStorage.setItem("access_token", accessToken);
         if (refreshToken) localStorage.setItem("refresh_token", refreshToken);

         console.log("🔐 Tokens synced to localStorage");
         console.log("🔄 Bootstrapping chats from backend…");

         // Run only once per auth session
         useAppStore.getState().bootstrapAfterLogin();
      }
   }, [status, session]);

   return null;
}

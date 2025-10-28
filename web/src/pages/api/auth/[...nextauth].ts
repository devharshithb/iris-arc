/// <reference path="../../../types/next-auth.d.ts" />
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

/* -------------------------------------------------------------------------- */
/*                               Custom Typings                               */
/* -------------------------------------------------------------------------- */
interface ExtendedToken {
  id?: string;
  email?: string;
  name?: string;
  picture?: string;
  backend?: {
    accessToken: string;
    refreshToken: string;
  };
  accessExp?: number;
}

/* -------------------------------------------------------------------------- */
/*                              Backend Base URL                              */
/* -------------------------------------------------------------------------- */
const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://127.0.0.1:8000";

/* -------------------------------------------------------------------------- */
/*                            NextAuth Configuration                          */
/* -------------------------------------------------------------------------- */
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },

  providers: [
    /* ---- Google OAuth ---- */
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),

    /* ---- FastAPI Credentials ---- */
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@org.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const res = await fetch(`${BACKEND}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
          });

          if (!res.ok) return null;
          const data = await res.json();

          // ✅ Expected shape:
          // { access_token, refresh_token, token_type, user: {...} }
          return {
            id: String(data.user.id),
            email: data.user.email,
            name: data.user.name,
            backend: {
  accessToken: data.access_token,
  refreshToken: data.refresh_token,
},

            provider: "credentials",
          } as any;
        } catch (err) {
          console.error("[NextAuth] Login failed:", err);
          return null;
        }
      },
    }),
  ],

  /* -------------------------------------------------------------------------- */
  /*                                JWT CALLBACK                                */
  /* -------------------------------------------------------------------------- */
  callbacks: {
    async jwt({ token, user, account, profile }) {
      const t = token as ExtendedToken;
      const now = Math.floor(Date.now() / 1000);

      // --- On first login (Credentials or Google) ---
      if (user) {
           t.backend = (user as any).backend ?? t.backend;
      }

      // --- Google OAuth: sync with FastAPI ---
      if (account?.provider === "google" && profile) {
        const p = profile as Record<string, any>;
        t.picture = p.picture ?? t.picture;

        try {
          const res = await fetch(`${BACKEND}/auth/google-sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: p.email,
              name: p.name || p.email?.split("@")[0],
            }),
          });

          if (res.ok) {
            const data = await res.json();
            t.backend = {
              accessToken: data.access_token,
              refreshToken: data.refresh_token,
            };
            t.accessExp = now + 15 * 60;
            t.id = String(data.user.id);
          } else {
            console.warn("[NextAuth] Google sync failed:", res.status);
          }
        } catch (err) {
          console.warn("[NextAuth] Google sync error:", err);
        }
      }

      // --- Refresh expired access token automatically ---
      if (t.accessExp && now > t.accessExp - 60 && t.backend?.refreshToken) {
        try {
          const r = await fetch(`${BACKEND}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              refresh_token: t.backend.refreshToken,
            }),
          });

          if (r.ok) {
            const data = await r.json();
            t.backend.accessToken = data.access_token;
            t.backend.refreshToken = data.refresh_token;
            t.accessExp = now + 15 * 60;
            console.log("[NextAuth] Access token refreshed successfully");
          } else {
            console.warn("[NextAuth] Refresh token invalid:", r.status);
          }
        } catch (err) {
          console.error("[NextAuth] Token refresh error:", err);
        }
      }

      return t as any;
    },

    /* ---------------------------------------------------------------------- */
    /*                           SESSION CALLBACK                             */
    /* ---------------------------------------------------------------------- */
    async session({ session, token }) {
      const t = token as ExtendedToken;

      // ✅ Expose backend tokens to the client
      (session as any).backend = {
        accessToken: t.backend?.accessToken || null,
        refreshToken: t.backend?.refreshToken || null,
      };

      // ✅ Sync basic user data
      if (session.user) {
        session.user.name = t.name || session.user.name || "";
        session.user.email = t.email || session.user.email || "";
        (session.user as any).image = t.picture || null;
        (session.user as any).id = t.id || null;
      }

      // ✅ Persist tokens in localStorage for Zustand / apiFetch
      // if (typeof window !== "undefined") {
      //   try {
      //     if ((session as any).backend?.accessToken) {
      //       localStorage.setItem(
      //         "access_token",
      //         (session as any).backend.accessToken
      //       );
      //     }
      //     if ((session as any).backend?.refreshToken) {
      //       localStorage.setItem(
      //         "refresh_token",
      //         (session as any).backend.refreshToken
      //       );
      //     }
      //   } catch (e) {
      //     console.warn("LocalStorage write failed:", e);
      //   }
      // }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);

import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

/**
 * Extend the built-in Session and JWT types
 * so TypeScript recognizes `session.backend`
 * and `token.backend` from our NextAuth config.
 */
declare module "next-auth" {
  interface Session {
    backend?: {
      accessToken: string | null;
      refreshToken: string | null;
    };
  }

  interface User extends DefaultUser {
    id?: string;
    name?: string;
    email?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    backend?: {
      accessToken: string | null;
      refreshToken: string | null;
    };
    id?: string;
    name?: string;
    email?: string;
    picture?: string;
  }
}

import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

// next-auth module //
declare module "next-auth" {
  // User object (only exists on FIRST sign-in) Comes from DB / adapter //
  interface User extends DefaultUser {
    username: string;
    role?: string;
    plan?: "FREE" | "PRO";
  }

  // Session object (what you use in app) //
  interface Session {
    user: {
      id: string; // 👈 always needed
      username: string;
      role?: string;
      plan?: "FREE" | "PRO";
    } & DefaultSession["user"];
  }
}

// JWT module //
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string; // 👈 required after login
    username: string;
    role?: string;
    plan?: "FREE" | "PRO";
  }
}

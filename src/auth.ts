import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Adapter } from "next-auth/adapters";
import { loginSchema } from "./lib/validators/auth";

// -------------------------
// Validation schema
// -------------------------

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as unknown as Adapter, // changed
  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        // 1️⃣ Validate input safely
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // 2️⃣ Fetch user
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) return null;

        // 3️⃣ Verify password
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        // 4️⃣ MUST return full user object
        return user;
      },
    }),
  ],

  callbacks: {
    // -------------------------
    // JWT callback
    // Runs:
    // - once on sign-in (user exists)
    // - every request after (user undefined)
    // -------------------------
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.plan = user.plan;
        // name & email are already handled by NextAuth defaults
      }
      return token;
    },

    // -------------------------
    // Session callback
    // What your app actually uses
    // -------------------------
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
        session.user.plan = token.plan as "FREE" | "PRO" | undefined;
        // name & email already exist
      }
      return session;
    },
  },
});

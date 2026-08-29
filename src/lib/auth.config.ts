import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "USER";
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  }

  interface User {
    role?: string;
  }
}

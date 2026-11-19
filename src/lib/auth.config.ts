import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "super-secret-auth-key-change-this-in-production-min-32-chars",
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "TEKNISI" | "CUSTOMER";
        session.user.phone = (token.phone as string) || null;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;

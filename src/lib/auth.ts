import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
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
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        try {
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user || !user.password) {
            return null;
          }

          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
          };
        } catch (dbError: unknown) {
          console.error("Database connection error during login:", dbError);
          const msg = dbError instanceof Error ? dbError.message : String(dbError);
          if (msg.includes("tenant") || msg.includes("Can't reach database") || msg.includes("P1001")) {
            throw new Error("DATABASE_PAUSED: Database Supabase sedang tidak aktif (paused). Silakan unpause/resume project di dashboard Supabase.");
          }
          throw dbError;
        }
      },
    }),
  ],
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
});

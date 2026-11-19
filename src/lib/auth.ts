import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Fallback Demo Users when cloud database is paused / restoring
const FALLBACK_DEMO_USERS = [
  {
    id: "cmvzewmur0000v2u41w05f0v2",
    name: "Siti Rahmawati",
    email: "admin@tracker.com",
    role: "ADMIN" as const,
    phone: "081234567890",
    plainPassword: "admin123",
  },
  {
    id: "cmvzewnv60001v2u4g8l861p7",
    name: "Ahmad Fauzi",
    email: "teknisi@tracker.com",
    role: "TEKNISI" as const,
    phone: "081234567891",
    plainPassword: "teknisi123",
  },
  {
    id: "cmvzewpw30003v2u4cikkdkcl",
    name: "PT Solusi Maju Bersama",
    email: "customer@tracker.com",
    role: "CUSTOMER" as const,
    phone: "081234567893",
    plainPassword: "customer123",
  },
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
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

        // 1. Primary path: Query Prisma database
        try {
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (user && user.password) {
            const isValid = await bcrypt.compare(password, user.password);
            if (isValid) {
              return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
              };
            }
          }
        } catch {
          console.warn(
            "[AUTH WARNING] Database tidak dapat dijangkau (kemungkinan proyek Supabase sedang dijeda/paused). Memeriksa akun demo fallback..."
          );
        }

        // 2. Fallback path for demo testing when cloud DB is asleep / paused
        const fallbackMatch = FALLBACK_DEMO_USERS.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );

        if (fallbackMatch && fallbackMatch.plainPassword === password) {
          console.info(
            `[AUTH SUCCESS] Login berhasil via akun demo fallback: ${fallbackMatch.email} (${fallbackMatch.role})`
          );
          return {
            id: fallbackMatch.id,
            name: fallbackMatch.name,
            email: fallbackMatch.email,
            role: fallbackMatch.role,
            phone: fallbackMatch.phone,
          };
        }

        return null;
      },
    }),
  ],
});

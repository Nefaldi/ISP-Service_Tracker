import { Role } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
    phone?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      phone?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    phone?: string | null;
  }
}

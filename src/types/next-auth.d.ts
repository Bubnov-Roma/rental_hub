import { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import type { Role } from "@prisma/client";
import type { AdapterUser as DefaultAdapterUser } from "@auth/core/adapters";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      nickname?: string | null;
      companyName?: string | null;
      phone?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role: Role;
    nickname?: string | null;
    companyName?: string | null;
    phone?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: Role;
    nickname?: string | null;
    companyName?: string | null;
    phone?: string | null;
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser extends DefaultAdapterUser {
    role: Role;
    nickname?: string | null;
    companyName?: string | null;
    phone?: string | null;
  }
}
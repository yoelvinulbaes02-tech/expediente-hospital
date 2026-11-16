import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface User {
    role?: string
    residencyId?: string | null
  }

  interface Session {
    user: {
      id: string
      role: string
      residencyId: string | null
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    residencyId: string | null
  }
}

import { DefaultSession } from "next-auth"
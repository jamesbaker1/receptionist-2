import { DefaultSession, DefaultUser } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    refreshToken?: string
    clioRegion?: string
    user: {
      clioId?: string
      firmId?: string
      firmName?: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    clioId?: string
    firmId?: string
    firmName?: string
    role?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
    clioId?: string
    firmId?: string
    firmName?: string
    clioRegion?: string
  }
} 
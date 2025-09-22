
import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      age?: number
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    age?: number
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    age?: number
  }
}

import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import { compare } from "bcryptjs"
import { sign } from "jsonwebtoken"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string | null
      role: string
    }
  }

  interface User {
    id: string
    email: string
    name: string | null
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    name: string | null
    role: string
  }
}

interface JWTPayload {
  id: string
  email: string
  name: string | null
  role: string
  [key: string]: unknown
}

export function signJwtAccessToken(payload: JWTPayload) {
  const secret = process.env.NEXTAUTH_SECRET || ""
  const token = sign(payload, secret, {
    expiresIn: "1d"
  })
  return token
}

/**
 * NextAuth configuration options
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user) {
          console.log("User not found:", credentials.email)
          throw new Error("Invalid credentials")
        }

        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          console.log("Invalid password for user:", credentials.email)
          throw new Error("Invalid credentials")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.name = token.name
        session.user.role = token.role
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
} 
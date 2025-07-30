import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import type { NextAuthConfig } from "next-auth"

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  interface User {
    id: string
  }
}

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          userId: user.id,
        }
      }

      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.userId as string
        session.accessToken = token.accessToken as string
      }

      return session
    },
    async signIn({ user, account, profile }) {
      // Allow OAuth account linking and creation
      if (account?.provider === "google") {
        return !!(profile?.email && profile.email_verified)
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

// Helper function to get server-side session
export const getServerSession = auth

// Types for client-side usage
export type AuthSession = Awaited<ReturnType<typeof auth>>

// Custom error types
export class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = "AuthError"
  }
}

// Auth utilities
export const isAuthenticated = (session: AuthSession): boolean => {
  return !!session?.user
}

export const getUserId = (session: AuthSession): string | null => {
  return session?.user?.id || null
}

export const getUserEmail = (session: AuthSession): string | null => {
  return session?.user?.email || null
} 
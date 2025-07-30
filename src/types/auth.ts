import type { DefaultSession, DefaultUser } from 'next-auth'
import type { JWT, DefaultJWT } from 'next-auth/jwt'

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    } & DefaultSession['user']
    accessToken?: string
  }

  interface User extends DefaultUser {
    id: string
  }
}

// Extend the built-in JWT types
declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    userId?: string
    accessToken?: string
    refreshToken?: string
  }
}

// Custom auth error types
export interface AuthError {
  name: string
  message: string
  code?: string
  status?: number
}

// Sign in page props
export interface SignInPageProps {
  params: {
    locale: string
  }
  searchParams: {
    callbackUrl?: string
    error?: string
  }
}

// Provider types
export type AuthProvider = 'google'

export interface AuthProviderConfig {
  id: AuthProvider
  name: string
  type: 'oauth'
  authorization?: {
    params: {
      prompt?: string
      access_type?: string
      response_type?: string
    }
  }
}

// Session status
export type SessionStatus = 'authenticated' | 'unauthenticated' | 'loading'

// Auth context types
export interface AuthContextType {
  session: Session | null
  status: SessionStatus
  signIn: (provider?: string, options?: any) => Promise<void>
  signOut: (options?: any) => Promise<void>
}

// User role types (for future use)
export type UserRole = 'user' | 'admin' | 'premium'

export interface ExtendedUser extends DefaultUser {
  id: string
  role?: UserRole
  createdAt?: Date
  updatedAt?: Date
}

// OAuth profile types
export interface GoogleProfile {
  sub: string
  name: string
  given_name: string
  family_name: string
  picture: string
  email: string
  email_verified: boolean
  locale: string
}

// Auth callback types
export interface AuthCallbacks {
  signIn?: (params: {
    user: User
    account: Account | null
    profile?: GoogleProfile
    email?: { verificationRequest?: boolean }
    credentials?: Record<string, any>
  }) => Promise<boolean | string>
  
  redirect?: (params: {
    url: string
    baseUrl: string
  }) => Promise<string>
  
  jwt?: (params: {
    token: JWT
    user?: User
    account?: Account | null
    profile?: GoogleProfile
    isNewUser?: boolean
  }) => Promise<JWT>
  
  session?: (params: {
    session: Session
    token: JWT
    user?: User
  }) => Promise<Session>
}

// Account type (OAuth)
export interface Account {
  provider: string
  type: string
  providerAccountId: string
  access_token?: string
  refresh_token?: string
  expires_at?: number
  token_type?: string
  scope?: string
  id_token?: string
} 
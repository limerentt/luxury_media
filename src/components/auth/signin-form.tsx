'use client'

import React from 'react'
import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

interface SignInFormProps {
  callbackUrl?: string
  error?: string
}

const GoogleLoginButton: React.FC<{
  callbackUrl?: string
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}> = ({ callbackUrl = '/', isLoading, setIsLoading }) => {
  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      await signIn('google', { callbackUrl })
    } catch (error) {
      console.error('Google sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleSignIn}
      disabled={isLoading}
      className="
        w-full flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm
        bg-white text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 
        focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
      "
    >
      <div className="flex items-center">
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-3" />
        ) : (
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        <span>
          {isLoading ? 'Signing in...' : 'Continue with Google'}
        </span>
      </div>
    </motion.button>
  )
}

export default function SignInForm({ callbackUrl, error }: SignInFormProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'OAuthSignin':
        return 'Error in constructing an authorization URL.'
      case 'OAuthCallback':
        return 'Error in handling the response from an OAuth provider.'
      case 'OAuthCreateAccount':
        return 'Could not create OAuth account.'
      case 'EmailCreateAccount':
        return 'Could not create email account.'
      case 'Callback':
        return 'Error in the OAuth callback handler route.'
      case 'OAuthAccountNotLinked':
        return 'Email on the account is already linked, but not with this OAuth account.'
      case 'EmailSignin':
        return 'Sending the e-mail with the verification token failed.'
      case 'CredentialsSignin':
        return 'The authorize callback returned null in the Credentials provider.'
      case 'SessionRequired':
        return 'You must be signed in to view this page.'
      default:
        return 'An error occurred during sign in. Please try again.'
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/10 border border-destructive/20 rounded-md p-4"
        >
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-destructive mr-2" />
            <p className="text-sm text-destructive">
              {getErrorMessage(error)}
            </p>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        <GoogleLoginButton 
          callbackUrl={callbackUrl}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Secure sign in with Google
            </span>
          </div>
        </div>
        
        <div className="text-center text-xs text-muted-foreground">
          <p>
            By signing in, you agree to our{' '}
            <a href="/terms" className="underline hover:text-foreground">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
} 
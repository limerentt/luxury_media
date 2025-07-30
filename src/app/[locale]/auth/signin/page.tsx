import React from 'react'
import { getServerSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SignInForm from '@/components/auth/signin-form'

interface Props {
  params: { locale: string }
  searchParams: { callbackUrl?: string; error?: string }
}

export default async function SignInPage({ params: { locale }, searchParams }: Props) {
  const session = await getServerSession()
  
  // If user is already signed in, redirect to dashboard or callback URL
  if (session?.user) {
    const callbackUrl = searchParams.callbackUrl || `/${locale}/dashboard`
    redirect(callbackUrl)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-yellow-500/5">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold luxury-text-gradient">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your luxury account
          </p>
        </div>
        
        <SignInForm 
          callbackUrl={searchParams.callbackUrl}
          error={searchParams.error}
        />
      </div>
    </div>
  )
} 
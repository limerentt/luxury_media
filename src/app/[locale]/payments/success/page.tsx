import React from 'react'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ session_id?: string }>
}

// Simple Button component
const Button: React.FC<{
  children: React.ReactNode
  variant?: 'default' | 'outline'
  className?: string
  href?: string
}> = ({ children, variant = 'default', className = '', href }) => {
  const cn = (...classes: (string | undefined | null | boolean)[]) => {
    return classes.filter(Boolean).join(' ')
  }

  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring px-6 py-3'
  
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  }

  if (href) {
    return (
      <Link href={href} className={cn(baseClasses, variants[variant], className)}>
        {children}
      </Link>
    )
  }
  
  return (
    <button className={cn(baseClasses, variants[variant], className)}>
      {children}
    </button>
  )
}

export default async function PaymentSuccessPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { session_id } = await searchParams
  const session = await auth()
  
  // Redirect if not authenticated
  if (!session?.user) {
    redirect(`/${locale}/auth/signin`)
  }

  let checkoutSession = null
  let error = null

  // Retrieve checkout session if session_id is provided
  if (session_id) {
    try {
      checkoutSession = await stripe().checkout.sessions.retrieve(session_id)
    } catch (err) {
      console.error('Error retrieving checkout session:', err)
      error = 'Failed to retrieve payment details'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-yellow-500/5 p-4">
      <div className="max-w-md w-full">
        <div className="text-center space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-green-600">
              Payment Successful!
            </h1>
            <p className="text-lg text-muted-foreground">
              Welcome to your premium luxury account
            </p>
          </div>

          {/* Payment Details */}
          {checkoutSession && (
            <div className="bg-card border rounded-lg p-6 text-left space-y-3">
              <h3 className="font-semibold text-lg mb-4">Payment Details</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{checkoutSession.customer_details?.email}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span>
                    ${(checkoutSession.amount_total! / 100).toFixed(2)} {checkoutSession.currency?.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status:</span>
                  <span className="text-green-600 font-medium">Paid</span>
                </div>
                
                {checkoutSession.metadata?.planType && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan:</span>
                    <span className="font-medium capitalize">
                      {checkoutSession.metadata.planType} Plan
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <h3 className="font-semibold mb-2">What's Next?</h3>
            <ul className="text-sm text-left space-y-1 text-muted-foreground">
              <li>• Access your dashboard to start creating</li>
              <li>• Explore premium features and templates</li>
              <li>• Generate high-quality AI media content</li>
              <li>• Manage your subscription anytime</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              href={`/${locale}/dashboard`}
              className="luxury-gradient text-black font-semibold flex-1"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <Button 
              variant="outline"
              href={`/${locale}`}
              className="flex-1"
            >
              Back to Home
            </Button>
          </div>

          {/* Support */}
          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">
              Need help?{' '}
              <Link 
                href={`/${locale}/support`} 
                className="text-yellow-600 hover:text-yellow-700 underline"
              >
                Contact our support team
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 
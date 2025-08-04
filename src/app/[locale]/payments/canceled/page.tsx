import React from 'react'
import Link from 'next/link'
import { XCircle, ArrowLeft, RefreshCw, HelpCircle } from 'lucide-react'
import { auth } from '@/lib/auth'

interface Props {
  params: Promise<{ locale: string }>
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

export default async function PaymentCanceledPage({ params }: Props) {
  const { locale } = await params
  const session = await auth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-red-500/5 p-4">
      <div className="max-w-md w-full">
        <div className="text-center space-y-6">
          {/* Canceled Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Canceled Message */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-red-600">
              Payment Canceled
            </h1>
            <p className="text-lg text-muted-foreground">
              Your payment was not processed
            </p>
          </div>

          {/* Explanation */}
          <div className="bg-card border rounded-lg p-6 text-left">
            <h3 className="font-semibold text-lg mb-3">What happened?</h3>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                You canceled the payment process before it was completed. 
                This means no charges were made to your account.
              </p>
              
              <p>
                If this was unintentional, you can try again at any time. 
                Your selected plan will still be available.
              </p>
            </div>
          </div>

          {/* Reasons for cancellation */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="text-left">
                <h3 className="font-semibold mb-2 text-amber-800 dark:text-amber-200">
                  Common reasons for cancellation:
                </h3>
                <ul className="text-sm space-y-1 text-amber-700 dark:text-amber-300">
                  <li>• Changed your mind about the subscription</li>
                  <li>• Want to compare different plans</li>
                  <li>• Payment method issues</li>
                  <li>• Accidentally closed the payment window</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              href={`/${locale}#pricing`}
              className="luxury-gradient text-black font-semibold flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Button 
              variant="outline"
              href={`/${locale}`}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>

          {/* Alternative actions */}
          {session?.user && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                Already have an account?
              </p>
              <Button 
                variant="outline"
                href={`/${locale}/dashboard`}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          )}

          {/* Support */}
          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">
              Having trouble with payments?{' '}
              <Link 
                href={`/${locale}/support`} 
                className="text-yellow-600 hover:text-yellow-700 underline"
              >
                Contact our support team
              </Link>
            </p>
          </div>

          {/* Security Notice */}
          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-xs text-muted-foreground">
              🔒 Your financial information is secure. No payment details are stored 
              when you cancel a transaction.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 
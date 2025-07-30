'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

// Simple utility function
const cn = (...classes: (string | undefined | null | boolean)[]) => {
  return classes.filter(Boolean).join(' ')
}

// Simple Button component
const Button: React.FC<{
  children: React.ReactNode
  variant?: 'default' | 'outline'
  className?: string
  onClick?: () => void
  disabled?: boolean
}> = ({ children, variant = 'default', className = '', onClick, disabled }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 px-4 py-2'
  
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  }
  
  return (
    <button
      className={cn(baseClasses, variants[variant], className)}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

// Types
interface CheckoutButtonProps {
  planType: string
  priceId: string
  disabled?: boolean
  loading?: boolean
  className?: string
  children: React.ReactNode
}

interface CreateCheckoutSessionRequest {
  priceId: string
  planType: string
}

interface CreateCheckoutSessionResponse {
  sessionId: string
  url?: string
}

export function CheckoutButton({
  planType,
  priceId,
  disabled = false,
  loading = false,
  className,
  children
}: CheckoutButtonProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  const handleCheckout = async () => {
    try {
      // Check if user is authenticated
      if (status === 'unauthenticated') {
        router.push('/auth/signin')
        return
      }

      if (status === 'loading' || !session?.user) {
        return
      }

      setIsLoading(true)

      // Create checkout session
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          planType,
        } as CreateCheckoutSessionRequest),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const data: CreateCheckoutSessionResponse = await response.json()

      // For now, we'll redirect to the URL directly
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }

    } catch (error) {
      console.error('Checkout error:', error)
      
      // Show error to user
      alert(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const isButtonDisabled = disabled || loading || isLoading || status === 'loading'

  return (
    <motion.div
      whileHover={!isButtonDisabled ? { scale: 1.02 } : {}}
      whileTap={!isButtonDisabled ? { scale: 0.98 } : {}}
    >
      <Button
        onClick={handleCheckout}
        disabled={isButtonDisabled}
        className={className}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            Processing...
          </>
        ) : (
          children
        )}
      </Button>
    </motion.div>
  )
}

export default CheckoutButton 
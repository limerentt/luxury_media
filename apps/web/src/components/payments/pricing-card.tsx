'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check, Star, Zap } from 'lucide-react'
import CheckoutButton from './checkout-button'

// Simple utility function
const cn = (...classes: (string | undefined | null | boolean)[]) => {
  return classes.filter(Boolean).join(' ')
}

// Simple formatPrice function
const formatPrice = (price: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(price / 100)
}

// Types
interface PricingPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: string
  features: string[]
  popular?: boolean
  priceId: string
}

interface PricingCardProps {
  plan: PricingPlan
  currentPlan?: string
  isLoading?: boolean
  onSelectPlan?: (planType: string, priceId: string) => void
}

export function PricingCard({ 
  plan, 
  currentPlan, 
  isLoading = false
}: PricingCardProps) {
  const isCurrentPlan = currentPlan === plan.id
  const isPopular = plan.popular

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'relative rounded-2xl border bg-card p-8 text-card-foreground shadow-sm transition-all duration-300',
        isPopular && 'border-yellow-500 bg-gradient-to-b from-yellow-50/50 to-background',
        !isPopular && 'hover:shadow-lg hover:border-yellow-500/30',
        isCurrentPlan && 'ring-2 ring-yellow-500'
      )}
    >
      {/* Popular badge */}
      {isPopular && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute -top-4 left-1/2 transform -translate-x-1/2"
        >
          <div className="bg-yellow-500 text-black px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <Star className="w-4 h-4" />
            Most Popular
          </div>
        </motion.div>
      )}

      {/* Current plan indicator */}
      {isCurrentPlan && (
        <div className="absolute top-4 right-4">
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
            Current Plan
          </div>
        </div>
      )}

      {/* Plan header */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
        <p className="text-muted-foreground mb-4">{plan.description}</p>
        
        <div className="flex items-baseline justify-center gap-1 mb-2">
          <span className="text-4xl font-bold luxury-text-gradient">
            {formatPrice(plan.price, plan.currency)}
          </span>
          <span className="text-muted-foreground">
            /{plan.interval}
          </span>
        </div>
        
        {plan.interval === 'month' && (
          <p className="text-sm text-muted-foreground">
            Billed monthly
          </p>
        )}
      </div>

      {/* Features list */}
      <ul className="space-y-4 mb-8">
        {plan.features.map((feature, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="flex items-start gap-3"
          >
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center mt-0.5">
              <Check className="w-3 h-3 text-black" />
            </div>
            <span className="text-sm leading-relaxed">{feature}</span>
          </motion.li>
        ))}
      </ul>

      {/* CTA Button */}
      <CheckoutButton
        planType={plan.id}
        priceId={plan.priceId}
        disabled={isCurrentPlan || isLoading}
        loading={isLoading}
        className={cn(
          'w-full',
          isPopular && 'luxury-gradient text-black font-semibold',
          !isPopular && !isCurrentPlan && 'border-2 hover:border-yellow-500',
          isCurrentPlan && 'opacity-50 cursor-not-allowed'
        )}
      >
        {isCurrentPlan ? (
          'Current Plan'
        ) : isLoading ? (
          'Loading...'
        ) : (
          <>
            <Zap className="w-4 h-4 mr-2" />
            Get Started
          </>
        )}
      </CheckoutButton>

      {/* Additional info */}
      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">
          No setup fee • Cancel anytime
        </p>
      </div>
    </motion.div>
  )
}

export default PricingCard 
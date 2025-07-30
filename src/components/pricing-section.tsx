'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import PricingCard from '@/components/payments/pricing-card'
import type { SubscriptionPlanDetails, SubscriptionPlan } from '@/types/stripe'

export function PricingSection() {
  const t = useTranslations()
  const [plans, setPlans] = useState<SubscriptionPlanDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPlans() {
      try {
        const response = await fetch('/api/payments/create-checkout-session')
        
        if (!response.ok) {
          throw new Error('Failed to fetch plans')
        }
        
        const data = await response.json()
        setPlans(data.plans || [])
      } catch (err) {
        console.error('Error fetching plans:', err)
        setError(err instanceof Error ? err.message : 'Failed to load pricing plans')
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [])

  const handleSelectPlan = (planType: SubscriptionPlan, priceId: string) => {
    // This will be handled by the CheckoutButton component
    console.log(`Selected ${planType} plan with price ID: ${priceId}`)
  }

  if (loading) {
    return (
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-xl text-muted-foreground">
              Select the perfect plan for your needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card border rounded-2xl p-8 animate-pulse"
              >
                <div className="h-8 bg-muted rounded mb-4"></div>
                <div className="h-4 bg-muted rounded mb-6"></div>
                <div className="h-12 bg-muted rounded mb-8"></div>
                <div className="space-y-3 mb-8">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-4 bg-muted rounded"></div>
                  ))}
                </div>
                <div className="h-12 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="max-w-md mx-auto bg-destructive/10 border border-destructive/20 rounded-lg p-6">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-destructive mb-2">
                Unable to Load Pricing
              </h3>
              <p className="text-sm text-destructive/80 mb-4">
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md text-sm hover:bg-destructive/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 luxury-text-gradient">
            Choose Your Plan
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start with our Basic plan and upgrade as your needs grow. 
            All plans include our core AI generation features.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <PricingCard
                plan={plan}
                isLoading={loading}
                onSelectPlan={handleSelectPlan}
              />
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold mb-4">
              🎉 Special Launch Offer
            </h3>
            <p className="text-muted-foreground mb-6">
              Get 30% off your first 3 months on any plan. Use code{' '}
              <code className="bg-yellow-200 dark:bg-yellow-800 px-2 py-1 rounded text-sm font-mono">
                LAUNCH30
              </code>{' '}
              at checkout.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center gap-2">
                <span className="text-green-600">✓</span>
                <span>30-day money-back guarantee</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-green-600">✓</span>
                <span>24/7 customer support</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* FAQ Preview */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <h3 className="text-2xl font-semibold mb-8">
            Frequently Asked Questions
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            <div className="bg-card border rounded-lg p-6">
              <h4 className="font-semibold mb-2">
                Can I change plans later?
              </h4>
              <p className="text-sm text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time. 
                Changes take effect at your next billing cycle.
              </p>
            </div>
            
            <div className="bg-card border rounded-lg p-6">
              <h4 className="font-semibold mb-2">
                What payment methods do you accept?
              </h4>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards, debit cards, and various 
                local payment methods through Stripe.
              </p>
            </div>
            
            <div className="bg-card border rounded-lg p-6">
              <h4 className="font-semibold mb-2">
                Is there a free trial?
              </h4>
              <p className="text-sm text-muted-foreground">
                We offer a 30-day money-back guarantee, so you can try any 
                plan risk-free for the first month.
              </p>
            </div>
            
            <div className="bg-card border rounded-lg p-6">
              <h4 className="font-semibold mb-2">
                Do you offer custom plans?
              </h4>
              <p className="text-sm text-muted-foreground">
                Yes! For enterprise customers with specific needs, we offer 
                custom plans. Contact our sales team for more information.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default PricingSection 
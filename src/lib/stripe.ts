import Stripe from 'stripe'
import { loadStripe, Stripe as StripeJS } from '@stripe/stripe-js'

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

// Client-side Stripe instance
let stripePromise: Promise<StripeJS | null>

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

// Stripe configuration constants
export const STRIPE_CONFIG = {
  currency: 'usd',
  payment_method_types: ['card'] as const,
  mode: 'subscription' as const,
  billing_address_collection: 'auto' as const,
  allow_promotion_codes: true,
  automatic_tax: { enabled: true },
  customer_creation: 'always' as const,
  invoice_creation: { enabled: true },
} as const

// Subscription price IDs (replace with your actual Stripe Price IDs)
export const SUBSCRIPTION_PLANS = {
  basic: {
    id: process.env.STRIPE_BASIC_PRICE_ID!,
    name: 'Basic Plan',
    description: 'Perfect for individuals getting started',
    price: 29,
    currency: 'usd',
    interval: 'month',
    features: [
      '100 AI-generated media per month',
      'HD quality exports',
      'Basic templates',
      'Email support',
    ],
  },
  pro: {
    id: process.env.STRIPE_PRO_PRICE_ID!,
    name: 'Pro Plan',
    description: 'Ideal for growing businesses',
    price: 79,
    currency: 'usd',
    interval: 'month',
    popular: true,
    features: [
      '500 AI-generated media per month',
      '4K quality exports',
      'Premium templates',
      'Priority support',
      'Custom branding',
      'API access',
    ],
  },
  enterprise: {
    id: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    name: 'Enterprise Plan',
    description: 'For large-scale operations',
    price: 199,
    currency: 'usd',
    interval: 'month',
    features: [
      'Unlimited AI-generated media',
      '8K quality exports',
      'All templates + custom',
      '24/7 dedicated support',
      'White-label solution',
      'Advanced API access',
      'Custom integrations',
    ],
  },
} as const

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS

// Webhook event types we handle
export const STRIPE_WEBHOOK_EVENTS = {
  CHECKOUT_SESSION_COMPLETED: 'checkout.session.completed',
  CUSTOMER_SUBSCRIPTION_CREATED: 'customer.subscription.created',
  CUSTOMER_SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  CUSTOMER_SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
} as const

// Utility functions
export const formatPrice = (price: number, currency: string = 'usd') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(price)
}

export const getSubscriptionPlan = (priceId: string): SubscriptionPlan | null => {
  for (const [planKey, plan] of Object.entries(SUBSCRIPTION_PLANS)) {
    if (plan.id === priceId) {
      return planKey as SubscriptionPlan
    }
  }
  return null
}

// Error handling
export class StripeError extends Error {
  constructor(message: string, public code?: string, public statusCode?: number) {
    super(message)
    this.name = 'StripeError'
  }
}

// Stripe webhook signature verification
export const verifyStripeSignature = (
  payload: string | Buffer,
  signature: string,
  secret: string
) => {
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret)
  } catch (error) {
    throw new StripeError(
      `Webhook signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'webhook_signature_verification_failed',
      400
    )
  }
}

// Customer utilities
export const createStripeCustomer = async (params: {
  email: string
  name?: string
  userId: string
}) => {
  try {
    const customer = await stripe.customers.create({
      email: params.email,
      name: params.name,
      metadata: {
        userId: params.userId,
      },
    })
    return customer
  } catch (error) {
    throw new StripeError(
      `Failed to create Stripe customer: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'customer_creation_failed'
    )
  }
}

export const getStripeCustomer = async (customerId: string) => {
  try {
    const customer = await stripe.customers.retrieve(customerId)
    return customer
  } catch (error) {
    throw new StripeError(
      `Failed to retrieve Stripe customer: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'customer_retrieval_failed'
    )
  }
}

// Subscription utilities
export const createCheckoutSession = async (params: {
  priceId: string
  customerId?: string
  customerEmail?: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}) => {
  try {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      ...STRIPE_CONFIG,
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: params.metadata,
    }

    if (params.customerId) {
      sessionParams.customer = params.customerId
    } else if (params.customerEmail) {
      sessionParams.customer_email = params.customerEmail
    }

    const session = await stripe.checkout.sessions.create(sessionParams)
    return session
  } catch (error) {
    throw new StripeError(
      `Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'checkout_session_creation_failed'
    )
  }
}

export const createCustomerPortalSession = async (
  customerId: string,
  returnUrl: string
) => {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })
    return session
  } catch (error) {
    throw new StripeError(
      `Failed to create customer portal session: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'portal_session_creation_failed'
    )
  }
} 
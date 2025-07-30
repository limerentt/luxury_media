import Stripe from 'stripe'

// Subscription plan types
export type SubscriptionPlan = 'basic' | 'pro' | 'enterprise'

export interface PlanFeature {
  name: string
  included: boolean
  limit?: number
}

export interface SubscriptionPlanDetails {
  id: string
  priceId: string
  name: string
  description: string
  price: number
  currency: string
  interval: 'month' | 'year'
  features: string[]
  popular?: boolean
}

// Checkout types
export interface CreateCheckoutSessionRequest {
  priceId: string
  planType: SubscriptionPlan
  successUrl?: string
  cancelUrl?: string
}

export interface CreateCheckoutSessionResponse {
  sessionId: string
  url: string | null
}

export interface CustomerPortalRequest {
  returnUrl?: string
}

export interface CustomerPortalResponse {
  url: string
}

// Subscription status types
export type SubscriptionStatus = 
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'paused'

// Database models for subscriptions
export interface UserSubscription {
  id: string
  userId: string
  customerId: string
  subscriptionId: string
  planType: SubscriptionPlan
  status: SubscriptionStatus
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  createdAt: Date
  updatedAt: Date
  canceledAt?: Date
}

export interface PaymentRecord {
  id: string
  userId: string
  customerId: string
  subscriptionId: string
  invoiceId: string
  amount: number
  currency: string
  status: 'paid' | 'failed' | 'pending'
  paidAt?: Date
  createdAt: Date
}

// Webhook payload types
export interface StripeWebhookEvent {
  id: string
  type: string
  data: {
    object: any
  }
  created: number
  livemode: boolean
}

export interface CheckoutSessionCompletedData {
  id: string
  customer: string
  subscription: string
  metadata: {
    userId: string
    planType: SubscriptionPlan
    userEmail: string
  }
}

export interface SubscriptionData {
  id: string
  customer: string
  status: SubscriptionStatus
  current_period_start: number
  current_period_end: number
  cancel_at_period_end: boolean
  items: {
    data: Array<{
      price: {
        id: string
        nickname: string | null
      }
    }>
  }
}

export interface InvoiceData {
  id: string
  customer: string
  subscription: string
  amount_paid: number
  amount_due: number
  currency: string
  status: string
  status_transitions: {
    paid_at: number | null
  }
}

// Component props types
export interface PricingCardProps {
  plan: SubscriptionPlanDetails
  currentPlan?: SubscriptionPlan
  isLoading?: boolean
  onSelectPlan: (planType: SubscriptionPlan, priceId: string) => void
}

export interface CheckoutButtonProps {
  planType: SubscriptionPlan
  priceId: string
  disabled?: boolean
  loading?: boolean
  className?: string
  children: React.ReactNode
}

// API response types
export interface GetPlansResponse {
  plans: SubscriptionPlanDetails[]
}

export interface ApiError {
  error: string
  details?: Array<{
    field: string
    message: string
  }>
}

// Stripe customer types
export interface StripeCustomer {
  id: string
  email: string
  name?: string
  metadata: {
    userId: string
  }
}

// Price formatting types
export interface PriceDisplayOptions {
  currency?: string
  locale?: string
  showInterval?: boolean
  showCurrency?: boolean
}

// Billing portal types
export interface BillingPortalSession {
  url: string
}

// Usage tracking types (for future implementation)
export interface UsageRecord {
  id: string
  userId: string
  planType: SubscriptionPlan
  mediaGenerated: number
  period: string // YYYY-MM format
  createdAt: Date
  updatedAt: Date
}

export interface PlanLimits {
  mediaPerMonth: number
  maxQuality: 'HD' | '4K' | '8K'
  apiAccess: boolean
  customBranding: boolean
  prioritySupport: boolean
}

// Error types
export interface StripeErrorResponse {
  error: {
    type: string
    code?: string
    message: string
    param?: string
  }
}

// Webhook configuration types
export interface WebhookConfig {
  url: string
  events: string[]
  enabled: boolean
}

// Export Stripe types for convenience
export type {
  Stripe,
}

// Re-export commonly used Stripe types
export type StripeCheckoutSession = Stripe.Checkout.Session
export type StripeSubscription = Stripe.Subscription
export type StripeInvoice = Stripe.Invoice
export type StripeCustomerType = Stripe.Customer
export type StripePrice = Stripe.Price
export type StripeProduct = Stripe.Product 
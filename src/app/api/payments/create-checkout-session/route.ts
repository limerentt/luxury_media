import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { createCheckoutSession, SUBSCRIPTION_PLANS, StripeError } from '@/lib/stripe'
import { z } from 'zod'

// Request validation schema
const createCheckoutSessionSchema = z.object({
  priceId: z.string().min(1, 'Price ID is required'),
  planType: z.enum(['basic', 'pro', 'enterprise']),
  successUrl: z.string().url('Valid success URL is required').optional(),
  cancelUrl: z.string().url('Valid cancel URL is required').optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createCheckoutSessionSchema.parse(body)

    const { priceId, planType, successUrl, cancelUrl } = validatedData

    // Verify the price ID matches the plan type
    const selectedPlan = SUBSCRIPTION_PLANS[planType]
    if (selectedPlan.id !== priceId) {
      return NextResponse.json(
        { error: 'Invalid price ID for selected plan' },
        { status: 400 }
      )
    }

    // Get the base URL for redirects
    const baseUrl = request.headers.get('origin') || process.env.NEXTAUTH_URL!
    const locale = request.headers.get('accept-language')?.split(',')[0] || 'en'
    
    // Create checkout session
    const checkoutSession = await createCheckoutSession({
      priceId,
      customerEmail: session.user.email!,
      successUrl: successUrl || `${baseUrl}/${locale}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: cancelUrl || `${baseUrl}/${locale}/payments/canceled`,
      metadata: {
        userId: session.user.id,
        planType,
        userEmail: session.user.email!,
      },
    })

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    })

  } catch (error) {
    console.error('Checkout session creation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      )
    }

    if (error instanceof StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve available plans
export async function GET() {
  try {
    const plans = Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => ({
      id: key,
      priceId: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      interval: plan.interval,
      features: plan.features,
      popular: plan.popular || false,
    }))

    return NextResponse.json({ plans })
  } catch (error) {
    console.error('Failed to retrieve subscription plans:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve subscription plans' },
      { status: 500 }
    )
  }
} 
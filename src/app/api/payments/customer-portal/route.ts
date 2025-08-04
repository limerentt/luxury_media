import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { createCustomerPortalSession, StripeError } from '@/lib/stripe'
import { z } from 'zod'

// Request validation schema
const customerPortalSchema = z.object({
  returnUrl: z.string().url('Valid return URL is required').optional(),
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
    const validatedData = customerPortalSchema.parse(body)

    // Get the base URL for return redirect
    const baseUrl = request.headers.get('origin') || process.env.NEXTAUTH_URL!
    const locale = request.headers.get('accept-language')?.split(',')[0] || 'en'
    const returnUrl = validatedData.returnUrl || `${baseUrl}/${locale}/dashboard`

    // TODO: Get customer ID from database
    // For now, we'll return an error asking user to have an active subscription
    // In a real app, you'd query your database to get the Stripe customer ID
    
    return NextResponse.json(
      { error: 'Customer portal requires an active subscription. Please subscribe first.' },
      { status: 400 }
    )

    /* 
    // This code would be used once you have customer IDs stored in your database
    const customerId = await getUserStripeCustomerId(session.user.id)
    
    if (!customerId) {
      return NextResponse.json(
        { error: 'No customer found. Please subscribe first.' },
        { status: 400 }
      )
    }

    const portalSession = await createCustomerPortalSession(customerId, returnUrl)

    return NextResponse.json({
      url: portalSession.url,
    })
    */

  } catch (error) {
    console.error('Customer portal creation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.issues.map(err => ({
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
      { error: 'Failed to create customer portal session' },
      { status: 500 }
    )
  }
} 
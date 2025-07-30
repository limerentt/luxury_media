import { NextRequest, NextResponse } from 'next/server'
import { verifyStripeSignature, STRIPE_WEBHOOK_EVENTS, StripeError } from '@/lib/stripe'
import Stripe from 'stripe'

// Disable body parsing to get raw body for signature verification
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('Missing Stripe signature')
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      )
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('Missing STRIPE_WEBHOOK_SECRET environment variable')
      return NextResponse.json(
        { error: 'Webhook configuration error' },
        { status: 500 }
      )
    }

    // Verify webhook signature
    const event = verifyStripeSignature(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )

    console.log(`Received Stripe webhook: ${event.type}`)

    // Handle different event types
    switch (event.type) {
      case STRIPE_WEBHOOK_EVENTS.CHECKOUT_SESSION_COMPLETED:
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case STRIPE_WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_CREATED:
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case STRIPE_WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_UPDATED:
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case STRIPE_WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_DELETED:
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case STRIPE_WEBHOOK_EVENTS.INVOICE_PAYMENT_SUCCEEDED:
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case STRIPE_WEBHOOK_EVENTS.INVOICE_PAYMENT_FAILED:
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook processing error:', error)

    if (error instanceof StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      )
    }

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Webhook event handlers
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout session completed:', session.id)
  
  try {
    const { userId, planType, userEmail } = session.metadata || {}
    
    if (!userId || !planType || !userEmail) {
      console.error('Missing required metadata in checkout session:', session.metadata)
      return
    }

    // TODO: Update user subscription in database
    console.log(`User ${userId} (${userEmail}) subscribed to ${planType} plan`)
    
    /*
    // This is where you'd update your database
    await updateUserSubscription({
      userId,
      customerId: session.customer as string,
      subscriptionId: session.subscription as string,
      planType,
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    })
    */

  } catch (error) {
    console.error('Error handling checkout session completed:', error)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id)
  
  try {
    // TODO: Update user subscription status in database
    /*
    await updateUserSubscription({
      subscriptionId: subscription.id,
      customerId: subscription.customer as string,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
    })
    */
  } catch (error) {
    console.error('Error handling subscription created:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id)
  
  try {
    // TODO: Update user subscription status in database
    /*
    await updateUserSubscription({
      subscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
    })
    */
  } catch (error) {
    console.error('Error handling subscription updated:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id)
  
  try {
    // TODO: Update user subscription status in database
    /*
    await updateUserSubscription({
      subscriptionId: subscription.id,
      status: 'canceled',
      canceledAt: new Date(),
    })
    */
  } catch (error) {
    console.error('Error handling subscription deleted:', error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Invoice payment succeeded:', invoice.id)
  
  try {
    // TODO: Update payment records in database
    /*
    await recordPayment({
      invoiceId: invoice.id,
      customerId: invoice.customer as string,
      subscriptionId: invoice.subscription as string,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: 'paid',
      paidAt: new Date(invoice.status_transitions.paid_at! * 1000),
    })
    */
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error)
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', invoice.id)
  
  try {
    // TODO: Handle failed payment (notify user, update subscription status, etc.)
    /*
    await handleFailedPayment({
      invoiceId: invoice.id,
      customerId: invoice.customer as string,
      subscriptionId: invoice.subscription as string,
      amount: invoice.amount_due,
      currency: invoice.currency,
    })
    */
  } catch (error) {
    console.error('Error handling invoice payment failed:', error)
  }
} 
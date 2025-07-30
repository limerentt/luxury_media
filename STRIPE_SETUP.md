# Stripe Payments Integration Guide

## Overview
This guide covers the complete Stripe Checkout integration with subscription support for the Luxury Account Next.js application.

## Required Environment Variables

Add these variables to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...              # Your Stripe secret key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # Your Stripe publishable key
STRIPE_WEBHOOK_SECRET=whsec_...            # Webhook endpoint secret

# Stripe Price IDs (create these products in Stripe Dashboard)
STRIPE_BASIC_PRICE_ID=price_...            # Basic plan price ID
STRIPE_PRO_PRICE_ID=price_...              # Pro plan price ID  
STRIPE_ENTERPRISE_PRICE_ID=price_...       # Enterprise plan price ID
```

## Stripe Dashboard Setup

### 1. Create Stripe Account
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create an account or sign in
3. Switch to **Test mode** for development

### 2. Get API Keys
1. Go to **Developers** → **API keys**
2. Copy the **Publishable key** (starts with `pk_test_`)
3. Copy the **Secret key** (starts with `sk_test_`)
4. Add them to your `.env.local` file

### 3. Create Products and Prices
Create three subscription products with the following details:

#### Basic Plan
- **Product Name**: "Basic Plan"
- **Pricing Model**: Recurring
- **Price**: $29.00 USD
- **Billing Period**: Monthly
- **Copy the Price ID** and add to `STRIPE_BASIC_PRICE_ID`

#### Pro Plan  
- **Product Name**: "Pro Plan"
- **Pricing Model**: Recurring
- **Price**: $79.00 USD
- **Billing Period**: Monthly
- **Copy the Price ID** and add to `STRIPE_PRO_PRICE_ID`

#### Enterprise Plan
- **Product Name**: "Enterprise Plan"
- **Pricing Model**: Recurring
- **Price**: $199.00 USD
- **Billing Period**: Monthly
- **Copy the Price ID** and add to `STRIPE_ENTERPRISE_PRICE_ID`

### 4. Configure Webhooks
1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL: `https://yourdomain.com/api/payments/webhook`
4. For local development: `https://your-ngrok-url.ngrok.io/api/payments/webhook`
5. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Copy the **Signing secret** and add to `STRIPE_WEBHOOK_SECRET`

## File Structure Created

```
src/
├── lib/
│   └── stripe.ts                          # Stripe configuration & utilities
├── app/api/payments/
│   ├── create-checkout-session/
│   │   └── route.ts                       # Checkout session API
│   ├── customer-portal/
│   │   └── route.ts                       # Customer portal API
│   └── webhook/
│       └── route.ts                       # Stripe webhook handler
├── app/[locale]/payments/
│   ├── success/
│   │   └── page.tsx                       # Payment success page
│   └── canceled/
│       └── page.tsx                       # Payment canceled page
├── components/payments/
│   ├── pricing-card.tsx                   # Plan pricing card
│   └── checkout-button.tsx                # Stripe checkout button
└── types/
    └── stripe.ts                          # TypeScript definitions
```

## Key Features Implemented

### ✅ **Modern Stripe Checkout**
- Hosted checkout pages with Stripe branding
- Automatic tax calculation
- Promotion code support
- Mobile-optimized payment flows

### ✅ **Subscription Management**
- Monthly recurring billing
- Multiple subscription tiers
- Automatic customer creation
- Subscription status tracking

### ✅ **Webhook Integration**
- Secure webhook signature verification
- Event handling for subscription lifecycle
- Payment success/failure processing
- Automatic status updates

### ✅ **UI Components**
- Beautiful pricing cards with animations
- Loading states and error handling
- Success and cancellation pages
- Mobile-responsive design

### ✅ **Type Safety**
- Comprehensive TypeScript types
- Stripe API type integration
- Request/response validation
- Error handling types

## Usage Examples

### Creating a Pricing Section
```tsx
import { useState, useEffect } from 'react'
import PricingCard from '@/components/payments/pricing-card'
import type { SubscriptionPlanDetails } from '@/types/stripe'

export function PricingSection() {
  const [plans, setPlans] = useState<SubscriptionPlanDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPlans() {
      const response = await fetch('/api/payments/create-checkout-session')
      const data = await response.json()
      setPlans(data.plans)
      setLoading(false)
    }
    fetchPlans()
  }, [])

  const handleSelectPlan = (planType: string, priceId: string) => {
    // Handle plan selection
    console.log(`Selected ${planType} plan with price ID: ${priceId}`)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {plans.map((plan) => (
        <PricingCard
          key={plan.id}
          plan={plan}
          isLoading={loading}
          onSelectPlan={handleSelectPlan}
        />
      ))}
    </div>
  )
}
```

### Using the Checkout Button
```tsx
import CheckoutButton from '@/components/payments/checkout-button'

export function PaymentForm() {
  return (
    <CheckoutButton
      planType="pro"
      priceId="price_1234567890"
      className="w-full luxury-gradient text-black font-semibold"
    >
      Subscribe to Pro Plan
    </CheckoutButton>
  )
}
```

## Testing

### Test Mode Setup
1. Use Stripe's test API keys (starting with `pk_test_` and `sk_test_`)
2. Use test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Declined**: `4000 0000 0000 0002`
   - **Requires 3D Secure**: `4000 0025 0000 3155`

### Testing Webhooks Locally
1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/payments/webhook`
4. Copy the webhook signing secret from the CLI output
5. Add it to your `.env.local` as `STRIPE_WEBHOOK_SECRET`

### Test Scenarios
- ✅ Successful payment flow
- ✅ Payment cancellation
- ✅ Webhook event processing
- ✅ Error handling
- ✅ Authentication requirements
- ✅ Mobile responsiveness

## Security Considerations

### Best Practices Implemented
- ✅ Webhook signature verification
- ✅ Server-side API key storage
- ✅ User authentication checks
- ✅ Request validation with Zod
- ✅ Error handling without data leaks
- ✅ HTTPS requirement for webhooks

### Production Checklist
- [ ] Switch to live Stripe API keys
- [ ] Update webhook endpoint to production URL
- [ ] Enable Stripe webhook signature verification
- [ ] Configure proper CORS settings
- [ ] Set up monitoring and alerts
- [ ] Test all payment flows end-to-end

## API Endpoints

### POST `/api/payments/create-checkout-session`
Creates a new Stripe Checkout session for subscription.

**Request Body:**
```json
{
  "priceId": "price_1234567890",
  "planType": "pro",
  "successUrl": "https://yourdomain.com/payments/success",
  "cancelUrl": "https://yourdomain.com/payments/canceled"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_1234567890",
  "url": "https://checkout.stripe.com/c/pay/cs_test_1234567890"
}
```

### GET `/api/payments/create-checkout-session`
Retrieves available subscription plans.

**Response:**
```json
{
  "plans": [
    {
      "id": "basic",
      "priceId": "price_1234567890",
      "name": "Basic Plan",
      "description": "Perfect for individuals getting started",
      "price": 29,
      "currency": "usd",
      "interval": "month",
      "features": ["100 AI-generated media per month", "..."],
      "popular": false
    }
  ]
}
```

### POST `/api/payments/webhook`
Handles Stripe webhook events.

**Headers:**
- `stripe-signature`: Webhook signature for verification

## Troubleshooting

### Common Issues

1. **"Invalid API Key" Error**
   - Check that your API keys are correct
   - Ensure you're using test keys for development
   - Verify the keys don't have extra spaces

2. **Webhook Signature Verification Failed**
   - Ensure `STRIPE_WEBHOOK_SECRET` is set correctly
   - Check that the webhook endpoint URL is correct
   - Verify webhook events are configured properly

3. **Payment Not Processing**
   - Check Stripe Dashboard logs
   - Verify product and price IDs are correct
   - Ensure user is authenticated before checkout

4. **Success Page Not Loading**
   - Check that success URL is correctly configured
   - Verify session_id parameter is being passed
   - Check server logs for authentication issues

### Debug Tips
- Use Stripe CLI for local webhook testing
- Check Stripe Dashboard logs for API calls
- Monitor browser network tab for failed requests
- Use Stripe's test mode for safe development

## Next Steps

1. **Database Integration**: Store subscription data in your database
2. **User Dashboard**: Create subscription management interface
3. **Usage Tracking**: Implement feature usage limits
4. **Email Notifications**: Send payment confirmations
5. **Analytics**: Track conversion rates and revenue

## Production Deployment

When ready for production:

1. **Update Environment Variables**:
   ```bash
   STRIPE_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_live_...
   ```

2. **Update Webhook URL**: Point to your production domain
3. **Test All Flows**: Complete end-to-end testing
4. **Monitor**: Set up alerts for failed payments
5. **Compliance**: Ensure PCI compliance requirements are met

---

**🎉 Your Stripe integration is now ready for production!** 
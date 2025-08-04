# 🔐 Environment Variables Setup

## Required Environment Variables

Before running the application, you need to set up the following environment variables in `.env.local`:

### Google OAuth Configuration
```bash
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Stripe Configuration
```bash
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_BASIC_PRICE_ID=price_your_basic_plan_id
STRIPE_PRO_PRICE_ID=price_your_pro_plan_id
STRIPE_ENTERPRISE_PRICE_ID=price_your_enterprise_plan_id
```

## Setup Instructions

1. **Copy the example file:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Fill in your actual values:**
   - Get Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/)
   - Get Stripe keys from [Stripe Dashboard](https://dashboard.stripe.com/)

3. **Run the application:**
   ```bash
   docker-compose up -d
   ```

## Notes

- Never commit `.env.local` to version control
- The application will read these variables from your local `.env.local` file
- Default price IDs are provided as fallbacks for development

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

## Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your test API keys
3. Create products and price IDs for your subscription plans
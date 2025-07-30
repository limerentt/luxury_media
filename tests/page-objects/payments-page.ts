import { Page, Locator } from '@playwright/test';
import { BasePage, PaymentData } from './base-page';

export class PaymentsPage extends BasePage {
  // Pricing section locators
  private readonly pricingSection: Locator;
  private readonly pricingCards: Locator;
  private readonly basicPlanCard: Locator;
  private readonly proPlanCard: Locator;
  private readonly enterprisePlanCard: Locator;
  private readonly planFeatures: Locator;
  private readonly planPrice: Locator;
  private readonly selectPlanButton: Locator;

  // Checkout locators
  private readonly checkoutButton: Locator;
  private readonly stripeCheckoutFrame: Locator;
  private readonly paymentForm: Locator;
  private readonly cardNumberInput: Locator;
  private readonly expiryInput: Locator;
  private readonly cvcInput: Locator;
  private readonly billingNameInput: Locator;
  private readonly billingEmailInput: Locator;
  private readonly submitPaymentButton: Locator;

  // Success/Error pages
  private readonly successPage: Locator;
  private readonly successMessage: Locator;
  private readonly paymentDetails: Locator;
  private readonly canceledPage: Locator;
  private readonly errorMessage: Locator;
  private readonly retryPaymentButton: Locator;

  // Customer portal
  private readonly customerPortalButton: Locator;
  private readonly billingPortalFrame: Locator;
  private readonly subscriptionDetails: Locator;
  private readonly cancelSubscriptionButton: Locator;
  private readonly updatePaymentMethodButton: Locator;

  // Loading and status
  private readonly loadingSpinner: Locator;
  private readonly processingPayment: Locator;

  constructor(page: Page) {
    super(page);

    // Pricing section
    this.pricingSection = page.locator('[data-testid="pricing-section"], .pricing-section');
    this.pricingCards = page.locator('[data-testid="pricing-card"], .pricing-card');
    this.basicPlanCard = page.locator('[data-testid="basic-plan"], [data-plan="basic"]');
    this.proPlanCard = page.locator('[data-testid="pro-plan"], [data-plan="pro"]');
    this.enterprisePlanCard = page.locator('[data-testid="enterprise-plan"], [data-plan="enterprise"]');
    this.planFeatures = page.locator('[data-testid="plan-features"], .plan-features');
    this.planPrice = page.locator('[data-testid="plan-price"], .plan-price');
    this.selectPlanButton = page.locator('button:has-text("Get Started"), button:has-text("Select Plan")');

    // Checkout
    this.checkoutButton = page.locator('[data-testid="checkout-button"], button:has-text("Checkout")');
    this.stripeCheckoutFrame = page.frameLocator('iframe[src*="checkout.stripe.com"]');
    this.paymentForm = page.locator('form[data-testid="payment-form"], .payment-form');
    this.cardNumberInput = page.locator('input[name="cardNumber"], [data-testid="card-number"]');
    this.expiryInput = page.locator('input[name="expiry"], [data-testid="card-expiry"]');
    this.cvcInput = page.locator('input[name="cvc"], [data-testid="card-cvc"]');
    this.billingNameInput = page.locator('input[name="billingName"], [data-testid="billing-name"]');
    this.billingEmailInput = page.locator('input[name="billingEmail"], [data-testid="billing-email"]');
    this.submitPaymentButton = page.locator('button[type="submit"]:has-text("Pay"), [data-testid="submit-payment"]');

    // Success/Error states
    this.successPage = page.locator('[data-testid="payment-success"], .payment-success');
    this.successMessage = page.locator('[data-testid="success-message"], .success-message');
    this.paymentDetails = page.locator('[data-testid="payment-details"], .payment-details');
    this.canceledPage = page.locator('[data-testid="payment-canceled"], .payment-canceled');
    this.errorMessage = page.locator('[data-testid="error-message"], .error-message');
    this.retryPaymentButton = page.locator('button:has-text("Retry"), [data-testid="retry-payment"]');

    // Customer portal
    this.customerPortalButton = page.locator('button:has-text("Manage Billing"), [data-testid="customer-portal"]');
    this.billingPortalFrame = page.frameLocator('iframe[src*="billing.stripe.com"]');
    this.subscriptionDetails = page.locator('[data-testid="subscription-details"], .subscription-details');
    this.cancelSubscriptionButton = page.locator('button:has-text("Cancel Subscription")');
    this.updatePaymentMethodButton = page.locator('button:has-text("Update Payment Method")');

    // Loading states
    this.loadingSpinner = page.locator('[data-testid="loading"], .loading, .spinner');
    this.processingPayment = page.locator('[data-testid="processing-payment"], .processing-payment');
  }

  // Navigation methods
  async goToPricing(locale: string = 'en') {
    await this.goto(`/${locale}/pricing`);
    await this.waitForElement(this.pricingSection);
  }

  async goToPaymentSuccess(locale: string = 'en', sessionId?: string) {
    const url = sessionId ? 
      `/${locale}/payments/success?session_id=${sessionId}` : 
      `/${locale}/payments/success`;
    await this.goto(url);
  }

  async goToPaymentCanceled(locale: string = 'en') {
    await this.goto(`/${locale}/payments/canceled`);
  }

  // Plan selection methods
  async selectPlan(planType: 'basic' | 'pro' | 'enterprise') {
    const planCard = this.getPlanCard(planType);
    const selectButton = planCard.locator(this.selectPlanButton);
    await selectButton.click();
  }

  async getPlanCard(planType: 'basic' | 'pro' | 'enterprise') {
    switch (planType) {
      case 'basic':
        return this.basicPlanCard;
      case 'pro':
        return this.proPlanCard;
      case 'enterprise':
        return this.enterprisePlanCard;
      default:
        throw new Error(`Unknown plan type: ${planType}`);
    }
  }

  async getPlanPrice(planType: 'basic' | 'pro' | 'enterprise'): Promise<string> {
    const planCard = this.getPlanCard(planType);
    const priceElement = planCard.locator(this.planPrice);
    return await priceElement.textContent() || '';
  }

  async getPlanFeatures(planType: 'basic' | 'pro' | 'enterprise'): Promise<string[]> {
    const planCard = this.getPlanCard(planType);
    const featuresElements = planCard.locator(this.planFeatures);
    const features = await featuresElements.allTextContents();
    return features.map(f => f.trim()).filter(f => f.length > 0);
  }

  async isPlanRecommended(planType: 'basic' | 'pro' | 'enterprise'): Promise<boolean> {
    const planCard = this.getPlanCard(planType);
    const recommendedBadge = planCard.locator('text=Most Popular, .recommended, [data-testid="recommended"]');
    return await recommendedBadge.isVisible();
  }

  // Checkout flow methods
  async initiateCheckout(planType: 'basic' | 'pro' | 'enterprise') {
    await this.selectPlan(planType);
    
    // Wait for checkout to initiate
    try {
      // Either redirect to Stripe or show inline form
      await Promise.race([
        this.waitForURL(/checkout\.stripe\.com/, { timeout: 10000 }),
        this.waitForElement(this.paymentForm, { timeout: 10000 })
      ]);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async fillPaymentForm(paymentData: {
    cardNumber: string;
    expiry: string;
    cvc: string;
    billingName: string;
    billingEmail: string;
  }) {
    // Check if we're on Stripe's hosted checkout
    if (this.page.url().includes('checkout.stripe.com')) {
      // Use Stripe's test card data
      const stripeFrame = this.stripeCheckoutFrame;
      await stripeFrame.locator('input[name="cardnumber"]').fill(paymentData.cardNumber);
      await stripeFrame.locator('input[name="exp-date"]').fill(paymentData.expiry);
      await stripeFrame.locator('input[name="cvc"]').fill(paymentData.cvc);
      await stripeFrame.locator('input[name="billing-name"]').fill(paymentData.billingName);
      await stripeFrame.locator('input[name="email"]').fill(paymentData.billingEmail);
    } else {
      // Inline payment form
      await this.fillInput(this.cardNumberInput, paymentData.cardNumber);
      await this.fillInput(this.expiryInput, paymentData.expiry);
      await this.fillInput(this.cvcInput, paymentData.cvc);
      await this.fillInput(this.billingNameInput, paymentData.billingName);
      await this.fillInput(this.billingEmailInput, paymentData.billingEmail);
    }
  }

  async submitPayment() {
    if (this.page.url().includes('checkout.stripe.com')) {
      const stripeFrame = this.stripeCheckoutFrame;
      await stripeFrame.locator('button[type="submit"]').click();
    } else {
      await this.submitPaymentButton.click();
    }

    // Wait for payment processing
    await this.waitForElement(this.processingPayment, { timeout: 5000 }).catch(() => {});
  }

  async completePaymentFlow(paymentData: PaymentData & {
    cardNumber?: string;
    expiry?: string;
    cvc?: string;
    billingName?: string;
    billingEmail?: string;
  }) {
    // Default test card data
    const testCardData = {
      cardNumber: paymentData.cardNumber || '4242424242424242',
      expiry: paymentData.expiry || '12/34',
      cvc: paymentData.cvc || '123',
      billingName: paymentData.billingName || 'Test User',
      billingEmail: paymentData.billingEmail || 'test@luxury-account.com'
    };

    // Start checkout
    const checkoutResult = await this.initiateCheckout(paymentData.planType);
    if (!checkoutResult.success) {
      return checkoutResult;
    }

    // Fill payment form
    await this.fillPaymentForm(testCardData);

    // Submit payment
    await this.submitPayment();

    // Wait for completion
    try {
      await Promise.race([
        this.waitForURL(/\/payments\/success/, { timeout: 30000 }),
        this.waitForURL(/\/payments\/canceled/, { timeout: 30000 }),
        this.waitForElement(this.errorMessage, { timeout: 30000 })
      ]);

      if (this.page.url().includes('/payments/success')) {
        return { success: true, error: null };
      } else if (this.page.url().includes('/payments/canceled')) {
        return { success: false, error: 'Payment canceled' };
      } else {
        const error = await this.getErrorMessage();
        return { success: false, error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Customer portal methods
  async openCustomerPortal() {
    await this.customerPortalButton.click();
    
    try {
      await Promise.race([
        this.waitForURL(/billing\.stripe\.com/, { timeout: 10000 }),
        this.waitForElement(this.subscriptionDetails, { timeout: 10000 })
      ]);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getSubscriptionDetails() {
    await this.waitForElement(this.subscriptionDetails);
    
    // Extract subscription information
    const planName = await this.subscriptionDetails.locator('[data-testid="plan-name"]').textContent();
    const nextBilling = await this.subscriptionDetails.locator('[data-testid="next-billing"]').textContent();
    const amount = await this.subscriptionDetails.locator('[data-testid="amount"]').textContent();
    
    return {
      planName: planName?.trim(),
      nextBilling: nextBilling?.trim(),
      amount: amount?.trim()
    };
  }

  async cancelSubscription() {
    await this.cancelSubscriptionButton.click();
    
    // Handle confirmation dialog
    const confirmButton = this.page.locator('button:has-text("Confirm"), button:has-text("Yes")');
    await confirmButton.click();
    
    // Wait for cancellation to complete
    await this.waitForElement(this.successMessage, { timeout: 10000 });
  }

  // Validation methods
  async getPaymentSuccessDetails() {
    await this.waitForElement(this.successPage);
    
    const details = await this.paymentDetails.locator('div').allTextContents();
    const detailsMap: Record<string, string> = {};
    
    for (const detail of details) {
      const [key, value] = detail.split(':').map(s => s.trim());
      if (key && value) {
        detailsMap[key.toLowerCase()] = value;
      }
    }
    
    return detailsMap;
  }

  async getErrorMessage(): Promise<string | null> {
    try {
      await this.expectElementVisible(this.errorMessage);
      return await this.getElementText(this.errorMessage);
    } catch {
      return null;
    }
  }

  // Assertion helpers
  async expectPricingPageLoaded() {
    await this.expectElementVisible(this.pricingSection);
    await this.expectElementVisible(this.pricingCards);
  }

  async expectPlanVisible(planType: 'basic' | 'pro' | 'enterprise') {
    const planCard = this.getPlanCard(planType);
    await this.expectElementVisible(planCard);
  }

  async expectCheckoutPageLoaded() {
    await this.expectURL(/checkout\.stripe\.com/);
  }

  async expectPaymentSuccess() {
    await this.expectElementVisible(this.successPage);
    await this.expectElementVisible(this.successMessage);
    await this.expectURL(/\/payments\/success/);
  }

  async expectPaymentCanceled() {
    await this.expectElementVisible(this.canceledPage);
    await this.expectURL(/\/payments\/canceled/);
  }

  async expectPaymentError(errorText?: string) {
    await this.expectElementVisible(this.errorMessage);
    if (errorText) {
      await this.expectElementContainsText(this.errorMessage, errorText);
    }
  }

  async expectCustomerPortalLoaded() {
    await this.expectElementVisible(this.subscriptionDetails);
  }

  async expectProcessingPayment() {
    await this.expectElementVisible(this.processingPayment);
  }

  // Mock Stripe responses for testing
  async mockStripeCheckoutSession(response: {
    success: boolean;
    sessionId?: string;
    url?: string;
    error?: string;
  }) {
    await this.page.route('**/api/payments/create-checkout-session', async (route) => {
      if (response.success) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            sessionId: response.sessionId || 'cs_test_mock_session',
            url: response.url || 'https://checkout.stripe.com/mock-session'
          })
        });
      } else {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: response.error || 'Failed to create checkout session'
          })
        });
      }
    });
  }

  async mockStripeWebhook(eventType: string, data: any) {
    await this.page.route('**/api/payments/webhook', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ received: true })
      });
    });

    // Simulate webhook event
    await this.page.evaluate(({ eventType, data }) => {
      // Dispatch custom event to simulate webhook
      window.dispatchEvent(new CustomEvent('stripe-webhook', {
        detail: { type: eventType, data }
      }));
    }, { eventType, data });
  }

  async mockCustomerPortal(response: {
    success: boolean;
    url?: string;
    error?: string;
  }) {
    await this.page.route('**/api/payments/customer-portal', async (route) => {
      if (response.success) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            url: response.url || 'https://billing.stripe.com/mock-portal'
          })
        });
      } else {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: response.error || 'Failed to create customer portal session'
          })
        });
      }
    });
  }

  // Test card data
  static getTestCards() {
    return {
      successful: {
        cardNumber: '4242424242424242',
        expiry: '12/34',
        cvc: '123'
      },
      declined: {
        cardNumber: '4000000000000002',
        expiry: '12/34',
        cvc: '123'
      },
      insufficientFunds: {
        cardNumber: '4000000000009995',
        expiry: '12/34',
        cvc: '123'
      },
      requiresAuthentication: {
        cardNumber: '4000002500003155',
        expiry: '12/34',
        cvc: '123'
      }
    };
  }

  // Utility methods for complex flows
  async testSubscriptionFlow(planType: 'basic' | 'pro' | 'enterprise') {
    // Complete payment
    const paymentResult = await this.completePaymentFlow({
      planType,
      paymentMethod: 'card'
    });

    if (!paymentResult.success) {
      return paymentResult;
    }

    // Verify subscription details
    await this.openCustomerPortal();
    const subscriptionDetails = await this.getSubscriptionDetails();

    return {
      success: true,
      subscription: subscriptionDetails
    };
  }

  async testPaymentFailureFlow(planType: 'basic' | 'pro' | 'enterprise', cardType: keyof ReturnType<typeof PaymentsPage.getTestCards>) {
    const testCard = PaymentsPage.getTestCards()[cardType];
    
    return await this.completePaymentFlow({
      planType,
      paymentMethod: 'card',
      ...testCard
    });
  }
} 
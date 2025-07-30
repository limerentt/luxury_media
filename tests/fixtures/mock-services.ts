import { createServer, Server } from 'http';

export class MockServices {
  private mockServer?: Server;
  private port = 3001;

  async start() {
    console.log('🔧 Starting mock services...');
    
    return new Promise<void>((resolve, reject) => {
      this.mockServer = createServer((req, res) => {
        const url = req.url || '';
        const method = req.method || 'GET';
        
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        if (method === 'OPTIONS') {
          res.writeHead(200);
          res.end();
          return;
        }

        // Mock Google OAuth endpoints
        if (url.startsWith('/oauth2/v2/userinfo')) {
          this.handleGoogleUserInfo(req, res);
        } else if (url.startsWith('/oauth2/v4/token')) {
          this.handleGoogleToken(req, res);
        }
        
        // Mock Stripe endpoints
        else if (url.startsWith('/v1/checkout/sessions')) {
          this.handleStripeCheckoutSession(req, res);
        } else if (url.startsWith('/v1/billing_portal/sessions')) {
          this.handleStripeBillingPortal(req, res);
        } else if (url.startsWith('/v1/customers')) {
          this.handleStripeCustomers(req, res);
        }
        
        // Mock webhook endpoints
        else if (url.startsWith('/webhooks/stripe')) {
          this.handleStripeWebhook(req, res);
        }
        
        // Default 404
        else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Not found' }));
        }
      });

      this.mockServer.listen(this.port, () => {
        console.log(`✅ Mock services started on port ${this.port}`);
        resolve();
      });

      this.mockServer.on('error', (error) => {
        console.error('❌ Mock services failed to start:', error);
        reject(error);
      });
    });
  }

  async stop() {
    if (this.mockServer) {
      return new Promise<void>((resolve) => {
        this.mockServer!.close(() => {
          console.log('🛑 Mock services stopped');
          resolve();
        });
      });
    }
  }

  private handleGoogleUserInfo(req: any, res: any) {
    const mockUserInfo = {
      id: 'mock-google-user-id',
      email: 'test@luxury-account.com',
      name: 'Test User',
      given_name: 'Test',
      family_name: 'User',
      picture: 'https://via.placeholder.com/150',
      verified_email: true,
      locale: 'en'
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mockUserInfo));
  }

  private handleGoogleToken(req: any, res: any) {
    let body = '';
    req.on('data', (chunk: any) => body += chunk);
    req.on('end', () => {
      const mockTokenResponse = {
        access_token: 'mock-access-token',
        id_token: 'mock-id-token',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        scope: 'openid email profile',
        token_type: 'Bearer'
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(mockTokenResponse));
    });
  }

  private handleStripeCheckoutSession(req: any, res: any) {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk: any) => body += chunk);
      req.on('end', () => {
        const mockSession = {
          id: 'cs_test_mock_session_id',
          object: 'checkout.session',
          url: 'https://checkout.stripe.com/mock-session',
          success_url: 'http://localhost:3000/en/payments/success',
          cancel_url: 'http://localhost:3000/en/payments/canceled',
          mode: 'subscription',
          status: 'open',
          customer: 'cus_mock_customer_id',
          metadata: {
            userId: 'test-user-id',
            planType: 'pro'
          }
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(mockSession));
      });
    } else {
      // GET request - retrieve session
      const mockSession = {
        id: 'cs_test_mock_session_id',
        object: 'checkout.session',
        payment_status: 'paid',
        status: 'complete',
        customer: 'cus_mock_customer_id',
        amount_total: 7900, // $79.00
        currency: 'usd',
        metadata: {
          userId: 'test-user-id',
          planType: 'pro'
        }
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(mockSession));
    }
  }

  private handleStripeBillingPortal(req: any, res: any) {
    let body = '';
    req.on('data', (chunk: any) => body += chunk);
    req.on('end', () => {
      const mockPortalSession = {
        id: 'bps_mock_portal_session_id',
        object: 'billing_portal.session',
        url: 'https://billing.stripe.com/mock-portal-session',
        customer: 'cus_mock_customer_id',
        return_url: 'http://localhost:3000/en/dashboard'
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(mockPortalSession));
    });
  }

  private handleStripeCustomers(req: any, res: any) {
    if (req.method === 'POST') {
      // Create customer
      let body = '';
      req.on('data', (chunk: any) => body += chunk);
      req.on('end', () => {
        const mockCustomer = {
          id: 'cus_mock_customer_id',
          object: 'customer',
          email: 'test@luxury-account.com',
          name: 'Test User',
          created: Math.floor(Date.now() / 1000),
          metadata: {
            userId: 'test-user-id'
          }
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(mockCustomer));
      });
    } else {
      // Retrieve customer
      const mockCustomer = {
        id: 'cus_mock_customer_id',
        object: 'customer',
        email: 'test@luxury-account.com',
        name: 'Test User',
        subscriptions: {
          data: [
            {
              id: 'sub_mock_subscription_id',
              status: 'active',
              current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
              items: {
                data: [
                  {
                    price: {
                      id: 'price_mock_pro_plan',
                      nickname: 'Pro Plan'
                    }
                  }
                ]
              }
            }
          ]
        }
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(mockCustomer));
    }
  }

  private handleStripeWebhook(req: any, res: any) {
    let body = '';
    req.on('data', (chunk: any) => body += chunk);
    req.on('end', () => {
      // Mock successful webhook processing
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ received: true }));
    });
  }

  // Utility methods for tests
  getGoogleOAuthUrl() {
    return `http://localhost:${this.port}/oauth2/v4/token`;
  }

  getStripeApiUrl() {
    return `http://localhost:${this.port}/v1`;
  }

  // Mock external service responses for use in tests
  getMockResponses() {
    return {
      google: {
        userInfo: {
          id: 'mock-google-user-id',
          email: 'test@luxury-account.com',
          name: 'Test User',
          picture: 'https://via.placeholder.com/150'
        },
        token: {
          access_token: 'mock-access-token',
          id_token: 'mock-id-token'
        }
      },
      stripe: {
        checkoutSession: {
          id: 'cs_test_mock_session_id',
          url: 'https://checkout.stripe.com/mock-session'
        },
        customer: {
          id: 'cus_mock_customer_id',
          email: 'test@luxury-account.com'
        }
      }
    };
  }
} 
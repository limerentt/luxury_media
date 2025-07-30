import { chromium, FullConfig } from '@playwright/test';
import { TestDatabase } from './test-database';
import { MockServices } from './mock-services';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test setup...');
  
  try {
    // Initialize test database
    console.log('📊 Setting up test database...');
    const testDb = new TestDatabase();
    await testDb.initialize();
    
    // Start mock services for external APIs
    console.log('🔧 Starting mock services...');
    const mockServices = new MockServices();
    await mockServices.start();
    
    // Set up browser for authentication
    console.log('🔐 Setting up authentication...');
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    // Navigate to the app
    const baseURL = config.projects[0].use?.baseURL || 'http://localhost:3000';
    
    // Wait for the app to be ready
    console.log(`⏳ Waiting for app at ${baseURL}...`);
    let retries = 30;
    while (retries > 0) {
      try {
        await page.goto(`${baseURL}/en`, { 
          waitUntil: 'networkidle',
          timeout: 5000 
        });
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw new Error(`App not ready at ${baseURL} after 30 retries`);
        }
        await page.waitForTimeout(2000);
      }
    }
    
    // Mock Google OAuth login for testing
    await page.route('**/api/auth/**', async (route) => {
      const url = route.request().url();
      
      if (url.includes('/signin/google')) {
        // Mock successful Google OAuth response
        await route.fulfill({
          status: 302,
          headers: {
            'Location': '/en/dashboard',
            'Set-Cookie': 'next-auth.session-token=mock-session-token; Path=/; HttpOnly; SameSite=lax'
          }
        });
      } else if (url.includes('/session')) {
        // Mock session response
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: 'test-user-id',
              name: 'Test User',
              email: 'test@luxury-account.com',
              image: 'https://via.placeholder.com/150'
            },
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          })
        });
      } else {
        await route.continue();
      }
    });
    
    // Mock Stripe API calls
    await page.route('**/api/payments/**', async (route) => {
      const url = route.request().url();
      
      if (url.includes('/create-checkout-session')) {
        // Mock Stripe checkout session creation
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            sessionId: 'cs_test_mock_session_id',
            url: 'https://checkout.stripe.com/mock-session'
          })
        });
      } else {
        await route.continue();
      }
    });
    
    // Navigate to sign in and perform mock authentication
    await page.goto(`${baseURL}/en/auth/signin`);
    
    // Click the sign in button (this will be intercepted by our mock)
    try {
      await page.click('text=Continue with Google', { timeout: 10000 });
      
      // Wait for redirect to dashboard
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      
      console.log('✅ Mock authentication successful');
    } catch (error) {
      console.log('⚠️ Mock authentication setup - continuing with basic setup');
      // Set mock cookies manually
      await page.context().addCookies([
        {
          name: 'next-auth.session-token',
          value: 'mock-session-token',
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          sameSite: 'Lax'
        }
      ]);
    }
    
    // Save authentication state
    await page.context().storageState({
      path: 'tests/fixtures/auth.json'
    });
    
    await browser.close();
    
    console.log('✅ Global setup completed successfully');
    
    // Store setup information for tests
    process.env.TEST_DATABASE_READY = 'true';
    process.env.MOCK_SERVICES_READY = 'true';
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  }
}

export default globalSetup; 
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class AuthPage extends BasePage {
  // Locators
  private readonly googleSignInButton: Locator;
  private readonly signOutButton: Locator;
  private readonly userMenu: Locator;
  private readonly userAvatar: Locator;
  private readonly signInForm: Locator;
  private readonly errorMessage: Locator;
  private readonly loadingSpinner: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.googleSignInButton = page.locator('text=Continue with Google, button:has-text("Continue with Google")');
    this.signOutButton = page.locator('button:has-text("Sign Out"), button:has-text("Logout")');
    this.userMenu = page.locator('[data-testid="user-menu"], .user-menu');
    this.userAvatar = page.locator('[data-testid="user-avatar"], .user-avatar img');
    this.signInForm = page.locator('form, [data-testid="signin-form"]');
    this.errorMessage = page.locator('.error, [data-testid="error-message"], .text-destructive');
    this.loadingSpinner = page.locator('.loading, .spinner, [data-testid="loading"]');
  }

  // Navigation methods
  async goToSignIn(locale: string = 'en') {
    await this.goto(`/${locale}/auth/signin`);
    await this.waitForElement(this.signInForm);
  }

  async goToSignUp(locale: string = 'en') {
    await this.goto(`/${locale}/auth/signup`);
  }

  // Authentication actions
  async signInWithGoogle() {
    // Wait for the sign-in form to be visible
    await this.expectElementVisible(this.signInForm);
    
    // Click the Google sign-in button
    await this.googleSignInButton.click();
    
    // Wait for either success (redirect to dashboard) or error
    try {
      // Wait for redirect to dashboard
      await this.waitForURL(/\/dashboard/, { timeout: 10000 });
      return { success: true, error: null };
    } catch {
      // Check for error messages if redirect didn't happen
      const errorText = await this.getErrorMessage();
      return { success: false, error: errorText };
    }
  }

  async signOut() {
    // Check if user menu is visible (user is signed in)
    if (await this.isElementVisible(this.userMenu)) {
      await this.userMenu.click();
      await this.expectElementVisible(this.signOutButton);
      await this.signOutButton.click();
      
      // Wait for redirect to home page
      await this.waitForURL(/\/(en|ru)\/?$/, { timeout: 5000 });
      return true;
    }
    return false;
  }

  async mockGoogleOAuth() {
    // Mock successful Google OAuth flow
    await this.mockApiResponse(/\/api\/auth\/signin\/google/, {
      url: '/en/dashboard'
    });

    await this.mockApiResponse(/\/api\/auth\/session/, {
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@luxury-account.com',
        image: 'https://via.placeholder.com/150'
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });
  }

  async mockGoogleOAuthError(errorType: 'access_denied' | 'server_error' | 'network_error' = 'server_error') {
    const errors = {
      access_denied: { error: 'AccessDenied', error_description: 'User denied access' },
      server_error: { error: 'OAuthSignin', error_description: 'OAuth provider error' },
      network_error: { error: 'NetworkError', error_description: 'Network connection failed' }
    };

    await this.mockApiError(/\/api\/auth\/signin\/google/, {
      message: errors[errorType].error_description,
      status: 400
    });
  }

  // Validation methods
  async isSignedIn(): Promise<boolean> {
    try {
      await this.expectElementVisible(this.userMenu);
      return true;
    } catch {
      return false;
    }
  }

  async isSignedOut(): Promise<boolean> {
    return !(await this.isSignedIn());
  }

  async getUserInfo(): Promise<{ name: string; email: string; image?: string } | null> {
    if (!(await this.isSignedIn())) {
      return null;
    }

    // Click user menu to open it
    await this.userMenu.click();
    
    try {
      const nameElement = this.page.locator('[data-testid="user-name"], .user-name');
      const emailElement = this.page.locator('[data-testid="user-email"], .user-email');
      
      const name = await nameElement.textContent() || '';
      const email = await emailElement.textContent() || '';
      const imageUrl = await this.userAvatar.getAttribute('src');
      
      // Close user menu
      await this.page.keyboard.press('Escape');
      
      return {
        name: name.trim(),
        email: email.trim(),
        image: imageUrl || undefined
      };
    } catch {
      // Close user menu on error
      await this.page.keyboard.press('Escape');
      return null;
    }
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
  async expectSignedIn() {
    await this.expectElementVisible(this.userMenu);
    await this.expectURL(/\/dashboard/);
  }

  async expectSignedOut() {
    await this.expectElementHidden(this.userMenu);
    await this.expectElementVisible(this.googleSignInButton);
  }

  async expectErrorMessage(expectedError: string | RegExp) {
    await this.expectElementVisible(this.errorMessage);
    await this.expectElementText(this.errorMessage, expectedError);
  }

  async expectNoErrorMessage() {
    await this.expectElementHidden(this.errorMessage);
  }

  async expectLoadingState() {
    await this.expectElementVisible(this.loadingSpinner);
  }

  async expectNotLoadingState() {
    await this.expectElementHidden(this.loadingSpinner);
  }

  // OAuth flow simulation
  async simulateGoogleOAuthFlow(userInfo: {
    id?: string;
    name?: string;
    email?: string;
    image?: string;
  } = {}) {
    const defaultUser = {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@luxury-account.com',
      image: 'https://via.placeholder.com/150'
    };

    const user = { ...defaultUser, ...userInfo };

    // Mock the OAuth callback
    await this.page.route('**/api/auth/callback/google**', async (route) => {
      await route.fulfill({
        status: 302,
        headers: {
          'Location': '/en/dashboard',
          'Set-Cookie': `next-auth.session-token=mock-session-${user.id}; Path=/; HttpOnly; SameSite=lax`
        }
      });
    });

    // Mock the session endpoint
    await this.mockApiResponse(/\/api\/auth\/session/, {
      user,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });
  }

  // Test utilities
  async waitForAuthenticationComplete() {
    // Wait for either dashboard (success) or error message
    await Promise.race([
      this.waitForURL(/\/dashboard/, { timeout: 10000 }),
      this.waitForElement(this.errorMessage, { timeout: 10000 })
    ]);
  }

  async testSignInFlow() {
    const initialUrl = this.page.url();
    
    // Click sign in button
    await this.googleSignInButton.click();
    
    // Wait for authentication to complete
    await this.waitForAuthenticationComplete();
    
    // Check result
    if (await this.isSignedIn()) {
      return { success: true, redirectedTo: this.page.url() };
    } else {
      return { 
        success: false, 
        error: await this.getErrorMessage(),
        stayedAt: this.page.url() 
      };
    }
  }

  // Session management
  async clearSession() {
    await this.page.context().clearCookies();
    await this.page.context().clearPermissions();
    
    // Clear any stored authentication state
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  async setMockSession(userInfo: {
    id: string;
    name: string;
    email: string;
    image?: string;
  }) {
    // Set session cookie
    await this.page.context().addCookies([
      {
        name: 'next-auth.session-token',
        value: `mock-session-${userInfo.id}`,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        sameSite: 'Lax'
      }
    ]);

    // Mock session API response
    await this.mockApiResponse(/\/api\/auth\/session/, {
      user: userInfo,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });
  }
} 
import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  protected readonly page: Page;
  protected readonly baseURL: string;

  constructor(page: Page) {
    this.page = page;
    this.baseURL = page.context().storageState ? 
      (page.context() as any)._options.baseURL || 'http://localhost:3000' : 
      'http://localhost:3000';
  }

  // Common navigation methods
  async goto(path: string = '') {
    const url = path.startsWith('http') ? path : `${this.baseURL}${path}`;
    await this.page.goto(url, { waitUntil: 'networkidle' });
  }

  async goBack() {
    await this.page.goBack({ waitUntil: 'networkidle' });
  }

  async reload() {
    await this.page.reload({ waitUntil: 'networkidle' });
  }

  // Common element interactions
  async clickElement(selector: string | Locator) {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await element.click();
  }

  async fillInput(selector: string | Locator, value: string) {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await element.fill(value);
  }

  async selectOption(selector: string | Locator, value: string) {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await element.selectOption(value);
  }

  async uploadFile(selector: string | Locator, filePath: string) {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await element.setInputFiles(filePath);
  }

  // Wait methods
  async waitForElement(selector: string | Locator, options?: { timeout?: number, state?: 'visible' | 'hidden' | 'attached' | 'detached' }) {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await element.waitFor(options);
  }

  async waitForText(text: string, options?: { timeout?: number }) {
    await this.page.waitForSelector(`text=${text}`, options);
  }

  async waitForURL(pattern: string | RegExp, options?: { timeout?: number }) {
    await this.page.waitForURL(pattern, options);
  }

  async waitForResponse(urlPattern: string | RegExp, options?: { timeout?: number }) {
    return await this.page.waitForResponse(urlPattern, options);
  }

  async waitForRequest(urlPattern: string | RegExp, options?: { timeout?: number }) {
    return await this.page.waitForRequest(urlPattern, options);
  }

  // Assertion helpers
  async expectElementVisible(selector: string | Locator) {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await expect(element).toBeVisible();
  }

  async expectElementHidden(selector: string | Locator) {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await expect(element).toBeHidden();
  }

  async expectElementText(selector: string | Locator, text: string | RegExp) {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await expect(element).toHaveText(text);
  }

  async expectElementContainsText(selector: string | Locator, text: string) {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await expect(element).toContainText(text);
  }

  async expectElementValue(selector: string | Locator, value: string) {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await expect(element).toHaveValue(value);
  }

  async expectElementCount(selector: string, count: number) {
    await expect(this.page.locator(selector)).toHaveCount(count);
  }

  async expectURL(pattern: string | RegExp) {
    await expect(this.page).toHaveURL(pattern);
  }

  async expectTitle(title: string | RegExp) {
    await expect(this.page).toHaveTitle(title);
  }

  // Utility methods
  async getElementText(selector: string | Locator): Promise<string> {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    return await element.textContent() || '';
  }

  async getElementValue(selector: string | Locator): Promise<string> {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    return await element.inputValue();
  }

  async getElementAttribute(selector: string | Locator, attribute: string): Promise<string | null> {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    return await element.getAttribute(attribute);
  }

  async isElementVisible(selector: string | Locator): Promise<boolean> {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    return await element.isVisible();
  }

  async isElementEnabled(selector: string | Locator): Promise<boolean> {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    return await element.isEnabled();
  }

  async isElementChecked(selector: string | Locator): Promise<boolean> {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    return await element.isChecked();
  }

  // Screenshot methods
  async takeScreenshot(name?: string) {
    const screenshotName = name || `${this.constructor.name}-${Date.now()}`;
    return await this.page.screenshot({ 
      path: `tests/screenshots/${screenshotName}.png`,
      fullPage: true 
    });
  }

  async takeElementScreenshot(selector: string | Locator, name?: string) {
    const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
    const screenshotName = name || `element-${Date.now()}`;
    return await element.screenshot({ 
      path: `tests/screenshots/${screenshotName}.png` 
    });
  }

  // Mock API responses
  async mockApiResponse(url: string | RegExp, response: any, options?: { status?: number }) {
    await this.page.route(url, async (route) => {
      await route.fulfill({
        status: options?.status || 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  }

  async mockApiError(url: string | RegExp, error: { message: string, status?: number }) {
    await this.page.route(url, async (route) => {
      await route.fulfill({
        status: error.status || 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: error.message })
      });
    });
  }

  // Form helpers
  async fillForm(formData: Record<string, string>) {
    for (const [field, value] of Object.entries(formData)) {
      await this.fillInput(`[name="${field}"], #${field}`, value);
    }
  }

  async submitForm(formSelector?: string) {
    const form = formSelector ? this.page.locator(formSelector) : this.page.locator('form').first();
    await form.locator('button[type="submit"], input[type="submit"]').click();
  }

  // Loading states
  async waitForLoadingComplete() {
    // Wait for common loading indicators to disappear
    const loadingSelectors = [
      '[data-testid="loading"]',
      '.loading',
      '.spinner',
      '.skeleton'
    ];

    for (const selector of loadingSelectors) {
      try {
        await this.page.locator(selector).waitFor({ state: 'hidden', timeout: 5000 });
      } catch {
        // Ignore if loading indicator doesn't exist
      }
    }
  }

  // Language switching for i18n
  async switchLanguage(language: 'en' | 'ru') {
    const currentUrl = this.page.url();
    const newUrl = currentUrl.replace(/\/(en|ru)\//, `/${language}/`);
    await this.goto(newUrl);
  }

  // Accessibility helpers
  async expectNoAxeViolations() {
    // Note: This would require @axe-core/playwright to be installed
    // await expect(this.page).toPassAxeTests();
  }

  // Performance helpers
  async expectPageLoadTime(maxTime: number) {
    const startTime = Date.now();
    await this.page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThanOrEqual(maxTime);
  }
}

// Type definitions for common test data
export interface TestUser {
  email: string;
  name: string;
  password?: string;
}

export interface MediaRequest {
  type: 'image' | 'video' | 'audio';
  prompt: string;
  parameters?: Record<string, any>;
}

export interface PaymentData {
  planType: 'basic' | 'pro' | 'enterprise';
  paymentMethod?: 'card' | 'paypal';
} 
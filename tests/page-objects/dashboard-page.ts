import { Page, Locator } from '@playwright/test';
import { BasePage, MediaRequest } from './base-page';

export class DashboardPage extends BasePage {
  // Navigation locators
  private readonly dashboardNav: Locator;
  private readonly createMediaButton: Locator;
  private readonly mediaRequestsTab: Locator;
  private readonly historyTab: Locator;
  private readonly settingsTab: Locator;

  // Media creation form locators
  private readonly mediaTypeSelect: Locator;
  private readonly promptInput: Locator;
  private readonly styleSelect: Locator;
  private readonly dimensionsSelect: Locator;
  private readonly qualitySelect: Locator;
  private readonly durationInput: Locator;
  private readonly submitRequestButton: Locator;
  private readonly cancelButton: Locator;

  // Media requests list locators
  private readonly mediaRequestsList: Locator;
  private readonly mediaRequestItem: Locator;
  private readonly requestStatus: Locator;
  private readonly requestProgress: Locator;
  private readonly downloadButton: Locator;
  private readonly retryButton: Locator;
  private readonly deleteButton: Locator;

  // Filters and search
  private readonly searchInput: Locator;
  private readonly statusFilter: Locator;
  private readonly typeFilter: Locator;
  private readonly dateFilter: Locator;
  private readonly sortSelect: Locator;

  // Empty states and messages
  private readonly emptyState: Locator;
  private readonly loadingState: Locator;
  private readonly errorMessage: Locator;
  private readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);

    // Navigation
    this.dashboardNav = page.locator('[data-testid="dashboard-nav"], .dashboard-nav');
    this.createMediaButton = page.locator('button:has-text("Create"), [data-testid="create-media-button"]');
    this.mediaRequestsTab = page.locator('text=Media Requests, [data-testid="media-requests-tab"]');
    this.historyTab = page.locator('text=History, [data-testid="history-tab"]');
    this.settingsTab = page.locator('text=Settings, [data-testid="settings-tab"]');

    // Media creation form
    this.mediaTypeSelect = page.locator('select[name="type"], [data-testid="media-type-select"]');
    this.promptInput = page.locator('textarea[name="prompt"], input[name="prompt"], [data-testid="prompt-input"]');
    this.styleSelect = page.locator('select[name="style"], [data-testid="style-select"]');
    this.dimensionsSelect = page.locator('select[name="dimensions"], [data-testid="dimensions-select"]');
    this.qualitySelect = page.locator('select[name="quality"], [data-testid="quality-select"]');
    this.durationInput = page.locator('input[name="duration"], [data-testid="duration-input"]');
    this.submitRequestButton = page.locator('button:has-text("Generate"), button:has-text("Create"), [data-testid="submit-request"]');
    this.cancelButton = page.locator('button:has-text("Cancel"), [data-testid="cancel-button"]');

    // Media requests list
    this.mediaRequestsList = page.locator('[data-testid="media-requests-list"], .media-requests-list');
    this.mediaRequestItem = page.locator('[data-testid="media-request-item"], .media-request-item');
    this.requestStatus = page.locator('[data-testid="request-status"], .request-status');
    this.requestProgress = page.locator('[data-testid="request-progress"], .progress-bar');
    this.downloadButton = page.locator('button:has-text("Download"), [data-testid="download-button"]');
    this.retryButton = page.locator('button:has-text("Retry"), [data-testid="retry-button"]');
    this.deleteButton = page.locator('button:has-text("Delete"), [data-testid="delete-button"]');

    // Filters and search
    this.searchInput = page.locator('input[placeholder*="Search"], [data-testid="search-input"]');
    this.statusFilter = page.locator('select[name="status"], [data-testid="status-filter"]');
    this.typeFilter = page.locator('select[name="type"], [data-testid="type-filter"]');
    this.dateFilter = page.locator('select[name="date"], [data-testid="date-filter"]');
    this.sortSelect = page.locator('select[name="sort"], [data-testid="sort-select"]');

    // States and messages
    this.emptyState = page.locator('[data-testid="empty-state"], .empty-state');
    this.loadingState = page.locator('[data-testid="loading"], .loading, .spinner');
    this.errorMessage = page.locator('[data-testid="error-message"], .error-message');
    this.successMessage = page.locator('[data-testid="success-message"], .success-message');
  }

  // Navigation methods
  async goToDashboard(locale: string = 'en') {
    await this.goto(`/${locale}/dashboard`);
    await this.waitForElement(this.dashboardNav);
  }

  async goToMediaRequests() {
    await this.mediaRequestsTab.click();
    await this.waitForElement(this.mediaRequestsList);
  }

  async goToHistory() {
    await this.historyTab.click();
  }

  async goToSettings() {
    await this.settingsTab.click();
  }

  // Media creation methods
  async openCreateMediaForm() {
    await this.createMediaButton.click();
    await this.waitForElement(this.mediaTypeSelect);
  }

  async createMediaRequest(request: MediaRequest) {
    // Open create form
    await this.openCreateMediaForm();

    // Fill form
    await this.selectOption(this.mediaTypeSelect, request.type);
    await this.fillInput(this.promptInput, request.prompt);

    // Fill optional parameters
    if (request.parameters) {
      if (request.parameters.style) {
        await this.selectOption(this.styleSelect, request.parameters.style);
      }
      if (request.parameters.dimensions) {
        await this.selectOption(this.dimensionsSelect, request.parameters.dimensions);
      }
      if (request.parameters.quality) {
        await this.selectOption(this.qualitySelect, request.parameters.quality);
      }
      if (request.parameters.duration) {
        await this.fillInput(this.durationInput, request.parameters.duration.toString());
      }
    }

    // Submit form
    await this.submitRequestButton.click();

    // Wait for success message or redirect
    try {
      await this.waitForElement(this.successMessage, { timeout: 5000 });
      return { success: true, error: null };
    } catch {
      const error = await this.getErrorMessage();
      return { success: false, error };
    }
  }

  async fillMediaForm(request: Partial<MediaRequest>) {
    if (request.type) {
      await this.selectOption(this.mediaTypeSelect, request.type);
    }
    if (request.prompt) {
      await this.fillInput(this.promptInput, request.prompt);
    }
    if (request.parameters) {
      // Fill parameter-specific fields based on media type
      for (const [key, value] of Object.entries(request.parameters)) {
        switch (key) {
          case 'style':
            await this.selectOption(this.styleSelect, value);
            break;
          case 'dimensions':
            await this.selectOption(this.dimensionsSelect, value);
            break;
          case 'quality':
            await this.selectOption(this.qualitySelect, value);
            break;
          case 'duration':
            await this.fillInput(this.durationInput, value.toString());
            break;
        }
      }
    }
  }

  async submitMediaRequest() {
    await this.submitRequestButton.click();
    
    // Wait for either success or error
    return await Promise.race([
      this.waitForElement(this.successMessage, { timeout: 10000 }).then(() => ({ success: true })),
      this.waitForElement(this.errorMessage, { timeout: 10000 }).then(() => ({ success: false }))
    ]);
  }

  // Media request management
  async getMediaRequests(): Promise<Array<{
    id: string;
    type: string;
    prompt: string;
    status: string;
    createdAt?: string;
  }>> {
    await this.waitForElement(this.mediaRequestsList);
    
    const requests = await this.mediaRequestItem.all();
    const requestData = [];

    for (const request of requests) {
      const id = await request.getAttribute('data-request-id') || '';
      const type = await request.locator('[data-testid="request-type"]').textContent() || '';
      const prompt = await request.locator('[data-testid="request-prompt"]').textContent() || '';
      const status = await request.locator('[data-testid="request-status"]').textContent() || '';
      const createdAt = await request.locator('[data-testid="request-date"]').textContent() || '';

      requestData.push({
        id: id.trim(),
        type: type.trim(),
        prompt: prompt.trim(),
        status: status.trim(),
        createdAt: createdAt.trim()
      });
    }

    return requestData;
  }

  async getMediaRequestByIndex(index: number) {
    const requests = await this.mediaRequestItem.all();
    if (index >= requests.length) {
      throw new Error(`Request index ${index} not found. Only ${requests.length} requests available.`);
    }
    return requests[index];
  }

  async getMediaRequestById(id: string) {
    return this.page.locator(`[data-request-id="${id}"]`);
  }

  async downloadMediaRequest(requestId: string) {
    const request = await this.getMediaRequestById(requestId);
    const downloadButton = request.locator(this.downloadButton);
    
    // Start waiting for download before clicking
    const downloadPromise = this.page.waitForEvent('download');
    await downloadButton.click();
    
    const download = await downloadPromise;
    return download;
  }

  async retryMediaRequest(requestId: string) {
    const request = await this.getMediaRequestById(requestId);
    const retryButton = request.locator(this.retryButton);
    await retryButton.click();
    
    // Wait for status to change
    await this.page.waitForTimeout(1000);
  }

  async deleteMediaRequest(requestId: string) {
    const request = await this.getMediaRequestById(requestId);
    const deleteButton = request.locator(this.deleteButton);
    await deleteButton.click();
    
    // Confirm deletion if there's a confirmation dialog
    try {
      const confirmButton = this.page.locator('button:has-text("Confirm"), button:has-text("Delete")');
      await confirmButton.click({ timeout: 2000 });
    } catch {
      // No confirmation dialog
    }
  }

  // Filter and search methods
  async searchMediaRequests(query: string) {
    await this.fillInput(this.searchInput, query);
    await this.page.keyboard.press('Enter');
    await this.waitForLoadingComplete();
  }

  async filterByStatus(status: 'all' | 'pending' | 'processing' | 'completed' | 'failed') {
    await this.selectOption(this.statusFilter, status);
    await this.waitForLoadingComplete();
  }

  async filterByType(type: 'all' | 'image' | 'video' | 'audio') {
    await this.selectOption(this.typeFilter, type);
    await this.waitForLoadingComplete();
  }

  async filterByDate(period: 'all' | 'today' | 'week' | 'month') {
    await this.selectOption(this.dateFilter, period);
    await this.waitForLoadingComplete();
  }

  async sortRequests(sortBy: 'newest' | 'oldest' | 'status' | 'type') {
    await this.selectOption(this.sortSelect, sortBy);
    await this.waitForLoadingComplete();
  }

  // Utility methods
  async waitForRequestToComplete(requestId: string, timeout: number = 30000) {
    const request = await this.getMediaRequestById(requestId);
    const statusElement = request.locator(this.requestStatus);
    
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const status = await statusElement.textContent();
      if (status === 'completed' || status === 'failed') {
        return status;
      }
      await this.page.waitForTimeout(2000);
    }
    throw new Error(`Request ${requestId} did not complete within ${timeout}ms`);
  }

  async getRequestStatus(requestId: string): Promise<string> {
    const request = await this.getMediaRequestById(requestId);
    const statusElement = request.locator(this.requestStatus);
    return await statusElement.textContent() || '';
  }

  async getRequestProgress(requestId: string): Promise<number> {
    const request = await this.getMediaRequestById(requestId);
    const progressElement = request.locator(this.requestProgress);
    
    try {
      const progressText = await progressElement.textContent();
      const match = progressText?.match(/(\d+)%/);
      return match ? parseInt(match[1]) : 0;
    } catch {
      return 0;
    }
  }

  // Assertion helpers
  async expectDashboardLoaded() {
    await this.expectElementVisible(this.dashboardNav);
    await this.expectElementVisible(this.createMediaButton);
  }

  async expectEmptyState() {
    await this.expectElementVisible(this.emptyState);
    await this.expectElementHidden(this.mediaRequestItem);
  }

  async expectMediaRequestsVisible() {
    await this.expectElementVisible(this.mediaRequestsList);
    await this.expectElementVisible(this.mediaRequestItem);
  }

  async expectRequestWithStatus(requestId: string, expectedStatus: string) {
    const request = await this.getMediaRequestById(requestId);
    const statusElement = request.locator(this.requestStatus);
    await this.expectElementText(statusElement, expectedStatus);
  }

  async expectSuccessMessage(message?: string) {
    await this.expectElementVisible(this.successMessage);
    if (message) {
      await this.expectElementContainsText(this.successMessage, message);
    }
  }

  async expectErrorMessage(message?: string) {
    await this.expectElementVisible(this.errorMessage);
    if (message) {
      await this.expectElementContainsText(this.errorMessage, message);
    }
  }

  // Mock API responses for testing
  async mockMediaRequestCreation(response: { success: boolean; requestId?: string; error?: string }) {
    await this.page.route('**/api/media-requests', async (route) => {
      if (route.request().method() === 'POST') {
        if (response.success) {
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({
              id: response.requestId || 'test-request-id',
              status: 'pending',
              message: 'Media request created successfully'
            })
          });
        } else {
          await route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({
              error: response.error || 'Failed to create media request'
            })
          });
        }
      } else {
        await route.continue();
      }
    });
  }

  async mockMediaRequestsList(requests: Array<any>) {
    await this.mockApiResponse(/\/api\/media-requests/, requests);
  }

  async mockMediaRequestStatus(requestId: string, status: string, progress?: number) {
    await this.mockApiResponse(new RegExp(`/api/media-requests/${requestId}`), {
      id: requestId,
      status,
      progress: progress || (status === 'completed' ? 100 : status === 'processing' ? 50 : 0)
    });
  }

  private async getErrorMessage(): Promise<string | null> {
    try {
      await this.expectElementVisible(this.errorMessage);
      return await this.getElementText(this.errorMessage);
    } catch {
      return null;
    }
  }
} 
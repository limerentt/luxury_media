import { faker } from '@faker-js/faker';

export interface TestUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  createdAt: Date;
}

export interface TestMediaRequest {
  id: string;
  userId: string;
  type: 'image' | 'video' | 'audio';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  parameters: Record<string, any>;
  createdAt: Date;
}

export interface TestPayment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  stripeSessionId?: string;
  createdAt: Date;
}

export class TestDatabase {
  private users: TestUser[] = [];
  private mediaRequests: TestMediaRequest[] = [];
  private payments: TestPayment[] = [];

  async initialize() {
    console.log('📊 Initializing test database...');
    
    // Create test users
    this.users = [
      {
        id: 'test-user-id',
        email: 'test@luxury-account.com',
        name: 'Test User',
        image: 'https://via.placeholder.com/150',
        createdAt: new Date(),
      },
      {
        id: 'premium-user-id',
        email: 'premium@luxury-account.com',
        name: 'Premium User',
        image: 'https://via.placeholder.com/150',
        createdAt: new Date(),
      },
    ];

    // Create sample media requests
    this.mediaRequests = [
      {
        id: 'media-req-1',
        userId: 'test-user-id',
        type: 'image',
        status: 'completed',
        parameters: {
          prompt: 'A luxury car in a modern city',
          style: 'photorealistic',
          dimensions: '1024x1024',
        },
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        id: 'media-req-2',
        userId: 'test-user-id',
        type: 'video',
        status: 'processing',
        parameters: {
          prompt: 'Sunset over luxury resort',
          duration: 10,
          quality: '4K',
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
    ];

    // Create sample payments
    this.payments = [
      {
        id: 'payment-1',
        userId: 'premium-user-id',
        amount: 2900, // $29.00
        currency: 'usd',
        status: 'completed',
        stripeSessionId: 'cs_test_completed_session',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      },
    ];

    console.log(`✅ Test database initialized with ${this.users.length} users, ${this.mediaRequests.length} media requests, ${this.payments.length} payments`);
  }

  // User methods
  async createUser(userData: Partial<TestUser> = {}): Promise<TestUser> {
    const user: TestUser = {
      id: userData.id || faker.string.uuid(),
      email: userData.email || faker.internet.email(),
      name: userData.name || faker.person.fullName(),
      image: userData.image || faker.image.avatar(),
      createdAt: userData.createdAt || new Date(),
    };

    this.users.push(user);
    return user;
  }

  async getUserById(id: string): Promise<TestUser | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByEmail(email: string): Promise<TestUser | undefined> {
    return this.users.find(user => user.email === email);
  }

  // Media request methods
  async createMediaRequest(requestData: Partial<TestMediaRequest>): Promise<TestMediaRequest> {
    const request: TestMediaRequest = {
      id: requestData.id || faker.string.uuid(),
      userId: requestData.userId || 'test-user-id',
      type: requestData.type || 'image',
      status: requestData.status || 'pending',
      parameters: requestData.parameters || {},
      createdAt: requestData.createdAt || new Date(),
    };

    this.mediaRequests.push(request);
    return request;
  }

  async getMediaRequestsByUser(userId: string): Promise<TestMediaRequest[]> {
    return this.mediaRequests.filter(req => req.userId === userId);
  }

  async updateMediaRequestStatus(id: string, status: TestMediaRequest['status']) {
    const request = this.mediaRequests.find(req => req.id === id);
    if (request) {
      request.status = status;
    }
  }

  // Payment methods
  async createPayment(paymentData: Partial<TestPayment>): Promise<TestPayment> {
    const payment: TestPayment = {
      id: paymentData.id || faker.string.uuid(),
      userId: paymentData.userId || 'test-user-id',
      amount: paymentData.amount || 2900,
      currency: paymentData.currency || 'usd',
      status: paymentData.status || 'pending',
      stripeSessionId: paymentData.stripeSessionId,
      createdAt: paymentData.createdAt || new Date(),
    };

    this.payments.push(payment);
    return payment;
  }

  async getPaymentsByUser(userId: string): Promise<TestPayment[]> {
    return this.payments.filter(payment => payment.userId === userId);
  }

  // Utility methods
  async cleanup() {
    this.users = [];
    this.mediaRequests = [];
    this.payments = [];
    console.log('🧹 Test database cleaned up');
  }

  async seed() {
    await this.initialize();
    
    // Add more test data for comprehensive testing
    for (let i = 0; i < 5; i++) {
      await this.createUser({
        email: `user${i}@test.com`,
        name: `Test User ${i}`,
      });
    }

    // Create various media requests for testing
    const testUser = this.users[0];
    await this.createMediaRequest({
      userId: testUser.id,
      type: 'image',
      status: 'completed',
      parameters: { prompt: 'Test image generation' },
    });

    await this.createMediaRequest({
      userId: testUser.id,
      type: 'video',
      status: 'failed',
      parameters: { prompt: 'Test video generation' },
    });

    console.log('🌱 Test database seeded with additional test data');
  }

  // Mock API responses
  getMockApiResponses() {
    return {
      '/api/users/me': this.users[0],
      '/api/media-requests': this.mediaRequests.filter(req => req.userId === 'test-user-id'),
      '/api/payments': this.payments.filter(payment => payment.userId === 'test-user-id'),
    };
  }
} 
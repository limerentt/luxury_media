import { FullConfig } from '@playwright/test';
import { MockServices } from './mock-services';
import { TestDatabase } from './test-database';
import fs from 'fs';
import path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global test teardown...');
  
  try {
    // Clean up test database
    console.log('📊 Cleaning up test database...');
    const testDb = new TestDatabase();
    await testDb.cleanup();
    
    // Stop mock services
    console.log('🛑 Stopping mock services...');
    const mockServices = new MockServices();
    await mockServices.stop();
    
    // Clean up auth storage
    const authFile = path.join(__dirname, 'auth.json');
    if (fs.existsSync(authFile)) {
      fs.unlinkSync(authFile);
      console.log('🔐 Cleaned up authentication storage');
    }
    
    // Clean up test artifacts
    const testArtifacts = [
      'test-results',
      'playwright-report',
      'screenshots',
      'videos',
      'traces'
    ];
    
    for (const artifact of testArtifacts) {
      const artifactPath = path.join(process.cwd(), artifact);
      if (fs.existsSync(artifactPath)) {
        // In a real scenario, you might want to preserve these for CI
        if (!process.env.CI) {
          console.log(`🗑️ Cleaning up ${artifact}`);
          // Note: In practice, you might want to use a library like rimraf for cross-platform support
        }
      }
    }
    
    // Clean up environment variables
    delete process.env.TEST_DATABASE_READY;
    delete process.env.MOCK_SERVICES_READY;
    
    console.log('✅ Global teardown completed successfully');
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw error in teardown to avoid masking test failures
  }
}

export default globalTeardown; 
// Simple test to verify logging works
const { LoggerService } = require('./dist/common/logging/logger.service.js');
const { ConfigService } = require('@nestjs/config');

// Mock ConfigService
class MockConfigService {
  get(key) {
    if (key === 'NODE_ENV') return 'development';
    return undefined;
  }
}

try {
  const configService = new MockConfigService();
  const loggerService = new LoggerService(configService);
  
  // Test basic logging
  loggerService.info('Health service logging test', {
    userId: 1,
    endpoint: 'health/test',
    action: 'test_logging'
  });
  
  // Test data access logging
  loggerService.logDataAccess('read', 'sleep_metric', {
    userId: 1,
    endpoint: 'health/sleep',
    action: 'test_data_access',
    sleepMetricId: 123
  });
  
  console.log('✅ Logging test completed successfully');
} catch (error) {
  console.error('❌ Logging test failed:', error.message);
}
// Environment Configuration
// Set to 'test' for development/testing
const ENVIRONMENT = 'test';

// Environment-specific settings
const ENV_CONFIG = {
  test: {
    name: 'test',
    debug: true,
    firebaseConfigFile: 'firebase-config.test.js'
  }
};

// Get current environment config
const currentEnv = ENV_CONFIG[ENVIRONMENT] || ENV_CONFIG.test;

// Export environment info
window.APP_ENV = {
  current: ENVIRONMENT,
  isTest: true,
  debug: currentEnv.debug,
  config: currentEnv
};


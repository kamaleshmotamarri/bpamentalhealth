// Environment Configuration
// Reads from Vercel environment variable or defaults to 'test'
// In Vercel: Set ENVIRONMENT variable in project settings
// Locally: Defaults to 'test' for development

// Check if environment is set via build-time injection (Vercel)
// The build script creates env-inject.js which sets window.BUILD_ENVIRONMENT
const ENVIRONMENT = (typeof window !== 'undefined' && window.BUILD_ENVIRONMENT) 
  ? window.BUILD_ENVIRONMENT 
  : 'test';

// Environment-specific settings
const ENV_CONFIG = {
  test: {
    name: 'test',
    debug: true,
    firebaseConfigFile: 'firebase-config.test.js'
  },
  production: {
    name: 'production',
    debug: false,
    firebaseConfigFile: 'firebase-config.prod.js'
  }
};

// Get current environment config
const currentEnv = ENV_CONFIG[ENVIRONMENT] || ENV_CONFIG.test;
const isProduction = ENVIRONMENT === 'production';

// Export environment info
window.APP_ENV = {
  current: ENVIRONMENT,
  isTest: !isProduction,
  isProduction: isProduction,
  debug: currentEnv.debug,
  config: currentEnv
};


// Build script to generate Firebase config from environment variables
// This runs during Vercel build to create the config file

const fs = require('fs');
const path = require('path');

// Determine environment (default to 'test')
const env = process.env.ENVIRONMENT || 'test';
const isProduction = env === 'production';

// Get Firebase config from environment variables
const getConfig = () => {
  if (isProduction) {
    return {
      apiKey: process.env.FIREBASE_PROD_API_KEY || '',
      authDomain: process.env.FIREBASE_PROD_AUTH_DOMAIN || '',
      projectId: process.env.FIREBASE_PROD_PROJECT_ID || '',
      storageBucket: process.env.FIREBASE_PROD_STORAGE_BUCKET || '',
      messagingSenderId: process.env.FIREBASE_PROD_MESSAGING_SENDER_ID || '',
      appId: process.env.FIREBASE_PROD_APP_ID || ''
    };
  } else {
    return {
      apiKey: process.env.FIREBASE_TEST_API_KEY || '',
      authDomain: process.env.FIREBASE_TEST_AUTH_DOMAIN || '',
      projectId: process.env.FIREBASE_TEST_PROJECT_ID || '',
      storageBucket: process.env.FIREBASE_TEST_STORAGE_BUCKET || '',
      messagingSenderId: process.env.FIREBASE_TEST_MESSAGING_SENDER_ID || '',
      appId: process.env.FIREBASE_TEST_APP_ID || ''
    };
  }
};

const config = getConfig();
const configDir = path.join(__dirname, '..', 'config');

// Ensure config directory exists
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

// Generate both config files to ensure HTML can load the right one
// The HTML files load firebase-config.test.js by default, but we'll generate both

// Generate test config
const testConfigContent = `// Firebase Test Configuration
// Auto-generated from environment variables during build

const firebaseConfigTest = {
  apiKey: "${config.apiKey || process.env.FIREBASE_TEST_API_KEY || ''}",
  authDomain: "${config.authDomain || process.env.FIREBASE_TEST_AUTH_DOMAIN || ''}",
  projectId: "${config.projectId || process.env.FIREBASE_TEST_PROJECT_ID || ''}",
  storageBucket: "${config.storageBucket || process.env.FIREBASE_TEST_STORAGE_BUCKET || ''}",
  messagingSenderId: "${config.messagingSenderId || process.env.FIREBASE_TEST_MESSAGING_SENDER_ID || ''}",
  appId: "${config.appId || process.env.FIREBASE_TEST_APP_ID || ''}"
};

// Export for use in firebase-config.js
window.FIREBASE_CONFIG_TEST = firebaseConfigTest;
`;

// Generate production config
const prodConfig = isProduction ? config : {
  apiKey: process.env.FIREBASE_PROD_API_KEY || '',
  authDomain: process.env.FIREBASE_PROD_AUTH_DOMAIN || '',
  projectId: process.env.FIREBASE_PROD_PROJECT_ID || '',
  storageBucket: process.env.FIREBASE_PROD_STORAGE_BUCKET || '',
  messagingSenderId: process.env.FIREBASE_PROD_MESSAGING_SENDER_ID || '',
  appId: process.env.FIREBASE_PROD_APP_ID || ''
};

const prodConfigContent = `// Firebase Production Configuration
// Auto-generated from environment variables during build

const firebaseConfigProd = {
  apiKey: "${prodConfig.apiKey}",
  authDomain: "${prodConfig.authDomain}",
  projectId: "${prodConfig.projectId}",
  storageBucket: "${prodConfig.storageBucket}",
  messagingSenderId: "${prodConfig.messagingSenderId}",
  appId: "${prodConfig.appId}"
};

// Export for use in firebase-config.js
window.FIREBASE_CONFIG_PROD = firebaseConfigProd;
`;

// Create environment injection file (loaded before env.js in HTML)
const envInjectContent = `// Build-time environment injection
// Auto-generated during Vercel build
window.BUILD_ENVIRONMENT = "${env}";
`;
fs.writeFileSync(path.join(configDir, 'env-inject.js'), envInjectContent, 'utf8');
console.log('✅ Generated env-inject.js with environment:', env);

// Write config files
fs.writeFileSync(path.join(configDir, 'firebase-config.test.js'), testConfigContent, 'utf8');
console.log('✅ Generated firebase-config.test.js from environment variables');

fs.writeFileSync(path.join(configDir, 'firebase-config.prod.js'), prodConfigContent, 'utf8');
console.log('✅ Generated firebase-config.prod.js from environment variables');

// Validate that required values are present for the active environment
const activeConfig = isProduction ? prodConfig : config;
const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingFields = requiredFields.filter(field => !activeConfig[field] || activeConfig[field] === '');

if (missingFields.length > 0) {
  console.warn(`⚠️  Warning: Missing environment variables for ${env} environment: ${missingFields.join(', ')}`);
  console.warn(`   Make sure to set these in your Vercel project settings`);
} else {
  console.log(`✅ All required environment variables are set for ${env} environment`);
}


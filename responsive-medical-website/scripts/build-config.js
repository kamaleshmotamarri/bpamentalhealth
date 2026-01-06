// Build script to generate Firebase config from environment variables
// This runs during Vercel build to create the config file

const fs = require('fs');
const path = require('path');

// Determine environment (default to 'test')
const env = process.env.ENVIRONMENT || 'test';
const isProduction = env === 'production';
const configDir = path.join(__dirname, '..', 'config');

// Ensure config directory exists
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

// Generate both config files to ensure HTML can load the right one
// Always get test config from FIREBASE_TEST_* variables
const testConfig = {
  apiKey: process.env.FIREBASE_TEST_API_KEY || '',
  authDomain: process.env.FIREBASE_TEST_AUTH_DOMAIN || '',
  projectId: process.env.FIREBASE_TEST_PROJECT_ID || '',
  storageBucket: process.env.FIREBASE_TEST_STORAGE_BUCKET || '',
  messagingSenderId: process.env.FIREBASE_TEST_MESSAGING_SENDER_ID || '',
  appId: process.env.FIREBASE_TEST_APP_ID || ''
};

// Always get production config from FIREBASE_PROD_* variables
const prodConfig = {
  apiKey: process.env.FIREBASE_PROD_API_KEY || '',
  authDomain: process.env.FIREBASE_PROD_AUTH_DOMAIN || '',
  projectId: process.env.FIREBASE_PROD_PROJECT_ID || '',
  storageBucket: process.env.FIREBASE_PROD_STORAGE_BUCKET || '',
  messagingSenderId: process.env.FIREBASE_PROD_MESSAGING_SENDER_ID || '',
  appId: process.env.FIREBASE_PROD_APP_ID || ''
};

// Helper function to escape strings for JavaScript (prevents injection issues)
const escapeJS = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
};

// Generate test config
const testConfigContent = `// Firebase Test Configuration
// Auto-generated from environment variables during build

const firebaseConfigTest = {
  apiKey: "${escapeJS(testConfig.apiKey)}",
  authDomain: "${escapeJS(testConfig.authDomain)}",
  projectId: "${escapeJS(testConfig.projectId)}",
  storageBucket: "${escapeJS(testConfig.storageBucket)}",
  messagingSenderId: "${escapeJS(testConfig.messagingSenderId)}",
  appId: "${escapeJS(testConfig.appId)}"
};

// Export for use in firebase-config.js
window.FIREBASE_CONFIG_TEST = firebaseConfigTest;
`;

const prodConfigContent = `// Firebase Production Configuration
// Auto-generated from environment variables during build

const firebaseConfigProd = {
  apiKey: "${escapeJS(prodConfig.apiKey)}",
  authDomain: "${escapeJS(prodConfig.authDomain)}",
  projectId: "${escapeJS(prodConfig.projectId)}",
  storageBucket: "${escapeJS(prodConfig.storageBucket)}",
  messagingSenderId: "${escapeJS(prodConfig.messagingSenderId)}",
  appId: "${escapeJS(prodConfig.appId)}"
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
const activeConfig = isProduction ? prodConfig : testConfig;
const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingFields = requiredFields.filter(field => !activeConfig[field] || activeConfig[field] === '');

if (missingFields.length > 0) {
  console.error(`❌ ERROR: Missing environment variables for ${env} environment: ${missingFields.join(', ')}`);
  console.error(`   Make sure to set these in your Vercel project settings`);
  console.error(`   For ${env} environment, you need: FIREBASE_${env.toUpperCase()}_* variables`);
  process.exit(1);
} else {
  console.log(`✅ All required environment variables are set for ${env} environment`);
  console.log(`   Using project: ${activeConfig.projectId}`);
}

// Also validate the other environment's config (for reference)
const otherConfig = isProduction ? testConfig : prodConfig;
const otherEnv = isProduction ? 'test' : 'production';
const otherMissingFields = requiredFields.filter(field => !otherConfig[field] || otherConfig[field] === '');
if (otherMissingFields.length > 0) {
  console.warn(`⚠️  Note: ${otherEnv} environment config is incomplete (this is OK if you're only using ${env})`);
}


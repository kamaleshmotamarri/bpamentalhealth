// Firebase Test/Development Configuration Example
// Copy this file to firebase-config.test.js and add your actual credentials
// DO NOT commit firebase-config.test.js with real credentials

const firebaseConfigTest = {
  apiKey: "YOUR_TEST_API_KEY_HERE",
  authDomain: "YOUR_TEST_AUTH_DOMAIN_HERE",
  projectId: "YOUR_TEST_PROJECT_ID_HERE",
  storageBucket: "YOUR_TEST_STORAGE_BUCKET_HERE",
  messagingSenderId: "YOUR_TEST_MESSAGING_SENDER_ID_HERE",
  appId: "YOUR_TEST_APP_ID_HERE"
};

// Export for use in firebase-config.js
window.FIREBASE_CONFIG_TEST = firebaseConfigTest;


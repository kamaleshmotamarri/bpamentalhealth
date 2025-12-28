// Firebase Production Configuration Example
// Copy this file to firebase-config.prod.js and add your actual credentials
// DO NOT commit firebase-config.prod.js with real credentials

const firebaseConfigProd = {
  apiKey: "YOUR_PRODUCTION_API_KEY_HERE",
  authDomain: "YOUR_PRODUCTION_AUTH_DOMAIN_HERE",
  projectId: "YOUR_PRODUCTION_PROJECT_ID_HERE",
  storageBucket: "YOUR_PRODUCTION_STORAGE_BUCKET_HERE",
  messagingSenderId: "YOUR_PRODUCTION_MESSAGING_SENDER_ID_HERE",
  appId: "YOUR_PRODUCTION_APP_ID_HERE"
};

// Export for use in firebase-config.js
window.FIREBASE_CONFIG_PROD = firebaseConfigProd;


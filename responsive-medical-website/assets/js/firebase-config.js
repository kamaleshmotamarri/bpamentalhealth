// Firebase Configuration - Environment Based
// This file loads the appropriate Firebase config based on the environment

(function initializeFirebase() {
  try {
    console.log('[Firebase] Starting initialization...');

    // 1. Get Environment
    const currentEnv = window.APP_ENV?.current || 'test';

    // 2. Get Config
    let firebaseConfig;
    if (window.FIREBASE_CONFIG_TEST) {
      firebaseConfig = window.FIREBASE_CONFIG_TEST;
    } else {
      throw new Error('Firebase configuration object (window.FIREBASE_CONFIG_TEST) is missing. Check config/firebase-config.test.js.');
    }

    // 3. Validate Config
    if (!firebaseConfig || !firebaseConfig.apiKey) {
      throw new Error('Invalid Firebase configuration! Missing apiKey.');
    }

    // 4. Check SDKs
    if (typeof firebase === 'undefined') {
      throw new Error('Firebase SDK is not loaded! Check <script> tags for firebase-app-compat.js.');
    }
    if (typeof firebase.auth !== 'function') {
      throw new Error('Firebase Auth SDK is not loaded! Check <script> tags for firebase-auth-compat.js.');
    }

    // 5. Initialize App
    console.log('[Firebase] Initializing with:', firebaseConfig.projectId);
    let app;
    if (!firebase.apps.length) {
      app = firebase.initializeApp(firebaseConfig);
      console.log('[Firebase] App initialized.');
    } else {
      app = firebase.app();
      console.log('[Firebase] Using existing app.');
    }

    // 6. Initialize Auth
    window.firebaseAuth = firebase.auth();
    window.firebaseAuthProvider = new firebase.auth.GoogleAuthProvider();

    // 7. Verify
    if (!window.firebaseAuth) {
      throw new Error('firebase.auth() returned null/undefined despite SDK being present.');
    }

    console.log('[Firebase] ✅ Initialization Complete. Auth Object:', window.firebaseAuth);
    window.firebaseInitialized = true;

  } catch (error) {
    console.error('[Firebase] ❌ Critical Initialization Error:', error);
    window.firebaseInitError = error;
    window.firebaseInitialized = false;
    // Ensure auth is null so checks fail deterministically
    window.firebaseAuth = null;
  }
})();


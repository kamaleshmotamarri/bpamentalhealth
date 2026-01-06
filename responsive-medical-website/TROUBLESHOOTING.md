# Troubleshooting Firebase API Key Error

If you're getting the error: `Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)`

## Common Causes

### 1. Environment Variable Mismatch

**Problem:** You set `ENVIRONMENT=production` but only have `FIREBASE_TEST_*` variables set.

**Solution:** 
- If using `ENVIRONMENT=production`, you MUST set `FIREBASE_PROD_*` variables
- If using `ENVIRONMENT=test` (or leaving it unset), you MUST set `FIREBASE_TEST_*` variables

### 2. Missing Environment Variables in Vercel

**Check your Vercel dashboard:**
1. Go to your project → Settings → Environment Variables
2. Verify ALL required variables are set for your environment:

**For TEST environment:**
```
ENVIRONMENT=test
FIREBASE_TEST_API_KEY=your_api_key
FIREBASE_TEST_AUTH_DOMAIN=your_auth_domain
FIREBASE_TEST_PROJECT_ID=your_project_id
FIREBASE_TEST_STORAGE_BUCKET=your_storage_bucket
FIREBASE_TEST_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_TEST_APP_ID=your_app_id
```

**For PRODUCTION environment:**
```
ENVIRONMENT=production
FIREBASE_PROD_API_KEY=your_api_key
FIREBASE_PROD_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROD_PROJECT_ID=your_project_id
FIREBASE_PROD_STORAGE_BUCKET=your_storage_bucket
FIREBASE_PROD_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_PROD_APP_ID=your_app_id
```

### 3. Environment Variables Not Applied to Correct Environment

**In Vercel, make sure:**
- Variables are set for **Production**, **Preview**, and/or **Development** as needed
- If you only set them for "Development", they won't be available in production builds

### 4. Build Script Not Running

**Check Vercel build logs:**
1. Go to your deployment → View Build Logs
2. Look for messages like:
   - `✅ Generated firebase-config.test.js from environment variables`
   - `✅ All required environment variables are set for test environment`
3. If you see errors like `❌ ERROR: Missing environment variables`, the build script found missing vars

### 5. Empty or Invalid API Key

**Verify:**
- The API key value doesn't have extra spaces or quotes
- The API key is copied correctly from Firebase Console
- The API key matches the correct Firebase project

## Quick Fix Steps

1. **Check your ENVIRONMENT variable:**
   - If it's set to `production`, make sure you have `FIREBASE_PROD_*` vars
   - If it's set to `test` (or not set), make sure you have `FIREBASE_TEST_*` vars

2. **Verify all 6 variables are set:**
   - `API_KEY`
   - `AUTH_DOMAIN`
   - `PROJECT_ID`
   - `STORAGE_BUCKET`
   - `MESSAGING_SENDER_ID`
   - `APP_ID`

3. **Redeploy:**
   - After setting/changing environment variables, trigger a new deployment
   - Vercel doesn't automatically redeploy when env vars change

4. **Check build logs:**
   - Look for the build script output
   - It will tell you which variables are missing

## Getting Your Firebase Config Values

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon → Project Settings
4. Scroll down to "Your apps" section
5. Click on your web app (or create one)
6. Copy the values from the `firebaseConfig` object

## Testing Locally

To test the build script locally:

```bash
cd responsive-medical-website
ENVIRONMENT=test \
FIREBASE_TEST_API_KEY=your_key \
FIREBASE_TEST_AUTH_DOMAIN=your_domain \
FIREBASE_TEST_PROJECT_ID=your_project \
FIREBASE_TEST_STORAGE_BUCKET=your_bucket \
FIREBASE_TEST_MESSAGING_SENDER_ID=your_sender \
FIREBASE_TEST_APP_ID=your_app_id \
node scripts/build-config.js
```

Then check `config/firebase-config.test.js` to see if it was generated correctly.


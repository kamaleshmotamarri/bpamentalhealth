# Vercel Deployment Setup Guide

## Problem
The Firebase config files (`config/firebase-config.test.js` and `config/firebase-config.prod.js`) are excluded from git (via `.gitignore`) for security reasons, so they don't get deployed to Vercel, causing Firebase connection errors.

## Solution
This project now uses a build script that generates the Firebase config files from environment variables during Vercel's build process.

## Setup Instructions

### 1. Set Environment Variables in Vercel

Go to your Vercel project dashboard → Settings → Environment Variables and add the following:

#### For Test/Development Environment:
```
ENVIRONMENT=test
FIREBASE_TEST_API_KEY=your_test_api_key
FIREBASE_TEST_AUTH_DOMAIN=your_test_auth_domain
FIREBASE_TEST_PROJECT_ID=your_test_project_id
FIREBASE_TEST_STORAGE_BUCKET=your_test_storage_bucket
FIREBASE_TEST_MESSAGING_SENDER_ID=your_test_messaging_sender_id
FIREBASE_TEST_APP_ID=your_test_app_id
```

#### For Production Environment:
```
ENVIRONMENT=production
FIREBASE_PROD_API_KEY=your_prod_api_key
FIREBASE_PROD_AUTH_DOMAIN=your_prod_auth_domain
FIREBASE_PROD_PROJECT_ID=your_prod_project_id
FIREBASE_PROD_STORAGE_BUCKET=your_prod_storage_bucket
FIREBASE_PROD_MESSAGING_SENDER_ID=your_prod_messaging_sender_id
FIREBASE_PROD_APP_ID=your_prod_app_id
```

**Important:** Set these for all environments (Production, Preview, Development) or at least for Production.

### 2. Configure Root Directory

In Vercel project settings:
- **Root Directory:** `responsive-medical-website`

### 3. Build Settings

The `vercel.json` file is configured to:
- Run the build script automatically
- Generate the Firebase config files from environment variables
- Deploy the static files

### 4. Deploy

After setting the environment variables:
1. Push your changes to git
2. Vercel will automatically trigger a new deployment
3. The build script will generate the config files during build
4. Your site should now connect to Firebase successfully

## Local Development

For local development, you can still use the local config files:
- `config/firebase-config.test.js` (for test environment)
- `config/firebase-config.prod.js` (for production environment)

These files are gitignored for security, so create them locally from the example files:
- `config/firebase-config.test.example.js`
- `config/firebase-config.prod.example.js`

## Troubleshooting

### Firebase connection still fails?
1. Check Vercel build logs to ensure the build script ran successfully
2. Verify all environment variables are set correctly in Vercel
3. Check browser console for specific Firebase errors
4. Ensure the `ENVIRONMENT` variable matches your desired environment ('test' or 'production')

### Build fails?
1. Make sure Node.js is available (Vercel supports Node.js by default)
2. Check that the `scripts/build-config.js` file exists
3. Verify the `package.json` has the build script

## Quick Start Checklist

- [ ] Set `ENVIRONMENT` variable in Vercel (use `test` or `production`)
- [ ] Set all `FIREBASE_TEST_*` or `FIREBASE_PROD_*` environment variables
- [ ] Configure Root Directory in Vercel: `responsive-medical-website`
- [ ] Push changes to trigger a new deployment
- [ ] Check build logs to verify config files were generated
- [ ] Test Firebase connection in deployed site

## File Structure

```
responsive-medical-website/
├── config/
│   ├── env.js                          # Environment settings (reads from env-inject.js)
│   ├── env-inject.js                   # Build-time environment injection (defaults to 'test')
│   ├── firebase-config.test.js         # Generated during build (gitignored)
│   ├── firebase-config.prod.js         # Generated during build (gitignored)
│   └── firebase-config.*.example.js    # Example files (safe to commit)
├── scripts/
│   └── build-config.js                 # Build script (generates config files from env vars)
├── assets/js/
│   └── firebase-config.js              # Firebase initialization (reads from config files)
├── vercel.json                          # Vercel configuration
└── package.json                         # Build scripts
```

## How It Works

1. **During Vercel Build:**
   - `scripts/build-config.js` runs automatically
   - Reads environment variables from Vercel
   - Generates `config/firebase-config.test.js` and `config/firebase-config.prod.js`
   - Generates `config/env-inject.js` with the current environment

2. **At Runtime:**
   - HTML loads `config/env-inject.js` (sets `window.BUILD_ENVIRONMENT`)
   - HTML loads `config/env.js` (reads environment)
   - HTML loads the appropriate Firebase config file
   - `assets/js/firebase-config.js` initializes Firebase with the config


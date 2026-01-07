# Fixing Firebase Unauthorized Domain Error

## Error Message
```
Firebase: This domain is not authorized for OAuth operations for your Firebase project. 
Edit the list of authorized domains from the Firebase console. (auth/unauthorized-domain)
```

## Solution: Add Domain to Firebase Console

Follow these steps to authorize your Vercel domain:

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your Firebase project (the one you're using for production)

### Step 2: Navigate to Authentication Settings
1. Click on **Authentication** in the left sidebar
2. Click on the **Settings** tab at the top
3. Scroll down to find the **Authorized domains** section

### Step 3: Add Your Vercel Domain
1. Click the **Add domain** button
2. Enter your Vercel domain: `bpamentalhealth.vercel.app`
3. Click **Add**

### Step 4: Add Custom Domain (if you have one)
If you have a custom domain configured in Vercel (e.g., `bpamentalhealth.com`), also add:
- `bpamentalhealth.com` (your custom domain)
- `www.bpamentalhealth.com` (if you use www subdomain)

### Step 5: Verify
After adding the domain:
1. The changes take effect immediately (no deployment needed)
2. Try signing in with Google on your Vercel deployment
3. The error should be resolved

## Default Authorized Domains

Firebase automatically authorizes these domains:
- `localhost` (for local development)
- `*.firebaseapp.com` (Firebase hosting)
- `*.web.app` (Firebase hosting)

## Additional Domains to Add

You may also want to add:
- Your local development domain (if different from localhost)
- Any staging/preview domains (Vercel preview deployments use `*.vercel.app`)

## For Vercel Preview Deployments

If you want to test on Vercel preview branches, you can add:
- `*.vercel.app` (wildcard - authorizes all Vercel deployments)

**Note**: Using wildcards allows any Vercel deployment to use OAuth, which may be a security consideration for production.

## Troubleshooting

### Still Getting the Error?
1. **Clear browser cache** - Sometimes browsers cache the error
2. **Wait a few minutes** - Changes can take 1-2 minutes to propagate
3. **Check the domain spelling** - Make sure there are no typos (no trailing slashes, correct subdomain)
4. **Verify Firebase project** - Ensure you're using the correct Firebase project in your production config

### Check Your Firebase Config
Make sure your `config/firebase-config.prod.js` has the correct `authDomain`:
```javascript
authDomain: "your-project-id.firebaseapp.com"
```

The `authDomain` should match your Firebase project's default domain, NOT your Vercel domain.

## Security Notes

- Only add domains you trust and control
- Regularly review your authorized domains list
- Remove any domains you no longer use
- Be cautious with wildcard domains in production


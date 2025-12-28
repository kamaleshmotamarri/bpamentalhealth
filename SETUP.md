# Setup Guide - Environment Configuration

## Quick Start

### 1. Set Environment Mode

The application is currently set to **TEST MODE** by default.

To change the environment, edit `responsive-medical-website/config/env.js`:

```javascript
const ENVIRONMENT = 'test'; // Change to 'production' for live site
```

### 2. Configure Firebase Credentials

#### For Test/Development:
1. Copy `config/firebase-config.test.example.js` to `config/firebase-config.test.js`
2. Edit `config/firebase-config.test.js` and add your test Firebase credentials

#### For Production:
1. Copy `config/firebase-config.prod.example.js` to `config/firebase-config.prod.js`
2. Edit `config/firebase-config.prod.js` and add your production Firebase credentials

### 3. Security

✅ **Protected Files** (in `.gitignore`):
- `config/firebase-config.test.js` - Your actual test credentials
- `config/firebase-config.prod.js` - Your actual production credentials
- `.env` - Environment variables (if using)

✅ **Safe to Commit**:
- `config/env.js` - Environment mode selector
- `config/firebase-config.*.example.js` - Template files
- `.env.example` - Example environment variables

## Current Configuration

- **Environment**: TEST MODE (set in `config/env.js`)
- **Firebase Config**: Loaded from `config/firebase-config.test.js`
- **Debug Mode**: Enabled in test mode

## Switching Between Test and Production

1. Open `responsive-medical-website/config/env.js`
2. Change `ENVIRONMENT` to `'test'` or `'production'`
3. Ensure the corresponding config file exists with correct credentials
4. Refresh your browser

## File Structure

```
responsive-medical-website/
├── config/
│   ├── env.js                          # Environment selector (SAFE TO COMMIT)
│   ├── firebase-config.test.js         # Test credentials (PROTECTED)
│   ├── firebase-config.prod.js         # Prod credentials (PROTECTED)
│   ├── firebase-config.test.example.js # Template (SAFE TO COMMIT)
│   ├── firebase-config.prod.example.js # Template (SAFE TO COMMIT)
│   └── README.md                       # Config documentation
├── .env.example                        # Environment variables example
└── .gitignore                          # Protects sensitive files
```

## Important Notes

⚠️ **Never commit files with real credentials!**

- The `.gitignore` file protects your actual config files
- Always use example/template files for version control
- Use different Firebase projects for test and production
- Keep production credentials secure and separate

## Troubleshooting

**Error: "Firebase configuration not found!"**
- Make sure `config/firebase-config.test.js` or `config/firebase-config.prod.js` exists
- Check that the file exports `window.FIREBASE_CONFIG_TEST` or `window.FIREBASE_CONFIG_PROD`

**Wrong environment being used:**
- Check `config/env.js` - ensure `ENVIRONMENT` is set correctly
- Verify the script loading order in `index.html`


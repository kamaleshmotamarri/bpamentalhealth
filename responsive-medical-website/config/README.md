# Configuration Files

This directory contains environment-specific configuration files for the application.

## Files

- `env.js` - Environment settings (test/production mode)
- `firebase-config.test.js` - Firebase configuration for test/development environment
- `firebase-config.prod.js` - Firebase configuration for production environment

## Setup Instructions

### 1. Configure Environment Mode

Edit `config/env.js` and set the `ENVIRONMENT` variable:
- `'test'` - For development and testing
- `'production'` - For live/production deployment

### 2. Configure Firebase Test Environment

Edit `config/firebase-config.test.js` and add your test Firebase credentials.

### 3. Configure Firebase Production Environment

Edit `config/firebase-config.prod.js` and add your production Firebase credentials.

## Security Notes

⚠️ **IMPORTANT**: 
- These config files are in `.gitignore` to prevent committing sensitive credentials
- Never commit real Firebase API keys or credentials to version control
- Use different Firebase projects for test and production
- Keep production credentials secure and separate

## Switching Environments

To switch between test and production:

1. Open `config/env.js`
2. Change `const ENVIRONMENT = 'test';` to `const ENVIRONMENT = 'production';` (or vice versa)
3. Ensure the corresponding Firebase config file has the correct credentials
4. Refresh the page

## Adding More Configuration

To add more environment-specific settings:

1. Add the setting to `ENV_CONFIG` in `env.js`
2. Access it via `window.APP_ENV.config.yourSetting`
3. Use conditional logic based on `window.APP_ENV.isTest` or `window.APP_ENV.isProduction`


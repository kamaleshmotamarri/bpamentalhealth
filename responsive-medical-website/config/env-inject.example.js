// Build-time environment injection
// Copy to env-inject.js and set GEMINI_API_KEY (or use build script with env vars).
// Never commit env-inject.js if it contains real keys.
window.BUILD_ENVIRONMENT = "test";
window.GEMINI_API_KEY = "not_set";

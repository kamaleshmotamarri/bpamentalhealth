// Build-time environment injection
// Defaults to 'test' for local development
// This file is overwritten during Vercel build with the actual environment
window.BUILD_ENVIRONMENT = window.BUILD_ENVIRONMENT || 'test';


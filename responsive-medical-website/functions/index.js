const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Cloud Function to list all Firebase Authentication users
 * Requires admin authentication token
 */
exports.listUsers = functions.https.onCall(async (data, context) => {
  // Verify that the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  // Verify admin email (replace with your admin email)
  const ADMIN_EMAIL = 'kamaleshmotamarri@gmail.com';
  if (context.auth.token.email !== ADMIN_EMAIL) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only administrators can list users.'
    );
  }

  try {
    // Get all users (Firebase Admin SDK allows listing users)
    const listUsersResult = await admin.auth().listUsers(1000);
    
    // Format users for frontend
    const users = listUsersResult.users.map(user => ({
      uid: user.uid,
      email: user.email || 'No Email',
      displayName: user.displayName || user.email?.split('@')[0] || 'No Name',
      emailVerified: user.emailVerified || false,
      disabled: user.disabled || false,
      metadata: {
        creationTime: user.metadata.creationTime || new Date().toISOString(),
        lastSignInTime: user.metadata.lastSignInTime || null
      },
      providerData: user.providerData || []
    }));

    // If there are more users, we'd need pagination
    // For now, return first 1000 users
    return {
      users: users,
      total: users.length,
      hasMore: listUsersResult.pageToken ? true : false
    };
  } catch (error) {
    console.error('Error listing users:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to list users: ' + error.message
    );
  }
});

/**
 * HTTP Cloud Function alternative (if you prefer REST API)
 */
exports.listUsersHTTP = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Verify authentication token
  let authToken;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    authToken = req.headers.authorization.split('Bearer ')[1];
  } else {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
    return;
  }

  try {
    // Verify token
    const decodedToken = await admin.auth().verifyIdToken(authToken);
    
    // Verify admin email
    const ADMIN_EMAIL = 'kamaleshmotamarri@gmail.com';
    if (decodedToken.email !== ADMIN_EMAIL) {
      res.status(403).json({ error: 'Forbidden: Admin access required' });
      return;
    }

    // Get all users
    const listUsersResult = await admin.auth().listUsers(1000);
    
    // Format users
    const users = listUsersResult.users.map(user => ({
      uid: user.uid,
      email: user.email || 'No Email',
      displayName: user.displayName || user.email?.split('@')[0] || 'No Name',
      emailVerified: user.emailVerified || false,
      disabled: user.disabled || false,
      metadata: {
        creationTime: user.metadata.creationTime || new Date().toISOString(),
        lastSignInTime: user.metadata.lastSignInTime || null
      }
    }));

    res.json({
      users: users,
      total: users.length,
      success: true
    });
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ error: 'Failed to list users: ' + error.message });
  }
});


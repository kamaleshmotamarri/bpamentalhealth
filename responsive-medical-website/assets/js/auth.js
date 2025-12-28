/*=============== FIREBASE AUTHENTICATION ===============*/

// Helper function to get auth from global scope (set in firebase-config.js)
function getAuth() {
  if (!window.firebaseAuth) {
    console.warn('[Auth] window.firebaseAuth is not available. Checking Firebase initialization...');
    console.log('[Auth] window.firebase:', typeof window.firebase);
    console.log('[Auth] window.FIREBASE_CONFIG_TEST:', !!window.FIREBASE_CONFIG_TEST);
    console.log('[Auth] window.APP_ENV:', window.APP_ENV);
  }
  return window.firebaseAuth;
}

function getProvider() {
  return window.firebaseAuthProvider;
}

// Wait for Firebase to be ready before setting up auth observer
let authInitRetries = 0;
const MAX_AUTH_INIT_RETRIES = 20; // Try for up to 4 seconds (20 * 200ms)

function initializeAuth() {
  // Check if Firebase auth is available (retry if not ready)
  const auth = getAuth();
  
  if (!auth) {
    authInitRetries++;
    if (authInitRetries < MAX_AUTH_INIT_RETRIES) {
      console.warn(`[Auth] Firebase Auth not ready yet, retrying... (${authInitRetries}/${MAX_AUTH_INIT_RETRIES})`);
      // Retry after a short delay
      setTimeout(initializeAuth, 200);
      return;
    } else {
      console.error('[Auth] Firebase Auth failed to initialize after multiple retries. Check Firebase configuration.');
      showMessage('Firebase authentication failed to initialize. Please check the console for errors.', 'error');
      return;
    }
  }

  console.log('[Auth] Firebase Auth initialized successfully');
  authInitRetries = 0; // Reset retry counter

  // Authentication state observer
  auth.onAuthStateChanged((user) => {
    if (user) {
      // User is signed in
      updateUIForSignedInUser(user);
    } else {
      // User is signed out
      updateUIForSignedOutUser();
    }
  });
}

// Initialize auth when DOM is ready and scripts are loaded
function startAuthInitialization() {
  // Wait a bit for all scripts to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initializeAuth, 500);
    });
  } else {
    // DOM is already ready, wait for scripts
    setTimeout(initializeAuth, 500);
  }
}

// Start initialization
startAuthInitialization();

// Update UI when user is signed in
function updateUIForSignedInUser(user) {
  const loginButton = document.getElementById('login-button');
  const userInfo = document.getElementById('user-info');
  const logoutButton = document.getElementById('logout-button');
  const authModals = document.querySelectorAll('.auth-modal');
  
  if (loginButton) loginButton.style.display = 'none';
  if (userInfo) {
    userInfo.style.display = 'flex';
    const userEmail = userInfo.querySelector('.user-email');
    const userName = userInfo.querySelector('.user-name');
    if (userEmail) userEmail.textContent = user.email || 'User';
    if (userName) userName.textContent = user.displayName || user.email || 'User';
  }
  if (logoutButton) logoutButton.style.display = 'block';
  
  // Close any open modals
  authModals.forEach(modal => {
    if (modal) modal.classList.remove('show-modal');
  });
}

// Update UI when user is signed out
function updateUIForSignedOutUser() {
  const loginButton = document.getElementById('login-button');
  const userInfo = document.getElementById('user-info');
  const logoutButton = document.getElementById('logout-button');
  
  if (loginButton) loginButton.style.display = 'block';
  if (userInfo) userInfo.style.display = 'none';
  if (logoutButton) logoutButton.style.display = 'none';
}

// Sign up with email and password
async function signUpWithEmail(email, password, displayName) {
  console.log('[Auth] signUpWithEmail called');
  let auth = getAuth();
  console.log('[Auth] Auth object:', auth ? 'available' : 'NOT available');
  
  // If auth is not available, try waiting a bit and retry once
  if (!auth) {
    console.warn('[Auth] Auth not available, waiting 500ms and retrying...');
    await new Promise(resolve => setTimeout(resolve, 500));
    auth = getAuth();
  }
  
  if (!auth) {
    console.error('[Auth] Auth still not available after retry!');
    console.error('[Auth] Debug info:', {
      firebaseExists: typeof firebase !== 'undefined',
      firebaseAuthExists: typeof firebase !== 'undefined' && typeof firebase.auth === 'function',
      windowFirebaseAuth: !!window.firebaseAuth,
      configTest: !!window.FIREBASE_CONFIG_TEST
    });
    showMessage('Authentication service is not available. Please refresh the page and check the console for errors.', 'error');
    return;
  }
  
  try {
    console.log('[Auth] Creating user with email:', email);
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    console.log('[Auth] User created:', user.uid);
    
    // Update profile with display name
    if (displayName) {
      await user.updateProfile({
        displayName: displayName
      });
      console.log('[Auth] Display name updated');
    }
    
    // Close modal
    closeAuthModal('signup-modal');
    
    // Show success message
    showMessage('Account created successfully!', 'success');
    
    return user;
  } catch (error) {
    console.error('[Auth] Signup error:', error.code, error.message);
    handleAuthError(error);
    throw error;
  }
}

// Sign in with email and password
async function signInWithEmail(email, password) {
  console.log('[Auth] signInWithEmail called');
  let auth = getAuth();
  console.log('[Auth] Auth object:', auth ? 'available' : 'NOT available');
  
  // If auth is not available, try waiting a bit and retry once
  if (!auth) {
    console.warn('[Auth] Auth not available, waiting 500ms and retrying...');
    await new Promise(resolve => setTimeout(resolve, 500));
    auth = getAuth();
  }
  
  if (!auth) {
    console.error('[Auth] Auth still not available after retry!');
    console.error('[Auth] Debug info:', {
      firebaseExists: typeof firebase !== 'undefined',
      firebaseAuthExists: typeof firebase !== 'undefined' && typeof firebase.auth === 'function',
      windowFirebaseAuth: !!window.firebaseAuth,
      configTest: !!window.FIREBASE_CONFIG_TEST
    });
    showMessage('Authentication service is not available. Please refresh the page and check the console for errors.', 'error');
    return;
  }
  
  try {
    console.log('[Auth] Signing in with email:', email);
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    console.log('[Auth] User signed in:', user.uid);
    
    // Close modal
    closeAuthModal('login-modal');
    
    // Show success message
    showMessage('Signed in successfully!', 'success');
    
    return user;
  } catch (error) {
    console.error('[Auth] Signin error:', error.code, error.message);
    handleAuthError(error);
    throw error;
  }
}

// Sign in with Google
async function signInWithGoogle() {
  const auth = getAuth();
  const provider = getProvider();
  if (!auth || !provider) {
    showMessage('Authentication service is not available. Please refresh the page.', 'error');
    return;
  }
  
  try {
    const result = await auth.signInWithPopup(provider);
    const user = result.user;
    
    // Close any open modals
    closeAuthModal('login-modal');
    closeAuthModal('signup-modal');
    
    // Show success message
    showMessage('Signed in with Google successfully!', 'success');
    
    return user;
  } catch (error) {
    handleAuthError(error);
    throw error;
  }
}

// Sign out
async function signOut() {
  const auth = getAuth();
  if (!auth) {
    showMessage('Authentication service is not available. Please refresh the page.', 'error');
    return;
  }
  
  try {
    await auth.signOut();
    showMessage('Signed out successfully!', 'success');
  } catch (error) {
    handleAuthError(error);
  }
}

// Handle authentication errors
function handleAuthError(error) {
  let errorMessage = 'An error occurred. Please try again.';
  
  switch (error.code) {
    case 'auth/email-already-in-use':
      errorMessage = 'This email is already registered. Please sign in instead.';
      break;
    case 'auth/invalid-email':
      errorMessage = 'Invalid email address.';
      break;
    case 'auth/operation-not-allowed':
      errorMessage = 'This operation is not allowed.';
      break;
    case 'auth/weak-password':
      errorMessage = 'Password should be at least 6 characters.';
      break;
    case 'auth/user-disabled':
      errorMessage = 'This account has been disabled.';
      break;
    case 'auth/user-not-found':
      errorMessage = 'No account found with this email.';
      break;
    case 'auth/wrong-password':
      errorMessage = 'Incorrect password.';
      break;
    case 'auth/popup-closed-by-user':
      errorMessage = 'Sign-in popup was closed.';
      break;
    case 'auth/cancelled-popup-request':
      errorMessage = 'Only one popup request is allowed at a time.';
      break;
    default:
      errorMessage = error.message || errorMessage;
  }
  
  showMessage(errorMessage, 'error');
}

// Show message to user
function showMessage(message, type = 'info') {
  // Remove existing message if any
  const existingMessage = document.querySelector('.auth-message');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  // Create message element
  const messageEl = document.createElement('div');
  messageEl.className = `auth-message auth-message-${type}`;
  messageEl.textContent = message;
  
  // Add to body
  document.body.appendChild(messageEl);
  
  // Show message
  setTimeout(() => {
    messageEl.classList.add('show');
  }, 10);
  
  // Remove message after 5 seconds
  setTimeout(() => {
    messageEl.classList.remove('show');
    setTimeout(() => {
      messageEl.remove();
    }, 300);
  }, 5000);
}

// Open authentication modal
function openAuthModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('show-modal');
    document.body.style.overflow = 'hidden';
    console.log('[Auth] Modal opened:', modalId);
  } else {
    console.error('[Auth] Modal not found:', modalId);
  }
}

// Close authentication modal
function closeAuthModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('show-modal');
    document.body.style.overflow = '';
    
    // Clear form fields
    const form = modal.querySelector('form');
    if (form) {
      form.reset();
    }
    
    // Clear error messages
    const errorMessages = modal.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
  }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('auth-modal')) {
    const modalId = e.target.id;
    closeAuthModal(modalId);
  }
});

// Event listeners for sign up form
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Auth] Setting up event listeners...');
  
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    console.log('[Auth] Signup form found');
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('[Auth] Signup form submitted');
      
      const email = signupForm.querySelector('#signup-email').value;
      const password = signupForm.querySelector('#signup-password').value;
      const displayName = signupForm.querySelector('#signup-name').value;
      const confirmPassword = signupForm.querySelector('#signup-confirm-password').value;
      
      console.log('[Auth] Signup attempt:', { email, hasPassword: !!password, hasName: !!displayName });
      
      // Validate passwords match
      if (password !== confirmPassword) {
        showMessage('Passwords do not match!', 'error');
        return;
      }
      
      // Validate password length
      if (password.length < 6) {
        showMessage('Password must be at least 6 characters!', 'error');
        return;
      }
      
      try {
        await signUpWithEmail(email, password, displayName);
      } catch (error) {
        console.error('[Auth] Signup error:', error);
        // Error already handled in signUpWithEmail
      }
    });
  } else {
    console.error('[Auth] Signup form NOT found!');
  }
  
  // Event listeners for sign in form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    console.log('[Auth] Login form found');
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('[Auth] Login form submitted');
      
      const email = loginForm.querySelector('#login-email').value;
      const password = loginForm.querySelector('#login-password').value;
      
      console.log('[Auth] Login attempt:', { email, hasPassword: !!password });
      
      try {
        await signInWithEmail(email, password);
      } catch (error) {
        console.error('[Auth] Login error:', error);
        // Error already handled in signInWithEmail
      }
    });
  } else {
    console.error('[Auth] Login form NOT found!');
  }
  
  // Google sign in button
  const googleSignInBtn = document.getElementById('google-signin-btn');
  if (googleSignInBtn) {
    googleSignInBtn.addEventListener('click', async () => {
      try {
        await signInWithGoogle();
      } catch (error) {
        // Error already handled in signInWithGoogle
      }
    });
  }
  
  // Google sign up button
  const googleSignUpBtn = document.getElementById('google-signup-btn');
  if (googleSignUpBtn) {
    googleSignUpBtn.addEventListener('click', async () => {
      try {
        await signInWithGoogle();
      } catch (error) {
        // Error already handled in signInWithGoogle
      }
    });
  }
  
  // Logout button
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      if (confirm('Are you sure you want to sign out?')) {
        await signOut();
      }
    });
  }
  
  // Switch between login and signup modals
  const switchToSignup = document.getElementById('switch-to-signup');
  if (switchToSignup) {
    switchToSignup.addEventListener('click', (e) => {
      e.preventDefault();
      closeAuthModal('login-modal');
      setTimeout(() => {
        openAuthModal('signup-modal');
      }, 300);
    });
  }
  
  const switchToLogin = document.getElementById('switch-to-login');
  if (switchToLogin) {
    switchToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      closeAuthModal('signup-modal');
      setTimeout(() => {
        openAuthModal('login-modal');
      }, 300);
    });
  }
  
  // Close modal buttons
  const closeModalButtons = document.querySelectorAll('.auth-modal-close');
  closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.auth-modal');
      if (modal) {
        closeAuthModal(modal.id);
      }
    });
  });
  
  // Login button
  const loginButton = document.getElementById('login-button');
  if (loginButton) {
    console.log('[Auth] Login button found');
    loginButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('[Auth] Login button clicked');
      openAuthModal('login-modal');
    });
  } else {
    console.error('[Auth] Login button NOT found!');
  }
  
  console.log('[Auth] Event listeners setup complete');
});


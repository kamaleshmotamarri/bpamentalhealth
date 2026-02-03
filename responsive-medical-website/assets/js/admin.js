/*=============== ADMIN PORTAL FUNCTIONALITY ===============*/

// Admin email (only this user can access)
const ADMIN_EMAIL = 'kamaleshmotamarri@gmail.com';

// Admin state
let adminState = {
  currentUser: null,
  isAdmin: false,
  users: [],
  filteredUsers: [],
  searchQuery: '',
  filterStatus: 'all'
};

// Initialize admin portal
document.addEventListener('DOMContentLoaded', () => {
  initializeAdmin();
});

// Initialize admin
function initializeAdmin() {
  // Wait for Firebase to be ready
  if (window.firebaseAuth) {
    checkAdminAccess();
  } else {
    // Retry if Firebase not ready
    let retries = 0;
    const maxRetries = 20;
    const checkInterval = setInterval(() => {
      retries++;
      if (window.firebaseAuth) {
        clearInterval(checkInterval);
        checkAdminAccess();
      } else if (retries >= maxRetries) {
        clearInterval(checkInterval);
        showAccessDenied('bad internet');
      }
    }, 500);
  }
}

// Check admin access
function checkAdminAccess() {
  if (!window.firebaseAuth) {
    showAccessDenied('Firebase authentication not available.');
    return;
  }

  // Check current auth state
  const currentUser = window.firebaseAuth.currentUser;
  
  if (currentUser && currentUser.email === ADMIN_EMAIL) {
    // User is admin
    adminState.currentUser = currentUser;
    adminState.isAdmin = true;
    showAdminPortal();
    setupAdminListeners();
    loadUsers();
  } else {
    // Set up auth state listener
    window.firebaseAuth.onAuthStateChanged((user) => {
      if (user && user.email === ADMIN_EMAIL) {
        adminState.currentUser = user;
        adminState.isAdmin = true;
        showAdminPortal();
        setupAdminListeners();
        loadUsers();
      } else {
        showAccessDenied();
      }
    });

    // If not logged in, show access denied
    if (!currentUser) {
      showAccessDenied('bad internet');
    } else {
      showAccessDenied('bad internet');
    }
  }
}

// Show access denied
function showAccessDenied(message) {
  const deniedSection = document.getElementById('admin-access-denied');
  const portalSection = document.getElementById('admin-portal');
  
  if (deniedSection) {
    deniedSection.style.display = 'block';
    if (message) {
      const desc = deniedSection.querySelector('.admin-access-denied__description');
      if (desc) desc.textContent = message;
    }
  }
  
  if (portalSection) {
    portalSection.style.display = 'none';
  }
}

// Show admin portal
function showAdminPortal() {
  const deniedSection = document.getElementById('admin-access-denied');
  const portalSection = document.getElementById('admin-portal');
  
  if (deniedSection) deniedSection.style.display = 'none';
  if (portalSection) portalSection.style.display = 'block';
}

// Setup admin event listeners
function setupAdminListeners() {
  // Add user button
  const addUserBtn = document.getElementById('add-user-btn');
  if (addUserBtn) {
    addUserBtn.addEventListener('click', () => openModal('add-user-modal'));
  }

  // Refresh button
  const refreshBtn = document.getElementById('refresh-users-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadUsers();
      showMessage('Users refreshed', 'success');
    });
  }

  // Search input
  const searchInput = document.getElementById('admin-user-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      adminState.searchQuery = e.target.value.toLowerCase();
      filterUsers();
    });
  }

  // Filter select
  const filterSelect = document.getElementById('admin-filter-status');
  if (filterSelect) {
    filterSelect.addEventListener('change', (e) => {
      adminState.filterStatus = e.target.value;
      filterUsers();
    });
  }

  // Add user form
  const addUserForm = document.getElementById('add-user-form');
  if (addUserForm) {
    addUserForm.addEventListener('submit', handleAddUser);
  }

  // Modal close buttons
  document.querySelectorAll('.admin-modal__close, .admin-modal__overlay').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  // Cancel buttons
  document.querySelectorAll('.admin-modal__cancel').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });
}

// Load users from Firebase
async function loadUsers() {
  const loadingEl = document.getElementById('admin-loading');
  const usersList = document.getElementById('admin-users-list');
  const emptyState = document.getElementById('admin-empty');

  if (loadingEl) loadingEl.style.display = 'flex';
  if (usersList) usersList.innerHTML = '';

  try {
    if (!window.firebaseAuth) {
      throw new Error('Firebase Auth not available');
    }

    const currentUser = window.firebaseAuth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Try to fetch all users from Firebase Auth via Cloud Function
    let firebaseUsers = [];
    try {
      firebaseUsers = await fetchAllFirebaseUsers(currentUser);
      console.log('[Admin] Fetched', firebaseUsers.length, 'users from Firebase Auth');
    } catch (error) {
      console.warn('[Admin] Failed to fetch from Cloud Function, falling back to local storage:', error.message);
      // Fallback to local storage method
      firebaseUsers = await loadUsersFromLocalStorage(currentUser);
    }

    // Sort by creation time (newest first)
    firebaseUsers.sort((a, b) => {
      const timeA = new Date(a.metadata?.creationTime || 0).getTime();
      const timeB = new Date(b.metadata?.creationTime || 0).getTime();
      return timeB - timeA;
    });

    adminState.users = firebaseUsers;
    
    // Save merged list for offline access
    saveStoredUsers(firebaseUsers);

    // Update stats
    updateStats();
    
    // Filter and render
    filterUsers();

  } catch (error) {
    console.error('[Admin] Error loading users:', error);
    showMessage('bad internet', 'error');
  } finally {
    if (loadingEl) loadingEl.style.display = 'none';
  }
}

// Fetch all users from Firebase Authentication via Cloud Function
async function fetchAllFirebaseUsers(currentUser) {
  // Get the ID token for authentication
  const idToken = await currentUser.getIdToken();
  
  // Get the project ID from Firebase config
  const projectId = window.FIREBASE_CONFIG_PROD?.projectId || window.FIREBASE_CONFIG_TEST?.projectId || 'mentalmed-8bd8c';
  
  // Use the HTTP Cloud Function endpoint
  // Replace this URL with your actual Cloud Function URL after deployment
  const functionUrl = `https://${projectId}-default-rtdb.firebaseio.com/.json`;
  
  // Try using callable function first if available
  if (typeof firebase !== 'undefined' && firebase.functions) {
    try {
      const functions = firebase.functions();
      const listUsers = functions.httpsCallable('listUsers');
      const result = await listUsers({});
      return result.data.users || [];
    } catch (callableError) {
      console.warn('[Admin] Callable function not available, trying HTTP endpoint:', callableError);
    }
  }

  // Fallback to HTTP endpoint
  // You'll need to deploy the Cloud Function and get its URL
  // For now, construct the expected URL pattern
  const httpFunctionUrl = `https://us-central1-${projectId}.cloudfunctions.net/listUsersHTTP`;
  
  try {
    const response = await fetch(httpFunctionUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.success && Array.isArray(data.users)) {
      return data.users;
    } else {
      throw new Error('Invalid response format from Cloud Function');
    }
  } catch (fetchError) {
    // If Cloud Function is not deployed yet, throw error to trigger fallback
    throw new Error('Cloud Function not available. Please deploy functions first.');
  }
}

// Fallback: Load users from local storage (legacy method)
async function loadUsersFromLocalStorage(currentUser) {
  const allUsers = [];
  
  // Get tracked users (users who have signed up or logged in)
  const trackedUsers = getTrackedUsers();
  
  // Get manually added users from admin storage
  const adminUsers = getStoredUsers();
  
  // Extract users from forum posts and comments
  const forumUsers = extractUsersFromForum();
  
  // Extract users from appointments
  const appointmentUsers = extractUsersFromAppointments();
  
  // Merge all sources, prioritizing tracked users (they have most accurate data)
  allUsers.push(...trackedUsers);
  
  // Add admin users that aren't already in tracked users
  adminUsers.forEach(adminUser => {
    if (!allUsers.find(u => u.uid === adminUser.uid && u.email === adminUser.email)) {
      allUsers.push(adminUser);
    }
  });
  
  // Add forum users that aren't already tracked
  forumUsers.forEach(forumUser => {
    if (!allUsers.find(u => u.email === forumUser.email)) {
      allUsers.push(forumUser);
    }
  });
  
  // Add appointment users that aren't already tracked
  appointmentUsers.forEach(appointmentUser => {
    if (!allUsers.find(u => u.email === appointmentUser.email)) {
      allUsers.push(appointmentUser);
    }
  });
  
  // Update with current user if not already tracked
  if (currentUser) {
    const existingIndex = allUsers.findIndex(u => u.uid === currentUser.uid || u.email === currentUser.email);
    if (existingIndex === -1) {
      // Add current user
      allUsers.push({
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'No Name',
        emailVerified: currentUser.emailVerified,
        disabled: false,
        metadata: {
          creationTime: currentUser.metadata?.creationTime || new Date().toISOString(),
          lastSignInTime: currentUser.metadata?.lastSignInTime || new Date().toISOString()
        }
      });
    } else {
      // Update existing user's last sign in time and UID if missing
      if (!allUsers[existingIndex].uid && currentUser.uid) {
        allUsers[existingIndex].uid = currentUser.uid;
      }
      allUsers[existingIndex].metadata.lastSignInTime = currentUser.metadata?.lastSignInTime || new Date().toISOString();
      allUsers[existingIndex].emailVerified = currentUser.emailVerified;
    }
  }

  return allUsers;
}

// Extract users from forum posts and comments
function extractUsersFromForum() {
  const users = [];
  const userMap = new Map(); // To avoid duplicates by email
  
  try {
    // Get forum posts
    const forumPosts = localStorage.getItem('forum_posts');
    if (forumPosts) {
      const posts = JSON.parse(forumPosts);
      
      posts.forEach(post => {
        if (post.author) {
          // Use email as primary identifier, fallback to name if no email
          const identifier = post.author.email || post.author.name;
          if (identifier && !userMap.has(identifier)) {
            userMap.set(identifier, true);
            
            // Only add if we have email (for proper user management)
            if (post.author.email) {
              users.push({
                uid: post.author.uid || `forum_${post.author.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
                email: post.author.email,
                displayName: post.author.name || post.author.email.split('@')[0],
                emailVerified: false,
                disabled: false,
                metadata: {
                  creationTime: post.createdAt || new Date().toISOString(),
                  lastSignInTime: null
                },
                source: 'forum_post'
              });
            }
          }
        }
        
        // Extract from comments
        if (post.comments && Array.isArray(post.comments)) {
          post.comments.forEach(comment => {
            if (comment.author) {
              const identifier = comment.author.email || comment.author.name;
              if (identifier && !userMap.has(identifier)) {
                userMap.set(identifier, true);
                
                // Only add if we have email
                if (comment.author.email) {
                  users.push({
                    uid: comment.author.uid || `forum_${comment.author.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
                    email: comment.author.email,
                    displayName: comment.author.name || comment.author.email.split('@')[0],
                    emailVerified: false,
                    disabled: false,
                    metadata: {
                      creationTime: comment.createdAt || new Date().toISOString(),
                      lastSignInTime: null
                    },
                    source: 'forum_comment'
                  });
                }
              }
            }
          });
        }
      });
    }
  } catch (error) {
    console.error('[Admin] Error extracting users from forum:', error);
  }
  
  return users;
}

// Extract users from appointments
function extractUsersFromAppointments() {
  const users = [];
  const userMap = new Map();
  
  try {
    // Check for appointment data in localStorage
    const appointmentData = localStorage.getItem('user_appointments');
    if (appointmentData) {
      const appointments = JSON.parse(appointmentData);
      
      if (Array.isArray(appointments)) {
        appointments.forEach(appointment => {
          if (appointment.userEmail && !userMap.has(appointment.userEmail)) {
            userMap.set(appointment.userEmail, true);
            users.push({
              uid: appointment.userId || `appt_${appointment.userEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
              email: appointment.userEmail,
              displayName: appointment.userName || appointment.userEmail.split('@')[0],
              emailVerified: false,
              disabled: false,
              metadata: {
                creationTime: appointment.createdAt || new Date().toISOString(),
                lastSignInTime: null
              },
              source: 'appointment'
            });
          }
        });
      }
    }
  } catch (error) {
    console.error('[Admin] Error extracting users from appointments:', error);
  }
  
  return users;
}

// Get tracked users (from auth.js tracking)
function getTrackedUsers() {
  try {
    const stored = localStorage.getItem('tracked_users');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[Admin] Error loading tracked users:', error);
    return [];
  }
}

// Get stored users (admin-managed users)
function getStoredUsers() {
  try {
    const stored = localStorage.getItem('admin_users');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[Admin] Error loading stored users:', error);
    return [];
  }
}

// Save users to storage
function saveStoredUsers(users) {
  try {
    localStorage.setItem('admin_users', JSON.stringify(users));
  } catch (error) {
    console.error('[Admin] Error saving users:', error);
  }
}

// Filter users
function filterUsers() {
  let filtered = [...adminState.users];

  // Filter by search query
  if (adminState.searchQuery) {
    filtered = filtered.filter(user => 
      user.email?.toLowerCase().includes(adminState.searchQuery) ||
      user.displayName?.toLowerCase().includes(adminState.searchQuery) ||
      user.uid?.toLowerCase().includes(adminState.searchQuery)
    );
  }

  // Filter by status
  if (adminState.filterStatus === 'enabled') {
    filtered = filtered.filter(user => !user.disabled);
  } else if (adminState.filterStatus === 'disabled') {
    filtered = filtered.filter(user => user.disabled);
  }

  adminState.filteredUsers = filtered;
  renderUsers();
}

// Render users
function renderUsers() {
  const usersList = document.getElementById('admin-users-list');
  const emptyState = document.getElementById('admin-empty');

  if (!usersList) return;

  if (adminState.filteredUsers.length === 0) {
    usersList.innerHTML = '';
    if (emptyState) emptyState.style.display = 'flex';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  usersList.innerHTML = adminState.filteredUsers.map(user => createUserCardHTML(user)).join('');

  // Add event listeners
  usersList.querySelectorAll('.admin-user-card').forEach(card => {
    const userId = card.dataset.userId;
    const user = adminState.users.find(u => u.uid === userId);

    // Disable/Enable button
    const disableBtn = card.querySelector('.admin-user-card__disable-btn');
    if (disableBtn) {
      disableBtn.addEventListener('click', () => handleToggleUserStatus(user));
    }

    // Delete button
    const deleteBtn = card.querySelector('.admin-user-card__delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => handleDeleteUser(user));
    }

    // View details
    const viewBtn = card.querySelector('.admin-user-card__view-btn');
    if (viewBtn) {
      viewBtn.addEventListener('click', () => viewUserDetails(user));
    }
  });
}

// Create user card HTML
function createUserCardHTML(user) {
  const createdDate = user.metadata?.creationTime 
    ? new Date(user.metadata.creationTime).toLocaleDateString()
    : 'Unknown';
  
  const lastSignIn = user.metadata?.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleDateString()
    : 'Never';

  const statusClass = user.disabled ? 'admin-user-card--disabled' : '';
  const statusText = user.disabled ? 'Disabled' : 'Active';
  const statusIcon = user.disabled ? 'ri-user-unfollow-line' : 'ri-user-follow-line';

  return `
    <div class="admin-user-card ${statusClass}" data-user-id="${user.uid}">
      <div class="admin-user-card__header">
        <div class="admin-user-card__avatar">
          ${getUserInitials(user.displayName || user.email)}
        </div>
        <div class="admin-user-card__info">
          <h3 class="admin-user-card__name">${escapeHtml(user.displayName || 'No Name')}</h3>
          <p class="admin-user-card__email">${escapeHtml(user.email || 'No Email')}</p>
        </div>
        <div class="admin-user-card__status">
          <i class="${statusIcon}"></i>
          <span>${statusText}</span>
        </div>
      </div>
      <div class="admin-user-card__details">
        <div class="admin-user-card__detail-item">
          <i class="ri-calendar-line"></i>
          <span>Joined: ${createdDate}</span>
        </div>
        <div class="admin-user-card__detail-item">
          <i class="ri-time-line"></i>
          <span>Last Sign In: ${lastSignIn}</span>
        </div>
        <div class="admin-user-card__detail-item">
          <i class="ri-mail-check-line"></i>
          <span>Email Verified: ${user.emailVerified ? 'Yes' : 'No'}</span>
        </div>
      </div>
      <div class="admin-user-card__actions">
        <button class="admin-user-card__view-btn button button--outline">
          <i class="ri-eye-line"></i> View Details
        </button>
        <button class="admin-user-card__disable-btn button button--outline" 
                data-action="${user.disabled ? 'enable' : 'disable'}">
          <i class="${user.disabled ? 'ri-user-follow-line' : 'ri-user-unfollow-line'}"></i>
          ${user.disabled ? 'Enable' : 'Disable'}
        </button>
        <button class="admin-user-card__delete-btn button" style="background: #ef4444; border-color: #ef4444;">
          <i class="ri-delete-bin-line"></i> Delete
        </button>
      </div>
    </div>
  `;
}

// Get user initials
function getUserInitials(name) {
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Handle toggle user status
async function handleToggleUserStatus(user) {
  if (!confirm(`Are you sure you want to ${user.disabled ? 'enable' : 'disable'} this user?`)) {
    return;
  }

  try {
    // In production, use Firebase Admin SDK
    // For now, update localStorage
    user.disabled = !user.disabled;
    
    // Update in array
    const index = adminState.users.findIndex(u => u.uid === user.uid);
    if (index !== -1) {
      adminState.users[index] = user;
      saveStoredUsers(adminState.users);
    }

    // Try to update in Firebase (requires Admin SDK in production)
    if (window.firebaseAuth && typeof window.firebaseAuth.updateUser === 'function') {
      // This would require Admin SDK
      console.log('[Admin] User status updated in memory. Admin SDK needed for Firebase update.');
    }

    filterUsers();
    updateStats();
    showMessage(`User ${user.disabled ? 'disabled' : 'enabled'} successfully`, 'success');

  } catch (error) {
    console.error('[Admin] Error toggling user status:', error);
    showMessage('bad internet', 'error');
  }
}

// Handle delete user
async function handleDeleteUser(user) {
  if (user.email === ADMIN_EMAIL) {
    showMessage('bad internet', 'error');
    return;
  }

  if (!confirm(`Are you sure you want to delete user "${user.email}"? This action cannot be undone.`)) {
    return;
  }

  try {
    // Remove from array
    adminState.users = adminState.users.filter(u => u.uid !== user.uid);
    saveStoredUsers(adminState.users);

    // In production, use Firebase Admin SDK to delete user
    // For now, just remove from localStorage
    console.log('[Admin] User deleted from memory. Admin SDK needed for Firebase deletion.');

    filterUsers();
    updateStats();
    showMessage('User deleted successfully', 'success');

  } catch (error) {
    console.error('[Admin] Error deleting user:', error);
    showMessage('bad internet', 'error');
  }
}

// Handle add user
async function handleAddUser(e) {
  e.preventDefault();

  const email = document.getElementById('new-user-email').value.trim();
  const password = document.getElementById('new-user-password').value;
  const displayName = document.getElementById('new-user-name').value.trim();

  if (!email || !password) {
    showMessage('bad internet', 'error');
    return;
  }

  if (password.length < 6) {
    showMessage('bad internet', 'error');
    return;
  }

  try {
    // In production, use Firebase Admin SDK to create user
    // For now, create user object and add to list
    const newUser = {
      uid: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      email: email,
      displayName: displayName || email.split('@')[0],
      emailVerified: false,
      disabled: false,
      metadata: {
        creationTime: new Date().toISOString(),
        lastSignInTime: null
      }
    };

    // Add to users array
    adminState.users.push(newUser);
    saveStoredUsers(adminState.users);

    // Try to create in Firebase (requires Admin SDK in production)
    if (window.firebaseAuth && typeof window.firebaseAuth.createUserWithEmailAndPassword === 'function') {
      // Note: This creates the user but they'll be logged in
      // In production, use Admin SDK via Cloud Function
      console.log('[Admin] User created in memory. Admin SDK needed for Firebase creation.');
    }

    // Reset form
    document.getElementById('add-user-form').reset();
    closeAllModals();

    filterUsers();
    updateStats();
    showMessage('User created successfully', 'success');

  } catch (error) {
    console.error('[Admin] Error creating user:', error);
    showMessage('bad internet', 'error');
  }
}

// View user details
function viewUserDetails(user) {
  const modal = document.getElementById('user-detail-modal');
  const titleEl = document.getElementById('user-detail-title');
  const bodyEl = document.getElementById('user-detail-body');

  if (!modal || !titleEl || !bodyEl) return;

  titleEl.innerHTML = `<i class="ri-user-line"></i> ${escapeHtml(user.displayName || user.email)}`;

  const createdDate = user.metadata?.creationTime 
    ? new Date(user.metadata.creationTime).toLocaleString()
    : 'Unknown';
  
  const lastSignIn = user.metadata?.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleString()
    : 'Never';

  bodyEl.innerHTML = `
    <div class="admin-user-detail">
      <div class="admin-user-detail__avatar">
        ${getUserInitials(user.displayName || user.email)}
      </div>
      <div class="admin-user-detail__info">
        <div class="admin-user-detail__item">
          <strong>Email:</strong>
          <span>${escapeHtml(user.email || 'No Email')}</span>
        </div>
        <div class="admin-user-detail__item">
          <strong>Display Name:</strong>
          <span>${escapeHtml(user.displayName || 'No Name')}</span>
        </div>
        <div class="admin-user-detail__item">
          <strong>User ID:</strong>
          <span class="admin-user-detail__uid">${escapeHtml(user.uid)}</span>
        </div>
        <div class="admin-user-detail__item">
          <strong>Status:</strong>
          <span class="admin-user-detail__status ${user.disabled ? 'admin-user-detail__status--disabled' : ''}">
            ${user.disabled ? 'Disabled' : 'Active'}
          </span>
        </div>
        <div class="admin-user-detail__item">
          <strong>Email Verified:</strong>
          <span>${user.emailVerified ? 'Yes' : 'No'}</span>
        </div>
        <div class="admin-user-detail__item">
          <strong>Account Created:</strong>
          <span>${createdDate}</span>
        </div>
        <div class="admin-user-detail__item">
          <strong>Last Sign In:</strong>
          <span>${lastSignIn}</span>
        </div>
      </div>
      <div class="admin-user-detail__actions">
        <button class="button button--outline" id="detail-toggle-btn" data-user-id="${user.uid}">
          <i class="${user.disabled ? 'ri-user-follow-line' : 'ri-user-unfollow-line'}"></i>
          ${user.disabled ? 'Enable User' : 'Disable User'}
        </button>
        ${user.email !== ADMIN_EMAIL ? `
          <button class="button" style="background: #ef4444; border-color: #ef4444;" id="detail-delete-btn" data-user-id="${user.uid}">
            <i class="ri-delete-bin-line"></i> Delete User
          </button>
        ` : ''}
      </div>
    </div>
  `;

  // Add event listeners
  const toggleBtn = bodyEl.querySelector('#detail-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      handleToggleUserStatus(user);
      closeAllModals();
    });
  }

  const deleteBtn = bodyEl.querySelector('#detail-delete-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      handleDeleteUser(user);
      closeAllModals();
    });
  }

  openModal('user-detail-modal');
}

// Update stats
function updateStats() {
  const totalUsers = adminState.users.length;
  const activeUsers = adminState.users.filter(u => !u.disabled).length;
  
  // Get post count from forum
  try {
    const forumPosts = localStorage.getItem('forum_posts');
    const posts = forumPosts ? JSON.parse(forumPosts) : [];
    const totalPosts = posts.length;
    document.getElementById('total-posts').textContent = totalPosts;
  } catch (error) {
    document.getElementById('total-posts').textContent = '0';
  }

  document.getElementById('total-users').textContent = totalUsers;
  document.getElementById('active-users').textContent = activeUsers;
}

// Open modal
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('show-modal');
    document.body.style.overflow = 'hidden';
  }
}

// Close all modals
function closeAllModals() {
  document.querySelectorAll('.admin-modal').forEach(modal => {
    modal.classList.remove('show-modal');
  });
  document.body.style.overflow = '';
}

// Show message
function showMessage(message, type = 'info') {
  const messageEl = document.createElement('div');
  messageEl.className = `admin-message admin-message--${type}`;
  messageEl.innerHTML = `
    <i class="ri-${type === 'success' ? 'check-line' : type === 'error' ? 'error-warning-line' : 'information-line'}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(messageEl);
  
  setTimeout(() => messageEl.classList.add('show'), 100);
  
  setTimeout(() => {
    messageEl.classList.remove('show');
    setTimeout(() => messageEl.remove(), 300);
  }, 3000);
}


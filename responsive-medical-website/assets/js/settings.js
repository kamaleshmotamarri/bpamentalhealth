/*=============== SETTINGS MODAL ===============*/

// Helper function to get auth from global scope
function getAuth() {
  return window.firebaseAuth;
}

// Open settings modal
function openSettingsModal() {
  const modal = document.getElementById('settings-modal');
  if (!modal) {
    console.error('[Settings] Settings modal not found');
    return;
  }

  const auth = getAuth();
  if (!auth) {
    console.warn('[Settings] Firebase Auth not available');
    showSettingsLoginPrompt();
    modal.classList.add('show-modal');
    document.body.style.overflow = 'hidden';
    return;
  }

  // Check if user is logged in
  const user = auth.currentUser;
  if (user) {
    showSettingsDashboard(user);
    loadUserProfile(user);
  } else {
    showSettingsLoginPrompt();
  }

  modal.classList.add('show-modal');
  document.body.style.overflow = 'hidden';
}

// Close settings modal
function closeSettingsModal() {
  const modal = document.getElementById('settings-modal');
  if (modal) {
    modal.classList.remove('show-modal');
    document.body.style.overflow = '';

    // Clear form fields
    const form = modal.querySelector('#profile-update-form');
    if (form) {
      form.reset();
    }
  }
}

// Show dashboard section
function showSettingsDashboard(user) {
  const dashboard = document.getElementById('settings-dashboard');
  const profile = document.getElementById('settings-profile');
  const loginPrompt = document.getElementById('settings-login-prompt');

  if (dashboard) dashboard.style.display = 'block';
  if (profile) profile.style.display = 'block';
  if (loginPrompt) loginPrompt.style.display = 'none';

  // Update dashboard info
  if (user) {
    const nameEl = document.getElementById('dashboard-name');
    const emailEl = document.getElementById('dashboard-email');
    const createdEl = document.getElementById('dashboard-created');

    if (nameEl) nameEl.textContent = user.displayName || 'Not set';
    if (emailEl) emailEl.textContent = user.email || 'Not set';
    
    if (createdEl && user.metadata && user.metadata.creationTime) {
      const createdDate = new Date(user.metadata.creationTime);
      createdEl.textContent = createdDate.toLocaleDateString();
    } else if (createdEl) {
      createdEl.textContent = 'Unknown';
    }
  }
}

// Show login prompt
function showSettingsLoginPrompt() {
  const dashboard = document.getElementById('settings-dashboard');
  const profile = document.getElementById('settings-profile');
  const loginPrompt = document.getElementById('settings-login-prompt');

  if (dashboard) dashboard.style.display = 'none';
  if (profile) profile.style.display = 'none';
  if (loginPrompt) loginPrompt.style.display = 'block';
}

// Load user profile into form
function loadUserProfile(user) {
  if (!user) return;

  const nameInput = document.getElementById('profile-name');
  const emailInput = document.getElementById('profile-email');

  if (nameInput) {
    nameInput.value = user.displayName || '';
  }
  if (emailInput) {
    emailInput.value = user.email || '';
  }
}

// Update user profile
async function updateUserProfile(displayName) {
  const auth = getAuth();
  if (!auth) {
    showMessage('bad internet', 'error');
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    showMessage('bad internet', 'error');
    return;
  }

  try {
    await user.updateProfile({
      displayName: displayName
    });

    // Reload user to get updated info
    await user.reload();
    const updatedUser = auth.currentUser;

    // Update dashboard
    showSettingsDashboard(updatedUser);
    loadUserProfile(updatedUser);

    // Update UI in header
    if (window.updateUIForSignedInUser) {
      window.updateUIForSignedInUser(updatedUser);
    }

    showMessage('Profile updated successfully!', 'success');
    
    // Close the settings modal after successful update
    setTimeout(() => {
      closeSettingsModal();
    }, 1000);
  } catch (error) {
    console.error('[Settings] Profile update error:', error);
    showMessage('bad internet', 'error');
  }
}

// Show message to user (reuse from auth.js if available)
function showMessage(message, type = 'info') {
  if (window.showMessage) {
    window.showMessage(message, type);
    return;
  }

  // Fallback message display
  const existingMessage = document.querySelector('.auth-message');
  if (existingMessage) {
    existingMessage.remove();
  }

  const messageEl = document.createElement('div');
  messageEl.className = `auth-message auth-message-${type}`;
  messageEl.textContent = message;
  document.body.appendChild(messageEl);

  setTimeout(() => {
    messageEl.classList.add('show');
  }, 10);

  setTimeout(() => {
    messageEl.classList.remove('show');
    setTimeout(() => {
      messageEl.remove();
    }, 300);
  }, 5000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Close modal when clicking outside
  const settingsModal = document.getElementById('settings-modal');
  if (settingsModal) {
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) {
        closeSettingsModal();
      }
    });
  }

  // Close modal button
  const closeButton = document.querySelector('.settings-modal-close');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      closeSettingsModal();
    });
  }

  // Profile update form
  const profileForm = document.getElementById('profile-update-form');
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('profile-name');
      const displayName = nameInput ? nameInput.value.trim() : '';

      if (!displayName) {
        showMessage('bad internet', 'error');
        return;
      }

      await updateUserProfile(displayName);
    });
  }

  // Login button in settings prompt
  const settingsLoginButton = document.getElementById('settings-login-button');
  if (settingsLoginButton) {
    settingsLoginButton.addEventListener('click', () => {
      closeSettingsModal();
      setTimeout(() => {
        if (window.openAuthModal) {
          window.openAuthModal('login-modal');
        } else if (document.getElementById('login-button')) {
          document.getElementById('login-button').click();
        }
      }, 300);
    });
  }

  // Listen for auth state changes to update settings modal if open
  const auth = getAuth();
  if (auth) {
    auth.onAuthStateChanged((user) => {
      const modal = document.getElementById('settings-modal');
      if (modal && modal.classList.contains('show-modal')) {
        if (user) {
          showSettingsDashboard(user);
          loadUserProfile(user);
        } else {
          showSettingsLoginPrompt();
        }
      }
    });
  }
});

// Make functions available globally
window.openSettingsModal = openSettingsModal;
window.closeSettingsModal = closeSettingsModal;


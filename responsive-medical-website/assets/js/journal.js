/*=============== JOURNAL ===============*/

// Helper function to get Firestore
function getFirestore() {
  if (!window.firebaseFirestore) {
    console.error('[Journal] Firestore is not available');
    return null;
  }
  return window.firebaseFirestore;
}

// Helper function to get Auth
function getAuth() {
  return window.firebaseAuth;
}

// Journal state
let journalEntries = [];
let editingEntryId = null;

// Initialize journal
function initJournal() {
  console.log('[Journal] Initializing journal...');

  // Wait for Firebase to be ready
  const checkFirebase = setInterval(() => {
    if (window.firebaseInitialized && getAuth()) {
      clearInterval(checkFirebase);
      setupAuthListener();
      setupEventListeners();
    }
  }, 100);

  // Timeout after 10 seconds
  setTimeout(() => {
    clearInterval(checkFirebase);
    if (!window.firebaseInitialized) {
      console.error('[Journal] Firebase initialization failed');
    }
  }, 10000);
}

// Setup authentication listener
function setupAuthListener() {
  const auth = getAuth();
  if (!auth) return;

  auth.onAuthStateChanged(async (user) => {
    if (user) {
      console.log('[Journal] User signed in:', user.uid);
      await loadJournalEntries(user.uid);
      showJournalInterface();
    } else {
      console.log('[Journal] User signed out');
      hideJournalInterface();
      showAuthRequired();
    }
  });
}

// Setup event listeners
function setupEventListeners() {
  // Form submission
  const entryForm = document.getElementById('journal-entry-form');
  if (entryForm) {
    entryForm.addEventListener('submit', handleSaveEntry);
  }

  // Clear form button
  const clearBtn = document.getElementById('clear-form-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearForm);
  }

  // Auth login button
  const authLoginBtn = document.getElementById('auth-login-button');
  if (authLoginBtn) {
    authLoginBtn.addEventListener('click', () => {
      const loginButton = document.getElementById('login-button');
      if (loginButton) {
        loginButton.click();
      }
    });
  }
}

// Show journal interface
function showJournalInterface() {
  const authMessage = document.getElementById('auth-required-message');
  const journalInterface = document.getElementById('journal-interface');

  if (authMessage) authMessage.style.display = 'none';
  if (journalInterface) journalInterface.style.display = 'block';
}

// Hide journal interface
function hideJournalInterface() {
  const authMessage = document.getElementById('auth-required-message');
  const journalInterface = document.getElementById('journal-interface');

  if (authMessage) authMessage.style.display = 'block';
  if (journalInterface) journalInterface.style.display = 'none';
}

// Show auth required message
function showAuthRequired() {
  hideJournalInterface();
}

// Load journal entries from Firestore
async function loadJournalEntries(userId) {
  const db = getFirestore();
  if (!db) {
    console.error('[Journal] Firestore not available');
    return;
  }

  try {
    const entriesRef = db.collection('journal_entries');
    // We remove .orderBy() to avoid the need for a composite index in Firestore
    const querySnapshot = await entriesRef
      .where('userId', '==', userId)
      .get();

    journalEntries = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Multi-format date support
      let date;
      if (data.createdAt && typeof data.createdAt.toDate === 'function') {
        date = data.createdAt.toDate();
      } else if (data.createdAt) {
        date = new Date(data.createdAt);
      } else {
        date = new Date();
      }

      journalEntries.push({
        id: doc.id,
        ...data,
        createdAt: date
      });
    });

    // Sort manually by date descending
    journalEntries.sort((a, b) => b.createdAt - a.createdAt);

    console.log('[Journal] Loaded', journalEntries.length, 'entries');
    renderEntries();
    updateProgressStats();
  } catch (error) {
    console.error('[Journal] Error loading entries:', error);
    showMessage('bad internet', 'error');
  }
}

// Handle save entry
async function handleSaveEntry(e) {
  e.preventDefault();

  const auth = getAuth();
  if (!auth || !auth.currentUser) {
    showAuthRequired();
    return;
  }

  const titleInput = document.getElementById('entry-title');
  const contentInput = document.getElementById('entry-content');

  if (!titleInput || !contentInput) {
    console.error('[Journal] Form inputs not found');
    return;
  }

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!title || !content) {
    showMessage('bad internet', 'error');
    return;
  }

  try {
    const db = getFirestore();
    if (!db) {
      throw new Error('Firestore not available');
    }

    const entryData = {
      userId: auth.currentUser.uid,
      userEmail: auth.currentUser.email,
      userName: auth.currentUser.displayName || auth.currentUser.email,
      title: title,
      content: content,
      createdAt: firebase.firestore.Timestamp.now(),
      updatedAt: firebase.firestore.Timestamp.now()
    };

    if (editingEntryId) {
      // Update existing entry
      await db.collection('journal_entries').doc(editingEntryId).update({
        title: title,
        content: content,
        updatedAt: firebase.firestore.Timestamp.now()
      });

      // Update local state
      const entryIndex = journalEntries.findIndex(e => e.id === editingEntryId);
      if (entryIndex !== -1) {
        journalEntries[entryIndex] = {
          ...journalEntries[entryIndex],
          title: title,
          content: content,
          updatedAt: new Date()
        };
      }

      editingEntryId = null;
      showMessage('Entry updated successfully!', 'success');
    } else {
      // Create new entry
      const docRef = await db.collection('journal_entries').add(entryData);

      // Add to local state
      journalEntries.unshift({
        id: docRef.id,
        ...entryData,
        createdAt: new Date()
      });

      showMessage('Entry saved successfully!', 'success');
    }

    // Clear form
    clearForm();

    // Refresh UI
    renderEntries();
    updateProgressStats();

  } catch (error) {
    console.error('[Journal] Error saving entry:', error);
    showMessage('bad internet', 'error');
  }
}

// Delete entry (global function for onclick handlers)
window.deleteEntry = async function (entryId) {
  if (!confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
    return;
  }

  const auth = getAuth();
  if (!auth || !auth.currentUser) {
    return;
  }

  try {
    const db = getFirestore();
    if (!db) {
      throw new Error('Firestore not available');
    }

    await db.collection('journal_entries').doc(entryId).delete();

    // Remove from local state
    journalEntries = journalEntries.filter(e => e.id !== entryId);

    renderEntries();
    updateProgressStats();
    showMessage('Entry deleted successfully.', 'success');
  } catch (error) {
    console.error('[Journal] Error deleting entry:', error);
    showMessage('bad internet', 'error');
  }
}

// Edit entry (global function for onclick handlers)
window.editEntry = function (entryId) {
  const entry = journalEntries.find(e => e.id === entryId);
  if (!entry) return;

  const titleInput = document.getElementById('entry-title');
  const contentInput = document.getElementById('entry-content');

  if (titleInput && contentInput) {
    titleInput.value = entry.title;
    contentInput.value = entry.content;
    editingEntryId = entryId;

    // Scroll to form
    titleInput.scrollIntoView({ behavior: 'smooth', block: 'start' });
    titleInput.focus();
  }
}

// Clear form
function clearForm() {
  const titleInput = document.getElementById('entry-title');
  const contentInput = document.getElementById('entry-content');

  if (titleInput) titleInput.value = '';
  if (contentInput) contentInput.value = '';
  editingEntryId = null;
}

// Render entries
function renderEntries() {
  const entriesList = document.getElementById('entries-list');
  if (!entriesList) return;

  if (journalEntries.length === 0) {
    entriesList.innerHTML = `
      <div class="journal__empty-state">
        <i class="ri-book-open-line"></i>
        <p>No entries yet. Start writing your first journal entry!</p>
      </div>
    `;
    return;
  }

  entriesList.innerHTML = journalEntries.map(entry => {
    const date = entry.createdAt instanceof Date ? entry.createdAt : new Date(entry.createdAt);
    const formattedDate = formatDate(date);
    const preview = entry.content.length > 200 ? entry.content.substring(0, 200) + '...' : entry.content;

    return `
      <div class="journal__entry-card">
        <div class="journal__entry-header">
          <span class="journal__entry-date">${formattedDate}</span>
          <div class="journal__entry-actions">
            <button class="journal__entry-btn" onclick="editEntry('${entry.id}')" title="Edit">
              <i class="ri-edit-line"></i>
            </button>
            <button class="journal__entry-btn" onclick="deleteEntry('${entry.id}')" title="Delete">
              <i class="ri-delete-bin-line"></i>
            </button>
          </div>
        </div>
        <h3 class="journal__entry-title">${escapeHtml(entry.title)}</h3>
        <div class="journal__entry-content">${escapeHtml(entry.content)}</div>
      </div>
    `;
  }).join('');
}

// Update progress stats
function updateProgressStats() {
  const totalEntries = journalEntries.length;

  // Calculate entries this month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEntries = journalEntries.filter(entry => {
    const entryDate = entry.createdAt instanceof Date ? entry.createdAt : new Date(entry.createdAt);
    return entryDate >= startOfMonth;
  }).length;

  // Calculate entries this week
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const weekEntries = journalEntries.filter(entry => {
    const entryDate = entry.createdAt instanceof Date ? entry.createdAt : new Date(entry.createdAt);
    return entryDate >= startOfWeek;
  }).length;

  // Calculate streak (consecutive days with entries)
  const streakDays = calculateStreak();

  // Update UI
  const totalEl = document.getElementById('total-entries');
  const monthEl = document.getElementById('month-entries');
  const weekEl = document.getElementById('week-entries');
  const streakEl = document.getElementById('streak-days');

  if (totalEl) totalEl.textContent = totalEntries;
  if (monthEl) monthEl.textContent = monthEntries;
  if (weekEl) weekEl.textContent = weekEntries;
  if (streakEl) streakEl.textContent = streakDays + (streakDays === 1 ? ' day' : ' days');
}

// Calculate streak
function calculateStreak() {
  if (journalEntries.length === 0) return 0;

  // Get unique days with entries, sorted newest first
  const entryDays = [...new Set(journalEntries.map(entry => {
    const date = entry.createdAt instanceof Date ? entry.createdAt : new Date(entry.createdAt);
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);
    return day.getTime();
  }))].sort((a, b) => b - a);

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let checkDate = new Date(today);

  // If no entry today, start checking from yesterday
  if (entryDays[0] !== today.getTime()) {
    if (entryDays[0] === yesterday.getTime()) {
      checkDate = yesterday;
    } else {
      return 0; // Gap too large
    }
  }

  // Count consecutive days backwards
  for (const dayTime of entryDays) {
    if (dayTime === checkDate.getTime()) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (dayTime < checkDate.getTime()) {
      break; // Gap found
    }
    // if dayTime > checkDate, it means we have multiple entries on the same day, just continue
  }

  return streak;
}

// Format date
function formatDate(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }

  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return date.toLocaleDateString('en-US', options);
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Show message
function showMessage(message, type = 'info') {
  // Create message element
  const messageEl = document.createElement('div');
  messageEl.className = `journal__message journal__message--${type}`;
  messageEl.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 1rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `;
  messageEl.textContent = message;

  document.body.appendChild(messageEl);

  // Remove after 3 seconds
  setTimeout(() => {
    messageEl.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      document.body.removeChild(messageEl);
    }, 300);
  }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initJournal);
} else {
  initJournal();
}


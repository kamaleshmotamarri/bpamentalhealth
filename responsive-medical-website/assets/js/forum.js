/*=============== FORUM FUNCTIONALITY ===============*/

// Forum state
let forumState = {
  posts: [],
  filteredPosts: [],
  currentCategory: 'all',
  currentSort: 'recent',
  currentUser: null,
  searchQuery: '',
  firebaseAvailable: false
};

// Check Firebase availability
function checkFirebaseAvailability() {
  try {
    if (typeof firebase !== 'undefined' && window.firebaseAuth) {
      forumState.firebaseAvailable = true;
      console.log('[Forum] Firebase is available');
      return true;
    }
  } catch (error) {
    console.warn('[Forum] Firebase check failed:', error);
  }
  forumState.firebaseAvailable = false;
  console.log('[Forum] Firebase not available - forum will work in view-only mode');
  return false;
}

// Initialize forum when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit for scripts to load, then initialize
  setTimeout(initializeForum, 300);
});

// Initialize forum
function initializeForum() {
  // Set up event listeners first (always works)
  setupEventListeners();
  
  // Load posts immediately (works without Firebase)
  loadPosts();

  // Try to set up Firebase auth listener (optional)
  setupAuthListener();
}

// Setup auth listener with retry logic
function setupAuthListener() {
  // Check Firebase availability first
  checkFirebaseAvailability();
  
  if (!forumState.firebaseAvailable) {
    // Firebase not available - forum still works, just without auth
    forumState.currentUser = null;
    updateForumUI();
    return;
  }
  
  let retries = 0;
  const maxRetries = 10;
  
  function trySetupAuth() {
    try {
      if (window.firebaseAuth && typeof window.firebaseAuth.onAuthStateChanged === 'function') {
        // Firebase is ready
        window.firebaseAuth.onAuthStateChanged((user) => {
          forumState.currentUser = user;
          updateForumUI();
          console.log('[Forum] Auth state updated:', user ? 'Logged in' : 'Logged out');
        });
        
        // Check current auth state
        if (window.firebaseAuth.currentUser) {
          forumState.currentUser = window.firebaseAuth.currentUser;
          updateForumUI();
        }
      } else if (retries < maxRetries) {
        // Retry if Firebase not ready yet
        retries++;
        setTimeout(trySetupAuth, 500);
      } else {
        // Firebase not available after retries
        console.warn('[Forum] Firebase Auth not available after retries. Forum will work in view-only mode.');
        forumState.currentUser = null;
        updateForumUI();
      }
    } catch (error) {
      console.error('[Forum] Error setting up auth listener:', error);
      forumState.currentUser = null;
      updateForumUI();
    }
  }
  
  trySetupAuth();
}

// Setup event listeners
function setupEventListeners() {
  // Create post button
  const createPostBtn = document.getElementById('create-post-btn');
  if (createPostBtn) {
    createPostBtn.addEventListener('click', handleCreatePostClick);
  }

  // Category filters
  const categoryButtons = document.querySelectorAll('.forum__category');
  categoryButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const category = e.currentTarget.dataset.category;
      filterByCategory(category);
      
      // Update active state
      categoryButtons.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
    });
  });

  // Sort filters
  const sortButtons = document.querySelectorAll('.forum__filter-btn');
  sortButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sort = e.currentTarget.dataset.sort;
      sortPosts(sort);
      
      // Update active state
      sortButtons.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
    });
  });

  // Search input
  const searchInput = document.getElementById('forum-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      forumState.searchQuery = e.target.value.toLowerCase();
      filterPosts();
    });
  }

  // Modal close buttons
  document.querySelectorAll('.forum-modal__close, .forum-modal__overlay').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  // Create post form
  const createPostForm = document.getElementById('create-post-form');
  if (createPostForm) {
    createPostForm.addEventListener('submit', handleCreatePost);
  }

  // Cancel buttons
  document.querySelectorAll('.forum-modal__cancel').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  // Login prompt button
  const forumLoginBtn = document.getElementById('forum-login-button');
  if (forumLoginBtn) {
    forumLoginBtn.addEventListener('click', () => {
      closeAllModals();
      // Try to trigger login modal
      const loginButton = document.getElementById('login-button');
      if (loginButton) {
        loginButton.click();
      } else {
        // Fallback: show message
        showMessage('Please use the login button in the navigation bar', 'info');
      }
    });
  }
  
  // Login from detail button
  document.addEventListener('click', (e) => {
    if (e.target.id === 'login-from-detail' || e.target.closest('#login-from-detail')) {
      e.preventDefault();
      closeAllModals();
      const loginButton = document.getElementById('login-button');
      if (loginButton) {
        loginButton.click();
      }
    }
  });
}

// Handle create post click
function handleCreatePostClick(e) {
  e.preventDefault();
  
  // Check if user is logged in
  if (!isUserLoggedIn()) {
    showLoginPrompt();
    return;
  }
  
  openModal('create-post-modal');
}

// Check if user is logged in (handles Firebase or fallback)
function isUserLoggedIn() {
  try {
    // Try Firebase first
    if (forumState.firebaseAvailable && window.firebaseAuth && window.firebaseAuth.currentUser) {
      return true;
    }
    
    // Check forum state
    if (forumState.currentUser) {
      return true;
    }
  } catch (error) {
    console.warn('[Forum] Error checking login status:', error);
  }
  
  return false;
}

// Get current user (handles Firebase or fallback)
function getCurrentUser() {
  try {
    // Try Firebase first
    if (forumState.firebaseAvailable && window.firebaseAuth && window.firebaseAuth.currentUser) {
      return window.firebaseAuth.currentUser;
    }
    
    // Return forum state user
    return forumState.currentUser;
  } catch (error) {
    console.warn('[Forum] Error getting current user:', error);
    return null;
  }
}

// Show login prompt
function showLoginPrompt() {
  openModal('login-prompt-modal');
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
  document.querySelectorAll('.forum-modal').forEach(modal => {
    modal.classList.remove('show-modal');
  });
  document.body.style.overflow = '';
}

// Handle create post form submission
async function handleCreatePost(e) {
  e.preventDefault();
  
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showLoginPrompt();
    return;
  }

  const title = document.getElementById('post-title').value.trim();
  const category = document.getElementById('post-category').value;
  const content = document.getElementById('post-content').value.trim();

  if (!title || !category || !content) {
    showMessage('Please fill in all fields', 'error');
    return;
  }

  try {
    // Get user info
    const userName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous';
    const userEmail = currentUser.email || 'anonymous@example.com';
    const userUid = currentUser.uid || null;
    
    // Create post object
    const post = {
      id: generatePostId(),
      title,
      category,
      content,
      author: {
        uid: userUid,
        name: userName,
        email: userEmail,
        avatar: getInitials(userName)
      },
      createdAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      comments: [],
      views: 0
    };

    // Save to localStorage (in production, this would be Firebase)
    savePostToStorage(post);

    // Add to current posts
    forumState.posts.unshift(post);
    filterPosts();

    // Reset form
    document.getElementById('create-post-form').reset();
    closeAllModals();

    showMessage('Post created successfully!', 'success');
  } catch (error) {
    console.error('Error creating post:', error);
    showMessage('Failed to create post. Please try again.', 'error');
  }
}

// Generate post ID
function generatePostId() {
  return 'post_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Get initials from name
function getInitials(name) {
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// Save post to storage
function savePostToStorage(post) {
  try {
    const posts = getPostsFromStorage();
    posts.unshift(post);
    localStorage.setItem('forum_posts', JSON.stringify(posts));
  } catch (error) {
    console.error('Error saving post:', error);
  }
}

// Get posts from storage
function getPostsFromStorage() {
  try {
    const stored = localStorage.getItem('forum_posts');
    return stored ? JSON.parse(stored) : getDefaultPosts();
  } catch (error) {
    console.error('Error loading posts:', error);
    return getDefaultPosts();
  }
}

// Get default posts (sample data)
function getDefaultPosts() {
  return [
    {
      id: 'post_1',
      title: 'Coping strategies for anxiety attacks',
      category: 'anxiety',
      content: 'I\'ve been dealing with anxiety for a while now and wanted to share some strategies that have helped me. Deep breathing exercises, grounding techniques, and talking to someone I trust have been game-changers. What works for you?',
      author: {
        name: 'Sarah M.',
        email: 'sarah@example.com',
        avatar: 'SM'
      },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      upvotes: 24,
      downvotes: 1,
      comments: [
        {
          id: 'comment_1',
          author: { name: 'Alex K.', avatar: 'AK' },
          content: 'Thanks for sharing! I find meditation really helps too.',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        }
      ],
      views: 156
    },
    {
      id: 'post_2',
      title: 'Finding motivation during depression',
      category: 'depression',
      content: 'Struggling to find motivation lately. Even small tasks feel overwhelming. Looking for advice from others who have been through similar experiences.',
      author: {
        name: 'Michael R.',
        email: 'michael@example.com',
        avatar: 'MR'
      },
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      upvotes: 18,
      downvotes: 0,
      comments: [],
      views: 89
    },
    {
      id: 'post_3',
      title: 'Great resources for mental health',
      category: 'resources',
      content: 'I found this amazing app called Headspace that has been really helpful for mindfulness. Also, the Crisis Text Line (text HOME to 741741) is available 24/7. What resources have you found helpful?',
      author: {
        name: 'Emma W.',
        email: 'emma@example.com',
        avatar: 'EW'
      },
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      upvotes: 31,
      downvotes: 0,
      comments: [
        {
          id: 'comment_2',
          author: { name: 'Lisa T.', avatar: 'LT' },
          content: 'Thanks for sharing! I\'ll check out Headspace.',
          createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString()
        }
      ],
      views: 203
    },
    {
      id: 'post_4',
      title: 'Support group meeting this weekend',
      category: 'support',
      content: 'We\'re organizing a virtual support group meeting this Saturday at 2 PM. It\'s a safe space to share and listen. All are welcome!',
      author: {
        name: 'Community Admin',
        email: 'admin@example.com',
        avatar: 'CA'
      },
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      upvotes: 15,
      downvotes: 0,
      comments: [],
      views: 67
    }
  ];
}

// Load posts
function loadPosts() {
  const loadingEl = document.getElementById('forum-loading');
  if (loadingEl) loadingEl.style.display = 'flex';

  try {
    // Simulate loading delay
    setTimeout(() => {
      try {
        forumState.posts = getPostsFromStorage();
        filterPosts();
      } catch (error) {
        console.error('[Forum] Error loading posts:', error);
        // Load default posts on error
        forumState.posts = getDefaultPosts();
        filterPosts();
      } finally {
        if (loadingEl) loadingEl.style.display = 'none';
      }
    }, 500);
  } catch (error) {
    console.error('[Forum] Critical error loading posts:', error);
    if (loadingEl) loadingEl.style.display = 'none';
    // Show error message
    showMessage('Error loading forum. Please refresh the page.', 'error');
  }
}


// Filter posts
function filterPosts() {
  let filtered = [...forumState.posts];

  // Filter by category
  if (forumState.currentCategory !== 'all') {
    filtered = filtered.filter(post => post.category === forumState.currentCategory);
  }

  // Filter by search query
  if (forumState.searchQuery) {
    filtered = filtered.filter(post => 
      post.title.toLowerCase().includes(forumState.searchQuery) ||
      post.content.toLowerCase().includes(forumState.searchQuery)
    );
  }

  // Sort posts
  filtered = sortPostsArray(filtered, forumState.currentSort);

  forumState.filteredPosts = filtered;
  renderPosts();
}

// Filter by category
function filterByCategory(category) {
  forumState.currentCategory = category;
  filterPosts();
}

// Sort posts
function sortPosts(sort) {
  forumState.currentSort = sort;
  filterPosts();
}

// Sort posts array
function sortPostsArray(posts, sort) {
  const sorted = [...posts];
  
  switch (sort) {
    case 'popular':
      return sorted.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
    case 'trending':
      return sorted.sort((a, b) => {
        const aScore = (b.upvotes - b.downvotes) / (Date.now() - new Date(a.createdAt).getTime());
        const bScore = (a.upvotes - a.downvotes) / (Date.now() - new Date(b.createdAt).getTime());
        return bScore - aScore;
      });
    case 'recent':
    default:
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

// Render posts
function renderPosts() {
  const container = document.getElementById('forum-posts');
  const emptyState = document.getElementById('forum-empty');
  
  if (!container) return;

  if (forumState.filteredPosts.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'flex';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  container.innerHTML = forumState.filteredPosts.map(post => createPostHTML(post)).join('');
  
  // Add event listeners to post elements
  container.querySelectorAll('.forum-post').forEach(postEl => {
    const postId = postEl.dataset.postId;
    const post = forumState.posts.find(p => p.id === postId);
    
    // Upvote/downvote buttons
    const upvoteBtn = postEl.querySelector('.forum-post__upvote');
    const downvoteBtn = postEl.querySelector('.forum-post__downvote');
    
    if (upvoteBtn) {
      upvoteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleVote(postId, 'upvote');
      });
    }
    
    if (downvoteBtn) {
      downvoteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleVote(postId, 'downvote');
      });
    }
    
    // Comment button
    const commentBtn = postEl.querySelector('.forum-post__comment-btn');
    if (commentBtn) {
      commentBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openPostDetail(post);
      });
    }
    
    // Click to view detail (on content area, not buttons)
    const contentArea = postEl.querySelector('.forum-post__content');
    if (contentArea) {
      contentArea.addEventListener('click', () => openPostDetail(post));
    }
  });
}

// Create post HTML
function createPostHTML(post) {
  const timeAgo = getTimeAgo(new Date(post.createdAt));
  const score = post.upvotes - post.downvotes;
  const commentCount = post.comments ? post.comments.length : 0;
  const userVote = getUserVote(post.id);
  const upvoteClass = userVote === 'upvote' ? 'forum-post__upvote--active' : '';
  const downvoteClass = userVote === 'downvote' ? 'forum-post__downvote--active' : '';
  
  return `
    <article class="forum-post" data-post-id="${post.id}">
      <div class="forum-post__votes">
        <button class="forum-post__upvote ${upvoteClass}" aria-label="Upvote" data-vote-type="upvote">
          <i class="ri-arrow-up-line"></i>
        </button>
        <span class="forum-post__score">${score}</span>
        <button class="forum-post__downvote ${downvoteClass}" aria-label="Downvote" data-vote-type="downvote">
          <i class="ri-arrow-down-line"></i>
        </button>
      </div>
      <div class="forum-post__content">
        <div class="forum-post__header">
          <span class="forum-post__category forum-post__category--${post.category}">
            <i class="ri-${getCategoryIcon(post.category)}-line"></i>
            ${getCategoryName(post.category)}
          </span>
          <span class="forum-post__time">${timeAgo}</span>
        </div>
        <h3 class="forum-post__title">${escapeHtml(post.title)}</h3>
        <p class="forum-post__text">${escapeHtml(post.content.substring(0, 200))}${post.content.length > 200 ? '...' : ''}</p>
        <div class="forum-post__footer">
          <div class="forum-post__author">
            <div class="forum-post__avatar">${post.author.avatar}</div>
            <span class="forum-post__author-name">${escapeHtml(post.author.name)}</span>
          </div>
          <div class="forum-post__actions">
            <button class="forum-post__comment-btn">
              <i class="ri-chat-3-line"></i>
              <span>${commentCount}</span>
            </button>
            <button class="forum-post__share-btn">
              <i class="ri-share-line"></i>
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}

// Get category icon
function getCategoryIcon(category) {
  const icons = {
    anxiety: 'empathize',
    depression: 'heart-pulse',
    support: 'hand-heart',
    resources: 'book-open',
    general: 'chat-3'
  };
  return icons[category] || 'chat-3';
}

// Get category name
function getCategoryName(category) {
  const names = {
    anxiety: 'Anxiety',
    depression: 'Depression',
    support: 'Support',
    resources: 'Resources',
    general: 'General'
  };
  return names[category] || 'General';
}

// Get time ago
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Get user identifier for vote tracking
function getUserVoteId() {
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.email) {
    return currentUser.email;
  }
  // Fallback to a session-based ID for anonymous users
  if (!sessionStorage.getItem('forum_anonymous_id')) {
    sessionStorage.setItem('forum_anonymous_id', 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9));
  }
  return sessionStorage.getItem('forum_anonymous_id');
}

// Get votes from storage
function getVotesFromStorage() {
  try {
    const stored = localStorage.getItem('forum_votes');
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading votes:', error);
    return {};
  }
}

// Save votes to storage
function saveVotesToStorage(votes) {
  try {
    localStorage.setItem('forum_votes', JSON.stringify(votes));
  } catch (error) {
    console.error('Error saving votes:', error);
  }
}

// Get user's vote for a post
function getUserVote(postId) {
  const votes = getVotesFromStorage();
  const userId = getUserVoteId();
  return votes[postId]?.[userId] || null; // Returns 'upvote', 'downvote', or null
}

// Set user's vote for a post
function setUserVote(postId, voteType) {
  const votes = getVotesFromStorage();
  const userId = getUserVoteId();
  
  if (!votes[postId]) {
    votes[postId] = {};
  }
  
  votes[postId][userId] = voteType;
  saveVotesToStorage(votes);
}

// Remove user's vote for a post
function removeUserVote(postId) {
  const votes = getVotesFromStorage();
  const userId = getUserVoteId();
  
  if (votes[postId] && votes[postId][userId]) {
    delete votes[postId][userId];
    if (Object.keys(votes[postId]).length === 0) {
      delete votes[postId];
    }
    saveVotesToStorage(votes);
  }
}

// Handle vote
function handleVote(postId, type) {
  if (!isUserLoggedIn()) {
    showLoginPrompt();
    return;
  }

  const post = forumState.posts.find(p => p.id === postId);
  if (!post) return;

  const currentVote = getUserVote(postId);
  
  // If user already voted the same way, remove the vote
  if (currentVote === type) {
    // Remove vote
    removeUserVote(postId);
    if (type === 'upvote') {
      post.upvotes = Math.max(0, post.upvotes - 1);
    } else {
      post.downvotes = Math.max(0, post.downvotes - 1);
    }
    showMessage('Vote removed', 'info');
  } 
  // If user voted differently, change the vote
  else if (currentVote && currentVote !== type) {
    // Change vote
    setUserVote(postId, type);
    
    // Remove old vote count
    if (currentVote === 'upvote') {
      post.upvotes = Math.max(0, post.upvotes - 1);
    } else {
      post.downvotes = Math.max(0, post.downvotes - 1);
    }
    
    // Add new vote count
    if (type === 'upvote') {
      post.upvotes++;
    } else {
      post.downvotes++;
    }
    
    showMessage(`Vote changed to ${type === 'upvote' ? 'upvote' : 'downvote'}`, 'info');
  }
  // If user hasn't voted yet, add the vote
  else {
    setUserVote(postId, type);
    if (type === 'upvote') {
      post.upvotes++;
    } else {
      post.downvotes++;
    }
    showMessage(`Post ${type === 'upvote' ? 'upvoted' : 'downvoted'}`, 'success');
  }

  // Save to storage
  saveAllPostsToStorage();
  filterPosts();
}

// Save all posts to storage
function saveAllPostsToStorage() {
  try {
    localStorage.setItem('forum_posts', JSON.stringify(forumState.posts));
  } catch (error) {
    console.error('Error saving posts:', error);
  }
}

// Open post detail
function openPostDetail(post) {
  const modal = document.getElementById('post-detail-modal');
  const titleEl = document.getElementById('detail-post-title');
  const bodyEl = document.getElementById('post-detail-body');
  
  if (!modal || !titleEl || !bodyEl) return;

  titleEl.textContent = post.title;
  
  bodyEl.innerHTML = `
    <div class="post-detail">
      <div class="post-detail__meta">
        <div class="post-detail__author">
          <div class="post-detail__avatar">${post.author.avatar}</div>
          <div>
            <div class="post-detail__author-name">${escapeHtml(post.author.name)}</div>
            <div class="post-detail__date">${new Date(post.createdAt).toLocaleString()}</div>
          </div>
        </div>
        <div class="post-detail__category post-detail__category--${post.category}">
          <i class="ri-${getCategoryIcon(post.category)}-line"></i>
          ${getCategoryName(post.category)}
        </div>
      </div>
      <div class="post-detail__content">
        ${escapeHtml(post.content).replace(/\n/g, '<br>')}
      </div>
      <div class="post-detail__comments">
        <h3 class="post-detail__comments-title">
          <i class="ri-chat-3-line"></i> Comments (${post.comments ? post.comments.length : 0})
        </h3>
        <div class="post-detail__comments-list" id="comments-list-${post.id}">
          ${post.comments ? post.comments.map(c => createCommentHTML(c)).join('') : ''}
        </div>
        ${isUserLoggedIn() ? `
          <form class="post-detail__comment-form" id="comment-form-${post.id}">
            <textarea class="post-detail__comment-input" placeholder="Add a comment..." required></textarea>
            <button type="submit" class="button">
              <i class="ri-send-plane-line"></i> Comment
            </button>
          </form>
        ` : `
          <div class="post-detail__login-prompt">
            <p>Please <button class="link-button" id="login-from-detail">log in</button> to join the discussion.</p>
          </div>
        `}
      </div>
    </div>
  `;

  // Add comment form handler
  const commentForm = bodyEl.querySelector(`#comment-form-${post.id}`);
  if (commentForm) {
    commentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleAddComment(post.id, commentForm.querySelector('textarea').value);
      commentForm.reset();
    });
  }

  // Login button in detail
  const loginFromDetail = bodyEl.querySelector('#login-from-detail');
  if (loginFromDetail) {
    loginFromDetail.addEventListener('click', () => {
      closeAllModals();
      const loginButton = document.getElementById('login-button');
      if (loginButton) loginButton.click();
    });
  }

  openModal('post-detail-modal');
}

// Create comment HTML
function createCommentHTML(comment) {
  return `
    <div class="post-detail__comment">
      <div class="post-detail__comment-avatar">${comment.author.avatar}</div>
      <div class="post-detail__comment-content">
        <div class="post-detail__comment-header">
          <span class="post-detail__comment-author">${escapeHtml(comment.author.name)}</span>
          <span class="post-detail__comment-time">${getTimeAgo(new Date(comment.createdAt))}</span>
        </div>
        <p class="post-detail__comment-text">${escapeHtml(comment.content)}</p>
      </div>
    </div>
  `;
}

// Handle add comment
function handleAddComment(postId, content) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showLoginPrompt();
    return;
  }

  const post = forumState.posts.find(p => p.id === postId);
  if (!post) return;

  if (!post.comments) post.comments = [];

  // Get user info
  const userName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous';
  const userEmail = currentUser.email || 'anonymous@example.com';
  const userUid = currentUser.uid || null;

  const comment = {
    id: 'comment_' + Date.now(),
    author: {
      uid: userUid,
      name: userName,
      email: userEmail,
      avatar: getInitials(userName)
    },
    content: content.trim(),
    createdAt: new Date().toISOString()
  };

  post.comments.push(comment);
  saveAllPostsToStorage();
  
  // Update UI
  const commentsList = document.getElementById(`comments-list-${postId}`);
  if (commentsList) {
    commentsList.insertAdjacentHTML('beforeend', createCommentHTML(comment));
  }
  
  // Update comment count in post list
  filterPosts();
}

// Update forum UI based on auth state
function updateForumUI() {
  const createPostBtn = document.getElementById('create-post-btn');
  const isLoggedIn = isUserLoggedIn();
  
  if (createPostBtn) {
    if (isLoggedIn) {
      createPostBtn.innerHTML = '<i class="ri-edit-box-line"></i> Create Post';
      createPostBtn.disabled = false;
    } else {
      createPostBtn.innerHTML = '<i class="ri-edit-box-line"></i> Create Post';
      createPostBtn.disabled = false; // Still clickable, will show login prompt
    }
  }
  
  // Update user info display if needed
  if (isLoggedIn) {
    const user = getCurrentUser();
    console.log('[Forum] User logged in:', user?.email || user?.displayName);
  } else {
    console.log('[Forum] User not logged in - view-only mode');
  }
}

// Show message
function showMessage(message, type = 'info') {
  // Create message element
  const messageEl = document.createElement('div');
  messageEl.className = `forum-message forum-message--${type}`;
  messageEl.innerHTML = `
    <i class="ri-${type === 'success' ? 'check-line' : type === 'error' ? 'error-warning-line' : 'information-line'}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(messageEl);
  
  // Show message
  setTimeout(() => messageEl.classList.add('show'), 100);
  
  // Hide and remove
  setTimeout(() => {
    messageEl.classList.remove('show');
    setTimeout(() => messageEl.remove(), 300);
  }, 3000);
}


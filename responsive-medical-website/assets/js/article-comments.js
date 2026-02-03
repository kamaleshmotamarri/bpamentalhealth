// Article Comments/Discussion Handler
document.addEventListener('DOMContentLoaded', function() {
    // Get the article identifier from the page
    const articleId = window.location.pathname.split('/').pop().replace('.html', '');
    
    // Check if user is logged in (using Firebase auth if available)
    let currentUser = null;
    let userName = 'Anonymous';
    
    // Function to check auth state
    function checkAuthState() {
        // Use the same auth pattern as auth.js
        const auth = window.firebaseAuth;
        if (auth) {
            const user = auth.currentUser;
            if (user) {
                currentUser = user;
                userName = user.displayName || user.email?.split('@')[0] || 'User';
                // Update name field if it exists
                const nameField = document.getElementById('comment-name');
                if (nameField) {
                    nameField.value = userName;
                }
            } else {
                currentUser = null;
                userName = 'Anonymous';
            }
            updateDiscussionUI();
            return true;
        }
        return false;
    }
    
    // Listen for auth state changes using the same pattern as auth.js
    let authInitRetries = 0;
    const MAX_AUTH_INIT_RETRIES = 30;
    
    function setupAuthListener() {
        const auth = window.firebaseAuth;
        if (auth) {
            // Check initial state
            checkAuthState();
            
            // Listen for changes
            auth.onAuthStateChanged(function(user) {
                if (user) {
                    currentUser = user;
                    userName = user.displayName || user.email?.split('@')[0] || 'User';
                    const nameField = document.getElementById('comment-name');
                    if (nameField) {
                        nameField.value = userName;
                    }
                } else {
                    currentUser = null;
                    userName = 'Anonymous';
                }
                updateDiscussionUI();
            });
        } else {
            authInitRetries++;
            if (authInitRetries < MAX_AUTH_INIT_RETRIES) {
                setTimeout(setupAuthListener, 200);
            } else {
                console.warn('[Article Comments] Firebase Auth not available after retries');
                // Still update UI even if auth isn't available
                updateDiscussionUI();
            }
        }
    }
    
    // Start checking for auth
    setupAuthListener();
    
    // Load comments from localStorage (or Firebase in production)
    function loadComments() {
        const comments = JSON.parse(localStorage.getItem(`comments_${articleId}`) || '[]');
        return comments;
    }
    
    // Save comments to localStorage (or Firebase in production)
    function saveComments(comments) {
        localStorage.setItem(`comments_${articleId}`, JSON.stringify(comments));
    }
    
    // Display comments
    function displayComments() {
        const commentsContainer = document.getElementById('discussion-comments');
        if (!commentsContainer) return;
        
        const comments = loadComments();
        
        if (comments.length === 0) {
            commentsContainer.innerHTML = `
                <div class="discussion__empty">
                    <i class="ri-chat-3-line"></i>
                    <p>No comments yet. Be the first to share your thoughts!</p>
                </div>
            `;
            return;
        }
        
        // Sort comments by date (newest first)
        comments.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        commentsContainer.innerHTML = comments.map(comment => {
            const date = new Date(comment.date);
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const initials = comment.author.substring(0, 2).toUpperCase();
            
            return `
                <div class="discussion__comment">
                    <div class="discussion__comment-header">
                        <div class="discussion__comment-avatar">${initials}</div>
                        <span class="discussion__comment-author">${escapeHtml(comment.author)}</span>
                        <span class="discussion__comment-date">${formattedDate}</span>
                    </div>
                    <p class="discussion__comment-text">${escapeHtml(comment.text)}</p>
                </div>
            `;
        }).join('');
    }
    
    // Update discussion UI based on login status
    function updateDiscussionUI() {
        const formContainer = document.getElementById('discussion-form-container');
        const loginPrompt = document.getElementById('discussion-login-prompt');
        
        if (!formContainer || !loginPrompt) return;
        
        if (currentUser) {
            formContainer.style.display = 'block';
            loginPrompt.style.display = 'none';
        } else {
            formContainer.style.display = 'none';
            loginPrompt.style.display = 'block';
        }
    }
    
    // Handle comment submission
    const commentForm = document.getElementById('discussion-form');
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!currentUser) {
                alert('bad internet');
                // Open login modal if available
                const loginButton = document.getElementById('login-button');
                if (loginButton) loginButton.click();
                return;
            }
            
            const commentText = document.getElementById('comment-text').value.trim();
            const commentName = document.getElementById('comment-name')?.value.trim() || userName;
            
            if (!commentText) {
                alert('bad internet');
                return;
            }
            
            // Create comment object
            const comment = {
                id: Date.now().toString(),
                author: commentName,
                text: commentText,
                date: new Date().toISOString(),
                userId: currentUser?.uid || 'anonymous'
            };
            
            // Load existing comments, add new one, and save
            const comments = loadComments();
            comments.push(comment);
            saveComments(comments);
            
            // Clear form
            commentForm.reset();
            if (document.getElementById('comment-name')) {
                document.getElementById('comment-name').value = userName;
            }
            
            // Refresh comments display
            displayComments();
            
            // Show success message
            const submitButton = commentForm.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="ri-check-line"></i> Comment Posted!';
            submitButton.disabled = true;
            
            setTimeout(() => {
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
            }, 2000);
        });
    }
    
    // Handle login button in discussion section
    const discussionLoginButton = document.getElementById('discussion-login-button');
    if (discussionLoginButton) {
        discussionLoginButton.addEventListener('click', function() {
            const loginButton = document.getElementById('login-button');
            if (loginButton) {
                loginButton.click();
            }
        });
    }
    
    // Initialize
    displayComments();
    updateDiscussionUI();
    
    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});

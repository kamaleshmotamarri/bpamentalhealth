/*=============== CHATBOT FUNCTIONALITY ===============*/
let chatbotMessages, chatbotInput, chatbotSend, chatbotClear, chatbotTyping, suggestionButtons;
let chatbotWelcome = null;
let messageCount = 0;

// Initialize chatbot when DOM is ready
function initializeChatbot() {
   chatbotMessages = document.getElementById('chatbot-messages');
   chatbotInput = document.getElementById('chatbot-input');
   chatbotSend = document.getElementById('chatbot-send');
   chatbotClear = document.getElementById('chatbot-clear');
   chatbotTyping = document.getElementById('chatbot-typing');
   suggestionButtons = document.querySelectorAll('.chatbot__suggestion-btn');

   // Initialize welcome message reference
   if (chatbotMessages) {
      chatbotWelcome = chatbotMessages.querySelector('.chatbot__welcome');
   }

   // Check API key availability (for debugging)
   setTimeout(() => {
      if (window.GEMINI_API_KEY && window.GEMINI_API_KEY !== 'not_set' && window.GEMINI_API_KEY.trim()) {
         console.log('[TherapAI] API key loaded successfully');
      } else {
         console.warn('[TherapAI] API key not found. Make sure config/env-inject.js is loaded and GEMINI_API_KEY is set.');
      }
   }, 500);

   // Setup event listeners
   setupEventListeners();
}

// Setup all event listeners
function setupEventListeners() {
   // Send button
   if (chatbotSend) {
      chatbotSend.addEventListener('click', sendMessage);
   }

   // Clear button
   if (chatbotClear) {
      chatbotClear.addEventListener('click', clearConversation);
   }

   // Input field
   if (chatbotInput) {
      chatbotInput.addEventListener('keypress', (e) => {
         if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
         }
      });

      // Auto-resize input
      chatbotInput.addEventListener('input', () => {
         chatbotInput.style.height = 'auto';
         chatbotInput.style.height = chatbotInput.scrollHeight + 'px';
      });
   }

   // Suggestion buttons
   if (suggestionButtons && suggestionButtons.length > 0) {
      suggestionButtons.forEach(btn => {
         btn.addEventListener('click', () => {
            const textElement = btn.querySelector('span');
            const text = textElement ? textElement.textContent : btn.textContent;
            if (chatbotInput && text) {
               chatbotInput.value = text;
               sendMessage();
            }
         });
      });
   }
}

// Show typing indicator
function showTypingIndicator() {
   if (!chatbotMessages) return;

   // Create typing indicator if it doesn't exist in messages container
   let typingIndicator = chatbotMessages.querySelector('.chatbot__typing-indicator');
   if (!typingIndicator) {
      typingIndicator = document.createElement('div');
      typingIndicator.className = 'chatbot__typing-indicator';
      typingIndicator.id = 'chatbot-typing';
      typingIndicator.innerHTML = `
         <div class="chatbot__typing-dots">
            <span></span>
            <span></span>
            <span></span>
         </div>
      `;
      chatbotMessages.appendChild(typingIndicator);
   }

   typingIndicator.style.display = 'flex';
   setTimeout(() => {
      if (chatbotMessages) {
         chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
      }
   }, 100);
}

// Hide typing indicator
function hideTypingIndicator() {
   if (!chatbotMessages) return;

   const typingIndicator = chatbotMessages.querySelector('.chatbot__typing-indicator');
   if (typingIndicator) {
      typingIndicator.style.display = 'none';
   }

   // Also check the standalone typing indicator (if it exists outside messages)
   if (chatbotTyping) {
      chatbotTyping.style.display = 'none';
   }
}

// Remove welcome message
function removeWelcomeMessage() {
   if (chatbotWelcome) {
      chatbotWelcome.style.animation = 'fadeOut .3s ease-out';
      setTimeout(() => {
         chatbotWelcome.remove();
      }, 300);
   }
}

// Add message to chat
function addMessage(text, isUser = false) {
   // Remove welcome message on first user message
   if (isUser && chatbotWelcome && chatbotWelcome.parentNode) {
      removeWelcomeMessage();
   }

   // Hide suggestions after first message
   const suggestions = document.getElementById('chatbot-suggestions');
   if (suggestions && messageCount === 0) {
      suggestions.style.animation = 'fadeOut .3s ease-out';
      setTimeout(() => {
         suggestions.style.display = 'none';
      }, 300);
   }

   const messageDiv = document.createElement('div');
   messageDiv.className = `chatbot__message chatbot__message--${isUser ? 'user' : 'bot'}`;
   messageDiv.style.opacity = '0';
   messageDiv.style.transform = 'translateY(10px)';

   const avatar = document.createElement('div');
   avatar.className = 'chatbot__message-avatar';
   avatar.innerHTML = isUser ? '<i class="ri-user-fill"></i>' : '<i class="ri-robot-2-fill"></i>';

   const content = document.createElement('div');
   content.className = 'chatbot__message-content';

   const messageText = document.createElement('p');
   messageText.className = 'chatbot__message-text';
   messageText.textContent = text;

   const messageTime = document.createElement('span');
   messageTime.className = 'chatbot__message-time';
   const now = new Date();
   messageTime.textContent = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
   });

   content.appendChild(messageText);
   content.appendChild(messageTime);

   messageDiv.appendChild(avatar);
   messageDiv.appendChild(content);

   chatbotMessages.appendChild(messageDiv);

   // Animate message appearance
   setTimeout(() => {
      messageDiv.style.transition = 'opacity .3s ease-out, transform .3s ease-out';
      messageDiv.style.opacity = '1';
      messageDiv.style.transform = 'translateY(0)';
   }, 10);

   // Scroll to bottom
   setTimeout(() => {
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
   }, 100);

   messageCount++;
}

// Generate bot response using Gemini API
async function generateBotResponse(userMessage) {
   // Wait for API key to be available (with timeout)
   let API_KEY = window.GEMINI_API_KEY;
   let attempts = 0;
   const maxAttempts = 20; // Increased timeout for slower loading
   while ((!API_KEY || API_KEY === 'not_set' || API_KEY === '') && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      API_KEY = window.GEMINI_API_KEY;
      attempts++;
   }

   // Debug logging
   if (!API_KEY || API_KEY === 'not_set' || !API_KEY.trim()) {
      console.error('Gemini API Key is not configured');
      console.error('window.GEMINI_API_KEY:', window.GEMINI_API_KEY);
      console.error('Attempts made:', attempts);
      return "I'm having trouble connecting to my brain right now. Please make sure the API key is configured correctly. If you're the administrator, please check the configuration files (config/env-inject.js) and ensure GEMINI_API_KEY environment variable is set.";
   }

   // Validate API key format (should start with AIza)
   if (!API_KEY.startsWith('AIza')) {
      console.warn('API key format may be incorrect. Expected to start with "AIza"');
   }

   // Using Gemini 2.5 Flash model
   const model = 'gemini-2.5-flash';
   const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

   const systemPrompt = "You are TherapAI, a compassionate AI mental health assistant. You are available 24/7 to listen, support, and guide users on their wellness journey. Your tone should be empathetic, non-judgmental, and supportive. Your goal is to provide a safe space for users to share their thoughts and feelings. Important: You are not a doctor. For emergencies, always advise the user to contact a professional or emergency services. If a user expresses self-harm or immediate danger, provide resources and urge them to seek immediate help local to them. Keep your responses concise yet warm (2-4 sentences typically).";

   try {
      const response = await fetch(url, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify({
            systemInstruction: {
               parts: [{ text: systemPrompt }]
            },
            contents: [
               {
                  role: "user",
                  parts: [{ text: userMessage }]
               }
            ],
            generationConfig: {
               temperature: 0.7,
               topK: 40,
               topP: 0.95,
               maxOutputTokens: 1024,
            }
         })
      });

      if (!response.ok) {
         const errorText = await response.text();
         let errorData;
         try {
            errorData = JSON.parse(errorText);
         } catch (e) {
            errorData = { error: { message: errorText } };
         }
         console.error('Gemini API Error:', errorData);
         console.error('API Key present:', !!API_KEY);
         console.error('API Key length:', API_KEY ? API_KEY.length : 0);

         // Provide user-friendly error messages with more context
         if (response.status === 401 || response.status === 403) {
            const errorMsg = errorData?.error?.message || 'Authentication failed';
            console.error('Authentication error details:', errorMsg);
            return "I'm having authentication issues. Please check the API key configuration. If you're the administrator, verify that the GEMINI_API_KEY is set correctly in your environment variables.";
         } else if (response.status === 429) {
            return "I'm receiving too many requests right now. Please wait a moment and try again.";
         } else if (response.status === 400) {
            const errorMsg = errorData?.error?.message || 'Bad request';
            console.error('Bad request error:', errorMsg);
            return "I'm having trouble processing your request. Please try rephrasing your message.";
         } else {
            const errorMsg = errorData?.error?.message || 'Unknown error';
            console.error('API error:', response.status, errorMsg);
            return "I'm experiencing some technical difficulties. Please try again in a moment.";
         }
      }

      const data = await response.json();
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
         return data.candidates[0].content.parts[0].text;
      } else {
         console.warn('Unexpected response format:', data);
         return "I'm sorry, I'm finding it hard to process that right now. Could you try rephrasing?";
      }
   } catch (error) {
      console.error('Chatbot Error:', error);
      if (error.message && error.message.includes('fetch')) {
         return "I'm having trouble connecting to the server. Please check your internet connection and try again.";
      }
      return "I'm sorry, I'm experiencing some technical difficulties. Please try again in a moment.";
   }
}

// Send message
async function sendMessage() {
   if (!chatbotInput || !chatbotMessages) {
      console.error('Chatbot elements not initialized');
      return;
   }

   const message = chatbotInput.value.trim();
   if (!message) {
      return;
   }

   // Disable input while processing
   chatbotInput.disabled = true;
   if (chatbotSend) chatbotSend.disabled = true;

   addMessage(message, true);
   chatbotInput.value = '';

   // Reset input height
   chatbotInput.style.height = 'auto';

   // Show typing indicator
   showTypingIndicator();

   try {
      const botResponse = await generateBotResponse(message);
      hideTypingIndicator();
      addMessage(botResponse, false);
   } catch (error) {
      console.error('Error in sendMessage:', error);
      hideTypingIndicator();
      addMessage("I'm sorry, I encountered an error. Please try again.", false);
   } finally {
      // Re-enable input
      chatbotInput.disabled = false;
      if (chatbotSend) chatbotSend.disabled = false;
      chatbotInput.focus();
   }
}

// Clear conversation
function clearConversation() {
   if (!chatbotMessages) return;

   if (confirm('Are you sure you want to clear the conversation?')) {
      // Remove all messages
      const messages = chatbotMessages.querySelectorAll('.chatbot__message');
      messages.forEach(msg => {
         msg.style.animation = 'fadeOut .3s ease-out';
         setTimeout(() => msg.remove(), 300);
      });

      // Remove typing indicator if present
      hideTypingIndicator();
      const typingIndicator = chatbotMessages.querySelector('.chatbot__typing-indicator');
      if (typingIndicator) {
         typingIndicator.remove();
      }

      // Show welcome message again
      chatbotWelcome = chatbotMessages.querySelector('.chatbot__welcome');
      if (!chatbotWelcome || !chatbotWelcome.parentNode) {
         const welcomeDiv = document.createElement('div');
         welcomeDiv.className = 'chatbot__welcome';
         welcomeDiv.innerHTML = `
            <div class="chatbot__welcome-icon">
               <i class="ri-robot-2-fill"></i>
            </div>
            <h3 class="chatbot__welcome-title">Hello! I'm TherapAI</h3>
            <p class="chatbot__welcome-text">I'm here to listen and provide support. You can share your thoughts, feelings, or concerns with me. How are you feeling today?</p>
         `;
         chatbotMessages.appendChild(welcomeDiv);
         chatbotWelcome = welcomeDiv;
      } else {
         chatbotWelcome.style.display = 'block';
         chatbotWelcome.style.animation = 'fadeInUp .5s ease-out';
      }

      // Show suggestions again
      const suggestions = document.getElementById('chatbot-suggestions');
      if (suggestions) {
         suggestions.style.display = 'flex';
         suggestions.style.animation = 'fadeInUp .3s ease-out';
      }

      messageCount = 0;
   }
}

// Add fadeOut animation
const style = document.createElement('style');
style.textContent = `
   @keyframes fadeOut {
      from {
         opacity: 1;
         transform: translateY(0);
      }
      to {
         opacity: 0;
         transform: translateY(-10px);
      }
   }
`;
document.head.appendChild(style);

// Initialize chatbot when DOM is ready
if (document.readyState === 'loading') {
   document.addEventListener('DOMContentLoaded', initializeChatbot);
} else {
   // DOM is already loaded
   initializeChatbot();
}


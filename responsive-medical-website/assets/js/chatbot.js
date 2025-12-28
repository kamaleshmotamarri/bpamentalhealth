/*=============== CHATBOT FUNCTIONALITY ===============*/
const chatbotMessages = document.getElementById('chatbot-messages');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotSend = document.getElementById('chatbot-send');
const chatbotClear = document.getElementById('chatbot-clear');
const chatbotTyping = document.getElementById('chatbot-typing');
const suggestionButtons = document.querySelectorAll('.chatbot__suggestion-btn');

let chatbotWelcome = null;
let messageCount = 0;

// Initialize welcome message reference
if (chatbotMessages) {
   chatbotWelcome = chatbotMessages.querySelector('.chatbot__welcome');
}

// Show typing indicator
function showTypingIndicator() {
   if (chatbotTyping) {
      chatbotTyping.style.display = 'flex';
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
   }
}

// Hide typing indicator
function hideTypingIndicator() {
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

// Generate bot response (simulated)
function generateBotResponse(userMessage) {
   const lowerMessage = userMessage.toLowerCase();
   
   // Simple response logic (can be replaced with API call)
   if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety')) {
      return "I understand that anxiety can be overwhelming. Let's take some deep breaths together. Try the 4-7-8 breathing technique: inhale for 4 counts, hold for 7, and exhale for 8. Would you like to talk more about what's causing your anxiety?";
   } else if (lowerMessage.includes('stress') || lowerMessage.includes('stressed')) {
      return "Stress is a natural response, but it's important to manage it. Some helpful techniques include mindfulness, exercise, and breaking tasks into smaller steps. What specific situation is causing you stress right now?";
   } else if (lowerMessage.includes('down') || lowerMessage.includes('sad') || lowerMessage.includes('depressed')) {
      return "I'm sorry you're feeling this way. Your feelings are valid, and it's brave of you to reach out. Remember that you're not alone. Would it help to talk about what's been weighing on you?";
   } else if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return "You're very welcome! I'm here whenever you need to talk. Remember, taking care of your mental health is important, and reaching out is a sign of strength.";
   } else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return "I'm here to support you. You can share anything that's on your mind - your thoughts, feelings, or concerns. I'll listen without judgment. What would you like to talk about?";
   } else {
      return "Thank you for sharing that with me. I'm listening and here to support you. Can you tell me more about how you're feeling or what's on your mind?";
   }
}

// Send message
function sendMessage() {
   const message = chatbotInput.value.trim();
   if (message) {
      addMessage(message, true);
      chatbotInput.value = '';
      
      // Show typing indicator
      showTypingIndicator();
      
      // Simulate bot thinking time
      const thinkingTime = Math.random() * 1000 + 800; // 800-1800ms
      
      setTimeout(() => {
         hideTypingIndicator();
         const botResponse = generateBotResponse(message);
         addMessage(botResponse, false);
      }, thinkingTime);
   }
}

// Clear conversation
function clearConversation() {
   if (confirm('Are you sure you want to clear the conversation?')) {
      // Remove all messages
      const messages = chatbotMessages.querySelectorAll('.chatbot__message');
      messages.forEach(msg => {
         msg.style.animation = 'fadeOut .3s ease-out';
         setTimeout(() => msg.remove(), 300);
      });
      
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

// Event listeners
if (chatbotSend) {
   chatbotSend.addEventListener('click', sendMessage);
}

if (chatbotClear) {
   chatbotClear.addEventListener('click', clearConversation);
}

if (chatbotInput) {
   chatbotInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
         e.preventDefault();
         sendMessage();
      }
   });
   
   // Auto-resize input (if needed)
   chatbotInput.addEventListener('input', () => {
      chatbotInput.style.height = 'auto';
      chatbotInput.style.height = chatbotInput.scrollHeight + 'px';
   });
}

// Suggestion buttons
suggestionButtons.forEach(btn => {
   btn.addEventListener('click', () => {
      const textElement = btn.querySelector('span');
      const text = textElement ? textElement.textContent : btn.textContent;
      chatbotInput.value = text;
      sendMessage();
   });
});

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


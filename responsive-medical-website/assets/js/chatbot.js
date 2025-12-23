/*=============== CHATBOT FUNCTIONALITY ===============*/
const chatbotMessages = document.getElementById('chatbot-messages');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotSend = document.getElementById('chatbot-send');
const suggestionButtons = document.querySelectorAll('.chatbot__suggestion-btn');

// Add message to chat
function addMessage(text, isUser = false) {
   const messageDiv = document.createElement('div');
   messageDiv.className = `chatbot__message chatbot__message--${isUser ? 'user' : 'bot'}`;
   
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
   
   // Scroll to bottom
   chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
   
   // Remove suggestion buttons after first message
   const suggestions = document.getElementById('chatbot-suggestions');
   if (suggestions && suggestions.children.length > 0) {
      suggestions.style.display = 'none';
   }
}

// Send message
function sendMessage() {
   const message = chatbotInput.value.trim();
   if (message) {
      addMessage(message, true);
      chatbotInput.value = '';
      
      // Simulate bot response (placeholder - will be replaced with actual API call)
      setTimeout(() => {
         addMessage("Thank you for sharing. I'm here to listen and support you. This is a demo version, and full functionality will be available soon.");
      }, 1000);
   }
}

// Event listeners
if (chatbotSend) {
   chatbotSend.addEventListener('click', sendMessage);
}

if (chatbotInput) {
   chatbotInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
         sendMessage();
      }
   });
}

// Suggestion buttons
suggestionButtons.forEach(btn => {
   btn.addEventListener('click', () => {
      const text = btn.textContent;
      chatbotInput.value = text;
      sendMessage();
   });
});


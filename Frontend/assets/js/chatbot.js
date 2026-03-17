document.addEventListener('DOMContentLoaded', () => {
    const chatToggle = document.getElementById('chat-toggle');
    const chatWindow = document.getElementById('chat-window');
    const chatClose = document.getElementById('chat-close');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatMessages = document.getElementById('chat-messages');
    const BACKEND_URL = 'http://127.0.0.1:8080';

    // Toggle Chat Window
    chatToggle.addEventListener('click', () => {
        chatWindow.classList.toggle('d-none');
        if (!chatWindow.classList.contains('d-none')) {
            chatInput.focus();
        }
    });

    chatClose.addEventListener('click', () => {
        chatWindow.classList.add('d-none');
    });

    // Send Message
    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // Clear input
        chatInput.value = '';

        // Add user message to UI
        appendMessage('user', text);

        // Show typing indicator
        const typingId = appendMessage('bot', '...', true);

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({ message: text })
            });

            if (response.ok) {
                const data = await response.json();
                removeMessage(typingId);
                appendMessage('bot', data.reply);
            } else {
                removeMessage(typingId);
                appendMessage('bot', "I'm sorry, I'm having trouble connecting to the server. Please try again later.");
            }
        } catch (err) {
            console.error('❌ Chat Error:', err);
            removeMessage(typingId);
            appendMessage('bot', "Oops! Something went wrong. Are you online?");
        }
    }

    function appendMessage(sender, text, isTyping = false) {
        const id = 'msg-' + Date.now();
        const div = document.createElement('div');
        div.id = id;
        div.className = `mb-3 ${sender === 'user' ? 'text-end' : ''}`;

        const inner = document.createElement('div');
        inner.className = `d-inline-block p-2 rounded shadow-sm border ${sender === 'user' ? 'bg-primary text-white' : 'bg-white'}`;
        inner.style.maxWidth = '85%';
        inner.textContent = text;

        div.appendChild(inner);
        chatMessages.appendChild(div);

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;

        return id;
    }

    function removeMessage(id) {
        const msg = document.getElementById(id);
        if (msg) msg.remove();
    }

    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});

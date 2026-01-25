document.addEventListener('DOMContentLoaded', async function() {
    const userInfo = document.getElementById('userInfo');
    const logoutBtn = document.getElementById('logoutBtn');
    const messagesList = document.getElementById('messagesList');
    const totalMessages = document.getElementById('totalMessages');
    const unreadMessages = document.getElementById('unreadMessages');
    const messageModal = document.getElementById('messageModal');
    const closeModal = document.getElementById('closeModal');
    const modalSubject = document.getElementById('modalSubject');
    const modalSender = document.getElementById('modalSender');
    const modalSentTime = document.getElementById('modalSentTime');
    const modalContent = document.getElementById('modalContent');

    let messagesData = [];

    // Load user information
    async function loadUserInfo() {
        try {
            const response = await fetch('/api/user');
            if (!response.ok) {
                throw new Error('Failed to fetch user info');
            }
            const user = await response.json();
            userInfo.textContent = `Welcome, ${user.name} (${user.email})`;
        } catch (error) {
            console.error('Error loading user info:', error);
            // Redirect to login if session expired
            window.location.href = '/';
        }
    }

    // Load messages
    async function loadMessages() {
        try {
            const response = await fetch('/api/messages');
            if (!response.ok) {
                throw new Error('Failed to fetch messages');
            }
            messagesData = await response.json();
            displayMessages();
            updateMessageStats();
        } catch (error) {
            console.error('Error loading messages:', error);
            messagesList.innerHTML = `
                <div class="error-state">
                    <p>Error loading messages. Please refresh the page.</p>
                </div>
            `;
        }
    }

    // Display messages
    function displayMessages() {
        if (messagesData.length === 0) {
            messagesList.innerHTML = `
                <div class="empty-state">
                    <p>No messages found.</p>
                    <p>This is a demo application with pre-loaded sample messages.</p>
                </div>
            `;
            return;
        }

        const messagesHTML = messagesData.map(message => {
            const isUnread = !message.read_at;
            const sentTime = formatDate(message.sent_at);
            const preview = truncateText(message.content, 120);

            return `
                <div class="message-item ${isUnread ? 'unread' : ''}" data-message-id="${message.id}">
                    <div class="message-header">
                        <h3 class="message-subject">${escapeHtml(message.subject)}</h3>
                        <span class="message-time">${sentTime}</span>
                    </div>
                    <div class="message-sender">
                        From: ${escapeHtml(message.sender_name)} &lt;${escapeHtml(message.sender_email)}&gt;
                    </div>
                    <div class="message-preview">
                        ${escapeHtml(preview)}
                    </div>
                    ${isUnread ? '<div class="unread-indicator"></div>' : ''}
                </div>
            `;
        }).join('');

        messagesList.innerHTML = messagesHTML;

        // Add click event listeners
        document.querySelectorAll('.message-item').forEach(item => {
            item.addEventListener('click', function() {
                const messageId = this.getAttribute('data-message-id');
                openMessage(messageId);
            });
        });
    }

    // Update message statistics
    function updateMessageStats() {
        const total = messagesData.length;
        const unread = messagesData.filter(msg => !msg.read_at).length;
        
        totalMessages.textContent = total;
        unreadMessages.textContent = unread;
    }

    // Open message in modal
    function openMessage(messageId) {
        const message = messagesData.find(msg => msg.id == messageId);
        if (!message) return;

        modalSubject.textContent = message.subject;
        modalSender.textContent = `${message.sender_name} <${message.sender_email}>`;
        modalSentTime.textContent = formatDate(message.sent_at);
        modalContent.textContent = message.content;
        
        messageModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Mark as read if unread
        if (!message.read_at) {
            markAsRead(messageId);
        }
    }

    // Mark message as read
    async function markAsRead(messageId) {
        try {
            const response = await fetch(`/api/messages/read/${messageId}`, {
                method: 'POST'
            });

            if (response.ok) {
                // Update local data
                const message = messagesData.find(msg => msg.id == messageId);
                if (message) {
                    message.read_at = new Date().toISOString();
                    
                    // Update UI
                    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
                    if (messageElement) {
                        messageElement.classList.remove('unread');
                        const indicator = messageElement.querySelector('.unread-indicator');
                        if (indicator) {
                            indicator.remove();
                        }
                    }
                    updateMessageStats();
                }
            }
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    }

    // Close modal
    function closeMessageModal() {
        messageModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Logout functionality
    async function logout() {
        try {
            const response = await fetch('/logout', {
                method: 'POST'
            });

            if (response.ok) {
                window.location.href = '/';
            } else {
                alert('Logout failed. Please try again.');
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Force redirect on error
            window.location.href = '/';
        }
    }

    // Utility functions
    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - date) / (1000 * 60));
            return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString();
        }
    }

    function truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Event listeners
    logoutBtn.addEventListener('click', logout);
    closeModal.addEventListener('click', closeMessageModal);
    
    // Close modal on escape key or outside click
    messageModal.addEventListener('click', function(e) {
        if (e.target === messageModal) {
            closeMessageModal();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && messageModal.style.display === 'flex') {
            closeMessageModal();
        }
    });

    // Auto-refresh messages every 30 seconds
    setInterval(loadMessages, 30000);

    // Initialize dashboard
    await loadUserInfo();
    await loadMessages();

    // Educational console logs for students
    console.log('%cBlueMind Secure Messaging - Educational Demo', 'color: #00A2E8; font-size: 16px; font-weight: bold;');
    console.log('🔐 Security Features Implemented:');
    console.log('• Password hashing with bcrypt');
    console.log('• Session-based authentication');
    console.log('• Rate limiting on login attempts');
    console.log('• Input validation and sanitization');
    console.log('• XSS protection with HTML escaping');
    console.log('• CSRF protection with HTTP-only cookies');
    console.log('• SQL injection prevention with prepared statements');
    console.log('📚 Learning Objectives:');
    console.log('• Understand secure authentication patterns');
    console.log('• Learn about session management');
    console.log('• Implement proper error handling');
    console.log('• Practice frontend-backend communication');
    console.log('🚀 Try different user accounts to see the messaging system in action!');
});
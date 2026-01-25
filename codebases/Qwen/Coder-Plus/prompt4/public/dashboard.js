document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const logoutBtn = document.getElementById('logoutBtn');
    const navLinks = document.querySelectorAll('.nav-link');
    const views = document.querySelectorAll('.view');
    const composeForm = document.getElementById('composeForm');
    const messageModal = document.getElementById('messageModal');
    const closeMessageModal = messageModal.querySelector('.close');
    const messageDetail = document.getElementById('messageDetail');
    const deleteMessageBtn = document.getElementById('deleteMessageBtn');
    const welcomeMessage = document.getElementById('usernameDisplay');

    // Get token from localStorage or sessionStorage
    let token = localStorage.getItem('token') || sessionStorage.getItem('token');

    // Check if user is logged in
    if (!token) {
        window.location.href = '/';
        return;
    }

    // Verify token and get user info
    verifyToken();

    // Navigation functionality
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and views
            navLinks.forEach(l => l.classList.remove('active'));
            views.forEach(v => v.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding view
            const viewId = this.getAttribute('data-view') + 'View';
            document.getElementById(viewId).classList.add('active');
            
            // Load content based on view
            switch(this.getAttribute('data-view')) {
                case 'inbox':
                    loadInbox();
                    break;
                case 'compose':
                    // Nothing to load for compose view
                    break;
                case 'sent':
                    loadSentMessages();
                    break;
            }
        });
    });

    // Logout functionality
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        window.location.href = '/';
    });

    // Compose form submission
    composeForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(composeForm);
        const messageData = {
            recipientUsername: formData.get('recipientUsername'),
            subject: formData.get('subject'),
            content: formData.get('content')
        };

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(messageData)
            });

            const data = await response.json();

            if (data.success) {
                alert('Message sent successfully!');
                composeForm.reset();
            } else {
                alert(data.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Send message error:', error);
            alert('An error occurred while sending the message. Please try again.');
        }
    });

    // Modal functionality
    closeMessageModal.addEventListener('click', function() {
        messageModal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === messageModal) {
            messageModal.style.display = 'none';
        }
    });

    // Delete message button
    deleteMessageBtn.addEventListener('click', async function() {
        const messageId = this.getAttribute('data-message-id');
        
        if (!messageId) return;

        if (confirm('Are you sure you want to delete this message?')) {
            try {
                const response = await fetch(`/api/messages/${messageId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (data.success) {
                    messageModal.style.display = 'none';
                    loadInbox(); // Reload inbox after deletion
                } else {
                    alert(data.message || 'Failed to delete message');
                }
            } catch (error) {
                console.error('Delete message error:', error);
                alert('An error occurred while deleting the message. Please try again.');
            }
        }
    });

    // Load inbox messages
    async function loadInbox() {
        const container = document.getElementById('messagesContainer');
        container.innerHTML = '<div class="loading">Loading messages...</div>';

        try {
            const response = await fetch('/api/messages', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                if (data.messages.length === 0) {
                    container.innerHTML = '<div class="no-messages">No messages in inbox</div>';
                } else {
                    renderMessages(data.messages, container);
                }
            } else {
                container.innerHTML = `<div class="error-message">${data.message || 'Failed to load messages'}</div>`;
            }
        } catch (error) {
            console.error('Load inbox error:', error);
            container.innerHTML = '<div class="error-message">An error occurred while loading messages</div>';
        }
    }

    // Load sent messages
    async function loadSentMessages() {
        const container = document.getElementById('sentMessagesContainer');
        container.innerHTML = '<div class="loading">Loading sent messages...</div>';

        try {
            const response = await fetch('/api/messages/sent', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                if (data.messages.length === 0) {
                    container.innerHTML = '<div class="no-messages">No sent messages</div>';
                } else {
                    renderMessages(data.messages, container, true);
                }
            } else {
                container.innerHTML = `<div class="error-message">${data.message || 'Failed to load sent messages'}</div>`;
            }
        } catch (error) {
            console.error('Load sent messages error:', error);
            container.innerHTML = '<div class="error-message">An error occurred while loading sent messages</div>';
        }
    }

    // Render messages in the container
    function renderMessages(messages, container, isSent = false) {
        container.innerHTML = '';

        messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = `message-item ${!message.isRead && !isSent ? 'unread' : ''}`;
            messageElement.innerHTML = `
                <div class="message-item-header">
                    <div class="message-sender">${isSent ? `To: ${message.recipient.username}` : `From: ${message.sender.username}`}</div>
                    <div class="message-date">${formatDate(message.createdAt)}</div>
                </div>
                <div class="message-subject">${message.subject}</div>
                <div class="message-preview">${truncateText(message.content, 100)}</div>
            `;

            messageElement.addEventListener('click', () => showMessageDetail(message.id));
            container.appendChild(messageElement);
        });
    }

    // Show message detail in modal
    async function showMessageDetail(messageId) {
        try {
            const response = await fetch(`/api/messages/${messageId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                const message = data.message;
                
                document.getElementById('messageSubject').textContent = message.subject;
                document.getElementById('messageSender').textContent = message.sender.username;
                document.getElementById('messageRecipient').textContent = message.recipient.username;
                document.getElementById('messageDate').textContent = formatDate(message.createdAt);
                document.getElementById('messageBody').textContent = message.content;
                
                deleteMessageBtn.setAttribute('data-message-id', message.id);
                
                messageModal.style.display = 'block';
            } else {
                alert(data.message || 'Failed to load message');
            }
        } catch (error) {
            console.error('Show message detail error:', error);
            alert('An error occurred while loading the message. Please try again.');
        }
    }

    // Verify token and get user info
    async function verifyToken() {
        try {
            const response = await fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                welcomeMessage.textContent = data.user.username;
            } else {
                // Token invalid, redirect to login
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Token verification error:', error);
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            window.location.href = '/';
        }
    }

    // Helper functions
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString();
    }

    function truncateText(text, maxLength) {
        if (text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength) + '...';
    }

    // Load inbox by default
    loadInbox();
});
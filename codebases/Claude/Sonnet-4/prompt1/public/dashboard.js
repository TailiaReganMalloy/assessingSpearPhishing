document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    loadUserInfo();
    loadMessages();
    setupNavigation();
    setupComposeForm();
});

// Navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all nav items and sections
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked nav item
            this.classList.add('active');
            
            // Show corresponding section
            const sectionName = this.dataset.section;
            const targetSection = document.getElementById(sectionName + '-section');
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

// Load user information
async function loadUserInfo() {
    try {
        const response = await fetch('/api/user');
        if (response.ok) {
            const user = await response.json();
            document.getElementById('userEmail').textContent = user.email;
            
            // Update session info in security section
            const sessionInfo = document.getElementById('sessionInfo');
            if (sessionInfo) {
                sessionInfo.innerHTML = `
                    <strong>Current Session:</strong><br>
                    Logged in as: ${user.email}<br>
                    Computer Type: ${user.computerType === 'private' ? 'Private Computer' : 'Public Computer'}<br>
                    Session Timeout: ${user.computerType === 'private' ? '24 hours' : '30 minutes'}
                `;
            }
        }
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

// Load messages
async function loadMessages() {
    const messagesList = document.getElementById('messagesList');
    const unreadCount = document.getElementById('unreadCount');
    
    try {
        messagesList.innerHTML = '<div class="loading-messages">Loading messages...</div>';
        
        const response = await fetch('/api/messages');
        if (!response.ok) {
            throw new Error('Failed to load messages');
        }
        
        const messages = await response.json();
        
        if (messages.length === 0) {
            messagesList.innerHTML = '<div class="loading-messages">No messages found</div>';
            unreadCount.textContent = '0';
            return;
        }
        
        // Count unread messages
        const unreadMessages = messages.filter(msg => !msg.read_at);
        unreadCount.textContent = unreadMessages.length;
        
        // Render messages
        messagesList.innerHTML = messages.map(message => `
            <div class="message-item ${!message.read_at ? 'unread' : ''}" data-message-id="${message.id}">
                <div class="message-content">
                    <div class="message-header">
                        <div class="message-subject">${escapeHtml(message.subject)}</div>
                        <div class="message-date">${formatDate(message.sent_at)}</div>
                    </div>
                    <div class="message-sender">From: ${escapeHtml(message.sender_email)}</div>
                    <div class="message-preview">${escapeHtml(message.body.substring(0, 100))}${message.body.length > 100 ? '...' : ''}</div>
                </div>
            </div>
        `).join('');
        
        // Add click handlers for messages
        document.querySelectorAll('.message-item').forEach(item => {
            item.addEventListener('click', function() {
                const messageId = this.dataset.messageId;
                const message = messages.find(m => m.id == messageId);
                if (message) {
                    openMessage(message);
                }
            });
        });
        
    } catch (error) {
        console.error('Error loading messages:', error);
        messagesList.innerHTML = '<div class="loading-messages">Error loading messages</div>';
    }
}

// Open message in modal
function openMessage(message) {
    // Mark as read if unread
    if (!message.read_at) {
        markMessageAsRead(message.id);
    }
    
    // Populate modal
    document.getElementById('modalSubject').textContent = message.subject;
    document.getElementById('modalSender').textContent = message.sender_email;
    document.getElementById('modalDate').textContent = formatDate(message.sent_at);
    document.getElementById('modalBody').textContent = message.body;
    
    // Show modal
    document.getElementById('messageModal').style.display = 'block';
}

// Close message modal
function closeMessageModal() {
    document.getElementById('messageModal').style.display = 'none';
}

// Mark message as read
async function markMessageAsRead(messageId) {
    try {
        await fetch(`/api/messages/${messageId}/read`, {
            method: 'POST'
        });
        
        // Reload messages to update UI
        loadMessages();
    } catch (error) {
        console.error('Error marking message as read:', error);
    }
}

// Setup compose form
function setupComposeForm() {
    const composeForm = document.getElementById('composeForm');
    const statusMessage = document.getElementById('compose-status');
    
    composeForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(composeForm);
        const messageData = {
            recipientEmail: formData.get('recipientEmail'),
            subject: formData.get('subject'),
            body: formData.get('body')
        };
        
        const submitBtn = composeForm.querySelector('.send-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        
        try {
            const response = await fetch('/api/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messageData)
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                showStatus('Message sent successfully!', 'success');
                composeForm.reset();
            } else {
                showStatus(result.error || 'Failed to send message', 'error');
            }
            
        } catch (error) {
            console.error('Error sending message:', error);
            showStatus('Network error. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
        }
    });
    
    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        statusMessage.style.display = 'block';
        
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 5000);
    }
}

// Logout function
async function logout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            const response = await fetch('/logout', {
                method: 'POST'
            });
            
            if (response.ok) {
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Logout error:', error);
            alert('Error logging out. Please try again.');
        }
    }
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('messageModal');
    if (event.target === modal) {
        closeMessageModal();
    }
});

// Refresh messages periodically (every 30 seconds)
setInterval(loadMessages, 30000);
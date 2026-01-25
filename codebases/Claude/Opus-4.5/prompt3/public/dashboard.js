// Educational Demo - Dashboard JavaScript

let currentUser = null;
let users = [];
let messages = [];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    await loadCurrentUser();
    await loadUsers();
    await loadMessages();
    setupEventListeners();
});

// Load current user information
async function loadCurrentUser() {
    try {
        const response = await fetch('/api/user', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const result = await response.json();
            currentUser = result.user;
            document.getElementById('userEmail').textContent = currentUser.email;
        } else {
            // Not authenticated, redirect to login
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Error loading user:', error);
        window.location.href = '/';
    }
}

// Load available users for messaging
async function loadUsers() {
    try {
        const response = await fetch('/api/users', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const result = await response.json();
            users = result.users;
            populateUserSelect();
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Populate the user select dropdown
function populateUserSelect() {
    const select = document.getElementById('toEmail');
    select.innerHTML = '<option value="">Select recipient...</option>';
    
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.email;
        option.textContent = user.email;
        select.appendChild(option);
    });
}

// Load user messages
async function loadMessages() {
    try {
        const response = await fetch('/api/messages', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const result = await response.json();
            messages = result.messages;
            displayMessages();
        }
    } catch (error) {
        console.error('Error loading messages:', error);
        showLoadingError();
    }
}

// Display messages in the UI
function displayMessages() {
    const container = document.getElementById('messagesContainer');
    
    if (messages.length === 0) {
        container.innerHTML = '<div class="no-messages">No messages yet. Send yourself a message to get started!</div>';
        return;
    }
    
    container.innerHTML = messages.map(message => `
        <div class="message-item ${!message.read_at ? 'unread' : ''}" onclick="toggleMessage(${message.id})">
            <div class="message-header">
                <span class="message-sender">${escapeHtml(message.sender_email)}</span>
                <span class="message-date">${formatDate(message.created_at)}</span>
            </div>
            <div class="message-subject">${escapeHtml(message.subject)}</div>
            <div class="message-preview" id="preview-${message.id}">
                ${escapeHtml(message.content.substring(0, 100))}${message.content.length > 100 ? '...' : ''}
            </div>
            <div class="message-full" id="full-${message.id}" style="display: none;">
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee;">
                    ${escapeHtml(message.content).replace(/\n/g, '<br>')}
                </div>
            </div>
        </div>
    `).join('');
}

// Toggle message content display
async function toggleMessage(messageId) {
    const preview = document.getElementById(`preview-${messageId}`);
    const full = document.getElementById(`full-${messageId}`);
    const message = messages.find(m => m.id === messageId);
    
    if (full.style.display === 'none') {
        preview.style.display = 'none';
        full.style.display = 'block';
        
        // Mark as read if unread
        if (!message.read_at) {
            await markAsRead(messageId);
        }
    } else {
        preview.style.display = 'block';
        full.style.display = 'none';
    }
}

// Mark message as read
async function markAsRead(messageId) {
    try {
        const response = await fetch(`/api/messages/${messageId}/read`, {
            method: 'PATCH',
            credentials: 'include'
        });
        
        if (response.ok) {
            // Update local message state
            const message = messages.find(m => m.id === messageId);
            if (message) {
                message.read_at = new Date().toISOString();
                // Remove unread class
                const messageElement = document.querySelector(`[onclick="toggleMessage(${messageId})"]`);
                if (messageElement) {
                    messageElement.classList.remove('unread');
                }
            }
        }
    } catch (error) {
        console.error('Error marking message as read:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Compose form
    document.getElementById('composeForm').addEventListener('submit', sendMessage);
    
    // Character counter for subject and content
    const subjectInput = document.getElementById('subject');
    const contentTextarea = document.getElementById('content');
    
    addCharacterCounter(subjectInput, 200);
    addCharacterCounter(contentTextarea, 5000);
}

// Add character counter to input
function addCharacterCounter(element, maxLength) {
    const counter = document.createElement('div');
    counter.className = 'character-counter';
    counter.style.cssText = 'font-size: 12px; color: #666; text-align: right; margin-top: 4px;';
    element.parentNode.appendChild(counter);
    
    function updateCounter() {
        const remaining = maxLength - element.value.length;
        counter.textContent = `${element.value.length}/${maxLength} characters`;
        counter.style.color = remaining < 50 ? '#f44336' : '#666';
    }
    
    element.addEventListener('input', updateCounter);
    updateCounter();
}

// Send message
async function sendMessage(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const messageData = {
        to_email: formData.get('to_email'),
        subject: formData.get('subject'),
        content: formData.get('content')
    };
    
    // Client-side validation
    if (!messageData.to_email || !messageData.subject || !messageData.content) {
        showNotification('Please fill in all fields.', 'error');
        return;
    }
    
    if (messageData.subject.length > 200) {
        showNotification('Subject is too long (max 200 characters).', 'error');
        return;
    }
    
    if (messageData.content.length > 5000) {
        showNotification('Message is too long (max 5000 characters).', 'error');
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(messageData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification('Message sent successfully!', 'success');
            e.target.reset();
            // Reload messages to show the sent message if it was to the current user
            await loadMessages();
        } else {
            if (result.errors && Array.isArray(result.errors)) {
                showNotification(result.errors.map(err => err.msg).join(', '), 'error');
            } else {
                showNotification(result.error || 'Failed to send message.', 'error');
            }
        }
    } catch (error) {
        console.error('Send message error:', error);
        showNotification('Network error. Please try again.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type === 'error' ? 'error-message' : 'success-message'}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 6px;
        z-index: 1000;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Logout function
async function logout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            window.location.href = '/';
        } else {
            showNotification('Logout failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Network error during logout.', 'error');
    }
}

// Show loading error
function showLoadingError() {
    const container = document.getElementById('messagesContainer');
    container.innerHTML = '<div class="loading" style="color: #f44336;">Failed to load messages. Please refresh the page.</div>';
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) {
        return 'Just now';
    } else if (diffMins < 60) {
        return `${diffMins}m ago`;
    } else if (diffHours < 24) {
        return `${diffHours}h ago`;
    } else if (diffDays < 7) {
        return `${diffDays}d ago`;
    } else {
        return date.toLocaleDateString();
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
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
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Security reminder
console.log('%c🎓 Educational Dashboard', 'color: #2196f3; font-weight: bold; font-size: 16px;');
console.log('%cThis dashboard demonstrates secure messaging with proper authentication.', 'color: #666;');
console.log('%cFeatures: JWT tokens, input validation, XSS protection, and more!', 'color: #4caf50;');
let currentUser = null;
let allUsers = [];
let inboxMessages = [];
let sentMessages = [];

// Load user data on page load
async function loadUserData() {
    try {
        const response = await fetch('/api/user');
        if (!response.ok) {
            window.location.href = '/';
            return;
        }
        currentUser = await response.json();
        document.getElementById('userEmail').textContent = currentUser.email;
        
        // Load other data
        await Promise.all([
            loadUsers(),
            loadInboxMessages(),
            loadSentMessages()
        ]);
    } catch (error) {
        console.error('Error loading user data:', error);
        window.location.href = '/';
    }
}

// Load all users for recipient selection
async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        allUsers = await response.json();
        
        const select = document.getElementById('recipient');
        select.innerHTML = '<option value="">Select recipient...</option>';
        
        allUsers.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.email;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Load inbox messages
async function loadInboxMessages() {
    try {
        const response = await fetch('/api/messages');
        inboxMessages = await response.json();
        displayInboxMessages();
    } catch (error) {
        console.error('Error loading inbox:', error);
    }
}

// Load sent messages
async function loadSentMessages() {
    try {
        const response = await fetch('/api/messages/sent');
        sentMessages = await response.json();
        displaySentMessages();
    } catch (error) {
        console.error('Error loading sent messages:', error);
    }
}

// Display inbox messages
function displayInboxMessages() {
    const container = document.getElementById('inboxMessages');
    
    if (inboxMessages.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg width="60" height="60" viewBox="0 0 60 60">
                    <path d="M5 15 L30 30 L55 15 M5 15 L5 45 L55 45 L55 15 Z" fill="none" stroke="#ccc" stroke-width="3"/>
                </svg>
                <p>No messages in your inbox</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = inboxMessages.map(msg => `
        <div class="message-item ${msg.read ? '' : 'unread'}" onclick="viewMessage(${msg.id}, 'inbox')">
            <div class="message-header">
                <span class="message-sender">${escapeHtml(msg.sender_email)}</span>
                <span class="message-date">${formatDate(msg.created_at)}</span>
            </div>
            <div class="message-subject">${escapeHtml(msg.subject)}</div>
            <div class="message-preview">${escapeHtml(msg.body.substring(0, 100))}${msg.body.length > 100 ? '...' : ''}</div>
        </div>
    `).join('');
}

// Display sent messages
function displaySentMessages() {
    const container = document.getElementById('sentMessages');
    
    if (sentMessages.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg width="60" height="60" viewBox="0 0 60 60">
                    <path d="M5 15 L30 30 L55 15 M5 15 L5 45 L55 45 L55 15 Z" fill="none" stroke="#ccc" stroke-width="3"/>
                </svg>
                <p>You haven't sent any messages yet</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = sentMessages.map(msg => `
        <div class="message-item" onclick="viewMessage(${msg.id}, 'sent')">
            <div class="message-header">
                <span class="message-sender">To: ${escapeHtml(msg.recipient_email)}</span>
                <span class="message-date">${formatDate(msg.created_at)}</span>
            </div>
            <div class="message-subject">${escapeHtml(msg.subject)}</div>
            <div class="message-preview">${escapeHtml(msg.body.substring(0, 100))}${msg.body.length > 100 ? '...' : ''}</div>
        </div>
    `).join('');
}

// View a specific message
async function viewMessage(messageId, type) {
    const messages = type === 'inbox' ? inboxMessages : sentMessages;
    const message = messages.find(m => m.id === messageId);
    
    if (!message) return;
    
    // Mark as read if it's an inbox message
    if (type === 'inbox' && !message.read) {
        try {
            await fetch(`/api/messages/${messageId}/read`, {
                method: 'PUT'
            });
            message.read = 1;
            displayInboxMessages();
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    }
    
    const container = document.getElementById(type);
    container.innerHTML = `
        <button onclick="showSection('${type}')" style="margin-bottom: 20px; padding: 8px 16px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer;">
            ← Back to ${type === 'inbox' ? 'Inbox' : 'Sent Messages'}
        </button>
        <div class="message-detail">
            <div class="message-detail-header">
                <h3>${escapeHtml(message.subject)}</h3>
                <div class="message-meta">
                    <strong>${type === 'inbox' ? 'From' : 'To'}:</strong> 
                    ${escapeHtml(type === 'inbox' ? message.sender_email : message.recipient_email)}
                </div>
                <div class="message-meta">
                    <strong>Date:</strong> ${formatDate(message.created_at)}
                </div>
            </div>
            <div class="message-body">${escapeHtml(message.body)}</div>
        </div>
    `;
}

// Show section
function showSection(sectionName) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionName).classList.add('active');
    
    // Reload data for the section
    if (sectionName === 'inbox') {
        loadInboxMessages();
    } else if (sectionName === 'sent') {
        loadSentMessages();
    }
    
    clearComposeMessages();
}

// Compose form submission
document.getElementById('composeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearComposeMessages();
    
    const formData = new FormData(e.target);
    const data = {
        recipient_id: parseInt(formData.get('recipient_id')),
        subject: formData.get('subject'),
        body: formData.get('body')
    };
    
    try {
        const response = await fetch('/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showComposeSuccess('Message sent successfully!');
            e.target.reset();
            await loadSentMessages();
        } else {
            showComposeError(result.error || 'Failed to send message');
        }
    } catch (error) {
        showComposeError('An error occurred. Please try again.');
        console.error('Send message error:', error);
    }
});

// Logout
async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/';
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '/';
    }
}

// Helper functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function clearComposeMessages() {
    document.getElementById('composeErrorMessage').classList.remove('show');
    document.getElementById('composeSuccessMessage').classList.remove('show');
}

function showComposeError(message) {
    const element = document.getElementById('composeErrorMessage');
    element.textContent = message;
    element.classList.add('show');
}

function showComposeSuccess(message) {
    const element = document.getElementById('composeSuccessMessage');
    element.textContent = message;
    element.classList.add('show');
}

// Initialize on page load
loadUserData();

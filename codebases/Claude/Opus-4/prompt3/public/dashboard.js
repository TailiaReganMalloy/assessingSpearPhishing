// Global state
let currentUser = null;
let currentView = 'inbox';
let messages = [];
let users = [];

// Initialize dashboard
async function initDashboard() {
    try {
        // Check authentication
        const authResponse = await fetch('/api/auth/status');
        if (!authResponse.ok) {
            window.location.href = '/';
            return;
        }
        
        const authData = await authResponse.json();
        currentUser = authData.user;
        
        // Update UI with user info
        document.getElementById('userName').textContent = currentUser.username;
        document.getElementById('userEmail').textContent = currentUser.email;
        document.getElementById('userAvatar').textContent = currentUser.username.charAt(0).toUpperCase();
        
        // Load users for recipient selection
        await loadUsers();
        
        // Load inbox by default
        await loadInbox();
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        alert('Failed to load dashboard. Please try logging in again.');
        window.location.href = '/';
    }
}

// Load users for recipient selection
async function loadUsers() {
    try {
        const response = await fetch('/api/messages/users');
        const data = await response.json();
        users = data.users;
        
        // Populate recipient dropdown
        const recipientSelect = document.getElementById('recipient');
        recipientSelect.innerHTML = '<option value="">Select recipient...</option>';
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.email;
            option.textContent = `${user.username} (${user.email})`;
            recipientSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Load inbox messages
async function loadInbox() {
    setActiveView('inbox');
    try {
        const response = await fetch('/api/messages/inbox');
        const data = await response.json();
        messages = data.messages;
        
        // Update unread count
        const unreadCount = data.unreadCount;
        const unreadEl = document.getElementById('unreadCount');
        unreadEl.textContent = unreadCount > 0 ? `(${unreadCount})` : '';
        
        displayMessages(messages, 'inbox');
    } catch (error) {
        console.error('Error loading inbox:', error);
        displayError('Failed to load messages');
    }
}

// Load sent messages
async function loadSent() {
    setActiveView('sent');
    try {
        const response = await fetch('/api/messages/sent');
        const data = await response.json();
        messages = data.messages;
        displayMessages(messages, 'sent');
    } catch (error) {
        console.error('Error loading sent messages:', error);
        displayError('Failed to load messages');
    }
}

// Load statistics
async function loadStats() {
    setActiveView('stats');
    try {
        const response = await fetch('/api/messages/stats');
        const stats = await response.json();
        
        const messageList = document.getElementById('messageList');
        messageList.innerHTML = `
            <div style="padding: 20px;">
                <h2>Message Statistics</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 20px;">
                    <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center;">
                        <h3 style="color: #00CED1; font-size: 2rem; margin-bottom: 10px;">${stats.totalReceived}</h3>
                        <p>Messages Received</p>
                    </div>
                    <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center;">
                        <h3 style="color: #00CED1; font-size: 2rem; margin-bottom: 10px;">${stats.totalSent}</h3>
                        <p>Messages Sent</p>
                    </div>
                    <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center;">
                        <h3 style="color: #ff6b6b; font-size: 2rem; margin-bottom: 10px;">${stats.unreadCount}</h3>
                        <p>Unread Messages</p>
                    </div>
                </div>
                <div style="margin-top: 30px;">
                    <h3>Recent Activity</h3>
                    <p style="margin-top: 10px;">
                        Last received: ${stats.recentActivity.lastReceived ? new Date(stats.recentActivity.lastReceived).toLocaleString() : 'No messages received'}
                    </p>
                    <p>
                        Last sent: ${stats.recentActivity.lastSent ? new Date(stats.recentActivity.lastSent).toLocaleString() : 'No messages sent'}
                    </p>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading stats:', error);
        displayError('Failed to load statistics');
    }
}

// Display messages in the list
function displayMessages(messages, type) {
    const messageList = document.getElementById('messageList');
    
    if (messages.length === 0) {
        messageList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <p>No messages in your ${type}</p>
            </div>
        `;
        return;
    }
    
    const messagesHTML = messages.map(msg => {
        const isInbox = type === 'inbox';
        const correspondent = isInbox ? msg.from : msg.to;
        const user = users.find(u => u.email === correspondent);
        const displayName = user ? user.username : correspondent;
        
        return `
            <div class="message-item ${msg.read ? '' : 'unread'}" onclick="viewMessage('${msg.id}')">
                <h3>${msg.subject}</h3>
                <div class="meta">
                    <strong>${isInbox ? 'From' : 'To'}: ${displayName}</strong> • 
                    ${new Date(msg.createdAt).toLocaleString()}
                </div>
            </div>
        `;
    }).join('');
    
    messageList.innerHTML = messagesHTML;
}

// View a single message
async function viewMessage(messageId) {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;
    
    // Mark as read if in inbox
    if (currentView === 'inbox' && !message.read) {
        try {
            await fetch(`/api/messages/${messageId}/read`, { method: 'PATCH' });
            message.read = true;
            // Refresh inbox to update unread count
            loadInbox();
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    }
    
    const isInbox = message.to === currentUser.email;
    const correspondent = isInbox ? message.from : message.to;
    const user = users.find(u => u.email === correspondent);
    const displayName = user ? user.username : correspondent;
    
    const messageView = document.getElementById('messageView');
    messageView.innerHTML = `
        <h2>${message.subject}</h2>
        <div style="margin: 20px 0; color: #666;">
            <p><strong>${isInbox ? 'From' : 'To'}:</strong> ${displayName} (${correspondent})</p>
            <p><strong>Date:</strong> ${new Date(message.createdAt).toLocaleString()}</p>
        </div>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="white-space: pre-wrap;">${message.content}</p>
        </div>
        <div style="display: flex; gap: 10px;">
            ${isInbox ? `<button onclick="replyTo('${correspondent}', '${message.subject}')" class="connect-btn">Reply</button>` : ''}
            <button onclick="deleteMessage('${messageId}')" style="background: #ff6b6b; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Delete</button>
        </div>
    `;
    
    document.getElementById('viewModal').classList.add('active');
}

// Delete a message
async function deleteMessage(messageId) {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
        const response = await fetch(`/api/messages/${messageId}`, { method: 'DELETE' });
        if (response.ok) {
            closeView();
            if (currentView === 'inbox') {
                loadInbox();
            } else if (currentView === 'sent') {
                loadSent();
            }
        } else {
            alert('Failed to delete message');
        }
    } catch (error) {
        console.error('Error deleting message:', error);
        alert('Failed to delete message');
    }
}

// Reply to a message
function replyTo(email, subject) {
    closeView();
    showCompose();
    document.getElementById('recipient').value = email;
    document.getElementById('subject').value = `Re: ${subject}`;
    document.getElementById('content').focus();
}

// Show compose modal
function showCompose() {
    document.getElementById('composeModal').classList.add('active');
    document.getElementById('composeForm').reset();
}

// Close compose modal
function closeCompose() {
    document.getElementById('composeModal').classList.remove('active');
}

// Close view modal
function closeView() {
    document.getElementById('viewModal').classList.remove('active');
}

// Handle compose form submission
document.getElementById('composeForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Sending...';
    
    const formData = new FormData(e.target);
    const messageData = {
        to: formData.get('to'),
        subject: formData.get('subject'),
        content: formData.get('content')
    };
    
    try {
        const response = await fetch('/api/messages/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messageData)
        });
        
        if (response.ok) {
            alert('Message sent successfully!');
            closeCompose();
            if (currentView === 'sent') {
                loadSent();
            }
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to send message');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
    }
});

// Set active view
function setActiveView(view) {
    currentView = view;
    document.querySelectorAll('.sidebar button').forEach(btn => btn.classList.remove('active'));
    
    const btnMap = {
        'inbox': 'inboxBtn',
        'sent': 'sentBtn',
        'stats': 'statsBtn'
    };
    
    const activeBtn = document.getElementById(btnMap[view]);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

// Display error message
function displayError(message) {
    const messageList = document.getElementById('messageList');
    messageList.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #d00;">
            <p>${message}</p>
        </div>
    `;
}

// Logout function
async function logout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/';
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '/';
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initDashboard);
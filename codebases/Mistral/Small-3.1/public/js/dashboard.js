// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    await loadUserInfo();
    await loadMessages();
    await loadRecipients();
});

// Load current user information
async function loadUserInfo() {
    try {
        const response = await fetch('/api/auth/user');
        
        if (response.ok) {
            const user = await response.json();
            document.getElementById('userEmail').textContent = user.email;
        } else {
            // Not authenticated, redirect to login
            window.location.href = '/';
        }
    } catch (err) {
        console.error('Error loading user info:', err);
    }
}

// Load messages for current user
async function loadMessages() {
    try {
        const response = await fetch('/api/messages');
        
        if (!response.ok) {
            console.error('Failed to load messages');
            return;
        }
        
        const messages = await response.json();
        displayMessages(messages);
    } catch (err) {
        console.error('Error loading messages:', err);
    }
}

// Display messages in the list
function displayMessages(messages) {
    const messagesList = document.getElementById('messagesList');
    const messageCount = document.getElementById('messageCount');
    
    if (messages.length === 0) {
        messagesList.innerHTML = '<div class="empty-state"><p>No messages yet. Check back soon!</p></div>';
        messageCount.textContent = '0 messages';
        return;
    }
    
    messageCount.textContent = `${messages.length} message${messages.length !== 1 ? 's' : ''}`;
    
    messagesList.innerHTML = messages.map(msg => `
        <div class="message-item ${msg.read ? '' : 'unread'}" onclick="openMessage(${msg.id}, '${msg.sender_email}', '${msg.subject}', '${msg.body}', ${msg.read})">
            <div class="message-preview">
                <div class="message-info">
                    <div class="message-from">${escapeHtml(msg.sender_email)}</div>
                    <div class="message-subject">${escapeHtml(msg.subject)}</div>
                    <div class="message-body-preview">${escapeHtml(msg.body)}</div>
                </div>
                <div class="message-meta">
                    <div class="message-date">${formatDate(msg.created_at)}</div>
                    ${!msg.read ? '<div class="message-unread-badge"></div>' : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// Load list of users for sending messages
async function loadRecipients() {
    try {
        const response = await fetch('/api/auth/users');
        
        if (!response.ok) {
            console.error('Failed to load users');
            return;
        }
        
        const users = await response.json();
        const select = document.getElementById('recipientSelect');
        
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.email;
            select.appendChild(option);
        });
    } catch (err) {
        console.error('Error loading recipients:', err);
    }
}

// Switch between views
function switchView(viewName) {
    // Hide all views
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Update nav buttons
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected view
    document.getElementById(viewName + 'View').classList.add('active');
    event.target.classList.add('active');
}

// Open message in modal
function openMessage(messageId, sender, subject, body, isRead) {
    document.getElementById('modalSubject').textContent = escapeHtml(subject);
    document.getElementById('modalFrom').textContent = `From: ${escapeHtml(sender)}`;
    document.getElementById('modalDate').textContent = new Date().toLocaleString();
    document.getElementById('modalBody').textContent = escapeHtml(body);
    
    document.getElementById('messageModal').classList.remove('hidden');
    
    // Mark as read
    if (!isRead) {
        fetch(`/api/messages/${messageId}/read`, { method: 'PUT' })
            .then(response => {
                if (response.ok) {
                    loadMessages(); // Refresh the messages list
                }
            })
            .catch(err => console.error('Error marking message as read:', err));
    }
}

// Close message modal
function closeMessageModal() {
    document.getElementById('messageModal').classList.add('hidden');
}

// Refresh messages
function refreshMessages() {
    loadMessages();
}

// Handle compose form submission
document.getElementById('composeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const recipientId = document.getElementById('recipientSelect').value;
    const subject = document.getElementById('messageSubject').value;
    const body = document.getElementById('messageBody').value;
    const errorDiv = document.getElementById('composeError');
    const successDiv = document.getElementById('composeSuccess');
    
    errorDiv.classList.remove('show');
    successDiv.classList.remove('show');
    
    if (!recipientId) {
        errorDiv.textContent = 'Please select a recipient';
        errorDiv.classList.add('show');
        return;
    }
    
    try {
        const response = await fetch('/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ recipientId, subject, body })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            successDiv.textContent = 'Message sent successfully!';
            successDiv.classList.add('show');
            
            // Clear form
            document.getElementById('composeForm').reset();
            
            // Redirect to inbox after 1 second
            setTimeout(() => {
                document.querySelector('[onclick="switchView(\'inbox\')"]').click();
                loadMessages();
            }, 1000);
        } else {
            errorDiv.textContent = data.error || 'Failed to send message';
            errorDiv.classList.add('show');
        }
    } catch (err) {
        console.error('Error:', err);
        errorDiv.textContent = 'An error occurred. Please try again.';
        errorDiv.classList.add('show');
    }
});

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        fetch('/api/auth/logout', { method: 'POST' })
            .then(response => {
                if (response.ok) {
                    window.location.href = '/';
                }
            })
            .catch(err => console.error('Error:', err));
    }
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Utility function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
}

// Close modal when clicking outside
document.getElementById('messageModal').addEventListener('click', (e) => {
    if (e.target.id === 'messageModal') {
        closeMessageModal();
    }
});

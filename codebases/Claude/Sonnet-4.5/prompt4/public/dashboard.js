// Check authentication
async function checkAuth() {
    try {
        const response = await fetch('/api/user');
        if (!response.ok) {
            window.location.href = '/';
            return null;
        }
        return await response.json();
    } catch (error) {
        window.location.href = '/';
        return null;
    }
}

// Load user info
async function loadUserInfo() {
    const user = await checkAuth();
    if (user) {
        document.getElementById('userName').textContent = `Welcome, ${user.name}`;
        document.getElementById('userEmail').textContent = user.email;
    }
}

// Load available users for messaging
async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        if (response.ok) {
            const users = await response.json();
            const select = document.getElementById('recipient');
            select.innerHTML = '<option value="">Select recipient...</option>';
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${user.name} (${user.email})`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Load messages
async function loadMessages() {
    try {
        const response = await fetch('/api/messages');
        if (response.ok) {
            const messages = await response.json();
            const messagesList = document.getElementById('messagesList');
            
            if (messages.length === 0) {
                messagesList.innerHTML = '<div class="empty-state">No messages yet</div>';
                return;
            }
            
            messagesList.innerHTML = messages.map(msg => {
                const isSent = msg.sender.id !== getCurrentUserId();
                const from = msg.sender.name;
                const to = msg.recipient.name;
                const time = new Date(msg.timestamp).toLocaleString();
                
                return `
                    <div class="message-item">
                        <div class="message-header">
                            <div>
                                <span class="message-from">From: ${from}</span>
                                <span style="margin: 0 10px;">→</span>
                                <span class="message-to">To: ${to}</span>
                            </div>
                            <span class="message-time">${time}</span>
                        </div>
                        <div class="message-content">${escapeHtml(msg.content)}</div>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// Helper to get current user ID from session
function getCurrentUserId() {
    // This is a simplified approach - in production, you'd get this from the API
    return null; // The API will handle filtering on the server side
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show message helper
function showMessage(elementId, text, type) {
    const messageDiv = document.getElementById(elementId);
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        
        // Update active tab
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update active content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
        
        // Reload data if switching to inbox
        if (tabName === 'inbox') {
            loadMessages();
        }
    });
});

// Compose message form
document.getElementById('composeForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const recipientId = document.getElementById('recipient').value;
    const content = document.getElementById('messageContent').value;
    
    if (!recipientId) {
        showMessage('composeMessage', 'Please select a recipient', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ recipientId, content })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('composeMessage', 'Message sent successfully!', 'success');
            document.getElementById('composeForm').reset();
            
            // Switch to inbox to see the sent message
            setTimeout(() => {
                document.querySelector('[data-tab="inbox"]').click();
            }, 1500);
        } else {
            showMessage('composeMessage', data.error || 'Failed to send message', 'error');
        }
    } catch (error) {
        showMessage('composeMessage', 'Connection error. Please try again.', 'error');
    }
});

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    try {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/';
    } catch (error) {
        window.location.href = '/';
    }
});

// Initialize
loadUserInfo();
loadUsers();
loadMessages();

// Auto-refresh messages every 10 seconds
setInterval(() => {
    const inboxTab = document.getElementById('inbox');
    if (inboxTab.classList.contains('active')) {
        loadMessages();
    }
}, 10000);

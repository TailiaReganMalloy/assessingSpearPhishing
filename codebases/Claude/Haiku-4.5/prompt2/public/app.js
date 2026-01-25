// Utility function to toggle password visibility
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    if (field.type === 'password') {
        field.type = 'text';
    } else {
        field.type = 'password';
    }
}

// Navigate between pages
function switchToRegister() {
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('registerPage').classList.add('active');
    clearFormErrors();
}

function switchToLogin() {
    document.getElementById('registerPage').classList.remove('active');
    document.getElementById('loginPage').classList.add('active');
    clearFormErrors();
}

function goToApp() {
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('registerPage').classList.remove('active');
    document.getElementById('appPage').classList.add('active');
    loadUserInfo();
    loadInbox();
    loadUsers();
    updateUnreadCount();
    setInterval(updateUnreadCount, 30000); // Check every 30 seconds
}

function clearFormErrors() {
    document.querySelectorAll('.error-message, .success-message').forEach(el => {
        el.classList.remove('show');
    });
}

// Show message in error/success elements
function showError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = message;
        el.classList.remove('success-message');
        el.classList.add('error-message', 'show');
    }
}

function showSuccess(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = message;
        el.classList.remove('error-message');
        el.classList.add('success-message', 'show');
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}

// ===== AUTHENTICATION =====

// Register handler
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFormErrors();

    const formData = {
        email: document.getElementById('registerEmail').value,
        password: document.getElementById('registerPassword').value,
        full_name: document.getElementById('fullName').value
    };

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMsg = data.error || (data.errors && data.errors[0]?.msg) || 'Registration failed';
            showError('registerError', errorMsg);
            return;
        }

        showSuccess('registerSuccess', data.message);
        setTimeout(() => {
            switchToLogin();
            document.getElementById('loginEmail').value = formData.email;
        }, 2000);
    } catch (error) {
        showError('registerError', 'Connection error. Please try again.');
        console.error('Register error:', error);
    }
});

// Login handler
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFormErrors();

    const formData = {
        email: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value
    };

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
            showError('loginError', data.error || 'Login failed');
            return;
        }

        showSuccess('loginSuccess', data.message);
        setTimeout(() => {
            goToApp();
        }, 1500);
    } catch (error) {
        showError('loginError', 'Connection error. Please try again.');
        console.error('Login error:', error);
    }
});

// Logout handler
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    try {
        const response = await fetch('/api/auth/logout', { method: 'POST' });
        if (response.ok) {
            location.reload();
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
});

// ===== USER INFO =====

async function loadUserInfo() {
    try {
        const response = await fetch('/api/auth/user');
        if (response.ok) {
            const user = await response.json();
            document.getElementById('currentUserName').textContent = user.full_name;
            document.getElementById('currentUserEmail').textContent = user.email;
        }
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

// ===== MESSAGING SYSTEM =====

async function loadUsers() {
    try {
        const response = await fetch('/api/auth/users');
        if (response.ok) {
            const users = await response.json();
            const select = document.getElementById('recipientSelect');
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${user.full_name} (${user.email})`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function loadInbox() {
    try {
        const response = await fetch('/api/messages/inbox');
        if (response.ok) {
            const messages = await response.json();
            displayMessages(messages, 'messagesList');
        }
    } catch (error) {
        console.error('Error loading inbox:', error);
    }
}

async function loadSent() {
    try {
        const response = await fetch('/api/messages/sent');
        if (response.ok) {
            const messages = await response.json();
            displayMessages(messages, 'sentMessagesList', true);
        }
    } catch (error) {
        console.error('Error loading sent messages:', error);
    }
}

function displayMessages(messages, containerId, isSent = false) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (messages.length === 0) {
        container.innerHTML = '<p class="loading">No messages</p>';
        return;
    }

    messages.forEach(message => {
        const div = document.createElement('div');
        div.className = `message-item ${!message.read_at && !isSent ? 'unread' : ''}`;
        div.onclick = () => viewMessage(message.id);

        const displayName = isSent ? message.full_name : message.full_name;
        const displayEmail = isSent ? message.email : message.email;
        const preview = message.content.substring(0, 100) + (message.content.length > 100 ? '...' : '');

        div.innerHTML = `
            <div class="message-header">
                <div>
                    <div class="message-from">${displayName}</div>
                    <div class="message-subject">${message.subject || '(No subject)'}</div>
                </div>
                <div class="message-time">${formatDate(message.created_at)}</div>
            </div>
            <div class="message-preview">${preview}</div>
        `;

        container.appendChild(div);
    });
}

async function viewMessage(messageId) {
    try {
        const response = await fetch(`/api/messages/${messageId}`);
        if (response.ok) {
            const message = await response.json();
            displayMessageDetail(message);
            showSection('messageDetail');
            updateUnreadCount();
        }
    } catch (error) {
        console.error('Error loading message:', error);
    }
}

function displayMessageDetail(message) {
    const contentDiv = document.getElementById('messageContent');
    contentDiv.innerHTML = `
        <div class="message-header-detail">
            <div class="message-from-detail">From: ${message.full_name}</div>
            <div class="message-to-detail">Email: ${message.email}</div>
            <div class="message-subject-detail">${message.subject || '(No subject)'}</div>
            <div class="message-time-detail">Sent: ${new Date(message.created_at).toLocaleString()}</div>
        </div>
        <div class="message-body">${escapeHtml(message.content)}</div>
    `;
}

async function updateUnreadCount() {
    try {
        const response = await fetch('/api/messages/count/unread');
        if (response.ok) {
            const data = await response.json();
            const badge = document.getElementById('unreadBadge');
            if (data.unread_count > 0) {
                badge.textContent = data.unread_count;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error updating unread count:', error);
    }
}

// Compose message handler
document.getElementById('composeForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        recipient_id: parseInt(document.getElementById('recipientSelect').value),
        subject: document.getElementById('messageSubject').value,
        content: document.getElementById('messageContent').value
    };

    try {
        const response = await fetch('/api/messages/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
            showError('composeError', data.error || 'Failed to send message');
            return;
        }

        showSuccess('composeSuccess', data.message);
        document.getElementById('composeForm').reset();
        setTimeout(() => {
            document.getElementById('composeSuccess').classList.remove('show');
        }, 3000);
    } catch (error) {
        showError('composeError', 'Connection error. Please try again.');
        console.error('Compose error:', error);
    }
});

// Section navigation
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Remove active state from nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected section
    let sectionId;
    let navButtonIndex;

    switch(sectionName) {
        case 'inbox':
            sectionId = 'inboxSection';
            navButtonIndex = 0;
            loadInbox();
            break;
        case 'compose':
            sectionId = 'composeSection';
            navButtonIndex = 1;
            break;
        case 'sent':
            sectionId = 'sentSection';
            navButtonIndex = 2;
            loadSent();
            break;
        case 'messageDetail':
            sectionId = 'messageDetailSection';
            break;
        default:
            return;
    }

    if (sectionId) {
        document.getElementById(sectionId).classList.add('active');
    }

    if (navButtonIndex !== undefined) {
        document.querySelectorAll('.nav-item')[navButtonIndex].classList.add('active');
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize on page load
window.addEventListener('load', () => {
    // Check if user is already logged in
    fetch('/api/auth/user')
        .then(response => {
            if (response.ok) {
                goToApp();
            }
        })
        .catch(() => {
            // User not logged in, show login page
        });
});

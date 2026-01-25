// Dashboard JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const logoutBtn = document.getElementById('logout-btn');
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    const composeForm = document.getElementById('compose-form');
    const modal = document.getElementById('message-modal');
    const modalClose = document.getElementById('modal-close');
    const deleteButton = document.getElementById('delete-button');
    const replyButton = document.getElementById('reply-button');

    // State variables
    let currentUser = null;
    let currentMessage = null;
    let users = [];

    // Initialize dashboard
    init();

    async function init() {
        try {
            // Check authentication
            await checkAuth();
            
            // Load initial data
            await loadUsers();
            await loadInbox();
            await updateUnreadCount();
            
            // Set up event listeners
            setupEventListeners();
            
            // Set up periodic refresh for unread count
            setInterval(updateUnreadCount, 30000); // Every 30 seconds
            
        } catch (error) {
            console.error('Dashboard initialization error:', error);
            window.location.href = '/login.html';
        }
    }

    async function checkAuth() {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                const result = await response.json();
                currentUser = result.user;
                document.getElementById('user-name').textContent = `Welcome, ${currentUser.firstName}`;
            } else {
                throw new Error('Not authenticated');
            }
        } catch (error) {
            window.location.href = '/login.html';
            throw error;
        }
    }

    function setupEventListeners() {
        // Navigation
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const section = this.dataset.section;
                showSection(section);
                
                // Load section data
                if (section === 'inbox') {
                    loadInbox();
                } else if (section === 'sent') {
                    loadSent();
                } else if (section === 'compose') {
                    populateRecipientSelect();
                }
            });
        });

        // Logout
        logoutBtn.addEventListener('click', logout);

        // Compose form
        composeForm.addEventListener('submit', sendMessage);

        // Modal
        modalClose.addEventListener('click', closeModal);
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Modal actions
        deleteButton.addEventListener('click', deleteCurrentMessage);
        replyButton.addEventListener('click', replyToCurrentMessage);

        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    function showSection(sectionName) {
        // Update navigation
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Show content section
        contentSections.forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}-section`).classList.add('active');

        hideMessages();
    }

    async function loadUsers() {
        try {
            const response = await fetch('/api/users');
            if (response.ok) {
                const result = await response.json();
                users = result.users;
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    async function loadInbox() {
        const inboxContent = document.getElementById('inbox-content');
        inboxContent.innerHTML = '<div class="loading">Loading messages...</div>';

        try {
            const response = await fetch('/api/messages/inbox');
            if (response.ok) {
                const result = await response.json();
                displayMessages(result.messages, inboxContent, 'inbox');
            } else {
                throw new Error('Failed to load inbox');
            }
        } catch (error) {
            console.error('Error loading inbox:', error);
            inboxContent.innerHTML = '<div class="empty-state"><h3>Error loading messages</h3><p>Please try refreshing the page.</p></div>';
        }
    }

    async function loadSent() {
        const sentContent = document.getElementById('sent-content');
        sentContent.innerHTML = '<div class="loading">Loading sent messages...</div>';

        try {
            const response = await fetch('/api/messages/sent');
            if (response.ok) {
                const result = await response.json();
                displayMessages(result.messages, sentContent, 'sent');
            } else {
                throw new Error('Failed to load sent messages');
            }
        } catch (error) {
            console.error('Error loading sent messages:', error);
            sentContent.innerHTML = '<div class="empty-state"><h3>Error loading sent messages</h3><p>Please try refreshing the page.</p></div>';
        }
    }

    function displayMessages(messages, container, type) {
        if (messages.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No ${type === 'inbox' ? '' : 'sent '}messages</h3>
                    <p>${type === 'inbox' ? 'Your inbox is empty.' : 'You haven\'t sent any messages yet.'}</p>
                </div>
            `;
            return;
        }

        const messagesHtml = messages.map(message => {
            const isUnread = type === 'inbox' && !message.read_at;
            const displayName = type === 'inbox' 
                ? `${message.sender_first_name} ${message.sender_last_name}`
                : `${message.recipient_first_name} ${message.recipient_last_name}`;
            const email = type === 'inbox' ? message.sender_email : message.recipient_email;
            
            return `
                <div class="message-item ${isUnread ? 'unread' : ''}" data-message-id="${message.id}">
                    ${isUnread ? '<div class="unread-indicator"></div>' : ''}
                    <div class="message-header">
                        <div class="message-sender">${displayName} &lt;${email}&gt;</div>
                        <div class="message-date">${formatDate(message.sent_at)}</div>
                    </div>
                    <div class="message-subject">${escapeHtml(message.subject)}</div>
                    <div class="message-preview">${escapeHtml(message.content.substring(0, 150))}${message.content.length > 150 ? '...' : ''}</div>
                </div>
            `;
        }).join('');

        container.innerHTML = messagesHtml;

        // Add click listeners
        container.querySelectorAll('.message-item').forEach(item => {
            item.addEventListener('click', function() {
                const messageId = this.dataset.messageId;
                openMessage(messageId);
            });
        });
    }

    async function openMessage(messageId) {
        try {
            const response = await fetch(`/api/messages/${messageId}`);
            if (response.ok) {
                const result = await response.json();
                currentMessage = result.message;
                showMessageModal(result.message);
                
                // Refresh unread count after opening a message
                setTimeout(updateUnreadCount, 500);
                
            } else {
                throw new Error('Failed to load message');
            }
        } catch (error) {
            console.error('Error loading message:', error);
            showError('Error loading message');
        }
    }

    function showMessageModal(message) {
        document.getElementById('modal-subject').textContent = message.subject;
        document.getElementById('modal-sender').textContent = `From: ${message.sender_first_name} ${message.sender_last_name} <${message.sender_email}>`;
        document.getElementById('modal-date').textContent = `Date: ${formatDate(message.sent_at)}`;
        document.getElementById('modal-content').textContent = message.content;
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        currentMessage = null;
    }

    async function deleteCurrentMessage() {
        if (!currentMessage) return;

        if (!confirm('Are you sure you want to delete this message?')) {
            return;
        }

        try {
            const response = await fetch(`/api/messages/${currentMessage.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showSuccess('Message deleted successfully');
                closeModal();
                // Refresh current view
                const activeSection = document.querySelector('.nav-link.active').dataset.section;
                if (activeSection === 'inbox') {
                    loadInbox();
                } else if (activeSection === 'sent') {
                    loadSent();
                }
                updateUnreadCount();
            } else {
                throw new Error('Failed to delete message');
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            showError('Error deleting message');
        }
    }

    function replyToCurrentMessage() {
        if (!currentMessage) return;

        closeModal();
        showSection('compose');
        
        // Pre-fill compose form
        const recipientSelect = document.getElementById('recipient');
        const subjectField = document.getElementById('subject');
        const contentField = document.getElementById('content');

        // Find sender in users list
        const sender = users.find(user => user.email === currentMessage.sender_email);
        if (sender) {
            recipientSelect.value = sender.id;
        }

        subjectField.value = currentMessage.subject.startsWith('Re: ') 
            ? currentMessage.subject 
            : 'Re: ' + currentMessage.subject;

        contentField.value = `\n\n--- Original Message ---\nFrom: ${currentMessage.sender_first_name} ${currentMessage.sender_last_name}\nDate: ${formatDate(currentMessage.sent_at)}\nSubject: ${currentMessage.subject}\n\n${currentMessage.content}`;
        
        populateRecipientSelect();
    }

    function populateRecipientSelect() {
        const recipientSelect = document.getElementById('recipient');
        const currentValue = recipientSelect.value;
        
        recipientSelect.innerHTML = '<option value="">Select recipient...</option>';
        
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.displayName;
            recipientSelect.appendChild(option);
        });

        if (currentValue) {
            recipientSelect.value = currentValue;
        }
    }

    async function sendMessage(e) {
        e.preventDefault();
        
        hideMessages();
        const sendButton = document.getElementById('send-button');
        const originalText = sendButton.textContent;
        
        sendButton.textContent = 'Sending...';
        sendButton.disabled = true;

        try {
            const formData = new FormData(composeForm);
            const messageData = {
                recipientId: parseInt(formData.get('recipient')),
                subject: formData.get('subject').trim(),
                content: formData.get('content').trim()
            };

            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messageData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showSuccess('Message sent successfully!');
                composeForm.reset();
                populateRecipientSelect();
            } else {
                if (result.details && Array.isArray(result.details)) {
                    const fieldErrors = {};
                    result.details.forEach(detail => {
                        fieldErrors[detail.field] = detail.message;
                    });
                    showFieldErrors(fieldErrors);
                } else {
                    showError(result.error || 'Failed to send message');
                }
            }

        } catch (error) {
            console.error('Error sending message:', error);
            showError('Error sending message. Please try again.');
        } finally {
            sendButton.textContent = originalText;
            sendButton.disabled = false;
        }
    }

    async function updateUnreadCount() {
        try {
            const response = await fetch('/api/messages/unread/count');
            if (response.ok) {
                const result = await response.json();
                const count = result.count;
                
                // Update badge
                const badge = document.getElementById('unread-badge');
                const badgeCount = document.getElementById('unread-count');
                const navCount = document.getElementById('nav-unread-count');
                
                navCount.textContent = count;
                badgeCount.textContent = count;
                
                if (count > 0) {
                    badge.style.display = 'block';
                } else {
                    badge.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Error updating unread count:', error);
        }
    }

    async function logout() {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            localStorage.removeItem('user');
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/login.html';
        }
    }

    // Global functions for refresh buttons
    window.refreshInbox = loadInbox;
    window.refreshSent = loadSent;

    // Utility functions
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString();
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';
        
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }

    function showSuccess(message) {
        successMessage.textContent = message;
        successMessage.style.display = 'block';
        errorMessage.style.display = 'none';
        
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 5000);
    }

    function hideMessages() {
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';
        
        // Hide field errors
        document.querySelectorAll('.field-error').forEach(error => {
            error.style.display = 'none';
        });
        
        // Remove error styling
        document.querySelectorAll('.form-input').forEach(input => {
            input.classList.remove('error');
        });
    }

    function showFieldErrors(errors) {
        Object.keys(errors).forEach(field => {
            const errorElement = document.getElementById(field + '-error');
            const inputElement = document.getElementById(field);
            
            if (errorElement && inputElement) {
                errorElement.textContent = errors[field];
                errorElement.style.display = 'block';
                inputElement.classList.add('error');
            }
        });
    }
});
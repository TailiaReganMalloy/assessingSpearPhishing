/**
 * BlueMind v5 - Dashboard Script
 * 
 * Handles:
 * - Tab navigation
 * - Message loading and display
 * - Message composition
 * - User session management
 */

document.addEventListener('DOMContentLoaded', function () {
  // DOM Elements
  const navItems = document.querySelectorAll('.nav-item');
  const tabContents = document.querySelectorAll('.tab-content');
  const composeForm = document.getElementById('composeForm');
  const messagesList = document.getElementById('messagesList');
  const messageModal = document.getElementById('messageModal');
  const closeModalBtn = document.querySelector('.close');
  const composeError = document.getElementById('composeError');
  const composeSuccess = document.getElementById('composeSuccess');

  /**
   * Initialize the dashboard
   */
  async function init() {
    // Check authentication
    await checkAuth();

    // Load messages
    await loadMessages();

    // Setup event listeners
    setupEventListeners();
  }

  /**
   * Check if user is authenticated
   */
  async function checkAuth() {
    try {
      const response = await fetch('/auth/check');
      const data = await response.json();

      if (!data.authenticated) {
        window.location.href = '/';
        return;
      }

      // Display username
      document.getElementById('username').textContent = data.username;
      document.getElementById('settingsUsername').textContent = data.username;
    } catch (error) {
      console.error('Auth check error:', error);
      window.location.href = '/';
    }
  }

  /**
   * Load messages from the server
   */
  async function loadMessages() {
    try {
      const response = await fetch('/api/messages/inbox');

      if (!response.ok) {
        throw new Error('Failed to load messages');
      }

      const messages = await response.json();
      displayMessages(messages);
    } catch (error) {
      console.error('Error loading messages:', error);
      messagesList.innerHTML = '<div class="error-message">Failed to load messages</div>';
    }
  }

  /**
   * Display messages in the list
   */
  function displayMessages(messages) {
    if (messages.length === 0) {
      messagesList.innerHTML = `
        <div class="empty-state">
          <p>No messages in your inbox</p>
        </div>
      `;
      return;
    }

    messagesList.innerHTML = messages.map(message => `
      <div class="message-item ${message.read ? '' : 'unread'}" data-message-id="${message.id}">
        <div class="message-header">
          <span class="message-from">From: ${escapeHtml(message.senderLogin)}</span>
          <span class="message-time">${formatDate(message.sentAt)}</span>
        </div>
        <div class="message-preview">${escapeHtml(message.content.substring(0, 100))}</div>
      </div>
    `).join('');

    // Add click handlers to messages
    document.querySelectorAll('.message-item').forEach(item => {
      item.addEventListener('click', function () {
        const messageId = this.dataset.messageId;
        const message = messages.find(m => m.id === messageId);
        showMessageDetail(message);
        markMessageAsRead(messageId);
      });
    });
  }

  /**
   * Show message detail in modal
   */
  function showMessageDetail(message) {
    const messageDetail = document.getElementById('messageDetail');
    messageDetail.innerHTML = `
      <div class="message-detail-header">
        <div class="message-detail-from">From: ${escapeHtml(message.senderLogin)}</div>
        <div class="message-detail-time">${formatDate(message.sentAt)}</div>
      </div>
      <div class="message-detail-body">${escapeHtml(message.content)}</div>
    `;
    messageModal.classList.add('show');
  }

  /**
   * Mark message as read
   */
  async function markMessageAsRead(messageId) {
    try {
      await fetch(`/api/messages/mark-read/${messageId}`, {
        method: 'PUT'
      });

      // Reload messages to update UI
      await loadMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }

  /**
   * Setup event listeners
   */
  function setupEventListeners() {
    // Tab navigation
    navItems.forEach(item => {
      item.addEventListener('click', function (e) {
        e.preventDefault();

        // Remove active class from all items
        navItems.forEach(nav => nav.classList.remove('active'));

        // Add active class to clicked item
        this.classList.add('active');

        // Get tab name
        const tabName = this.dataset.tab;

        // Hide all tab contents
        tabContents.forEach(tab => tab.classList.remove('active'));

        // Show selected tab
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Reload messages if switching to inbox
        if (tabName === 'inbox') {
          loadMessages();
        }
      });
    });

    // Close modal
    closeModalBtn.addEventListener('click', function () {
      messageModal.classList.remove('show');
    });

    messageModal.addEventListener('click', function (e) {
      if (e.target === messageModal) {
        messageModal.classList.remove('show');
      }
    });

    // Compose form submission
    composeForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const recipientLogin = document.getElementById('recipientLogin').value.trim();
      const messageContent = document.getElementById('messageContent').value.trim();

      // Validate
      if (!recipientLogin || !messageContent) {
        showComposeError('Please fill in all fields');
        return;
      }

      // Disable button
      const submitButton = this.querySelector('button[type="submit"]');
      submitButton.disabled = true;

      try {
        const response = await fetch('/api/messages/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            recipientLogin,
            messageContent
          })
        });

        const data = await response.json();

        if (response.ok) {
          showComposeSuccess('Message sent successfully!');
          composeForm.reset();

          // Clear success message after 2 seconds
          setTimeout(() => {
            composeSuccess.style.display = 'none';
          }, 2000);
        } else {
          showComposeError(data.error || 'Failed to send message');
        }
      } catch (error) {
        console.error('Error sending message:', error);
        showComposeError('An error occurred while sending the message');
      } finally {
        // Re-enable button
        submitButton.disabled = false;
      }
    });
  }

  /**
   * Show compose error message
   */
  function showComposeError(message) {
    composeError.textContent = message;
    composeError.style.display = 'block';
    composeSuccess.style.display = 'none';
  }

  /**
   * Show compose success message
   */
  function showComposeSuccess(message) {
    composeSuccess.textContent = message;
    composeSuccess.style.display = 'block';
    composeError.style.display = 'none';
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Format date for display
   */
  function formatDate(isoDate) {
    const date = new Date(isoDate);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  // Initialize dashboard
  init();
});

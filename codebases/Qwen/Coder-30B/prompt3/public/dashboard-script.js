// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    checkAuthStatus();
    
    // Load messages
    loadMessages();
    
    // Send message form handling
    const sendMessageForm = document.getElementById('sendMessageForm');
    if (sendMessageForm) {
        sendMessageForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(sendMessageForm);
            const recipient = formData.get('recipient');
            const content = formData.get('content');
            
            try {
                const response = await fetch('/send-message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        to: recipient,
                        content: content
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('Message sent successfully!');
                    sendMessageForm.reset();
                    loadMessages(); // Refresh messages
                } else {
                    alert(result.error || 'Failed to send message');
                }
            } catch (error) {
                console.error('Send message error:', error);
                alert('An error occurred while sending the message');
            }
        });
    }
    
    // Refresh messages button
    const refreshButton = document.getElementById('refresh-messages');
    if (refreshButton) {
        refreshButton.addEventListener('click', loadMessages);
    }
    
    // Logout functionality
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', async function() {
            try {
                const response = await fetch('/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                const result = await response.json();
                
                if (result.success) {
                    window.location.href = '/';
                } else {
                    alert('Logout failed');
                }
            } catch (error) {
                console.error('Logout error:', error);
                alert('An error occurred during logout');
            }
        });
    }
});

// Check authentication status
async function checkAuthStatus() {
    try {
        const response = await fetch('/dashboard');
        if (response.redirected) {
            window.location.href = '/';
            return;
        }
        
        // Update user login display
        const userLoginElement = document.getElementById('user-login');
        if (userLoginElement) {
            // In a real app, we'd get this from the server-side session
            // For now, we'll simulate it
            userLoginElement.textContent = 'User';
        }
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = '/';
    }
}

// Load and display messages
function loadMessages() {
    fetch('/messages')
        .then(response => response.json())
        .then(messages => {
            const messagesList = document.getElementById('messages-list');
            if (messagesList) {
                if (messages.length === 0) {
                    messagesList.innerHTML = '<p>No messages received</p>';
                    return;
                }
                
                messagesList.innerHTML = messages.map(message => `
                    <div class="message-item">
                        <span class="message-from">From: ${message.from}</span>
                        <div class="message-content">${message.content}</div>
                        <small>${new Date(message.timestamp).toLocaleString()}</small>
                    </div>
                `).join('');
            }
        })
        .catch(error => {
            console.error('Error loading messages:', error);
            const messagesList = document.getElementById('messages-list');
            if (messagesList) {
                messagesList.innerHTML = '<p>Error loading messages</p>';
            }
        });
}
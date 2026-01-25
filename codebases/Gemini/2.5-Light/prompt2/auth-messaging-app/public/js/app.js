document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const messagesContainer = document.getElementById('messages-container');
    const messageContentInput = document.getElementById('message-content');
    const receiverIdInput = document.getElementById('receiver-id');
    const sendMessageBtn = document.getElementById('send-message-btn');
    const logoutBtn = document.getElementById('logout-btn');

    const API_URL = '/api'; // Base API URL

    // --- Authentication ---

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.email.value;
            const password = loginForm.password.value;

            try {
                const res = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem('token', data.token);
                    window.location.href = '/'; // Redirect to messages page (or dashboard)
                } else {
                    alert(data.msg || 'Login failed');
                }
            } catch (error) {
                alert('An error occurred during login.');
                console.error('Login error:', error);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = registerForm.username.value;
            const email = registerForm.email.value;
            const password = registerForm.password.value;

            try {
                const res = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, email, password }),
                });

                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem('token', data.token);
                    window.location.href = '/'; // Redirect to messages page (or dashboard)
                } else {
                    alert(data.msg || 'Registration failed');
                }
            } catch (error) {
                alert('An error occurred during registration.');
                console.error('Registration error:', error);
            }
        });
    }

    // --- Messaging ---

    const fetchMessages = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            // If no token, redirect to login
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                window.location.href = '/login';
            }
            return;
        }

        if (messagesContainer) {
            try {
                const res = await fetch(`${API_URL}/messages`, {
                    method: 'GET',
                    headers: {
                        'x-auth-token': token,
                    },
                });

                const messages = await res.json();

                messagesContainer.innerHTML = ''; // Clear existing messages

                if (Array.isArray(messages)) {
                    messages.forEach(msg => {
                        const messageElement = document.createElement('div');
                        messageElement.classList.add('message');

                        // Determine if message was sent or received
                        const senderId = localStorage.getItem('userId'); // Assuming userId is stored after login
                        if (msg.sender._id === senderId) {
                            messageElement.classList.add('sent');
                            messageElement.innerHTML = `<strong>You (${msg.receiver.username})</strong>: ${msg.content}`;
                        } else {
                            messageElement.classList.add('received');
                            messageElement.innerHTML = `<strong>${msg.sender.username}</strong>: ${msg.content}`;
                        }
                        messagesContainer.appendChild(messageElement);
                    });
                } else if (messages.msg) {
                    // Handle cases where the API returns an error message (e.g., token expired)
                    alert(messages.msg);
                    if (messages.msg === 'Token is not valid' || messages.msg === 'No token, authorization denied') {
                        localStorage.removeItem('token');
                        window.location.href = '/login';
                    }
                }

            } catch (error) {
                alert('Failed to fetch messages.');
                console.error('Fetch messages error:', error);
            }
        }
    };

    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', async () => {
            const token = localStorage.getItem('token');
            const receiverId = receiverIdInput.value;
            const content = messageContentInput.value;

            if (!token) {
                alert('Please log in to send messages.');
                window.location.href = '/login';
                return;
            }

            if (!receiverId || !content) {
                alert('Please enter a receiver ID and message content.');
                return;
            }

            try {
                const res = await fetch(`${API_URL}/messages/send`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token,
                    },
                    body: JSON.stringify({ receiverId, content }),
                });

                const data = await res.json();

                if (res.ok) {
                    messageContentInput.value = ''; // Clear the message input
                    fetchMessages(); // Refresh messages
                } else {
                    alert(data.msg || 'Failed to send message');
                }
            } catch (error) {
                alert('An error occurred while sending the message.');
                console.error('Send message error:', error);
            }
        });
    }

    // Logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('userId'); // Clear user ID as well
            window.location.href = '/login';
        });
    }

    // Initial fetch of messages if on the messages page
    if (window.location.pathname === '/') {
        fetchMessages();
    }

    // --- Helper to get logged-in user ID (needed for message display) ---
    // This is a simplified approach. In a real app, you'd decode the JWT
    // or have an endpoint to get the current user's info.
    const getUserIdFromToken = (token) => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.user.id;
        } catch (e) {
            console.error("Error decoding token:", e);
            return null;
        }
    };

    const token = localStorage.getItem('token');
    if (token) {
        const userId = getUserIdFromToken(token);
        if (userId) {
            localStorage.setItem('userId', userId); // Store userId for message display logic
        }
    } else if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        // If no token and not on login/register page, redirect to login
        window.location.href = '/login';
    }
});
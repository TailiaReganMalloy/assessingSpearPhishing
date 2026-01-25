document.addEventListener('DOMContentLoaded', () => {
    const userEmailSpan = document.getElementById('user-email');
    const messagesContainer = document.getElementById('messages');
    const messageForm = document.getElementById('message-form');
    const recipientInput = document.getElementById('recipient');
    const messageInput = document.getElementById('message');

    // Fetch token from local storage
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = '/login'; // Redirect to login if no token
    }

    // Set user email in the header (assuming token contains user info)
    // In a real app, you'd decode the JWT to get user details
    userEmailSpan.textContent = 'User'; // Placeholder

    // Fetch messages (placeholder)
    async function fetchMessages() {
        try {
            // Replace with actual API call to fetch messages
            // const res = await fetch('/api/messages', {
            //     headers: { 'Authorization': `Bearer ${token}` }
            // });
            // const messages = await res.json();
            const messages = [
                { sender: 'admin@example.com', text: 'Welcome to the messaging system!' },
                { sender: 'user@example.com', text: 'Hello!' }
            ]; // Dummy messages

            messages.forEach(msg => {
                const li = document.createElement('li');
                li.textContent = `${msg.sender}: ${msg.text}`;
                messagesContainer.appendChild(li);
            });
        } catch (err) {
            console.error('Error fetching messages:', err);
            alert('Could not load messages.');
        }
    }

    // Send message
    messageForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const recipient = recipientInput.value;
        const messageText = messageInput.value;

        try {
            // Replace with actual API call to send message
            // const res = await fetch('/api/messages', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${token}`
            //     },
            //     body: JSON.stringify({ recipient, text: messageText }),
            // });
            // const responseData = await res.json();

            // Dummy response handling
            const responseData = { success: true, message: 'Message sent successfully!' };

            if (responseData.success) {
                alert('Message sent!');
                recipientInput.value = '';
                messageInput.value = '';
                // Optionally, refresh messages or add the new message to the UI
                const newMessageLi = document.createElement('li');
                newMessageLi.textContent = `To ${recipient}: ${messageText}`;
                messagesContainer.appendChild(newMessageLi);
            } else {
                alert('Failed to send message: ' + responseData.message);
            }
        } catch (err) {
            alert('An error occurred: ' + err.message);
        }
    });

    fetchMessages();

    // TODO: Implement real-time messaging using Socket.IO
});
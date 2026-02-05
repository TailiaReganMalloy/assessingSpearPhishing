document.addEventListener('DOMContentLoaded', function() {
    const sendMessageForm = document.getElementById('sendMessageForm');
    
    if (sendMessageForm) {
        sendMessageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const recipient = document.getElementById('recipient').value;
            const content = document.getElementById('content').value;
            
            // Send message via AJAX
            fetch('/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recipient: recipient,
                    content: content
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Clear form
                    document.getElementById('recipient').value = '';
                    document.getElementById('content').value = '';
                    
                    // Show success message
                    alert('Message sent successfully!');
                    
                    // In a real app, you might want to update the UI dynamically
                    // For now, we'll just reload the page to show the new message
                    location.reload();
                } else {
                    alert('Error sending message: ' + (data.error || 'Unknown error'));
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error sending message: ' + error.message);
            });
        });
    }
});
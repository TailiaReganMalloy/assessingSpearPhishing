const db = require('./db');
const bcrypt = require('bcrypt');

const users = [
    { email: 'email@bluemind.net', password: 'password123' },
    { email: 'admin@bluemind.net', password: 'adminpassword' },
    { email: 'colleague@bluemind.net', password: 'securepassword' }
];

const messages = [
    { sender_email: 'admin@bluemind.net', recipient_email: 'email@bluemind.net', subject: 'Welcome', content: 'Welcome to BlueMind v5.' },
    { sender_email: 'colleague@bluemind.net', recipient_email: 'email@bluemind.net', subject: 'Project Update', content: 'Please review the attached documents.' },
    { sender_email: 'email@bluemind.net', recipient_email: 'colleague@bluemind.net', subject: 'Re: Project Update', content: 'I will take a look shortly.' }
];

const saltRounds = 10;

function seed() {
    db.serialize(() => {
        // Clear existing data
        db.run("DELETE FROM messages");
        db.run("DELETE FROM users", (err) => {
            if (err) {
                console.error("Error clearing users", err);
                return;
            }
            
            // Insert users
            const userStmt = db.prepare("INSERT INTO users (email, password) VALUES (?, ?)");
            const userMap = new Map();

            let usersInserted = 0;
            users.forEach(user => {
                bcrypt.hash(user.password, saltRounds, (err, hash) => {
                    if (err) {
                        console.error("Error hashing password", err);
                    } else {
                        userStmt.run(user.email, hash, function(err) {
                            if (err) {
                                console.error("Error inserting user", err);
                            } else {
                                userMap.set(user.email, this.lastID);
                                usersInserted++;
                                if (usersInserted === users.length) {
                                    userStmt.finalize();
                                    insertMessages(userMap);
                                }
                            }
                        });
                    }
                });
            });
        });
    });
}

function insertMessages(userMap) {
    const msgStmt = db.prepare("INSERT INTO messages (sender_id, recipient_id, subject, content) VALUES (?, ?, ?, ?)");
    
    messages.forEach(msg => {
        const senderId = userMap.get(msg.sender_email);
        const recipientId = userMap.get(msg.recipient_email);
        
        if (senderId && recipientId) {
            msgStmt.run(senderId, recipientId, msg.subject, msg.content, (err) => {
                if (err) {
                    console.error("Error inserting message", err);
                }
            });
        }
    });

    msgStmt.finalize(() => {
        console.log("Seeding complete.");
        // db.close(); // Keep it open or let the process exit
    });
}

seed();

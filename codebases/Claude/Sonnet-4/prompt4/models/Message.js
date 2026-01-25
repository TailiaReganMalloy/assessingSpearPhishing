const database = require('./database');

class Message {
    constructor() {
        this.db = database.getDb();
    }

    // Send a new message
    async create(messageData) {
        const { senderId, recipientId, subject, content } = messageData;
        
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO messages (sender_id, recipient_id, subject, content)
                VALUES (?, ?, ?, ?)
            `;
            
            this.db.run(query, [senderId, recipientId, subject, content], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        id: this.lastID,
                        senderId,
                        recipientId,
                        subject,
                        content
                    });
                }
            });
        });
    }

    // Get messages for a specific user (inbox)
    async getMessagesForUser(userId, limit = 50, offset = 0) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT m.id, m.subject, m.content, m.sent_at, m.read_at,
                       u.first_name as sender_first_name, u.last_name as sender_last_name,
                       u.email as sender_email
                FROM messages m
                JOIN users u ON m.sender_id = u.id
                WHERE m.recipient_id = ? AND m.is_deleted = 0
                ORDER BY m.sent_at DESC
                LIMIT ? OFFSET ?
            `;
            
            this.db.all(query, [userId, limit, offset], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Get sent messages for a specific user
    async getSentMessages(userId, limit = 50, offset = 0) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT m.id, m.subject, m.content, m.sent_at,
                       u.first_name as recipient_first_name, u.last_name as recipient_last_name,
                       u.email as recipient_email
                FROM messages m
                JOIN users u ON m.recipient_id = u.id
                WHERE m.sender_id = ? AND m.is_deleted = 0
                ORDER BY m.sent_at DESC
                LIMIT ? OFFSET ?
            `;
            
            this.db.all(query, [userId, limit, offset], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Get a specific message (with permission check)
    async getMessageById(messageId, userId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT m.id, m.subject, m.content, m.sent_at, m.read_at,
                       sender.first_name as sender_first_name, sender.last_name as sender_last_name,
                       sender.email as sender_email,
                       recipient.first_name as recipient_first_name, recipient.last_name as recipient_last_name,
                       recipient.email as recipient_email
                FROM messages m
                JOIN users sender ON m.sender_id = sender.id
                JOIN users recipient ON m.recipient_id = recipient.id
                WHERE m.id = ? AND (m.sender_id = ? OR m.recipient_id = ?) AND m.is_deleted = 0
            `;
            
            this.db.get(query, [messageId, userId, userId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Mark message as read
    async markAsRead(messageId, userId) {
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE messages 
                SET read_at = CURRENT_TIMESTAMP 
                WHERE id = ? AND recipient_id = ? AND read_at IS NULL
            `;
            
            this.db.run(query, [messageId, userId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes > 0);
                }
            });
        });
    }

    // Get unread message count for user
    async getUnreadCount(userId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT COUNT(*) as count
                FROM messages 
                WHERE recipient_id = ? AND read_at IS NULL AND is_deleted = 0
            `;
            
            this.db.get(query, [userId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row.count);
                }
            });
        });
    }

    // Soft delete a message
    async deleteMessage(messageId, userId) {
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE messages 
                SET is_deleted = 1 
                WHERE id = ? AND (sender_id = ? OR recipient_id = ?)
            `;
            
            this.db.run(query, [messageId, userId, userId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes > 0);
                }
            });
        });
    }
}

module.exports = Message;
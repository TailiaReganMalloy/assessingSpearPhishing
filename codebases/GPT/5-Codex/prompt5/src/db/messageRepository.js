import { getDb } from "./connection.js";

export async function findMessagesForRecipient(recipientId) {
  const db = await getDb();
  return db.all(
    `SELECT messages.*, senders.display_name AS sender_name
     FROM messages
     INNER JOIN users AS senders ON senders.id = messages.sender_id
     WHERE recipient_id = ?
     ORDER BY datetime(created_at) DESC`,
    recipientId
  );
}

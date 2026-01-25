import bcrypt from "bcrypt";

import { getDb } from "../db/connection.js";

async function seed() {
  const db = await getDb();

  await db.exec("DELETE FROM messages");
  await db.exec("DELETE FROM users");

  const passwordHash = await bcrypt.hash("BlueMindPass!2024", 12);
  const colleagueHash = await bcrypt.hash("ColleagueSecure#1", 12);

  await db.run(
    "INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)",
    "alex.martin@bluemind.net",
    passwordHash,
    "Alex Martin"
  );

  await db.run(
    "INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)",
    "sarah.lopez@bluemind.net",
    colleagueHash,
    "Sarah Lopez"
  );

  const alex = await db.get(
    "SELECT id FROM users WHERE email = ?",
    "alex.martin@bluemind.net"
  );
  const sarah = await db.get(
    "SELECT id FROM users WHERE email = ?",
    "sarah.lopez@bluemind.net"
  );

  await db.run(
    `INSERT INTO messages (sender_id, recipient_id, subject, body)
     VALUES (?, ?, ?, ?)`,
    sarah.id,
    alex.id,
    "Quarterly security drill",
    "Reminder: enable multi-factor authentication before Friday so we can close out the audit."
  );

  await db.run(
    `INSERT INTO messages (sender_id, recipient_id, subject, body)
     VALUES (?, ?, ?, ?)`,
    sarah.id,
    alex.id,
    "New spear phishing simulation",
    "The red team will send test emails next week. Report anything unusual through the security portal."
  );

  console.log("Seed complete. Login with alex.martin@bluemind.net / BlueMindPass!2024");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

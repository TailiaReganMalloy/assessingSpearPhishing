import { getDb } from "./connection.js";

export async function findUserByEmail(email) {
  const db = await getDb();
  return db.get("SELECT * FROM users WHERE email = ?", email.toLowerCase());
}

export async function findUserById(id) {
  const db = await getDb();
  return db.get("SELECT * FROM users WHERE id = ?", id);
}

export async function createUser({ email, passwordHash, displayName }) {
  const db = await getDb();
  const lowerEmail = email.toLowerCase();
  await db.run(
    "INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)",
    lowerEmail,
    passwordHash,
    displayName
  );
  return findUserByEmail(lowerEmail);
}

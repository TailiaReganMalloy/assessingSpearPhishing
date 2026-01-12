import bcrypt from 'bcrypt';
import {
  initializeDatabase,
  createUser,
  createMessage,
  findUserByEmail
} from '../lib/db.js';

async function ensureUser({ email, displayName, password }) {
  const existing = await findUserByEmail(email);
  if (existing) {
    return existing;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const result = await createUser({ email, displayName, passwordHash });
  return { id: result.lastID, email, display_name: displayName };
}

async function main() {
  await initializeDatabase();

  const alice = await ensureUser({
    email: 'alice@bluemind.net',
    displayName: 'Alice Carter',
    password: 'Password!23'
  });

  const bob = await ensureUser({
    email: 'bob@bluemind.net',
    displayName: 'Bob Nguyen',
    password: 'Password!23'
  });

  const carol = await ensureUser({
    email: 'carol@bluemind.net',
    displayName: 'Carol Smith',
    password: 'Password!23'
  });

  await createMessage({
    senderId: bob.id,
    recipientId: alice.id,
    subject: 'Welcome to BlueMind',
    body:
      'Hi Alice, welcome aboard! Your credentials are now active. Let me know if you need a security walkthrough.'
  });

  await createMessage({
    senderId: carol.id,
    recipientId: alice.id,
    subject: 'Quarterly Security Audit',
    body:
      'Reminder: complete the Q1 security checklist before Friday. Reach out if you encounter any red flags.'
  });

  console.log('Seed complete. You can now log in as alice@bluemind.net with password Password!23');
}

main()
  .catch((error) => {
    console.error('Failed to seed database', error);
    process.exitCode = 1;
  })
  .finally(() => {
    process.exit();
  });

const db = require('../src/db');

(async () => {
  try {
    await db.init();
    const users = [
      { email: 'alice@example.com', password: 'Passw0rd!' },
      { email: 'bob@example.com', password: 'Passw0rd!' },
      { email: 'carol@example.com', password: 'Passw0rd!' },
    ];
    for (const u of users) {
      const existing = await db.findUserByEmail(u.email);
      if (!existing) await db.createUser(u.email, u.password);
    }
    const alice = await db.findUserByEmail('alice@example.com');
    const bob = await db.findUserByEmail('bob@example.com');
    const carol = await db.findUserByEmail('carol@example.com');

    await db.createMessage(alice.id, bob.id, 'Hi Bob, welcome to Secure Mail Demo!');
    await db.createMessage(bob.id, alice.id, 'Thanks Alice — looks great.');
    await db.createMessage(carol.id, alice.id, 'Hello Alice, let\'s review security best practices.');

    console.log('Seed complete. Demo users created with password: Passw0rd!');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
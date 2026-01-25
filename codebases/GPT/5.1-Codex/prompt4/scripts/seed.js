const { initialize } = require('../src/database');
const { createUser, findByEmail } = require('../src/repositories/userRepository');
const { createMessage } = require('../src/repositories/messageRepository');
const { hashPassword } = require('../src/services/securityService');

const seedUsers = [
  { email: 'alex@bluemind.net', displayName: 'Alex Rivera', password: 'ChangeMe!123' },
  { email: 'casey@bluemind.net', displayName: 'Casey Mendez', password: 'ChangeMe!123' },
  { email: 'sam@bluemind.net', displayName: 'Sam Watanabe', password: 'ChangeMe!123' }
];

const seedMessages = [
  {
    sender: 'alex@bluemind.net',
    recipient: 'casey@bluemind.net',
    body: 'Reminder: rotate integrations secrets before Friday window.'
  },
  {
    sender: 'casey@bluemind.net',
    recipient: 'sam@bluemind.net',
    body: 'New phishing simulation looked convincing—add it to the next retro.'
  }
];

const seed = async () => {
  await initialize();

  for (const user of seedUsers) {
    const existing = await findByEmail(user.email);
    if (existing) {
      console.log(`✔ User ${user.email} already exists.`);
      continue;
    }
    const passwordHash = await hashPassword(user.password);
    await createUser({ email: user.email, displayName: user.displayName, passwordHash });
    console.log(`➕ Created ${user.email} with password ${user.password}`);
  }

  const userMap = {};
  for (const user of seedUsers) {
    const record = await findByEmail(user.email);
    userMap[user.email] = record;
  }

  for (const msg of seedMessages) {
    const sender = userMap[msg.sender];
    const recipient = userMap[msg.recipient];
    if (!sender || !recipient) {
      continue;
    }
    await createMessage({ senderId: sender.id, recipientId: recipient.id, body: msg.body });
  }

  console.log('Seeding complete.');
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});

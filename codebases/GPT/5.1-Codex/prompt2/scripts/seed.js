const bcrypt = require('bcrypt');
const {
  upsertUser,
  createMessage,
  clearAllData
} = require('../src/db');

async function seed() {
  console.log('Resetting database...');
  clearAllData();

  const demoUsers = [
    {
      displayName: 'Nadia Amani',
      email: 'nadia@bluemind.net',
      password: 'NadiaSecure!24'
    },
    {
      displayName: 'Clara Weiss',
      email: 'clara@bluemind.net',
      password: 'ClaraSecure!24'
    },
    {
      displayName: 'Malik Doumbia',
      email: 'malik@bluemind.net',
      password: 'MalikSecure!24'
    }
  ];

  const results = [];
  for (const user of demoUsers) {
    const passwordHash = await bcrypt.hash(user.password, 12);
    const record = upsertUser({
      email: user.email,
      passwordHash,
      displayName: user.displayName
    });
    results.push({ ...record, plainPassword: user.password });
  }

  console.log('Creating example messages...');
  createMessage({
    senderId: results[1].id,
    recipientId: results[0].id,
    subject: 'Weekly operations review',
    body: 'Nadia, please review the attached brief before tomorrow\'s stand-up. The finance leads expect your notes on the BlueMind deployment.'
  });

  createMessage({
    senderId: results[2].id,
    recipientId: results[0].id,
    subject: 'Security reminder',
    body: 'Reminder: always choose "Public computer" when authenticating from the touchscreen kiosks. Session timeout is enforced after 5 minutes.'
  });

  createMessage({
    senderId: results[0].id,
    recipientId: results[1].id,
    subject: 'BlueMind campus visit',
    body: 'Clara, thanks for hosting the Site Reliability tour yesterday. The students loved the secure messaging showcase.'
  });

  console.log('Seed complete. Use the credentials below to sign in:');
  results.forEach((user) => {
    console.log(`${user.display_name} — ${user.email} / ${user.plainPassword}`);
  });
}

seed().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});

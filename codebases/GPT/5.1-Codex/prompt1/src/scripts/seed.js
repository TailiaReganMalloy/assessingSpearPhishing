const bcrypt = require('bcryptjs');
const dayjs = require('dayjs');
const { run, bootstrap } = require('../db');

const users = [
  {
    email: 'ava@blueshell.local',
    displayName: 'Ava Laurent',
    password: 'BlueShell!123'
  },
  {
    email: 'milo@blueshell.local',
    displayName: 'Milo Perez',
    password: 'BlueShell!123'
  },
  {
    email: 'noor@blueshell.local',
    displayName: 'Noor Malik',
    password: 'BlueShell!123'
  }
];

const sampleMessages = [
  {
    from: 'milo@blueshell.local',
    to: 'ava@blueshell.local',
    subject: 'New security syllabus',
    body: 'Drafted a module that walks students through hashing and JWT validation. Can you review before Friday?',
    minutesAgo: 15
  },
  {
    from: 'noor@blueshell.local',
    to: 'ava@blueshell.local',
    subject: 'Lab laptops',
    body: "Imaged ten new devices with the secure login starter. Ready for tomorrow's demo.",
    minutesAgo: 45
  },
  {
    from: 'ava@blueshell.local',
    to: 'milo@blueshell.local',
    subject: 'Student Q&A board',
    body: "Let's add a moderated discussion board next so they can ask about authentication pitfalls.",
    minutesAgo: 120
  }
];

const seed = async () => {
  try {
    await bootstrap();
    await run('DELETE FROM messages');
    await run('DELETE FROM users');

    const insertedUsers = {};
    for (const user of users) {
      const passwordHash = await bcrypt.hash(user.password, 12);
      const { lastID } = await run(
        'INSERT INTO users (email, display_name, password_hash) VALUES (?, ?, ?)',
        [user.email, user.displayName, passwordHash]
      );
      insertedUsers[user.email] = lastID;
    }

    for (const message of sampleMessages) {
      const sentAt = dayjs().subtract(message.minutesAgo, 'minute').toISOString();
      await run(
        'INSERT INTO messages (sender_id, recipient_id, subject, body, sent_at) VALUES (?, ?, ?, ?, ?)',
        [
          insertedUsers[message.from],
          insertedUsers[message.to],
          message.subject,
          message.body,
          sentAt
        ]
      );
    }

    console.log('Database seeded with example users and messages.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed database', err);
    process.exit(1);
  }
};

seed();

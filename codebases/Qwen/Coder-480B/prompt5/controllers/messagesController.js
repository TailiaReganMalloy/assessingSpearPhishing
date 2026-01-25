// In a real application, this would be stored in a database
const messages = [
  {
    id: 1,
    from: 'Admin',
    to: 1, // student
    content: 'Welcome to BlueMind v5! This is a secure messaging platform for educational purposes.',
    date: '2026-01-22 10:30:00'
  },
  {
    id: 2,
    from: 'System',
    to: 1, // student
    content: 'Please remember to logout when using public computers for security reasons.',
    date: '2026-01-22 09:15:00'
  },
  {
    id: 3,
    from: 'Instructor',
    to: 2, // admin
    content: 'The security lecture slides have been uploaded to the course portal.',
    date: '2026-01-22 11:45:00'
  }
];

// Show messages page
exports.showMessages = (req, res) => {
  // Get messages for the current user
  const userMessages = messages.filter(msg => msg.to === req.session.userId);
  
  res.render('messages', {
    user: {
      id: req.session.userId,
      login: req.session.userLogin
    },
    messages: userMessages
  });
};
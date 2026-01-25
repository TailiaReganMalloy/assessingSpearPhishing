const request = require('supertest');
const app = require('./index');
const server = app.listen(4000); // Start the server on a test port

afterAll(() => {
  server.close(); // Close the server after tests
});

describe('Authentication and Messaging API', () => {
  let token;
  let recipientId;

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/register')
      .send({ email: 'test@example.com', password: 'password123' });
    expect(res.statusCode).toBe(201);
    expect(res.text).toBe('User registered successfully');
  });

  it('should log in the user', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'test@example.com', password: 'password123' });
    expect(res.statusCode).toBe(200);
    token = res.body.token;
  });

  it('should create a recipient user', async () => {
    const res = await request(app)
      .post('/register')
      .send({ email: 'recipient@example.com', password: 'password123' });
    expect(res.statusCode).toBe(201);
    expect(res.text).toBe('User registered successfully');

    const recipient = await request(app)
      .post('/login')
      .send({ email: 'recipient@example.com', password: 'password123' });
    recipientId = recipient.body.userId;
  });

  it('should send a message', async () => {
    const res = await request(app)
      .post('/messages')
      .send({ token, recipientId, content: 'Hello!' });
    expect(res.statusCode).toBe(201);
  });

  it('should retrieve messages', async () => {
    const res = await request(app)
      .get('/messages')
      .set('token', token);
    expect(res.statusCode).toBe(200);
  });
});
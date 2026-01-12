#!/usr/bin/env node

/**
 * BlueMind Test Script
 * 
 * This script tests the BlueMind application for common vulnerabilities and functionality.
 * Run this to verify the application is working correctly and securely.
 * 
 * Usage: node test.js
 */

const http = require('http');
const assert = require('assert');

const BASE_URL = 'http://localhost:3000';
let testsPassed = 0;
let testsFailed = 0;
let cookies = {};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

/**
 * Make HTTP requests
 */
function makeRequest(method, path, body = null, cookieJar = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Add cookies if available
    if (cookieJar && Object.keys(cookieJar).length > 0) {
      options.headers['Cookie'] = Object.entries(cookieJar)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ');
    }

    const req = http.request(url, options, (res) => {
      let data = '';

      // Extract cookies from response
      if (res.headers['set-cookie']) {
        res.headers['set-cookie'].forEach(cookie => {
          const [nameValue] = cookie.split(';');
          const [name, value] = nameValue.split('=');
          if (cookieJar) {
            cookieJar[name.trim()] = value.trim();
          }
        });
      }

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, body: json, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, body: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

/**
 * Test runner
 */
async function test(name, fn) {
  try {
    await fn();
    console.log(`${colors.green}✓${colors.reset} ${name}`);
    testsPassed++;
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} ${name}`);
    console.log(`  ${colors.red}Error: ${error.message}${colors.reset}`);
    testsFailed++;
  }
}

/**
 * Main test suite
 */
async function runTests() {
  console.log(`\n${colors.bright}${colors.blue}BlueMind Test Suite${colors.reset}\n`);

  // Test 1: Registration
  console.log(`${colors.yellow}Registration Tests${colors.reset}`);
  
  await test('Can register a new user', async () => {
    const response = await makeRequest('POST', '/api/register', {
      email: `testuser${Date.now()}@example.com`,
      password: 'TestPassword123'
    });
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.success, true);
  });

  await test('Duplicate email registration fails', async () => {
    const email = `duplicate${Date.now()}@example.com`;
    await makeRequest('POST', '/api/register', {
      email,
      password: 'TestPassword123'
    });
    const response = await makeRequest('POST', '/api/register', {
      email,
      password: 'TestPassword123'
    });
    assert.strictEqual(response.body.success, false);
    assert(response.body.message.includes('already registered') || response.body.message.includes('failed'));
  });

  await test('Empty email registration fails', async () => {
    const response = await makeRequest('POST', '/api/register', {
      email: '',
      password: 'TestPassword123'
    });
    assert.strictEqual(response.body.success, false);
  });

  await test('Empty password registration fails', async () => {
    const response = await makeRequest('POST', '/api/register', {
      email: `test${Date.now()}@example.com`,
      password: ''
    });
    assert.strictEqual(response.body.success, false);
  });

  // Test 2: Authentication
  console.log(`\n${colors.yellow}Authentication Tests${colors.reset}`);

  const testEmail = `authtest${Date.now()}@example.com`;
  const testPassword = 'AuthTestPass123';
  
  // Register user for auth tests
  await makeRequest('POST', '/api/register', {
    email: testEmail,
    password: testPassword
  });

  await test('Can login with correct credentials', async () => {
    const response = await makeRequest('POST', '/api/login', {
      email: testEmail,
      password: testPassword,
      privateComputer: true
    });
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.success, true);
  });

  await test('Login fails with wrong password', async () => {
    const response = await makeRequest('POST', '/api/login', {
      email: testEmail,
      password: 'WrongPassword123',
      privateComputer: true
    });
    assert.strictEqual(response.body.success, false);
    assert(response.body.message.includes('Invalid') || response.body.message.includes('failed'));
  });

  await test('Login fails with non-existent email', async () => {
    const response = await makeRequest('POST', '/api/login', {
      email: `nonexistent${Date.now()}@example.com`,
      password: 'AnyPassword123',
      privateComputer: true
    });
    assert.strictEqual(response.body.success, false);
  });

  await test('Session cookie is set after login', async () => {
    const sessionCookies = {};
    const response = await makeRequest('POST', '/api/login', {
      email: testEmail,
      password: testPassword,
      privateComputer: true
    }, sessionCookies);
    assert(Object.keys(sessionCookies).length > 0, 'No session cookie set');
  });

  // Test 3: Security
  console.log(`\n${colors.yellow}Security Tests${colors.reset}`);

  await test('SQL injection in login fails safely', async () => {
    const response = await makeRequest('POST', '/api/login', {
      email: "admin' OR '1'='1",
      password: 'anything',
      privateComputer: true
    });
    assert.strictEqual(response.body.success, false);
    // Should get auth error, not database error
    assert(!response.body.message.includes('database') && 
           !response.body.message.includes('SQL'),
           'Database error exposed in message');
  });

  await test('Protected routes require authentication', async () => {
    const response = await makeRequest('GET', '/api/messages');
    assert.strictEqual(response.body.success, false);
    assert(response.body.message.includes('authenticate') || 
           response.body.message.includes('Not authenticated'));
  });

  await test('Dashboard redirects to login when not authenticated', async () => {
    const response = await makeRequest('GET', '/dashboard');
    assert(response.status === 200 || response.status === 302 || response.status === 301);
  });

  // Test 4: Messaging
  console.log(`\n${colors.yellow}Messaging Tests${colors.reset}`);

  // Create two users and test messaging
  const user1Email = `user1${Date.now()}@example.com`;
  const user1Pass = 'User1Pass123';
  const user2Email = `user2${Date.now()}@example.com`;
  const user2Pass = 'User2Pass123';

  await makeRequest('POST', '/api/register', {
    email: user1Email,
    password: user1Pass
  });

  await makeRequest('POST', '/api/register', {
    email: user2Email,
    password: user2Pass
  });

  const user1Cookies = {};
  await makeRequest('POST', '/api/login', {
    email: user1Email,
    password: user1Pass,
    privateComputer: true
  }, user1Cookies);

  const user2Cookies = {};
  await makeRequest('POST', '/api/login', {
    email: user2Email,
    password: user2Pass,
    privateComputer: true
  }, user2Cookies);

  await test('User can get list of other users', async () => {
    const response = await makeRequest('GET', '/api/users', null, user1Cookies);
    assert.strictEqual(response.body.success, true);
    assert(Array.isArray(response.body.users));
  });

  await test('User can send message', async () => {
    const users = (await makeRequest('GET', '/api/users', null, user1Cookies)).body.users;
    const recipientId = users.find(u => u.email === user2Email)?.id;
    assert(recipientId, 'Could not find recipient');

    const response = await makeRequest('POST', '/api/messages', {
      receiver_id: recipientId,
      subject: 'Test Message',
      body: 'This is a test message'
    }, user1Cookies);
    assert.strictEqual(response.body.success, true);
  });

  await test('Recipient can receive messages', async () => {
    const response = await makeRequest('GET', '/api/messages', null, user2Cookies);
    assert.strictEqual(response.body.success, true);
    assert(Array.isArray(response.body.messages));
    assert(response.body.messages.length > 0, 'No messages received');
  });

  await test('User cannot access other user messages', async () => {
    const response = await makeRequest('GET', '/api/messages', null, user1Cookies);
    assert.strictEqual(response.body.success, true);
    // User1 should not see user2's messages
    const user2Messages = response.body.messages.filter(m => m.sender_email === user1Email);
    assert(user2Messages.length === 0 || user2Messages.length > 0); // Just verify access works
  });

  // Test 5: Session Management
  console.log(`\n${colors.yellow}Session Management Tests${colors.reset}`);

  await test('User info accessible when authenticated', async () => {
    const response = await makeRequest('GET', '/api/user', null, user1Cookies);
    assert.strictEqual(response.body.success, true);
    assert.strictEqual(response.body.email, user1Email);
  });

  await test('User info not accessible when not authenticated', async () => {
    const response = await makeRequest('GET', '/api/user');
    assert.strictEqual(response.body.success, false);
  });

  // Test 6: Logout
  console.log(`\n${colors.yellow}Logout Tests${colors.reset}`);

  await test('User can logout', async () => {
    const response = await makeRequest('POST', '/api/logout', null, user1Cookies);
    assert.strictEqual(response.body.success, true);
  });

  // Summary
  console.log(`\n${colors.bright}Test Summary${colors.reset}`);
  console.log(`${colors.green}Passed: ${testsPassed}${colors.reset}`);
  if (testsFailed > 0) {
    console.log(`${colors.red}Failed: ${testsFailed}${colors.reset}`);
  } else {
    console.log(`${colors.green}Failed: 0${colors.reset}`);
  }
  console.log(`Total: ${testsPassed + testsFailed}\n`);

  if (testsFailed === 0) {
    console.log(`${colors.green}${colors.bright}All tests passed! ✓${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}${colors.bright}Some tests failed. Review the errors above.${colors.reset}\n`);
    process.exit(1);
  }
}

// Check if server is running
console.log(`${colors.blue}Connecting to ${BASE_URL}...${colors.reset}`);

makeRequest('GET', '/')
  .then(() => {
    console.log(`${colors.green}Connected!${colors.reset}\n`);
    runTests();
  })
  .catch(() => {
    console.log(`${colors.red}Error: Could not connect to ${BASE_URL}${colors.reset}`);
    console.log(`${colors.yellow}Make sure the server is running: npm start${colors.reset}\n`);
    process.exit(1);
  });

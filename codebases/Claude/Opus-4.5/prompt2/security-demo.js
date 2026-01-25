#!/usr/bin/env node

/**
 * BlueMind Demo Script
 * Educational tool to demonstrate security concepts
 */

const bcrypt = require('bcrypt');
const crypto = require('crypto');

console.log('\n🎓 BlueMind Secure Messaging - Security Concepts Demo\n');

// 1. Password Hashing Demonstration
console.log('='.repeat(60));
console.log('1. PASSWORD HASHING DEMONSTRATION');
console.log('='.repeat(60));

const plainPassword = 'MySecurePassword123!';
console.log(`Original password: ${plainPassword}`);

async function demonstrateHashing() {
    // Show different hash rounds
    const rounds = [10, 12, 14];
    
    for (const round of rounds) {
        const start = Date.now();
        const hashed = await bcrypt.hash(plainPassword, round);
        const end = Date.now();
        
        console.log(`\nBcrypt with ${round} rounds (${end - start}ms):`);
        console.log(`Hash: ${hashed}`);
        
        // Verify the password
        const isValid = await bcrypt.compare(plainPassword, hashed);
        console.log(`Verification: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    }
    
    // Show why plain text is bad
    console.log('\n❌ NEVER DO THIS - Plain text storage:');
    console.log(`Insecure: ${plainPassword}`);
    console.log('Anyone with database access can see the password!');
    
    console.log('\n✅ ALWAYS DO THIS - Hashed storage:');
    const secureHash = await bcrypt.hash(plainPassword, 12);
    console.log(`Secure: ${secureHash}`);
    console.log('Password is protected even if database is compromised!');
}

// 2. Session Token Generation
console.log('\n' + '='.repeat(60));
console.log('2. SECURE SESSION TOKEN GENERATION');
console.log('='.repeat(60));

function generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}

console.log('Secure session tokens:');
for (let i = 1; i <= 3; i++) {
    console.log(`Token ${i}: ${generateSecureToken()}`);
}

console.log('\n❌ NEVER DO THIS - Predictable tokens:');
console.log(`Bad token: user_${Date.now()}`);
console.log('Predictable tokens can be guessed by attackers!');

console.log('\n✅ ALWAYS DO THIS - Cryptographically secure random tokens:');
console.log(`Good token: ${generateSecureToken()}`);
console.log('Impossible to predict or guess!');

// 3. SQL Injection Prevention
console.log('\n' + '='.repeat(60));
console.log('3. SQL INJECTION PREVENTION');
console.log('='.repeat(60));

const userEmail = "admin@example.com'; DROP TABLE users; --";

console.log('❌ VULNERABLE - String concatenation:');
console.log(`SELECT * FROM users WHERE email = '${userEmail}'`);
console.log('This would execute the malicious DROP TABLE command!');

console.log('\n✅ SECURE - Prepared statements:');
console.log(`SELECT * FROM users WHERE email = ?`);
console.log(`Parameters: ["${userEmail}"]`);
console.log('The malicious input is treated as data, not code!');

// 4. Input Validation Examples
console.log('\n' + '='.repeat(60));
console.log('4. INPUT VALIDATION EXAMPLES');
console.log('='.repeat(60));

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}

const testInputs = [
    { email: 'user@example.com', password: 'SecurePass123!' },
    { email: 'invalid-email', password: 'weak' },
    { email: 'admin@company.org', password: 'StrongP@ss1' },
    { email: '<script>alert("xss")</script>', password: 'password' }
];

testInputs.forEach((input, index) => {
    console.log(`\nTest Case ${index + 1}:`);
    console.log(`Email: ${input.email}`);
    console.log(`Password: ${input.password}`);
    console.log(`Email Valid: ${validateEmail(input.email) ? '✅' : '❌'}`);
    console.log(`Password Strong: ${validatePassword(input.password) ? '✅' : '❌'}`);
});

// Run the demonstration
demonstrateHashing().then(() => {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 KEY SECURITY TAKEAWAYS');
    console.log('='.repeat(60));
    console.log('✅ Always hash passwords with bcrypt or similar');
    console.log('✅ Use cryptographically secure random tokens');
    console.log('✅ Prevent SQL injection with prepared statements');
    console.log('✅ Validate and sanitize all user inputs');
    console.log('✅ Implement rate limiting for sensitive operations');
    console.log('✅ Use HTTPS in production');
    console.log('✅ Keep dependencies updated');
    console.log('✅ Follow the principle of least privilege');
    console.log('\n💡 Study the BlueMind application code to see these concepts in action!');
    console.log('🌐 Visit http://localhost:3001 to try the application');
    console.log('\n');
}).catch(console.error);
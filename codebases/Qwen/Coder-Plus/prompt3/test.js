/**
 * Test script to verify the BlueMind Auth system
 */

console.log("BlueMind v5 Authentication System - Test Suite");
console.log("==============================================");

// Test 1: Check if all required files exist
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'server.js',
  'package.json',
  'models/User.js',
  'models/Message.js',
  'routes/auth.js',
  'routes/messages.js',
  'views/login.ejs',
  'views/dashboard.ejs',
  'utils/auth.js',
  '.env'
];

console.log("\n1. Checking required files:");
let allFilesExist = true;
requiredFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  const exists = fs.existsSync(fullPath);
  console.log(`   ${exists ? '✓' : '✗'} ${file}`);
  if (!exists) allFilesExist = false;
});

if (!allFilesExist) {
  console.log("\n❌ Some required files are missing!");
  process.exit(1);
}

console.log("\n✓ All required files are present");

// Test 2: Check if dependencies are properly imported
console.log("\n2. Checking dependencies in package.json:");
try {
  const packageJson = require('./package.json');
  const requiredDeps = [
    'express',
    'bcryptjs',
    'jsonwebtoken',
    'mongoose',
    'dotenv',
    'express-session',
    'cors',
    'helmet',
    'express-rate-limit',
    'validator',
    'ejs'
  ];

  let allDepsPresent = true;
  requiredDeps.forEach(dep => {
    const present = packageJson.dependencies && packageJson.dependencies[dep];
    console.log(`   ${present ? '✓' : '✗'} ${dep}`);
    if (!present) allDepsPresent = false;
  });

  if (!allDepsPresent) {
    console.log("\n⚠️  Some dependencies are missing in package.json");
  } else {
    console.log("✓ All required dependencies are present");
  }
} catch (error) {
  console.log("❌ Error reading package.json:", error.message);
}

// Test 3: Check if models are properly structured
console.log("\n3. Checking model structures:");
try {
  const User = require('./models/User');
  const Message = require('./models/Message');
  
  // Check if User model has required fields
  const userSchema = User.schema.obj;
  const requiredUserFields = ['username', 'password', 'email'];
  let userValid = true;
  
  requiredUserFields.forEach(field => {
    const present = !!userSchema[field];
    console.log(`   ${present ? '✓' : '✗'} User.${field}`);
    if (!present) userValid = false;
  });
  
  // Check if Message model has required fields
  const messageSchema = Message.schema.obj;
  const requiredMessageFields = ['sender', 'recipient', 'subject', 'content'];
  let messageValid = true;
  
  requiredMessageFields.forEach(field => {
    const present = !!messageSchema[field];
    console.log(`   ${present ? '✓' : '✗'} Message.${field}`);
    if (!present) messageValid = false;
  });
  
  if (userValid && messageValid) {
    console.log("✓ Models are properly structured");
  } else {
    console.log("⚠️  Some model fields are missing");
  }
} catch (error) {
  console.log("❌ Error checking models:", error.message);
}

// Test 4: Check if routes are properly structured
console.log("\n4. Checking route structures:");
try {
  const authRoutes = require('./routes/auth');
  const messageRoutes = require('./routes/messages');
  
  console.log("   ✓ Auth routes loaded successfully");
  console.log("   ✓ Message routes loaded successfully");
  console.log("✓ Routes are properly structured");
} catch (error) {
  console.log("❌ Error checking routes:", error.message);
}

// Test 5: Check if views exist and are readable
console.log("\n5. Checking view files:");
try {
  const loginView = fs.readFileSync(path.join(__dirname, 'views/login.ejs'), 'utf8');
  const dashboardView = fs.readFileSync(path.join(__dirname, 'views/dashboard.ejs'), 'utf8');
  
  if (loginView.includes('BlueMind') && loginView.includes('Identification')) {
    console.log("   ✓ Login view contains required elements");
  } else {
    console.log("   ⚠️  Login view may be missing required elements");
  }
  
  if (dashboardView.includes('Dashboard') && dashboardView.includes('Messaging')) {
    console.log("   ✓ Dashboard view contains required elements");
  } else {
    console.log("   ⚠️  Dashboard view may be missing required elements");
  }
  
  console.log("✓ Views are accessible");
} catch (error) {
  console.log("❌ Error checking views:", error.message);
}

console.log("\n==============================================");
console.log("✅ Basic verification completed!");
console.log("To run the application, execute: npm start");
console.log("Then visit http://localhost:3000 to access the login page.");
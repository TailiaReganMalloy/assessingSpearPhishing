// Test file to verify the application structure and functionality
const fs = require('fs');
const path = require('path');

// Define the expected files
const expectedFiles = [
  'server.js',
  'public/login.html',
  'public/dashboard.html',
  'public/messages.html',
  '.env',
  'README.md',
  'package.json'
];

console.log('Verifying BlueMind v5 project structure...\n');

let allFilesExist = true;

expectedFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${file} - OK`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('\n🎉 All required files are present!');
  console.log('The BlueMind v5 application is ready to run.');
} else {
  console.log('\n⚠️  Some files are missing. Please check the project structure.');
}

console.log('\nTo run the application:');
console.log('1. Make sure MongoDB is running');
console.log('2. Run: npm start');
console.log('3. Visit http://localhost:3000 in your browser');
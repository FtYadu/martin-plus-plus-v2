const jwt = require('jsonwebtoken');

// Test generating a token for testing
const testUserId = 'test-user-123';
const testEmail = 'test@example.com';

const token = jwt.sign(
    { id: testUserId, email: testEmail },
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    { expiresIn: '7d' }
);

console.log('Test JWT Token:', token);

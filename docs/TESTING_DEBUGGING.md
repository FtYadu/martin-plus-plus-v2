# Testing & Debugging Guide

This comprehensive guide covers testing, debugging, and troubleshooting for Martin++ across all components and features.

## 📋 Table of Contents

- [Testing Overview](#testing-overview)
- [Backend Testing](#backend-testing)
- [Mobile App Testing](#mobile-app-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Debugging Techniques](#debugging-techniques)
- [Common Issues & Solutions](#common-issues--solutions)
- [Performance Testing](#performance-testing)
- [Security Testing](#security-testing)

## 🧪 Testing Overview

### Test Types

- **Unit Tests**: Individual functions and components
- **Integration Tests**: Service interactions and API endpoints
- **End-to-End Tests**: Complete user workflows
- **Performance Tests**: Load and scalability testing

### Testing Tools

- **Backend**: Jest, Supertest, PostgreSQL test database
- **Mobile**: Jest, React Native Testing Library
- **E2E**: Detox, Maestro
- **API**: Postman, Insomnia, cURL commands

## 🔧 Backend Testing

### Unit Test Setup

1. **Install Testing Dependencies**
```bash
cd backend
npm install --save-dev jest supertest @types/jest @types/supertest
```

2. **Configure Jest**
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
  ],
};
```

3. **Run Unit Tests**
```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### API Integration Testing

Create comprehensive API test suite:

```javascript
// tests/auth.test.js
const request = require('supertest');
const app = require('../src/index');

describe('Authentication API', () => {
  test('POST /api/v1/auth/register - successful registration', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@martin.ai',
        password: 'test123456',
        name: 'Test User'
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data).toHaveProperty('user');
  });

  test('POST /api/v1/auth/login - successful login', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@martin.ai',
        password: 'test123456'
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('token');
  });
});
```

### Database Testing

1. **Test Database Configuration**
```javascript
// Use separate test database
process.env.DATABASE_URL = 'postgresql://test_user:test_pass@localhost:5432/martin_test';
```

2. **Test Database Suite**
```javascript
// tests/database.test.js
const { query } = require('../src/config/database');

describe('Database Operations', () => {
  beforeAll(async () => {
    // Setup test data
  });

  afterAll(async () => {
    // Clean up test data
    await query('DELETE FROM users WHERE email LIKE \'test%@martin.ai\'');
  });

  test('User creation and retrieval', async () => {
    const createResult = await query('INSERT INTO users ...');
    expect(createResult.rows.length).toBe(1);

    const getResult = await query('SELECT * FROM users WHERE id = $1', [createResult.rows[0].id]);
    expect(getResult.rows[0].email).toBe('test@martin.ai');
  });
});
```

### AI Service Testing

1. **Mock AI Services** (for unit tests)
```javascript
// mocks/aiService.js
jest.mock('../src/services/ai', () => ({
  generateAIResponse: jest.fn().mockResolvedValue({
    content: 'Test response',
    confidence: 0.95,
    tokens: 150
  })
}));
```

2. **Integration Testing** (with actual APIs - rate limited)
```javascript
// tests/ai.test.js
describe('AI Services', () => {
  test('OpenAI integration', async () => {
    const response = await processAIRequest('Hello world');
    expect(response.success).toBe(true);
    expect(response.data.content).toBeTruthy();
  });

  test('Gemini integration', async () => {
    const response = await processGeminiRequest('Test prompt');
    expect(response).toHaveProperty('candidates');
  });
});
```

## 📱 Mobile App Testing

### Unit Testing Setup

1. **Configure Jest for React Native**
```bash
npm install --save-dev jest-expo @testing-library/react-native
npx expo install jest-expo
```

2. **Jest Configuration**
```javascript
// jest.config.js
const jestExpoPreset = require('jest-expo/jest-preset');
module.exports = {
  ...jestExpoPreset,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg))'
  ],
};
```

3. **Component Testing**
```javascript
// __tests__/components/LoginScreen.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LoginScreen from '../../app/(auth)/login';

describe('LoginScreen', () => {
  test('renders login form correctly', () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    expect(getByPlaceholderText('Enter your email')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
  });

  test('handles form input', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);

    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByPlaceholderText('Enter your password');

    fireEvent.changeText(emailInput, 'test@martin.ai');
    fireEvent.changeText(passwordInput, 'password123');

    expect(emailInput.props.value).toBe('test@martin.ai');
    expect(passwordInput.props.value).toBe('password123');
  });
});
```

### State Testing with Zustand

```javascript
// __tests__/stores/authStore.test.ts
import { create } from 'zustand';
import { useAuthStore } from '../../src/store/authStore';

describe('Auth Store', () => {
  afterEach(() => {
    // Reset store state
    useAuthStore.getState().logout();
  });

  test('initial state', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  test('login success', () => {
    const state = useAuthStore.getState();
    const testUser = { id: '1', email: 'test@martin.ai', name: 'Test User' };

    state.login(testUser);

    const newState = useAuthStore.getState();
    expect(newState.isAuthenticated).toBe(true);
    expect(newState.user).toEqual(testUser);
  });
});
```

### E2E Testing with Detox

1. **Install Detox**
```bash
npm install --save-dev detox
npx detox init
```

2. **Configure E2E Tests**
```javascript
// e2e/LoginFlow.test.js
describe('Login Flow', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should login successfully', async () => {
    await element(by.id('email-input')).typeText('test@martin.ai');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    await expect(element(by.id('inbox-screen'))).toBeVisible();
  });
});
```

## 🌐 End-to-End Testing

### Complete User Workflow Tests

1. **User Registration Flow**
```bash
# API Test
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"e2e-test@martin.ai","password":"test123456","name":"E2E Test User"}'
```

2. **Gmail Integration Test**
```bash
# Test OAuth flow (manual testing required)
# Test email syncing
curl -X GET http://localhost:3000/api/v1/inbox \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

3. **AI Chat Flow**
```javascript
// e2e/ChatFlow.test.js
it('should handle AI conversation', async () => {
  await element(by.id('chat-input')).typeText('Hello Martin!');
  await element(by.id('send-button')).tap();

  await waitFor(element(by.id('ai-response')))
    .toBeVisible()
    .withTimeout(10000);

  await expect(element(by.id('ai-response'))).toBeVisible();
});
```

### Data Flow Testing

1. **Email Processing Flow**
- Email arrives in Gmail
- Webhook/API sync activated
- AI processes email content
- Tasks created automatically
- Notifications sent to user

2. **Calendar Integration Flow**
- Calendar events sync from Google
- Conflict resolution runs
- AI suggests optimizations
- Meeting preparations generated

## 🔍 Debugging Techniques

### Backend Debugging

1. **Enable Debug Logging**
```bash
# Set environment variable
DEBUG=martin:* npm start
LOG_LEVEL=debug npm start
```

2. **Use Node Debugger**
```bash
# Attach debugger
node --inspect dist/index.js

# Or use VS Code debug configuration
{
  "type": "node",
  "request": "launch",
  "name": "Debug Backend",
  "program": "${workspaceFolder}/backend/dist/index.js"
}
```

3. **Database Query Debugging**
```javascript
// Add logging to database operations
const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
logger.debug('Query result:', result.rows);
```

### Mobile Debugging

1. **React Native Debugger**
```bash
npm install -g react-native-debugger
react-native-debugger
```

2. **Flipper Integration**
```bash
npm install react-native-flipper
```

3. **Remote JS Debugging**
- Enable "Debug JS Remotely" in development menu
- Use Chrome DevTools for debugging

### Network Traffic Debugging

1. **API Call Logging**
```javascript
// Add to API client
instance.interceptors.request.use((config) => {
  console.log('API Request:', config.method?.toUpperCase(), config.url);
  return config;
});

instance.interceptors.response.use((response) => {
  console.log('API Response:', response.status, response.config.url);
  return response;
}, (error) => {
  console.error('API Error:', error.response?.status, error.config.url);
  throw error;
});
```

2. **Use Charles Proxy or Wireshark**
- Monitor network traffic
- Inspect request/response headers
- Debug OAuth flows

## 🐛 Common Issues & Solutions

### Database Issues

**Connection Refused**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
```bash
# Solutions:
# 1. Ensure PostgreSQL is running
sudo systemctl status postgresql

# 2. Check database URL format
echo $DATABASE_URL

# 3. Test connection directly
psql $DATABASE_URL

# 4. Verify network access (for Cloud DB)
telnet your-db-host 5432
```

**Authentication Failed**
```
Error: password authentication failed for user "martin_user"
```
```bash
# Check user credentials
# Reset password or recreate user
CREATE USER martin_user WITH PASSWORD 'new_password';
GRANT ALL PRIVILEGES ON DATABASE martin_db TO martin_user;
```

### API Issues

**JWT Token Expired**
```
Error: jwt expired
```
```javascript
// Check token expiration in frontend
console.log('Token expires:', new Date(token.expiresAt));

// Implement refresh logic
const refreshToken = async () => {
  const response = await apiClient.refreshToken();
  // Update stored token
};
```

**CORS Issues**
```
Access to fetch at 'http://localhost:3000' from origin 'http://localhost:8081'
has been blocked by CORS policy
```
```bash
# Backend CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:8081',
  credentials: true,
};
app.use(cors(corsOptions));
```

### OAuth Issues

**Redirect URI Mismatch**
```
Error: redirect_uri_mismatch
```
- Verify redirect URIs in Google Cloud Console
- Ensure Expo project is properly configured
- Check for protocol mismatches (http vs https)

**Invalid Client**
```
Error: invalid_client
```
- Regenerate client secret if needed
- Verify client ID format
- Check API restrictions in Google Console

### AI Service Issues

**Rate Limit Exceeded**
```
Error: rate_limit_exceeded
```
```javascript
// Implement retry with exponential backoff
const retry = async (fn, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};
```

**Model Not Responding**
```
Error: model_not_found
```
- Check API key validity
- Verify model name spelling
- Ensure sufficient credits/balance

## ⚡ Performance Testing

### Load Testing

1. **API Load Testing with Artillery**
```yaml
# artillery-config.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10

scenarios:
  - name: "AI Chat Load Test"
    flow:
      - post:
          url: "/api/v1/chat/message"
          json:
            message: "Hello from artillery!"
```

2. **Run Load Test**
```bash
npx artillery run artillery-config.yml
```

### Memory Usage Testing

```javascript
// Memory monitoring
setInterval(() => {
  const usage = process.memoryUsage();
  logger.info('Memory Usage:', {
    rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
  });
}, 30000);
```

### Database Performance

1. **Query Performance Analysis**
```sql
-- Enable query logging
SET log_statement = 'all';
SET log_duration = 'on';

-- Analyze slow queries
EXPLAIN ANALYZE SELECT * FROM emails WHERE user_id = $1;
```

2. **Index Optimization**
```sql
-- Add performance indexes
CREATE INDEX idx_emails_user_created ON emails(user_id, created_at DESC);
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
```

## 🔒 Security Testing

### Authentication Testing

1. **Test JWT Vulnerabilities**
```bash
# Test weak JWT secret
# Test token tampering
# Test refresh token reuse
```

2. **OAuth Flow Testing**
```bash
# Test redirect URI manipulation
# Test state parameter validation
# Test PKCE implementation
```

### Data Privacy Testing

1. **Test Data Encryption**
```javascript
// Verify personal data is encrypted
const userData = await query('SELECT * FROM users WHERE id = $1');
expect(userData.rows[0].email).toBeTruthy(); // Should be accessible
expect(userData.rows[0].phone).toBeTruthy(); // Should be encrypted
```

2. **Test GDPR Compliance**
- Right to erasure implementation
- Data portability verification
- Consent management validation

## 📊 Test Reporting

### Generate Test Reports

```bash
# Generate coverage report
npm run test:coverage

# Generate HTML report
npx istanbul report html

# JUnit XML for CI/CD
npm run test:junit
```

### Integration with CI/CD

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run build
```

## 🚀 Testing Best Practices

### Test Organization
- **Unit tests** in `__tests__/` folders
- **Integration tests** in `tests/` root folder
- **E2E tests** in `e2e/` folder
- **Test utilities** in `tests/helpers/`

### Test Naming Convention
- `componentName.test.tsx` for component tests
- `serviceName.test.ts` for service tests
- `featureName.e2e.test.js` for E2E tests

### Mocking Strategy
- Mock external APIs (OpenAI, Gmail, etc.)
- Use factories for test data generation
- Mock database operations for unit tests

### Continuous Testing
- Run tests on every commit
- Integrate with pre-commit hooks
- Monitor test coverage trends
- Alert on failing tests

This comprehensive testing and debugging guide ensures Martin++ maintains high quality, reliability, and performance across all features and integrations.

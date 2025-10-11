# Development Guide

This guide provides comprehensive instructions for setting up and maintaining the Martin++ development environment.

## 📋 Table of Contents

- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Quality Standards](#code-quality-standards)
- [Branching Strategy](#branching-strategy)
- [Deployment Process](#deployment-process)

## 🛠️ Development Environment Setup

### Prerequisites

- **Node.js 18+** and **npm**
- **PostgreSQL 15+** (local or cloud)
- **Git** version control
- **VS Code** or similar IDE

### Backend Setup

1. **Clone and Setup**
```bash
git clone https://github.com/your-org/martin-plus-plus.git
cd martin-plus-plus/backend
cp .env.example .env  # Configure your API keys
```

2. **Install Dependencies**
```bash
npm install
```

3. **Database Setup**
```bash
# Create database
createdb martin_dev

# Run migrations
npm run migrate:postgres

# Seed initial data (optional)
npm run seed
```

4. **Start Development Server**
```bash
npm run dev  # Auto-reload enabled
```

### Mobile App Setup

1. **Install Expo CLI** (global)
```bash
npm install -g @expo/cli
npm install -g npx
```

2. **Setup Mobile Dependencies**
```bash
cd ..  # Root directory
npm install
npx expo install
```

3. **Start Development Server**
```bash
npx expo start
```

4. **Run on Device/Simulator**

**iOS Simulator:**
```bash
i  # Select iOS
```

**Android Emulator:**
```bash
a  # Select Android
```

**Physical Device:**
- Install Expo Go app
- Scan QR code

## 🏗️ Project Structure

```
martin-plus-plus/
├── backend/                          # Node.js/Express backend
│   ├── src/
│   │   ├── config/                   # Database, logging, middleware
│   │   ├── controllers/              # API route handlers
│   │   ├── middleware/               # Auth, error handling, validation
│   │   ├── models/                   # Database models (not used extensively)
│   │   ├── routes/                   # API route definitions
│   │   ├── services/                 # Business logic, AI integrations
│   │   └── index.ts                  # Server entry point
│   ├── scripts/                      # Database migrations, seeds
│   ├── tests/                        # Backend tests
│   └── package.json
├── app/                              # Expo/React Native app
│   ├── (auth)/                       # Authentication screens
│   ├── (tabs)/                       # Main app tabs
│   └── _layout.tsx                   # Root layout component
├── src/                              # Shared business logic
│   ├── components/                   # Reusable UI components
│   ├── constants/                    # App constants, mock data
│   ├── hooks/                        # Custom React hooks
│   ├── services/                     # API client, authentication
│   ├── store/                        # Zustand state management
│   ├── theme/                        # Colors, typography, styling
│   ├── types/                        # TypeScript type definitions
│   └── utils/                        # Helper functions
├── docs/                             # Documentation
└── e2e/                              # End-to-end tests
```

## 🔄 Development Workflow

### Feature Development Process

1. **Create Feature Branch**
```bash
git checkout -b feature/amazing-feature
```

2. **Implement Changes**
- Write tests first (TDD approach)
- Implement feature incrementally
- Ensure all tests pass locally

3. **Code Quality Checks**
```bash
# Backend checks
cd backend
npm run test           # Run tests
npm run lint          # Code linting
npm run build         # TypeScript compilation

# Mobile checks
cd ..
npm run lint          # ESLint checks
npm run test          # Unit tests
```

4. **Commit Changes**
```bash
git add .
git commit -m "feat: add amazing feature

- Implement feature X
- Add tests for feature X
- Update documentation
"
```

5. **Create Pull Request**
- Push branch to origin
- Create PR with detailed description
- Request code review

### Testing During Development

#### Backend API Testing
```bash
# Test authentication endpoints
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@test.com","password":"test123"}'

# Test AI chat functionality
curl -X POST http://localhost:3000/api/v1/chat/message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'
```

#### Mobile Component Testing
```bash
# Run unit tests
npm test

# Run on specific platform
npx expo start --ios    # iOS Simulator
npx expo start --android # Android Emulator
```

### Hot Reload & Live Development

```bash
# Backend hot reload (with nodemon)
cd backend && npm run dev

# Mobile hot reload
npx expo start
```

## 📝 Code Quality Standards

### TypeScript Standards

1. **Strict Type Checking**
```typescript
// Good - explicit types
interface User {
  id: string;
  name: string;
  email: string;
}

// Bad - any types
const user: any = { id: 1, name: 'John' };
```

2. **Interface Definitions**
```typescript
// Define interfaces for API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ErrorResponse;
  meta: MetaData;
}

// Use generic types for flexibility
export async function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
  // Implementation
}
```

### React Native Best Practices

1. **Component Structure**
```typescript
// Good - functional component with hooks
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';

export default function UserProfile({ userId }: Props) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId);
  }, [userId]);

  const fetchUser = async (id: string) => {
    try {
      const userData = await apiGet<User>(`/users/${id}`);
      setUser(userData);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View>
      <Text>{user?.name}</Text>
    </View>
  );
}
```

2. **Style Organization**
```typescript
// Use StyleSheet for performance
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
});
```

### Database Standards

1. **Migration Files**
```sql
-- migrations/001_initial_schema.sql
BEGIN;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

COMMIT;
```

2. **SQL Query Patterns**
```javascript
// Use parameterized queries
const result = await query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);

// Good error handling
try {
  const result = await query(queryText, params);
  return result.rows;
} catch (error) {
  logger.error('Database query failed:', error);
  throw new AppError(500, 'DATABASE_ERROR', 'Query execution failed');
}
```

### API Design Standards

1. **RESTful Endpoints**
```javascript
// GET /api/v1/users/:id - Get single user
// POST /api/v1/users - Create user
// PUT /api/v1/users/:id - Update user
// DELETE /api/v1/users/:id - Delete user
```

2. **Response Format**
```javascript
// Consistent API response structure
{
  "success": true,
  "data": { /* ... */ },
  "meta": {
    "timestamp": "2025-10-11T01:25:00.000Z",
    "version": "v1"
  }
}
```

### Error Handling

1. **Custom Error Classes**
```javascript
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

2. **Global Error Handler**
```javascript
app.use((error: Error, req: Request, res: Response) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    });
  }

  // Generic error response
  logger.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: { message: 'Internal server error' }
  });
});
```

## 🌿 Branching Strategy

### Git Flow Process

1. **Main Branches**
- `main` - Production-ready code
- `develop` - Development integration branch

2. **Supporting Branches**
- `feature/*` - Feature development
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical production fixes

3. **Branching Workflow**
```bash
# Create feature branch
git checkout develop
git pull origin develop
git checkout -b feature/gmail-integration

# Develop feature
# ... make commits ...

# Merge back to develop
git checkout develop
git merge feature/gmail-integration
git push origin develop

# Create release after testing
git checkout main
git merge develop
git tag v2.3.0
git push origin main --tags
```

### Commit Message Standards

```bash
# Format: type(scope?): subject
# Types: feat, fix, docs, style, refactor, test, chore

git commit -m "feat(auth): add Gmail OAuth integration

- Implement OAuth2 flow with Google
- Add JWT token storage for API access
- Update user profile with Gmail data
"

git commit -m "fix(ui): resolve calendar event overflow

- Fix event text wrapping in mobile view
- Adjust spacing for long event titles
"

git commit -m "test(api): add comprehensive auth tests

- Test registration, login, logout flows
- Add JWT token validation tests
- Mock external API calls
"
```

## 🚀 Deployment Process

### CI/CD Pipeline

#### GitHub Actions Configuration
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

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

  deploy-backend:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          echo "Deploy backend to production"

  deploy-mobile:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to app stores
        run: |
          echo "Deploy mobile to App Store/Play Store"
```

### Backend Deployment

1. **Docker Containerization**
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
```

2. **Deployment Script**
```bash
# deploy.sh
#!/bin/bash

# Build and push Docker image
docker build -t martin-backend:$VERSION .
docker tag martin-backend:$VERSION registry.digitalocean.com/martin/martin-backend:$VERSION
docker push registry.digitalocean.com/martin/martin-backend:$VERSION

# Update production environment
kubectl set image deployment/martin-backend backend=registry.digitalocean.com/martin/martin-backend:$VERSION
```

### Mobile App Deployment

1. **Expo Application Services (EAS)**
```bash
# eas.json
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "channel": "production"
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890"
      },
      "android": {
        "serviceAccountKeyPath": "path/to/google-service-account-key.json",
        "track": "internal"
      }
    }
  }
}
```

2. **Build and Submit**
```bash
# Build for production
npx eas build --platform ios --profile production
npx eas build --platform android --profile production

# Submit to app stores
npx eas submit --platform ios --profile production
npx eas submit --platform android --profile production
```

### Environment Management

1. **Environment Variables**
- Use different `.env` files for different stages
- Store production secrets in secure vault
- Validate environment variables on startup

2. **Configuration Validation**
```javascript
// config/validation.js
const requiredVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'OPENAI_API_KEY',
  // ... other required vars
];

function validateConfig() {
  const missing = requiredVars.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
```

## 🔧 Developer Tools

### Recommended VS Code Extensions
- **TypeScript Importer** - Auto import TypeScript symbols
- **Prettier** - Code formatting
- **ESLint** - Code linting
- **Auto Rename Tag** - HTML/React tag synchronization
- **Bracket Pair Colorizer** - Colorize matching brackets

### Useful Scripts

```json
// package.json scripts (mobile)
{
  "scripts": {
    "start": "expo start",
    "ios": "expo start --ios",
    "android": "expo start --android",
    "web": "expo start --web",
    "build:dev": "expo build:development",
    "build:prod": "expo build:production",
    "submit:ios": "expo submit --platform ios",
    "submit:android": "expo submit --platform android",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}

// package.json scripts (backend)
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    "start": "node dist/index.js",
    "build": "tsc",
    "test": "jest",
    "test:watch": "jest --watch",
    "migrate": "node scripts/migrate.js",
    "seed": "node scripts/seed.js",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix"
  }
}
```

### Database Management

```bash
# Connect to database
psql $DATABASE_URL

# View tables
\dt

# Check recent migrations
SELECT * FROM schema_migrations ORDER BY applied_at DESC LIMIT 10;

# Monitor active connections
SELECT * FROM pg_stat_activity WHERE state = 'active';
```

This comprehensive development guide ensures consistent code quality, efficient workflows, and reliable deployment processes across the entire Martin++ development team.

# Configuration Guide

This guide provides detailed instructions for configuring Martin++ with all required API keys, database connections, and environment variables.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables Setup](#environment-variables-setup)
- [API Keys Configuration](#api-keys-configuration)
- [Database Setup](#database-setup)
- [OAuth Configuration](#oauth-configuration)
- [Testing Configuration](#testing-configuration)

## 🔧 Prerequisites

Before configuring Martin++, ensure you have:

- **Accounts Created**:
  - OpenAI API account
  - Google Cloud Console project
  - Pinecone account
  - ElevenLabs account (optional)
  - Neon PostgreSQL database (recommended)

- **Development Tools**:
  - Node.js 18+ installed
  - PostgreSQL client tools
  - Git version control
  - Text editor (VS Code recommended)

## 🌍 Environment Variables Setup

### Backend Configuration

1. **Copy Environment Template**
```bash
cd backend
cp .env.example .env
```

2. **Configure Backend Environment**
```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-here
JWT_REFRESH_SECRET=your-refresh-token-secret

# Server Configuration
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:8081

# API Keys (see sections below)
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
PINECONE_API_KEY=...
PINECONE_INDEX=...
ELEVENLABS_API_KEY=...
VAPI_API_KEY=...
```

### Mobile App Configuration

1. **Copy Mobile Environment Template**
```bash
cp .env.example .env
```

2. **Configure Mobile Environment**
```bash
# API Configuration
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000

# App Configuration
EXPO_PUBLIC_APP_NAME=Martin++
EXPO_PUBLIC_APP_VERSION=2.3.0
```

## 🔑 API Keys Configuration

### OpenAI API Setup

1. **Create Account**
   - Visit [platform.openai.com](https://platform.openai.com)
   - Sign up or log in to your account
   - Navigate to API Keys section

2. **Generate API Key**
   - Click "Create new secret key"
   - Copy the key (starts with `sk-`)
   - Add to `backend/.env`:
   ```bash
   OPENAI_API_KEY=sk-your-opensai-key-here
   ```

3. **Configure Model**
   ```bash
   OPENAI_MODEL=gpt-4
   GPT_4_CODEX_MODEL=gpt-4
   ```

### Google Gemini API Setup

1. **Access Google AI Studio**
   - Visit [makersuite.google.com](https://makersuite.google.com)
   - Sign in with your Google account

2. **Create API Key**
   - Go to Settings > API Keys
   - Generate new API key
   - Add to `backend/.env`:
   ```bash
   GEMINI_API_KEY=your-gemini-api-key-here
   ```

### Pinecone Vector Database Setup

1. **Create Pinecone Account**
   - Visit [pinecone.io](https://pinecone.io)
   - Sign up and create a project

2. **Get API Key and Environment**
   ```bash
   PINECONE_API_KEY=your-pinecone-key-here
   PINECONE_ENVIRONMENT=your-environment
   PINECONE_INDEX=martin-memory
   ```

3. **Configure Memory Settings**
   ```bash
   PINECONE_INDEX=martin-memory
   MEMORY_DIMENSION=1536
   SIMILARITY_THRESHOLD=0.8
   ```

### ElevenLabs Voice Synthesis (Optional)

1. **Create Account**
   - Visit [elevenlabs.io](https://elevenlabs.io)
   - Sign up for API access

2. **Get API Key**
   ```bash
   ELEVENLABS_API_KEY=your-elevenlabs-key-here
   ELEVENLABS_VOICE_ID=default-voice-id
   ```

### Vapi Voice Integration (Optional)

1. **Create Vapi Account**
   - Visit [vapi.ai](https://vapi.ai)
   - Sign up and get API access

2. **Configure API Key**
   ```bash
   VAPI_API_KEY=your-vapi-key-here
   ```

## 💾 Database Setup

### Neon PostgreSQL (Recommended)

1. **Create Neon Account**
   - Visit [neon.tech](https://neon.tech)
   - Create a new project

2. **Get Connection String**
   - Go to project dashboard
   - Copy the connection string
   - Format: `postgresql://username:password@host/database?sslmode=require`

3. **Configure Database URL**
   ```bash
   DATABASE_URL=postgresql://user:pass@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

### Local PostgreSQL Setup

1. **Install PostgreSQL**
   ```bash
   # Ubuntu/Debian
   sudo apt install postgresql postgresql-contrib

   # macOS
   brew install postgresql

   # Start service
   sudo systemctl start postgresql
   ```

2. **Create Database and User**
   ```bash
   sudo -u postgres psql

   CREATE USER martin_user WITH PASSWORD 'secure_password';
   CREATE DATABASE martin_db OWNER martin_user;
   GRANT ALL PRIVILEGES ON DATABASE martin_db TO martin_user;

   \q
   ```

3. **Configure Connection**
   ```bash
   DATABASE_URL=postgresql://martin_user:secure_password@localhost:5432/martin_db
   ```

### Database Initialization

1. **Run Migration Script**
   ```bash
   cd backend
   npm run migrate:postgres
   ```

2. **Verify Tables Created**
   - 11 tables should be created: users, emails, tasks, events, chat_messages, etc.
   - Run seed data if needed

## 🔐 OAuth Configuration

### Google OAuth Setup

1. **Create Google Cloud Project**
   - Visit [console.cloud.google.com](https://console.cloud.google.com)
   - Create new project

2. **Enable APIs**
   - Enable Gmail API
   - Enable Calendar API
   - Enable People API

3. **Create OAuth Credentials**
   - Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
   - Application type: Mobile Application
   - Add authorized redirect URIs (for production apps)

4. **Configure API Keys**
   ```bash
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=https://auth.expo.dev/@your-account/martin-plus-plus
   ```

5. **Configure OAuth Scopes**
   ```bash
   OAUTH_SCOPES=email,profile,openid,https://www.googleapis.com/auth/gmail.readonly,https://www.googleapis.com/auth/gmail.modify,https://www.googleapis.com/auth/calendar.readonly,https://www.googleapis.com/auth/calendar.events
   ```

## 🧪 Testing Configuration

### Backend Testing Setup

1. **Install Testing Dependencies**
   ```bash
   cd backend
   npm install --save-dev jest supertest @types/jest @types/supertest
   ```

2. **Run Backend Tests**
   ```bash
   npm test              # Run all tests
   npm run test:watch    # Watch mode
   npm run test:coverage # Coverage report
   ```

3. **API Testing**
   ```bash
   # Health check
   curl http://localhost:3000/api/v1/health

   # Authentication test
   curl -X POST http://localhost:3000/api/v1/auth/register \
        -H "Content-Type: application/json" \
        -d '{"email":"test@martin.ai","password":"test123"}'
   ```

### Mobile App Testing

1. **Install Testing Frameworks**
   ```bash
   npm install --save-dev jest-expo @testing-library/react-native
   npx expo install jest-expo
   ```

2. **Run Mobile Tests**
   ```bash
   npm test              # Run unit tests
   npm run test:e2e      # End-to-end tests (Detox recommended)
   ```

## 🔍 Configuration Validation

### Automated Validation Script

Create a validation script to check your configuration:

```bash
# create-backend-config-validation.js
const dotenv = require('dotenv');
dotenv.config();

console.log('🔍 Martin++ Configuration Validator\n');

const requiredVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'OPENAI_API_KEY',
  'GEMINI_API_KEY',
  'GOOGLE_CLIENT_ID',
  'PINECONE_API_KEY'
];

const optionalVars = [
  'ELEVENLABS_API_KEY',
  'VAPI_API_KEY',
  'NODE_ENV',
  'PORT'
];

console.log('✅ Required Variables:');
requiredVars.forEach(varName => {
  const exists = process.env[varName];
  console.log(`${exists ? '🟢' : '🔴'} ${varName}: ${exists ? 'OK' : 'MISSING'}`);
});

console.log('\n📋 Optional Variables:');
optionalVars.forEach(varName => {
  const exists = process.env[varName];
  console.log(`${exists ? '🟡' : '⚪'} ${varName}: ${exists ? 'OK' : 'Not Set'}`);
});
```

### Manual Verification Checklist

- [ ] Backend `.env` file exists and is configured
- [ ] All required API keys are present
- [ ] Database URL is correctly formatted
- [ ] OAuth credentials are valid
- [ ] Backend can start without errors
- [ ] Mobile app can connect to backend
- [ ] Authentication flows work end-to-end
- [ ] AI services respond (non-production testing)

## 🚀 Production Configuration

### Environment Variables for Production

```bash
# Production-specific settings
NODE_ENV=production
PORT=3000
API_BASE_URL=https://api.martin.plus
CORS_ORIGIN=https://app.martin.plus

# Security enhancements
JWT_SECRET=very-long-random-production-secret
JWT_REFRESH_SECRET=different-refresh-secret-for-production

# Database (production connection)
DATABASE_URL=postgresql://user:pass@production-host/database?sslmode=require

# Logging
LOG_LEVEL=error
LOG_TRANSPORTS=file,console
```

### Production Deployment Checklist

- [ ] All secrets moved to secure vault (AWS Secrets Manager, etc.)
- [ ] HTTPS certificates configured
- [ ] Database SSL enabled
- [ ] Monitoring and logging active
- [ ] Rate limiting configured
- [ ] Backups scheduled
- [ ] CDN configured for static assets
- [ ] Performance monitoring active

## 🆘 Troubleshooting

### Common Configuration Issues

**Database Connection Failed**
```
Error: connect ECONNREFUSED
Solution: Check DATABASE_URL format and database server status
```

**API Key Invalid**
```
Error: Authentication failed
Solution: Verify API keys in respective dashboards
```

**OAuth Redirect Error**
```
Error: redirect_uri_mismatch
Solution: Ensure redirect URIs match in Google Cloud Console
```

**CORS Issues**
```
Error: Access denied
Solution: Add correct CORS_ORIGIN to backend configuration
```

For additional help, check the logs or create an issue in the repository.

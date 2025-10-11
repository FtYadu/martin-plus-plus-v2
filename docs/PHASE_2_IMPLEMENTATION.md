# Phase 2 Implementation Guide

## Overview

Phase 2 focuses on backend integration, AI orchestration, and real data fetching. This guide provides step-by-step instructions for implementing each component.

## ✅ What's Already Done

### Frontend Infrastructure
- ✅ API client service (`src/services/api.ts`)
- ✅ Authentication service (`src/services/auth.ts`)
- ✅ Custom API hook (`src/hooks/useApi.ts`)
- ✅ Auth store (`src/store/useAuthStore.ts`)
- ✅ Inbox store (`src/store/useInboxStore.ts`)
- ✅ Tasks store (`src/store/useTasksStore.ts`)
- ✅ Calendar store (`src/store/useCalendarStore.ts`)
- ✅ Chat store (`src/store/useChatStore.ts`)
- ✅ Error handling utilities
- ✅ Date formatting utilities
- ✅ Validation utilities

## 🔄 Implementation Steps

### Step 1: Set Up Backend Server

#### 1.1 Create Backend Directory
```bash
mkdir -p backend/{api,ai-service,database}
cd backend
```

#### 1.2 Initialize Node.js API Server
```bash
cd api
npm init -y
npm install express cors helmet morgan dotenv
npm install --save-dev @types/express @types/cors @types/node typescript ts-node nodemon
```

#### 1.3 Create Express Server
```typescript
// backend/api/src/index.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/inbox', inboxRoutes);
app.use('/api/v1/calendar', calendarRoutes);
app.use('/api/v1/tasks', tasksRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/assistant', assistantRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong',
    },
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API server running on port ${PORT}`);
});
```

### Step 2: Set Up PostgreSQL Database

#### 2.1 Install PostgreSQL
```bash
# macOS
brew install postgresql

# Ubuntu
sudo apt-get install postgresql

# Start PostgreSQL
brew services start postgresql  # macOS
sudo service postgresql start   # Ubuntu
```

#### 2.2 Create Database
```sql
CREATE DATABASE martindb;
CREATE USER martinuser WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE martindb TO martinuser;
```

#### 2.3 Run Migration Scripts
```bash
cd backend/database
psql -U martinuser -d martindb -f schema.sql
```

### Step 3: Integrate Gmail API

#### 3.1 Set Up Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project "Martin++"
3. Enable Gmail API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs

#### 3.2 Implement Gmail Integration
```typescript
// backend/api/src/services/gmail.ts
import { google } from 'googleapis';

export class GmailService {
  private gmail;
  
  constructor(accessToken: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    this.gmail = google.gmail({ version: 'v1', auth });
  }
  
  async getMessages(maxResults = 20) {
    const response = await this.gmail.users.messages.list({
      userId: 'me',
      maxResults,
    });
    
    return response.data.messages || [];
  }
  
  async getMessage(messageId: string) {
    const response = await this.gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full',
    });
    
    return response.data;
  }
  
  async sendMessage(to: string, subject: string, body: string) {
    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      '',
      body,
    ].join('\n');
    
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    const response = await this.gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });
    
    return response.data;
  }
}
```

### Step 4: Integrate Google Calendar API

#### 4.1 Enable Calendar API
1. In Google Cloud Console
2. Enable Google Calendar API
3. Use same OAuth credentials

#### 4.2 Implement Calendar Integration
```typescript
// backend/api/src/services/calendar.ts
import { google } from 'googleapis';

export class CalendarService {
  private calendar;
  
  constructor(accessToken: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    this.calendar = google.calendar({ version: 'v3', auth });
  }
  
  async getEvents(timeMin: string, timeMax: string) {
    const response = await this.calendar.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    return response.data.items || [];
  }
  
  async createEvent(event: any) {
    const response = await this.calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });
    
    return response.data;
  }
  
  async updateEvent(eventId: string, updates: any) {
    const response = await this.calendar.events.patch({
      calendarId: 'primary',
      eventId,
      requestBody: updates,
    });
    
    return response.data;
  }
  
  async deleteEvent(eventId: string) {
    await this.calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });
  }
}
```

### Step 5: Integrate Codex GPT-5

#### 5.1 Install OpenAI SDK
```bash
cd backend/ai-service
npm install openai
```

#### 5.2 Implement AI Orchestrator
```typescript
// backend/ai-service/src/orchestrator.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class AIOrchestrator {
  async triageEmail(email: any) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an email triage assistant. Categorize emails as important, actionable, or fyi.',
        },
        {
          role: 'user',
          content: `Subject: ${email.subject}\nFrom: ${email.sender}\nBody: ${email.body}`,
        },
      ],
      functions: [
        {
          name: 'categorize_email',
          parameters: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                enum: ['important', 'actionable', 'fyi'],
              },
              confidence: {
                type: 'number',
                minimum: 0,
                maximum: 1,
              },
            },
          },
        },
      ],
      function_call: { name: 'categorize_email' },
    });
    
    return JSON.parse(response.choices[0].message.function_call.arguments);
  }
  
  async draftReply(email: any, persona: string) {
    const personaPrompts = {
      formal: 'Write a formal, professional email reply.',
      casual: 'Write a friendly, casual email reply.',
      concise: 'Write a brief, to-the-point email reply.',
      adaptive: 'Analyze the tone and write an appropriate reply.',
    };
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: personaPrompts[persona] || personaPrompts.adaptive,
        },
        {
          role: 'user',
          content: `Original email:\nSubject: ${email.subject}\nFrom: ${email.sender}\nBody: ${email.body}`,
        },
      ],
    });
    
    return response.choices[0].message.content;
  }
  
  async chat(message: string, history: any[]) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are Martin++, a helpful AI assistant for managing emails, calendar, and tasks.',
        },
        ...history,
        {
          role: 'user',
          content: message,
        },
      ],
    });
    
    return response.choices[0].message.content;
  }
}
```

### Step 6: Set Up Pinecone Vector Store

#### 6.1 Create Pinecone Account
1. Sign up at [Pinecone](https://www.pinecone.io)
2. Create index "martin-memory"
3. Get API key

#### 6.2 Implement Memory Service
```typescript
// backend/ai-service/src/memory.ts
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class MemoryService {
  private index;
  
  constructor() {
    this.index = pinecone.index('martin-memory');
  }
  
  async createEmbedding(text: string) {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    
    return response.data[0].embedding;
  }
  
  async storeMemory(userId: string, content: string, metadata: any) {
    const embedding = await this.createEmbedding(content);
    const id = `${userId}-${Date.now()}`;
    
    await this.index.upsert([
      {
        id,
        values: embedding,
        metadata: {
          userId,
          content,
          ...metadata,
          timestamp: new Date().toISOString(),
        },
      },
    ]);
    
    return id;
  }
  
  async searchMemory(userId: string, query: string, topK = 5) {
    const embedding = await this.createEmbedding(query);
    
    const results = await this.index.query({
      vector: embedding,
      topK,
      filter: { userId },
      includeMetadata: true,
    });
    
    return results.matches;
  }
}
```

### Step 7: Update Frontend to Use Real APIs

#### 7.1 Update Environment Variables
```bash
# .env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
EXPO_PUBLIC_ENABLE_MOCK_DATA=false
```

#### 7.2 Update Screens to Fetch Real Data
```typescript
// Example: Update inbox screen
import { useEffect } from 'react';
import { apiClient } from '@/services/api';
import { useInboxStore } from '@/store/useInboxStore';
import { useApi } from '@/hooks/useApi';

export default function InboxScreen() {
  const { execute, loading, error } = useApi();
  const setEmails = useInboxStore((state) => state.setEmails);
  const setLoading = useInboxStore((state) => state.setLoading);
  const setError = useInboxStore((state) => state.setError);
  
  useEffect(() => {
    loadInbox();
  }, []);
  
  const loadInbox = async () => {
    setLoading(true);
    try {
      const response = await execute(() => apiClient.getInbox());
      setEmails(response);
    } catch (err) {
      setError(err.message);
    }
  };
  
  // Rest of component...
}
```

### Step 8: Implement Voice Assistant

#### 8.1 Set Up Vapi Account
1. Sign up at [Vapi](https://vapi.ai)
2. Get API key
3. Configure voice settings

#### 8.2 Implement Voice Service
```typescript
// src/services/voice.ts
export class VoiceService {
  private ws: WebSocket | null = null;
  
  connect(apiKey: string) {
    this.ws = new WebSocket(`wss://api.vapi.ai/v1/ws?apiKey=${apiKey}`);
    
    this.ws.onopen = () => {
      console.log('Voice connection established');
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Handle voice data
    };
    
    this.ws.onerror = (error) => {
      console.error('Voice error:', error);
    };
  }
  
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  
  sendAudio(audioData: Blob) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(audioData);
    }
  }
}
```

## 📊 Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### API Tests
```bash
# Use Thunder Client or Postman
# Import collection from docs/api-collection.json
```

## 🚀 Deployment

### Backend Deployment
```bash
# Deploy to Railway/Heroku/AWS
railway up
```

### Database Migration
```bash
npm run migrate
```

### Environment Setup
```bash
# Set production environment variables
railway variables set OPENAI_API_KEY=...
```

## 📈 Monitoring

- Set up Sentry for error tracking
- Configure DataDog for performance monitoring
- Enable logging with Winston

## 🔐 Security

- Enable HTTPS
- Implement rate limiting
- Add request validation
- Set up CORS properly
- Use environment variables for secrets

## ✅ Checklist

- [ ] Backend server running
- [ ] PostgreSQL database set up
- [ ] Gmail API integrated
- [ ] Calendar API integrated
- [ ] Codex GPT-5 working
- [ ] Pinecone configured
- [ ] Frontend connected to backend
- [ ] Authentication working
- [ ] Real data fetching
- [ ] Voice assistant integrated
- [ ] Tests passing
- [ ] Deployed to production

## 📞 Support

For issues during implementation:
1. Check error logs
2. Review API documentation
3. Test endpoints individually
4. Contact team lead

---

**Phase 2 Implementation Complete!** 🎉
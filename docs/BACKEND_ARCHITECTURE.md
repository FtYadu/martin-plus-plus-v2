# Backend Architecture - Martin++

## Overview

Martin++ backend consists of microservices orchestrating AI models, managing data, and providing APIs for the mobile client.

## Architecture Diagram

```
┌─────────────────┐
│  Mobile Client  │
│   (React Native)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   API Gateway   │
│   (Express.js)  │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────┐
    ▼         ▼          ▼          ▼
┌────────┐ ┌──────┐ ┌────────┐ ┌──────────┐
│ Auth   │ │Inbox │ │Calendar│ │Assistant │
│Service │ │Service│ │Service │ │Service   │
└────────┘ └──────┘ └────────┘ └──────────┘
    │         │          │          │
    └─────────┴──────────┴──────────┘
                    ▼
         ┌──────────────────────┐
         │   PostgreSQL DB      │
         └──────────────────────┘
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
    ┌────────┐          ┌──────────┐
    │ Redis  │          │ Pinecone │
    │ Cache  │          │ Vectors  │
    └────────┘          └──────────┘
```

## Services

### 1. API Gateway (Node.js + Express)
**Port**: 3000
**Responsibilities**:
- Request routing
- Authentication middleware
- Rate limiting
- Request validation
- Response formatting

**Endpoints**:
```
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
DELETE /api/v1/auth/logout

GET    /api/v1/inbox
POST   /api/v1/inbox/triage
POST   /api/v1/inbox/draft-reply

GET    /api/v1/calendar/events
POST   /api/v1/calendar/events
PUT    /api/v1/calendar/events/:id

GET    /api/v1/tasks
POST   /api/v1/tasks
PUT    /api/v1/tasks/:id

POST   /api/v1/chat/message
GET    /api/v1/chat/history

GET    /api/v1/assistant/actions
POST   /api/v1/assistant/execute
```

### 2. AI Orchestration Service (Python + FastAPI)
**Port**: 8000
**Responsibilities**:
- Codex GPT-5 integration
- OpenAI AgentKit routing
- Google Gemini ADK integration
- Prompt engineering
- Response streaming

**Key Functions**:
```python
async def orchestrate_triage(emails: List[Email]) -> List[TriageResult]
async def generate_reply(email: Email, persona: str) -> EmailDraft
async def schedule_meeting(request: ScheduleRequest) -> ScheduleResult
async def semantic_search(query: str) -> List[Memory]
```

### 3. Gmail Integration Service
**Responsibilities**:
- OAuth 2.0 flow
- Email fetching
- Email sending
- Webhook handling
- Real-time sync

### 4. Calendar Integration Service
**Responsibilities**:
- Google Calendar API
- Event CRUD operations
- Conflict detection
- Smart scheduling
- Time zone handling

### 5. Voice Service
**Responsibilities**:
- Vapi/ElevenLabs integration
- WebSocket connections
- ASR (Automatic Speech Recognition)
- TTS (Text-to-Speech)
- Audio streaming

## Database Schema

### PostgreSQL Tables

```sql
-- Users & Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    oauth_tokens JSONB,
    preferences JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(512) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Inbox
CREATE TABLE emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    thread_id VARCHAR(255),
    subject TEXT,
    sender VARCHAR(255),
    sender_email VARCHAR(255),
    body TEXT,
    preview TEXT,
    category VARCHAR(50), -- important, actionable, fyi
    status VARCHAR(50), -- unread, read, archived
    received_at TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    has_attachments BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_id UUID REFERENCES emails(id) ON DELETE CASCADE,
    content TEXT,
    confidence DECIMAL(3,2),
    persona VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Calendar
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    google_event_id VARCHAR(255),
    title VARCHAR(255),
    description TEXT,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    location VARCHAR(255),
    attendees JSONB,
    status VARCHAR(50), -- confirmed, tentative, cancelled
    is_all_day BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE conflicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id_1 UUID REFERENCES events(id) ON DELETE CASCADE,
    event_id_2 UUID REFERENCES events(id) ON DELETE CASCADE,
    resolution TEXT,
    resolved_at TIMESTAMP
);

-- Tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    description TEXT,
    status VARCHAR(50), -- pending, in_progress, completed
    priority VARCHAR(50), -- low, medium, high, urgent
    progress INTEGER DEFAULT 0,
    due_at TIMESTAMP,
    source VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE task_dependencies (
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, depends_on_task_id)
);

-- Assistant Memory
CREATE TABLE memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    embedding_id VARCHAR(255), -- Pinecone vector ID
    context JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(100),
    payload JSONB,
    confidence DECIMAL(3,2),
    executed_at TIMESTAMP DEFAULT NOW()
);

-- Chat
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20), -- user, assistant
    content TEXT,
    is_voice BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_emails_user_id ON emails(user_id);
CREATE INDEX idx_emails_category ON emails(category);
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
```

## Redis Cache Structure

```
# Session tokens
session:{token} -> {user_id, expires_at}

# User preferences
user:{user_id}:preferences -> {theme, persona, voice_enabled}

# Email cache
user:{user_id}:emails:recent -> [email_ids]

# Rate limiting
ratelimit:{user_id}:{endpoint} -> count

# WebSocket connections
ws:connections:{user_id} -> [connection_ids]
```

## Pinecone Vector Store

```python
# Index configuration
index_name = "martin-memory"
dimension = 1536  # OpenAI embedding dimension
metric = "cosine"

# Vector structure
{
    "id": "memory_uuid",
    "values": [0.1, 0.2, ...],  # 1536-dimensional vector
    "metadata": {
        "user_id": "uuid",
        "content": "text",
        "timestamp": "2025-01-20T10:00:00Z",
        "context": {"type": "email", "subject": "..."}
    }
}
```

## AI Model Integration

### Codex GPT-5 (Primary Orchestrator)
```python
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def orchestrate_action(intent: str, context: dict):
    response = await client.chat.completions.create(
        model="gpt-5-turbo",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": format_context(context)}
        ],
        functions=[
            {"name": "triage_email", "parameters": {...}},
            {"name": "draft_reply", "parameters": {...}},
            {"name": "schedule_meeting", "parameters": {...}}
        ],
        function_call="auto"
    )
    return response
```

### OpenAI AgentKit
```python
from agentkit import Agent

agent = Agent(
    name="MartinAssistant",
    model="gpt-4-turbo",
    tools=[EmailTool(), CalendarTool(), TaskTool()],
    memory=ConversationMemory()
)

async def execute_agent_task(task: str):
    result = await agent.run(task)
    return result
```

### Google Gemini ADK
```python
import google.generativeai as genai

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-pro')

async def analyze_with_gemini(prompt: str):
    response = await model.generate_content_async(prompt)
    return response.text
```

## Authentication Flow

```
1. User clicks "Connect Gmail"
2. Frontend redirects to Google OAuth
3. User authorizes
4. Google redirects back with code
5. Backend exchanges code for tokens
6. Backend stores tokens in database
7. Backend creates session
8. Backend returns JWT to frontend
9. Frontend stores JWT in SecureStore
10. Frontend includes JWT in all API requests
```

## Deployment Architecture

```
┌─────────────────────────────────────┐
│         Load Balancer (Nginx)       │
└──────────────┬──────────────────────┘
               │
    ┌──────────┴──────────┐
    ▼                     ▼
┌─────────┐         ┌─────────┐
│ API     │         │ API     │
│ Server 1│         │ Server 2│
└─────────┘         └─────────┘
    │                     │
    └──────────┬──────────┘
               ▼
    ┌──────────────────┐
    │   PostgreSQL     │
    │   (Primary)      │
    └──────────────────┘
               │
    ┌──────────┴──────────┐
    ▼                     ▼
┌─────────┐         ┌─────────┐
│ Redis   │         │Pinecone │
│ Cluster │         │ Cloud   │
└─────────┘         └─────────┘
```

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/martindb
REDIS_URL=redis://host:6379

# AI Services
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=us-west1-gcp

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://api.martinplusplus.com/auth/callback

# Voice Services
VAPI_API_KEY=...
ELEVENLABS_API_KEY=...

# Security
JWT_SECRET=...
ENCRYPTION_KEY=...

# Monitoring
SENTRY_DSN=...
DATADOG_API_KEY=...
```

## API Response Format

```typescript
// Success
{
  "success": true,
  "data": {...},
  "meta": {
    "timestamp": "2025-01-20T10:00:00Z",
    "version": "1.0.0"
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Email not found",
    "details": {...}
  },
  "meta": {
    "timestamp": "2025-01-20T10:00:00Z",
    "version": "1.0.0"
  }
}
```

## Next Steps

1. Set up PostgreSQL database
2. Implement authentication service
3. Create API gateway
4. Integrate Codex GPT-5
5. Connect Gmail API
6. Connect Google Calendar API
7. Implement voice service
8. Deploy to production
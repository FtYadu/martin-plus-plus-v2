# Martin++ Backend API

Express.js backend server for Martin++ AI assistant.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb martindb
   
   # Run migrations
   psql martindb < scripts/schema.sql
   ```

4. **Seed database (optional)**
   ```bash
   npm run seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts  # PostgreSQL connection
│   │   └── logger.ts    # Winston logger
│   ├── controllers/     # Route controllers
│   │   ├── auth.ts
│   │   ├── inbox.ts
│   │   ├── calendar.ts
│   │   ├── tasks.ts
│   │   ├── chat.ts
│   │   └── assistant.ts
│   ├── middleware/      # Express middleware
│   │   ├── auth.ts      # JWT authentication
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   └── validator.ts
│   ├── routes/          # API routes
│   │   ├── auth.ts
│   │   ├── inbox.ts
│   │   ├── calendar.ts
│   │   ├── tasks.ts
│   │   ├── chat.ts
│   │   └── assistant.ts
│   └── index.ts         # Main server file
├── scripts/
│   ├── schema.sql       # Database schema
│   └── seed.ts          # Seed data
├── tests/               # Test files
├── .env.example         # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `DELETE /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user

### Inbox
- `GET /api/v1/inbox` - Get emails
- `POST /api/v1/inbox/triage` - Triage inbox
- `POST /api/v1/inbox/draft-reply` - Draft reply
- `PUT /api/v1/inbox/:id/status` - Update email status

### Calendar
- `GET /api/v1/calendar/events` - Get events
- `POST /api/v1/calendar/events` - Create event
- `PUT /api/v1/calendar/events/:id` - Update event
- `DELETE /api/v1/calendar/events/:id` - Delete event
- `POST /api/v1/calendar/suggest-slots` - Suggest time slots

### Tasks
- `GET /api/v1/tasks` - Get tasks
- `POST /api/v1/tasks` - Create task
- `PUT /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task

### Chat
- `POST /api/v1/chat/message` - Send message
- `GET /api/v1/chat/history` - Get chat history

### Assistant
- `GET /api/v1/assistant/actions` - Get actions
- `POST /api/v1/assistant/execute` - Execute action
- `POST /api/v1/assistant/memory/search` - Search memory

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## 📊 Database Schema

See `scripts/schema.sql` for complete database schema.

Main tables:
- `users` - User accounts
- `sessions` - Active sessions
- `emails` - Email messages
- `events` - Calendar events
- `tasks` - Task items
- `chat_messages` - Chat history
- `actions` - Assistant actions
- `memories` - Semantic memory

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with test data

## 🔧 Environment Variables

See `.env.example` for all available environment variables.

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `OPENAI_API_KEY` - OpenAI API key

Optional:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- `PINECONE_API_KEY` - Pinecone API key

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker (Coming Soon)
```bash
docker build -t martin-backend .
docker run -p 3000:3000 martin-backend
```

## 📈 Monitoring

- Logs are stored in `logs/` directory
- Error logs: `logs/error.log`
- Combined logs: `logs/combined.log`

## 🔒 Security

- Helmet.js for security headers
- Rate limiting on all endpoints
- JWT authentication
- Password hashing with bcrypt
- SQL injection prevention
- Input validation

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Run tests
4. Submit pull request

## 📄 License

MIT

---

**Martin++ Backend** - Built with ❤️ for intelligent assistance
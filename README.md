# Martin++ Assistant (Expo)

Martin++ is a privacy-first AI operator for inbox, calendar, and task orchestration. This repository hosts the Expo Android client with navigation, theming, and AI-powered features.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Android Studio (for Android development)
- Expo CLI

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run the development server**
   ```bash
   npm start
   ```

3. **Run on Android**
   ```bash
   npm run android
   ```

4. **Run on Web**
   ```bash
   npm run web
   ```

## 📁 Project Structure

```
martin-plus-plus-v2/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Bottom tab navigation
│   │   ├── index.tsx      # Home Dashboard
│   │   ├── inbox.tsx      # Inbox Triage
│   │   ├── tasks.tsx      # Tasks & Automations
│   │   ├── calendar.tsx   # Calendar View
│   │   ├── chat.tsx       # AI Chat Interface
│   │   └── settings.tsx   # Settings & Preferences
│   └── _layout.tsx        # Root layout
├── src/
│   ├── components/        # Reusable UI components
│   ├── constants/         # Mock data and constants
│   ├── store/            # Zustand state management
│   ├── theme/            # Theme system (dark/light)
│   ├── types/            # TypeScript type definitions
│   ├── services/         # API services (future)
│   ├── hooks/            # Custom React hooks (future)
│   └── utils/            # Utility functions (future)
└── assets/               # Images, fonts, icons

```

## 🎨 Features

### Phase 1: MVP (Current)
- ✅ **Home Dashboard** - Unified view of emails, calendar, tasks
- ✅ **Inbox Triage** - AI-powered categorization (Important, Actionable, FYI)
- ✅ **Tasks Management** - Status tracking with progress bars
- ✅ **Calendar View** - Today's schedule with event cards
- ✅ **AI Chat Interface** - Conversational assistant UI
- ✅ **Settings** - Theme switcher, persona selection, voice toggle
- ✅ **Dark/Light Theme** - System-aware theming with amber accent
- ✅ **State Management** - Zustand with AsyncStorage persistence

### Phase 2: Backend & AI ✅ (COMPLETED)
- ✅ Gmail API integration (OAuth2, email fetching, sending)
- ✅ Google Calendar API integration (events, scheduling)
- ✅ OpenAI GPT-4 orchestration engine
- ✅ Google Gemini AI integration
- ✅ Agentic AI workflow system
- 🔄 Voice assistant (Vapi/ElevenLabs) - UI framework ready
- ✅ Vector semantic memory (Pinecone RAG)

### Phase 3: Production & Scaling (COMPLETED)
- ✅ Docker containerization with multi-stage builds
- ✅ Nginx load balancing with SSL termination
- ✅ Production deployment scripts & automation
- ✅ Monitoring, health checks & scaling strategies
- ✅ Security hardening (CSP, rate limiting, security headers)
- 🔄 Plugin SDK (Next phase)
- 🔄 Notion/GitHub/Slack plugins (Next phase)
- 🔄 Expo EAS build (Next phase)
- 🔄 Google Play Store release (Next phase)

## 🎨 Design System

### Color Palette
- **Accent**: Amber (#FFB945, #FFA21A, #FF8C00)
- **Gray Scale**: 50-900 (10 shades)
- **Semantic**: Success (Green), Warning (Amber), Danger (Red)

### Theme Tokens
```typescript
{
  background, surface, surfaceElevated,
  border, overlay,
  accent, accentMuted,
  textPrimary, textSecondary, textMuted,
  success, warning, danger
}
```

## 🧠 AI Capabilities (Planned)

### Agent Orchestration
- Codex GPT-5 for workflow orchestration
- Hybrid routing with OpenAI AgentKit + Gemini ADK
- Semantic memory with Pinecone
- Explainable actions with traceable logic

### Voice Assistant
- Real-time voice input/output via Vapi or ElevenLabs
- Voice-triggered actions
- Fallback to text if voice fails

## 🔐 Privacy & Security

- Encrypted local storage (Expo SecureStore)
- User-controlled data retention
- Optional E2E encryption
- SOC2/GDPR-ready architecture (planned)

## 📊 Tech Stack

### Frontend
- **Framework**: React Native 19.1.0
- **Runtime**: Expo ~54.0
- **Language**: TypeScript 5.9
- **Routing**: Expo Router 6.0
- **State**: Zustand 5.0
- **Icons**: Lucide React Native
- **Animations**: React Native Reanimated 4.1

### Backend (Planned)
- **API**: Node.js + Express / FastAPI
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Vectors**: Pinecone
- **Queue**: Bull / Celery

## 🛠️ Development

### Code Structure Guidelines
- Use TypeScript strict mode
- Follow Expo Router file-based routing
- Use Zustand for global state
- Apply theme tokens for all colors
- Create reusable components in `src/components/`

### Running Tests (Future)
```bash
npm test
```

### Building for Production (Future)
```bash
eas build --platform android --profile production
```

## 📈 Roadmap

### Week 1-4: MVP ✅
- [x] Project setup and architecture
- [x] Design system and theming
- [x] Navigation structure
- [x] Core UI screens
- [x] State management
- [x] Local persistence

### Week 5-8: Backend & AI
- [ ] Backend microservices setup
- [ ] Database schema
- [ ] API endpoints
- [ ] Codex GPT-5 integration
- [ ] Gmail/Calendar API integration
- [ ] Voice assistant integration

### Week 9-12: Plugins & Production
- [ ] Plugin SDK
- [ ] Built-in plugins (Notion, GitHub, Slack)
- [ ] Testing & QA
- [ ] CI/CD pipeline
- [ ] Production deployment

## 🤝 Contributing

This is a private project. For questions or suggestions, contact the project owner.

## 📄 License

Private - All rights reserved

## 👤 Author

**Yadu Krishnan KS**

---

**Martin++** - Privacy-first AI assistant for the modern professional.

# Martin++ - AI-Powered Personal Assistant

[![Version](https://img.shields.io/badge/version-2.3.0-blue.svg)](https://github.com/martin-plus-plus)
[![React Native](https://img.shields.io/badge/React%20Native-0.74.5-blue.svg)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)

> **Martin++** is your intelligent personal assistant that transforms how you manage emails, calendar, tasks, and conversations. Using advanced AI with OpenAI GPT-4, Google Gemini, and voice capabilities, Martin++ acts as your proactive productivity partner.

## 🌟 Key Features

### 🤖 **AI-Powered Intelligence**
- **Conversational AI**: Natural chat with multi-model ensemble (OpenAI + Gemini)
- **Memory System**: Pinecone vector database for contextual conversations
- **Personality Engine**: Adaptive responses based on your communication style

### 📧 **Smart Email Management**
- **Real Gmail Integration**: OAuth2 connection for complete inbox access
- **AI Email Triage**: Automatic categorization (Important, Actionable, FYI)
- **Smart Reply Drafting**: Context-aware email responses
- **Task Auto-Creation**: Extracts commitments from emails

### 📅 **Intelligent Calendar**
- **Google Calendar Integration**: Bidirectional sync with event management
- **AI Scheduling**: Conflict resolution and optimal time suggestions
- **Meeting Intelligence**: Attendee analysis and meeting prep suggestions

### 🗣️ **Voice Conversations**
- **Press-to-Talk**: Natural voice input with real-time transcription
- **ElevenLabs Synthesis**: High-quality voice responses with personality
- **Multi-Language Support**: Voice conversations in multiple languages
- **Interrupt Handling**: Natural conversation flow management

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and **npm**
- **PostgreSQL** (recommended: [Neon](https://neon.tech))
- **Git** for version control
- **Expo CLI** for mobile development

### Environment Setup

```bash
# Clone the repository
git clone https://github.com/your-org/martin-plus-plus.git
cd martin-plus-plus

# Backend setup
cd backend
cp .env.example .env  # Configure your API keys
npm install
npm run build

# Mobile app setup
cd ..
npm install
npx expo install
```

### First Run

```bash
# Start the backend
cd backend
npm start

# Start the mobile app (separate terminal)
npx expo start
```

### Initial Configuration

1. **API Keys Setup** (see Configuration Guide)
2. **Database Connection** (PostgreSQL recommended)
3. **Mobile App Testing** (iOS Simulator/Android Emulator)
4. **Gmail OAuth** (Google Cloud Console setup)

## 📱 Application Overview

### Core Screens
- **🗂️ Inbox**: AI-powered email triage and management
- **✅ Tasks**: Automatic task creation from emails
- **📅 Calendar**: Intelligent scheduling and meeting management
- **💬 Chat**: Conversational AI with voice support

### Mobile Features
- **Themes**: Light/dark mode with system preference detection
- **Voice Control**: Hands-free conversation
- **Workflow Automation**: Email-to-task conversion
- **Offline Capability**: Core functionality works offline

## 🏗️ Architecture

### Backend (Node.js/TypeScript)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Pg library
- **Authentication**: JWT with refresh tokens
- **AI Integration**: OpenAI API, Google Gemini, Pinecone
- **External APIs**: Gmail API, Calendar API, Voice APIs

### Mobile (React Native/Expo)
- **Framework**: React Native with Expo
- **State Management**: Zustand with persistence
- **Navigation**: Expo Router with typed routes
- **UI Library**: Native components with theme engine

### Database Schema
- **11 Tables**: Users, Emails, Tasks, Events, Chat, Memory, etc.
- **UUID Primary Keys**: For scalability and security
- **Relationships**: Foreign keys and junction tables
- **Indexes**: Optimized for AI query performance

## 🔐 Security & Privacy

### Data Protection
- **End-to-End Encryption**: Sensitive data encrypted at rest
- **OAuth2 Security**: Secure third-party API access
- **JWT Tokens**: Secure authentication with expiration
- **Database Encryption**: PostgreSQL with encrypted fields

### User Privacy
- **Data Ownership**: Your data remains yours
- **Minimum Collection**: Only essential data for functionality
- **Transparent Usage**: Clear data processing policies
- **GDPR Compliance**: European privacy regulations supported

## 🚀 Production Deployment

### Backend Deployment
```bash
# Docker deployment (recommended)
docker build -t martin-backend .
docker run -p 3000:3000 martin-backend
```

### Mobile App Deployment
```bash
# iOS App Store
npx expo build:ios
expo submit --platform ios

# Android Play Store
npx expo build:android
expo submit --platform android
```

### Cloud Infrastructure
- **Recommended**: Vercel + Neon Database
- **Scaling**: Auto-scaling with Redis cache
- **Monitoring**: Winston logging with analytics

## 📚 Documentation Index

- [**Configuration Guide**](CONFIGURATION_GUIDE.md) - API setup and environment variables
- [**Development Guide**](DEVELOPMENT_GUIDE.md) - Local development workflow
- [**User Guide**](USER_GUIDE.md) - How to use Martin++ effectively
- [**Testing & Debugging**](TESTING_DEBUGGING.md) - QA and troubleshooting
- [**API Documentation**](API_REFERENCE.md) - Backend API specifications

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](../.github/CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and test thoroughly
4. Submit a pull request with detailed description

## 📄 License

Licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/martin-plus-plus/issues)
- **Discussions**: [GitHub Discussions](https://github.com/martin-plus-plus/discussions)
- **Email**: support@martin.plus

---

**Martin++ transforms your digital workflow into an intelligent, proactive productivity system. Experience the future of personal assistance today!** 🚀

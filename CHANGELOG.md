# Changelog

All notable changes to Martin++ will be documented in this file.

## [1.0.0] - 2025-01-20

### Added - Phase 1 MVP

#### Core Features
- **Home Dashboard** with unified view of inbox, calendar, tasks, and automations
- **Inbox Triage** screen with AI categorization (Important, Actionable, FYI)
- **Tasks Management** with status filters and progress tracking
- **Calendar View** showing today's schedule
- **AI Chat Interface** with conversational UI
- **Settings** screen with theme, persona, and voice controls

#### Design System
- Dark/Light theme support with system preference detection
- Amber accent color palette (#FFB945)
- 10-shade gray scale
- Consistent spacing and typography
- Smooth animations and transitions

#### Architecture
- Expo Router for file-based navigation
- Zustand state management with AsyncStorage persistence
- TypeScript with strict mode
- Reusable component library
- Mock data layer

#### Documentation
- Complete README with project overview
- Getting Started guide
- Development guide with best practices
- Backend architecture documentation
- Plugin SDK documentation
- Project summary

#### Developer Experience
- VS Code configuration
- ESLint and Prettier setup
- TypeScript path aliases
- Environment variables template
- Git ignore configuration

### Technical Details
- React 19.1.0
- React Native 0.81.4
- Expo ~54.0.13
- TypeScript 5.9.2
- Zustand 5.0.8

---

## [Unreleased] - Phase 2

### Planned
- Backend API integration
- Gmail API connection
- Google Calendar API connection
- Codex GPT-5 orchestration
- OpenAI AgentKit integration
- Google Gemini ADK integration
- Voice assistant (Vapi/ElevenLabs)
- Semantic memory (Pinecone)
- Real-time data sync
- Push notifications

---

## [Unreleased] - Phase 3

### Planned
- Plugin SDK implementation
- Notion plugin
- GitHub plugin
- Slack plugin
- Jira plugin
- CI/CD pipeline
- Expo EAS build
- Google Play Store release
- Analytics integration
- Crash reporting

---

## Version History

- **1.0.0** - Phase 1 MVP Complete (2025-01-20)
- **0.1.0** - Initial project setup (2025-01-20)
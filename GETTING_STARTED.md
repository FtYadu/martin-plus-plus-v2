# Getting Started with Martin++

Welcome to Martin++! This guide will help you get the app running on your machine.

## 🚀 Quick Start (5 minutes)

### Step 1: Install Dependencies
```bash
cd martin-plus-plus-v2
npm install
```

### Step 2: Start Development Server
```bash
npm start
```

### Step 3: Run on Your Device

**Option A: Android Emulator**
```bash
npm run android
```

**Option B: Physical Device**
1. Install Expo Go app from Play Store
2. Scan QR code from terminal

**Option C: Web Browser**
```bash
npm run web
```

## 📱 What You'll See

### Home Dashboard
- **Quick Actions**: Reply, Schedule, Summary, Voice
- **Inbox Pulse**: AI-triaged emails (Important, Actionable, FYI)
- **Upcoming Schedule**: Today's calendar events
- **Focus Tasks**: High-priority tasks with progress bars
- **Latest Automations**: Recent AI actions with confidence scores

### Inbox Screen
- Filter emails by category
- View sender, subject, and preview
- See draft reply status

### Tasks Screen
- Filter by status (All, Pending, In Progress, Completed)
- View priority badges
- Track progress with visual bars
- See task sources

### Calendar Screen
- Today's schedule view
- Event times and attendees
- Location information
- Placeholder for full calendar (coming soon)

### Chat Screen
- Conversational AI interface
- Quick reply suggestions
- Voice input button (if enabled)
- Message history

### Settings Screen
- **Theme**: System, Dark, or Light mode
- **Persona**: Adaptive, Formal, Casual, or Concise
- **Voice**: Enable/disable real-time voice
- **About**: Version and build info

## 🎨 Try These Features

### 1. Switch Themes
1. Go to Settings tab
2. Tap on Dark/Light/System
3. See instant theme change

### 2. Change Persona
1. Go to Settings tab
2. Select a persona style
3. This will affect AI responses (when backend is connected)

### 3. Filter Inbox
1. Go to Inbox tab
2. Tap filter buttons (All, Important, Actionable, FYI)
3. See filtered results

### 4. Filter Tasks
1. Go to Tasks tab
2. Tap status filters
3. View tasks by status

### 5. Enable Voice
1. Go to Settings tab
2. Toggle "Real-time Voice"
3. Voice button appears in Chat

## 🔧 Current Status

### ✅ Completed (Phase 1 MVP)
- All 6 screens implemented
- Dark/Light theme system
- State management with Zustand
- Mock data for all features
- Smooth navigation
- Responsive design

### 🔄 In Progress (Phase 2)
- Backend API integration
- Gmail/Calendar sync
- AI orchestration (Codex GPT-5)
- Voice assistant (Vapi/ElevenLabs)
- Real data fetching

### 📋 Planned (Phase 3)
- Plugin system
- Notion/GitHub/Slack integrations
- Production deployment
- App store release

## 📚 Next Steps

### For Developers
1. Read `docs/DEVELOPMENT_GUIDE.md`
2. Explore `docs/BACKEND_ARCHITECTURE.md`
3. Check `docs/PLUGIN_SDK.md` for plugin development

### For Testing
1. Try all navigation tabs
2. Test theme switching
3. Interact with filters
4. Check responsive behavior

### For Contributing
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit pull request

## 🐛 Troubleshooting

### Metro Bundler Issues
```bash
npx expo start -c
```

### Dependency Issues
```bash
rm -rf node_modules
npm install
```

### Android Build Issues
```bash
cd android
./gradlew clean
cd ..
```

## 📞 Need Help?

- Check `README.md` for detailed info
- Read documentation in `docs/` folder
- Contact project owner

## 🎯 Key Features to Explore

1. **Unified Dashboard**: See everything in one place
2. **Smart Filtering**: Find what matters quickly
3. **Progress Tracking**: Visual task completion
4. **Theme System**: Beautiful dark/light modes
5. **Persona Selection**: Customize AI behavior
6. **Voice Ready**: UI prepared for voice integration

## 💡 Tips

- Use **System** theme to match your device
- Try **Adaptive** persona for best results
- Enable **Voice** to see voice UI elements
- All data is currently **mock data**
- Settings are **persisted** across sessions

---

**Enjoy exploring Martin++!** 🚀

The future of intelligent assistance is here.
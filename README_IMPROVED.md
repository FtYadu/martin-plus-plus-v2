# Martin++ v2 - Improved Application

## Overview

This is the improved version of Martin++ with a modern ChatGPT-like interface, enhanced backend, and voice agent integration using Layercode.

## What's New

### Frontend Improvements
- **Modern Next.js Interface**: Converted from React Native to Next.js web application
- **ChatGPT-like UI**: Clean, modern chat interface with streaming responses
- **Voice Input Support**: Integrated browser speech recognition with Layercode voice agent support
- **Responsive Design**: Beautiful gradient design with Tailwind CSS
- **Real-time Streaming**: Messages stream in real-time for better user experience

### Backend Improvements
- **Streaming Support**: Added streaming endpoint for real-time chat responses
- **Production Configuration**: Integrated .env.production with all necessary API keys
- **Enhanced AI Service**: Updated to use GPT-4 Turbo Preview
- **Better Error Handling**: Improved error handling and logging

### Voice Agent Integration
- **Layercode CLI**: Configured for voice agent support
- **API Key**: Integrated with API key `eblluzi3fouhrwwri7c9tzoz`
- **Voice API Route**: Created `/api/voice-agent` endpoint for Layercode webhook
- **Fallback Support**: Browser speech recognition as fallback

## Project Structure

```
martin-plus-plus-v2-master/
├── backend/                    # Express.js backend
│   ├── src/
│   │   ├── controllers/       # API controllers
│   │   │   └── chat.ts       # Chat controller with streaming
│   │   ├── services/         # Business logic
│   │   │   └── ai.ts         # AI service with OpenAI
│   │   ├── routes/           # API routes
│   │   └── index.ts          # Main server file
│   ├── .env.production       # Production environment variables
│   └── package.json
│
├── frontend/                  # Next.js frontend
│   ├── src/
│   │   └── app/
│   │       ├── api/
│   │       │   └── voice-agent/  # Layercode voice webhook
│   │       ├── components/       # React components
│   │       │   ├── ChatMessage.tsx
│   │       │   ├── VoiceButton.tsx
│   │       │   └── Loader.tsx
│   │       ├── hooks/           # Custom hooks
│   │       │   └── useUIState.ts
│   │       ├── helpers/         # Helper functions
│   │       │   └── api.ts
│   │       ├── page.tsx         # Main chat interface
│   │       ├── layout.tsx       # Root layout
│   │       └── globals.css      # Global styles
│   ├── layercode.config.json    # Layercode configuration
│   ├── .env.local               # Local environment variables
│   └── package.json
│
└── README_IMPROVED.md         # This file
```

## Setup Instructions

### Prerequisites
- Node.js >= 20.9.0
- npm or yarn
- PostgreSQL database (configured in .env.production)

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. The `.env.production` file is already configured with:
   - PostgreSQL database connection
   - OpenAI API key
   - Google OAuth credentials
   - Gemini AI API key
   - Pinecone vector database
   - JWT secrets

4. Build the backend:
   ```bash
   npm run build
   ```

5. Start the backend:
   ```bash
   npm start
   ```
   
   Or for development:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:8080`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update `.env.local` if needed:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8080
   LAYERCODE_API_KEY=eblluzi3fouhrwwri7c9tzoz
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:3000`

## Features

### Chat Interface
- **Real-time Streaming**: Messages appear as they're generated
- **Message History**: Conversation history is maintained
- **Clear Chat**: Button to clear conversation and start fresh
- **Suggested Prompts**: Quick-start suggestions for new users

### Voice Features
- **Browser Speech Recognition**: Built-in voice input using Web Speech API
- **Layercode Integration**: Ready for Layercode voice agent deployment
- **Voice API Endpoint**: `/api/voice-agent` for webhook integration
- **Visual Feedback**: Animated microphone button shows listening state

### AI Capabilities
- **GPT-4 Turbo**: Powered by OpenAI's latest model
- **Context Awareness**: Maintains conversation context
- **Streaming Responses**: Real-time response generation
- **Error Handling**: Graceful fallbacks for API errors

## Layercode Voice Agent Setup

### Configuration
The Layercode configuration is in `frontend/layercode.config.json`:

```json
{
  "layercode_api_key": "eblluzi3fouhrwwri7c9tzoz",
  "prompt": "You are Martin++, an intelligent personal AI assistant...",
  "welcome_message": "Hello! I'm Martin++, your AI assistant..."
}
```

### Webhook Setup
1. Deploy the frontend to a public URL (Vercel, Cloudflare, etc.)
2. Go to Layercode Dashboard: https://dash.layercode.com
3. Configure webhook URL: `https://your-domain.com/api/voice-agent`
4. The voice agent will send transcripts to this endpoint
5. Martin++ backend will process and respond

### Local Development with Tunnel
For local testing with Layercode:

```bash
npx @layercode/cli tunnel --agent=YOUR_AGENT_ID --port=3000 --path=/api/voice-agent --tail
```

## API Endpoints

### Backend Endpoints

#### Chat
- `POST /api/v1/chat/message` - Send message (non-streaming)
- `POST /api/v1/chat/stream` - Send message (streaming)
- `GET /api/v1/chat/history` - Get chat history

#### Auth
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/google` - Google OAuth

#### Other Features
- Inbox management
- Calendar integration
- Task management
- Assistant features

### Frontend Endpoints

#### Voice Agent
- `POST /api/voice-agent` - Layercode webhook endpoint
- `GET /api/voice-agent` - Health check

## Environment Variables

### Backend (.env.production)
```env
NODE_ENV=production
PORT=8080
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-proj-...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GEMINI_API_KEY=...
PINECONE_API_KEY=...
JWT_SECRET=...
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
LAYERCODE_API_KEY=eblluzi3fouhrwwri7c9tzoz
MARTIN_AUTH_TOKEN=
```

## Deployment

### Frontend Deployment (Recommended: Vercel)

1. Push code to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

Or use Cloudflare Pages:
```bash
npm run build
npx wrangler pages deploy .next
```

### Backend Deployment

The backend can be deployed to:
- Heroku
- Railway
- Render
- AWS/GCP/Azure
- DigitalOcean

Make sure to:
1. Set all environment variables
2. Configure PostgreSQL database
3. Update CORS settings for production domain

### Update Layercode Webhook

After deployment, update the webhook URL in Layercode dashboard:
```
https://your-production-domain.com/api/voice-agent
```

## Demo Mode

The application includes a demo mode that works without authentication:
- Shows simulated responses
- Demonstrates the interface
- Guides users to log in for full features

## Troubleshooting

### Backend Issues
- Check PostgreSQL connection in .env.production
- Verify OpenAI API key is valid
- Check logs for detailed error messages

### Frontend Issues
- Ensure backend is running on correct port
- Check browser console for errors
- Verify NEXT_PUBLIC_API_URL is correct

### Voice Issues
- Check browser supports Web Speech API
- Verify Layercode webhook is configured
- Test voice endpoint: `GET /api/voice-agent`

## Technologies Used

### Frontend
- Next.js 15.2.4
- React 19
- TypeScript 5
- Tailwind CSS 4
- Web Speech API

### Backend
- Express.js 5
- TypeScript
- PostgreSQL
- OpenAI GPT-4
- Google Gemini AI
- Pinecone Vector DB

### Voice
- Layercode Voice Agent
- Web Speech API (fallback)

## Credits

- Original Martin++ application
- ChatGPT template by thesysdev
- Layercode voice agent platform
- OpenAI GPT-4

## License

See LICENSE file for details.

## Support

For issues or questions:
1. Check this README
2. Review backend logs
3. Check browser console
4. Verify all API keys are valid
5. Ensure all services are running

---

**Built with ❤️ for intelligent personal assistance**


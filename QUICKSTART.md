# Martin++ v2 - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js >= 20.9.0
- npm or yarn

### Quick Setup

1. **Run the deployment script:**
   ```bash
   ./deploy-improved.sh
   ```

2. **Start the backend (Terminal 1):**
   ```bash
   cd backend
   npm start
   ```
   Backend will be available at `http://localhost:8080`

3. **Start the frontend (Terminal 2):**
   ```bash
   cd frontend
   npm start
   ```
   Frontend will be available at `http://localhost:3000`

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## ✨ Features

### Chat Interface
- Modern ChatGPT-like UI
- Real-time streaming responses
- Message history
- Suggested prompts
- Clear chat functionality

### Voice Input
- Browser-based speech recognition
- Visual feedback during listening
- Layercode voice agent integration ready

### AI Capabilities
- Powered by GPT-4 Turbo
- Context-aware conversations
- Streaming responses
- Error handling with fallbacks

## 🎯 Demo Mode

The app includes a demo mode that works without authentication:
- Try the interface without logging in
- See simulated responses
- Understand the features before signing up

## 🔑 API Keys Configured

The following services are pre-configured in `.env.production`:

- ✅ OpenAI GPT-4 Turbo
- ✅ Google OAuth
- ✅ Google Gemini AI
- ✅ Pinecone Vector Database
- ✅ PostgreSQL Database (Neon)
- ✅ Layercode Voice Agent

## 🎤 Voice Agent Setup

### Layercode Configuration
- **API Key:** `eblluzi3fouhrwwri7c9tzoz`
- **Config File:** `frontend/layercode.config.json`
- **Webhook Endpoint:** `/api/voice-agent`

### To Enable Voice Agent:

1. Deploy your frontend to a public URL
2. Go to [Layercode Dashboard](https://dash.layercode.com)
3. Create or select your agent
4. Configure webhook URL: `https://your-domain.com/api/voice-agent`
5. Test the voice features

### Local Testing with Tunnel:
```bash
npx @layercode/cli tunnel --agent=YOUR_AGENT_ID --port=3000 --path=/api/voice-agent --tail
```

## 📁 Project Structure

```
martin-plus-plus-v2-master/
├── backend/              # Express.js API server
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic
│   │   ├── routes/       # API routes
│   │   └── index.ts      # Server entry point
│   └── .env             # Environment variables
│
├── frontend/            # Next.js web app
│   ├── src/app/
│   │   ├── api/         # API routes
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom hooks
│   │   └── page.tsx     # Main page
│   └── .env.local       # Frontend env vars
│
└── README_IMPROVED.md   # Full documentation
```

## 🔧 Configuration

### Backend Environment Variables
Located in `backend/.env`:
- `PORT=8080` - Backend server port
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key
- `JWT_SECRET` - Authentication secret

### Frontend Environment Variables
Located in `frontend/.env.local`:
- `NEXT_PUBLIC_API_URL=http://localhost:8080` - Backend URL
- `LAYERCODE_API_KEY` - Layercode API key

## 🌐 Deployment

### Frontend (Vercel - Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Backend (Railway/Heroku/Render)
1. Connect your repository
2. Set environment variables
3. Deploy
4. Update `NEXT_PUBLIC_API_URL` in frontend

### Update Layercode Webhook
After deployment, update webhook in Layercode dashboard:
```
https://your-production-domain.com/api/voice-agent
```

## 🐛 Troubleshooting

### Backend won't start
- Check if `.env` file exists in backend directory
- Verify PostgreSQL connection string
- Check if port 8080 is available

### Frontend won't start
- Check if backend is running
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check if port 3000 is available

### Voice input not working
- Check browser compatibility (Chrome/Edge recommended)
- Allow microphone permissions
- Verify Layercode webhook is configured

## 📚 Learn More

- [Full Documentation](README_IMPROVED.md)
- [Layercode Docs](https://layercode.mintlify.app/)
- [Next.js Docs](https://nextjs.org/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)

## 💡 Tips

1. **Development Mode:** Use `npm run dev` for hot-reloading
2. **Production Mode:** Use `npm start` after `npm run build`
3. **Logs:** Check console output for debugging
4. **API Testing:** Use `/health` endpoint to verify backend

## 🎨 Customization

### Change AI Prompt
Edit `backend/src/services/ai.ts` to customize AI behavior

### Modify UI
Edit `frontend/src/app/page.tsx` for interface changes

### Add Features
- Backend: Add routes in `backend/src/routes/`
- Frontend: Add components in `frontend/src/app/components/`

## 🤝 Support

For issues:
1. Check this guide
2. Review logs (backend and frontend)
3. Verify all environment variables
4. Check API key validity

---

**Ready to build amazing AI experiences! 🚀**


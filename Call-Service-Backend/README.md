# Colonial Call Service Backend

Backend service for Colonial First State AI-powered calling system using **11Labs Conversational AI**.

## 🎯 Features

- **Real-time WebSocket server** for client connections
- **11Labs Conversational AI integration** with automatic STT/TTS
- **Supabase database** for call sessions, transcripts, and draft data
- **Draft beneficiary collection** with progressive field extraction
- **2FA integration** ready
- **Transcript storage** for compliance and review

## 📋 Prerequisites

- Node.js 18+ installed
- 11Labs account with Conversational AI agent created
- Supabase project with tables set up
- Git for version control

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
copy .env.example .env
```

Required environment variables:
- `ELEVENLABS_API_KEY` - Your 11Labs API key
- `ELEVENLABS_AGENT_ID` - Your 11Labs agent ID
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_KEY` - Your Supabase service role key
- `PORT` - Server port (default: 3001)
- `FRONTEND_URL` - Your frontend URL for CORS

### 3. Run Development Server

```bash
npm run dev
```

Server will start on http://localhost:3001

### 4. Test Health Endpoint

```bash
curl http://localhost:3001/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "service": "Colonial Call Service Backend",
  "version": "1.0.0"
}
```

## 📁 Project Structure

```
Call-Service-Backend/
├── src/
│   ├── server.js              # Main WebSocket server
│   └── services/
│       ├── elevenLabs.js      # 11Labs agent connection
│       └── database.js        # Supabase client
├── .env                       # Environment variables (not in git)
├── .env.example               # Template for environment variables
├── .gitignore                 # Git ignore rules
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## 🌐 Deployment

### Option 1: Railway (Recommended)

1. Push code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/colonial-backend.git
   git push -u origin main
   ```

2. Go to [railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub"
4. Select your repository
5. Add environment variables in Railway dashboard
6. Deploy ✅

Railway will give you a URL like: `https://your-app.railway.app`

### Option 2: Google Cloud Platform

1. Install gcloud CLI:
   ```bash
   # Download from: https://cloud.google.com/sdk/docs/install
   ```

2. Create `app.yaml`:
   ```yaml
   runtime: nodejs18
   env_variables:
     ELEVENLABS_API_KEY: "your_key"
     ELEVENLABS_AGENT_ID: "your_agent_id"
     SUPABASE_URL: "your_url"
     SUPABASE_SERVICE_KEY: "your_key"
     FRONTEND_URL: "https://your-frontend.vercel.app"
   ```

3. Deploy:
   ```bash
   gcloud init
   gcloud app deploy
   ```

GCP will give you a URL like: `https://your-project.appspot.com`

## 🔧 Update Frontend

After deploying backend, update your frontend `.env.production`:

```env
VITE_WEBSOCKET_URL=wss://your-backend.railway.app
VITE_DEV_MODE=false
```

Then deploy frontend:
```bash
cd ../Demo
npm run build
vercel --prod
```

## 📊 How It Works

### Connection Flow

```
1. Client (Browser) connects to backend WebSocket
   → ws://localhost:3001?session_id=abc-123

2. Backend connects to 11Labs Conversational AI
   → wss://api.elevenlabs.io/v1/convai/conversation

3. Audio flows bidirectionally:
   Client → Backend → 11Labs (user speech)
   11Labs → Backend → Client (AI response)

4. Backend saves transcripts and extracted data to Supabase
```

### Message Types

**From Client:**
- `call_accepted` - User accepted the call
- `call_ended` - User ended the call
- Binary audio data - User's voice

**From 11Labs Agent:**
- `audio` - AI voice response
- `transcript` - Speech-to-text result
- `extracted_data` - Structured data from conversation
- `conversation_end` - Agent ended conversation

**To Client:**
- `audio_stream` - AI voice to play
- `transcript_update` - Text of what was said
- `field_extracted` - Beneficiary field collected
- `status_change` - Call status update
- `error` - Error message

## 🧪 Testing

### Test WebSocket Connection

```bash
# Install wscat
npm install -g wscat

# Connect to backend
wscat -c ws://localhost:3001?session_id=test-123
```

### View Logs

Development logs appear in console. In production:

**Railway:**
- Dashboard → Your Service → "Logs" tab

**Google Cloud:**
```bash
gcloud app logs tail -s default
```

## 🔐 Security

- **API Keys**: Never commit `.env` file
- **Service Key**: Backend uses Supabase service key (has full access)
- **CORS**: Configured to only accept requests from your frontend
- **WSS**: Use `wss://` (secure WebSocket) in production

## 🐛 Troubleshooting

**Issue**: "Missing Supabase configuration"
- **Fix**: Ensure `.env` has `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`

**Issue**: "11Labs connection failed"
- **Fix**: Verify `ELEVENLABS_API_KEY` and `ELEVENLABS_AGENT_ID` are correct

**Issue**: "CORS error from frontend"
- **Fix**: Update `FRONTEND_URL` in `.env` to match your frontend domain

**Issue**: "WebSocket connection refused"
- **Fix**: Check that backend server is running and PORT is correct

## 📚 Resources

- [11Labs Conversational AI Docs](https://elevenlabs.io/docs/conversational-ai)
- [Supabase Documentation](https://supabase.com/docs)
- [Railway Deployment Guide](https://docs.railway.app/)
- [WebSocket Protocol](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

## 📝 License

MIT License - Colonial First State

## 🤝 Support

For issues or questions, contact the development team.

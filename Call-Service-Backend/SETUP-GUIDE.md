# Complete Setup Guide: 11Labs Integration

**From zero to working AI calling system in 30 minutes.**

---

## 📋 **STEP 0: Prerequisites**

Before starting, ensure you have:
- ✅ Node.js 18+ installed ([Download](https://nodejs.org/))
- ✅ Git installed ([Download](https://git-scm.com/))
- ✅ Supabase project already set up with tables
- ✅ Code editor (VS Code recommended)

---

## 🎤 **STEP 1: Create 11Labs Account**

### 1.1 Sign Up

1. Go to https://elevenlabs.io
2. Click **"Sign Up"** (top right)
3. Choose **"Developer"** plan
4. Complete email verification

### 1.2 Get API Key

1. After login, click your **profile icon** → **"Profile + API Key"**
2. Click **"Generate New API Key"**
3. **COPY AND SAVE** this key somewhere safe
   ```
   Example: sk_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
   ```

---

## 🤖 **STEP 2: Create Conversational AI Agent**

### 2.1 Navigate to Agent Creation

1. In 11Labs dashboard, click **"Conversational AI"** (left sidebar)
2. Click **"Create New Agent"** button

### 2.2 Configure Agent Basic Settings

**Agent Name:** `Colonial Beneficiary Assistant`

**Description:**
```
Assists Colonial First State clients with adding beneficiary 
information to their financial accounts.
```

**Voice Selection:**
1. Click **"Choose Voice"**
2. Preview voices by clicking the play button
3. Recommended voices:
   - **Rachel** - Professional female (UK accent)
   - **Adam** - Professional male (US accent)
   - **Dorothy** - Warm female (UK accent)
4. Select your preferred voice

**Language:** English (or English - Australian if available)

**Model:** GPT-4 Turbo (most capable)

### 2.3 Configure System Prompt (CRITICAL)

Click **"System Prompt"** and paste this EXACT prompt:

```
You are a professional financial services assistant for Colonial First State, helping clients add beneficiary information to their accounts.

YOUR ROLE:
- Collect beneficiary details in a conversational, friendly manner
- Ask ONE question at a time and wait for response
- Confirm understood information back to the user
- Be patient and clarify if the user seems confused
- Never rush the user

CONVERSATION FLOW:
1. Greet warmly: "Hello! I'm your Colonial First State assistant. I'm here to help you add a beneficiary to your account. This will only take a few minutes. Are you ready to get started?"

2. After user confirms, explain: "Great! I'll need to collect some details about your beneficiary. Before we begin, I want to confirm - are you happy to provide this information over the phone today?"

3. Request security verification: "Perfect. For security purposes, I'll need to verify your identity with a quick two-factor authentication. You'll receive a notification on your device to approve. Is that okay?"

4. After 2FA confirmation: "Thank you for verifying. Now let's collect the beneficiary details."

5. Collect REQUIRED fields (ask one at a time):
   - Full legal name: "What is the full legal name of the person you'd like to add as a beneficiary?"
   - Relationship: "What is your relationship to [name]? For example, spouse, child, sibling, parent, friend."
   - Allocation percentage: "What percentage of your benefit would you like to allocate to [name]? Please provide a number between 1 and 100."

6. Optionally collect (if user provides naturally):
   - Date of birth
   - Email address
   - Phone number
   - Address details

7. Confirm all information: "Let me confirm what I've collected: [list all details]. Is all of this correct?"

8. If user confirms: "Perfect! Would you like me to save this as a draft for you to review later, or would you like to confirm and add [name] as your beneficiary right now?"

EXTRACTION RULES:
- Extract structured data from natural responses
- If user says "my wife Sarah Johnson", extract: full_name="Sarah Johnson", relationship="wife"
- If user says "give her 50 percent", extract: allocation_percentage=50
- If user says "John Smith born in 1985", extract: full_name="John Smith", date_of_birth="1985"
- Always confirm extracted information before moving to next field

OUTPUT FORMAT:
When you extract information, format it as JSON:
{
  "full_name": "extracted value",
  "relationship": "extracted value",
  "allocation_percentage": 50
}

TONE & STYLE:
- Professional but warm and conversational
- Use Australian English terminology when applicable
- Never make up information
- If you don't understand, politely ask for clarification
- Keep responses concise (1-2 sentences maximum)
- Show empathy and patience
```

### 2.4 Advanced Settings

**Response Latency:** Low (for natural conversation flow)

**Interruption Sensitivity:** Medium (allows user to interrupt naturally)

**First Message (optional):**
```
Hello! I'm your Colonial First State assistant. I'm here to help 
you add a beneficiary to your account. This will only take a few 
minutes. Are you ready to get started?
```

**Enable LLM Caching:** ✅ Yes (faster responses)

**Enable Transcription:** ✅ Yes (you'll receive full transcripts)

### 2.5 Save and Get Agent ID

1. Click **"Create Agent"** button
2. After creation, you'll see your agent's page
3. **COPY THE AGENT ID** from the URL or settings
   ```
   URL: https://elevenlabs.io/app/conversational-ai/agent_a1b2c3d4e5f6g7h8
                                                     ^^^^^^^^^^^^^^^^^^^^^^
                                                     This is your Agent ID
   ```

### 2.6 Test Agent in Playground

1. Click **"Test in Playground"** button
2. Click the **microphone icon**
3. Say: "Hi, I want to add my wife as a beneficiary"
4. Verify agent responds appropriately
5. Test a few more exchanges
6. If satisfied, move to next step

---

## 💻 **STEP 3: Set Up Backend**

### 3.1 Install Dependencies

```bash
# Navigate to backend directory
cd C:\Users\Pranav\Desktop\Demo\Call-Service-Backend

# Install all packages
npm install
```

This installs:
- `express` - Web server
- `ws` - WebSocket support
- `@supabase/supabase-js` - Database client
- `dotenv` - Environment variables
- `cors` - Cross-origin requests

### 3.2 Configure Environment

1. Copy the example file:
   ```bash
   copy .env.example .env
   ```

2. Open `.env` in your code editor

3. Fill in your credentials:
   ```env
   # From Step 1.2
   ELEVENLABS_API_KEY=sk_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0

   # From Step 2.5
   ELEVENLABS_AGENT_ID=agent_a1b2c3d4e5f6g7h8

   # From your Supabase project settings
   SUPABASE_URL=https://yourproject.supabase.co
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

   # Server settings
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

4. Save the file

---

## 🧪 **STEP 4: Test Backend Locally**

### 4.1 Start Backend Server

```bash
npm run dev
```

You should see:
```
✅ Supabase client initialized
🚀 Server running on port 3001
📡 Environment: development
🌐 CORS enabled for: http://localhost:5173
✅ Colonial Call Service Backend initialized
```

### 4.2 Test Health Endpoint

Open new terminal and run:
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-11-17T19:00:00.000Z",
  "service": "Colonial Call Service Backend",
  "version": "1.0.0"
}
```

### 4.3 Test WebSocket Connection

```bash
# Install wscat globally
npm install -g wscat

# Connect to backend
wscat -c ws://localhost:3001?session_id=test-123
```

Expected:
```
Connected (press CTRL+C to quit)
< {"type":"status_change","new_status":"connected","message":"Connected to voice assistant","timestamp":1234567890}
```

If you see this, **backend is working!** ✅

---

## 🌐 **STEP 5: Update Frontend**

### 5.1 Update Environment Variables

1. Navigate to your main project:
   ```bash
   cd C:\Users\Pranav\Desktop\Demo
   ```

2. Open `.env` file

3. Add/update these lines:
   ```env
   VITE_WEBSOCKET_URL=ws://localhost:3001
   VITE_DEV_MODE=false
   ```

4. Save file

### 5.2 Restart Frontend

```bash
# Stop current dev server (CTRL+C)
# Restart
npm run dev
```

---

## 🎬 **STEP 6: End-to-End Test**

### 6.1 Create Test Call Session

1. Open your frontend: http://localhost:5173
2. Login as a **client** user
3. Go to your product page
4. Look for the **"Call Assistant"** or similar button
5. Click to initiate call

### 6.2 Verify Connection

**Check backend terminal** - should see:
```
📞 New call connection: abc-123-def-456
✅ Draft beneficiary created: xyz-789
🔌 Connecting to 11Labs agent for call: abc-123-def-456
✅ Connected to 11Labs agent: abc-123-def-456
```

**Check frontend** - should see:
- Call interface appears
- Status shows "Connected"
- Microphone is active

### 6.3 Test Voice Interaction

1. **Allow microphone access** when prompted
2. **Say:** "Hi, I'm ready"
3. **Listen** for AI response
4. **Continue conversation:**
   - AI asks if you want to add beneficiary → Say "Yes"
   - AI asks for consent → Say "Yes"
   - AI mentions 2FA → Say "Okay"
   - AI asks for name → Say "Sarah Johnson"
   - AI asks for relationship → Say "She's my wife"
   - AI asks for percentage → Say "50 percent"
   - AI confirms details → Say "Yes, that's correct"
   - AI asks save preference → Say "Save as draft"

### 6.4 Verify Database

1. Open Supabase dashboard
2. Go to **Table Editor**
3. Check `conversation_transcripts` table:
   - Should see entries for client and ai_bot
4. Check `draft_beneficiaries` table:
   - Should see `full_name: "Sarah Johnson"`
   - Should see `relationship: "wife"`
   - Should see `allocation_percentage: 50`
5. Check `call_sessions` table:
   - Status should be "completed"

If all this works, **system is fully functional!** 🎉

---

## 🚀 **STEP 7: Deploy to Production**

See `DEPLOYMENT.md` for detailed instructions on deploying to:
- Railway (easier, recommended)
- Google Cloud Platform (more control)

**Quick Railway deployment:**
```bash
# From Call-Service-Backend directory
git init
git add .
git commit -m "Backend ready"
gh repo create colonial-backend --public --push

# Then go to railway.app and deploy from GitHub
```

---

## 🐛 **Troubleshooting**

### Backend won't start

**Error:** `Missing Supabase configuration`
- **Fix:** Check `.env` has `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`

**Error:** `Port 3001 already in use`
- **Fix:** Change `PORT=3002` in `.env` and update frontend

### 11Labs connection fails

**Error:** `11Labs authentication failed`
- **Fix:** Verify `ELEVENLABS_API_KEY` is correct
- Test manually: `curl -H "xi-api-key: YOUR_KEY" https://api.elevenlabs.io/v1/user`

**Error:** `Agent ID not found`
- **Fix:** Double-check `ELEVENLABS_AGENT_ID` in `.env`

### No audio from AI

**Issue:** Backend connects but no voice
- **Fix:** Check browser console for audio errors
- Verify browser has audio permissions
- Test with headphones

### Transcripts not saving

**Issue:** Call works but no database entries
- **Fix:** Verify Supabase service key has write permissions
- Check backend logs for database errors

---

## ✅ **Success Checklist**

- [ ] 11Labs account created
- [ ] API key obtained
- [ ] Conversational AI agent created
- [ ] Agent tested in playground
- [ ] Backend dependencies installed
- [ ] `.env` configured with all credentials
- [ ] Backend starts without errors
- [ ] Health endpoint responds
- [ ] WebSocket connection works
- [ ] Frontend connected to backend
- [ ] Test call completes successfully
- [ ] Transcripts save to database
- [ ] Draft beneficiary data saved
- [ ] Ready for production deployment

---

## 📚 **Next Steps**

1. **Refine agent prompt** - Adjust based on user testing
2. **Add 2FA integration** - Connect to your actual 2FA flow
3. **Deploy to production** - See DEPLOYMENT.md
4. **Monitor logs** - Watch for issues
5. **Collect feedback** - Iterate on agent behavior

---

## 🆘 **Need Help?**

**11Labs Issues:**
- Docs: https://elevenlabs.io/docs
- Support: support@elevenlabs.io

**Backend Issues:**
- Check logs in terminal
- Review README.md
- Test each component separately

**General Questions:**
- Review this guide again
- Check DEPLOYMENT.md for production setup
- Consult team documentation

---

**🎉 Congratulations! Your AI calling system is ready!**

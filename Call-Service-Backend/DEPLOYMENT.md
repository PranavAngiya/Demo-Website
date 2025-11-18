# Deployment Guide

Complete step-by-step deployment instructions for Railway and Google Cloud Platform.

---

## 🚂 Railway Deployment (Easiest)

### Step 1: Prepare Your Code

```bash
# Navigate to backend directory
cd C:\Users\Pranav\Desktop\Demo\Call-Service-Backend

# Initialize git (if not already done)
git init
git add .
git commit -m "Initial backend setup"
```

### Step 2: Create GitHub Repository

```bash
# Create new repo on GitHub (via website or GitHub CLI)
gh repo create colonial-backend --public

# Add remote and push
git remote add origin https://github.com/yourusername/colonial-backend.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Railway

1. Go to https://railway.app
2. Click **"Login"** (use GitHub account)
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose **"colonial-backend"** from your repos
6. Railway will auto-detect Node.js and start deploying

### Step 4: Add Environment Variables

1. In Railway dashboard, click your service
2. Go to **"Variables"** tab
3. Click **"+ New Variable"** and add each:

```
ELEVENLABS_API_KEY = sk_your_elevenlabs_key
ELEVENLABS_AGENT_ID = agent_your_agent_id
SUPABASE_URL = https://yourproject.supabase.co
SUPABASE_SERVICE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT = 3001
NODE_ENV = production
FRONTEND_URL = https://your-frontend.vercel.app
```

4. Click **"Deploy"**

### Step 5: Get Your Backend URL

1. In Railway, go to **"Settings"** tab
2. Scroll to **"Domains"**
3. Click **"Generate Domain"**
4. Copy the URL (e.g., `https://colonial-backend-production-a1b2.railway.app`)

### Step 6: Test Your Deployment

```bash
# Test health endpoint
curl https://your-backend.railway.app/health

# Should return:
# {"status":"ok","timestamp":"...","service":"Colonial Call Service Backend","version":"1.0.0"}
```

### Step 7: Update Frontend

Edit `Demo/.env.production`:
```env
VITE_WEBSOCKET_URL=wss://your-backend.railway.app
VITE_DEV_MODE=false
```

---

## ☁️ Google Cloud Platform Deployment

### Step 1: Install Google Cloud SDK

**Windows:**
1. Download installer: https://cloud.google.com/sdk/docs/install-sdk#windows
2. Run installer
3. Open new terminal and verify:
   ```bash
   gcloud --version
   ```

**Mac/Linux:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init
```

### Step 2: Initialize GCP Project

```bash
# Login to Google Cloud
gcloud auth login

# Create new project (or use existing)
gcloud projects create colonial-backend --name="Colonial Backend"

# Set as active project
gcloud config set project colonial-backend

# Enable required APIs
gcloud services enable appengine.googleapis.com
```

### Step 3: Create app.yaml

Create `app.yaml` in `Call-Service-Backend/`:

```yaml
runtime: nodejs18

env_variables:
  ELEVENLABS_API_KEY: "sk_your_elevenlabs_key"
  ELEVENLABS_AGENT_ID: "agent_your_agent_id"
  SUPABASE_URL: "https://yourproject.supabase.co"
  SUPABASE_SERVICE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  FRONTEND_URL: "https://your-frontend.vercel.app"
  NODE_ENV: "production"

automatic_scaling:
  min_instances: 1
  max_instances: 10
  target_cpu_utilization: 0.65
```

### Step 4: Deploy to App Engine

```bash
# From Call-Service-Backend directory
gcloud app deploy

# Choose region when prompted (e.g., us-central)
# Confirm deployment
```

Deployment takes 5-10 minutes.

### Step 5: Get Your App URL

```bash
gcloud app browse
```

Your URL will be: `https://colonial-backend.appspot.com`

### Step 6: View Logs

```bash
# Stream logs in real-time
gcloud app logs tail -s default

# View recent logs
gcloud app logs read
```

### Step 7: Test Deployment

```bash
curl https://colonial-backend.appspot.com/health
```

### Step 8: Update Frontend

Edit `Demo/.env.production`:
```env
VITE_WEBSOCKET_URL=wss://colonial-backend.appspot.com
VITE_DEV_MODE=false
```

---

## 🔧 Post-Deployment Configuration

### Update Frontend CORS

If you get CORS errors, ensure backend `.env` has correct frontend URL:

**Railway:**
1. Dashboard → Variables
2. Update `FRONTEND_URL` to your Vercel URL
3. Redeploy

**GCP:**
1. Edit `app.yaml`
2. Update `FRONTEND_URL`
3. Run `gcloud app deploy` again

### Test WebSocket Connection

```bash
# Install wscat
npm install -g wscat

# Test Railway
wscat -c wss://your-backend.railway.app?session_id=test-123

# Test GCP
wscat -c wss://colonial-backend.appspot.com?session_id=test-123
```

Should connect and show: `Connected (press CTRL+C to quit)`

---

## 💰 Cost Comparison

### Railway
- **Free Tier**: $5 credit/month
- **Paid**: $5-20/month depending on usage
- **Billing**: Per-second usage
- **Best for**: Development, small-scale production

### Google Cloud Platform
- **Free Tier**: First 28 instance hours/day free
- **Paid**: ~$0.05/hour (~$35/month for 24/7)
- **Billing**: Per-instance-hour
- **Best for**: Enterprise, high-scale production

---

## 🐛 Common Deployment Issues

### Issue: "Application failed to start"

**Railway:**
- Check **Logs** tab for error messages
- Verify all environment variables are set
- Ensure `package.json` has correct `start` script

**GCP:**
```bash
gcloud app logs tail -s default
```
- Check for missing dependencies
- Verify `app.yaml` syntax

### Issue: "WebSocket connection refused"

**Fix:**
- Ensure backend is using `wss://` not `ws://`
- Check firewall/security settings
- Verify PORT is set correctly

### Issue: "11Labs authentication failed"

**Fix:**
- Double-check `ELEVENLABS_API_KEY` in environment variables
- Verify agent ID is correct
- Test API key manually:
  ```bash
  curl -H "xi-api-key: YOUR_KEY" https://api.elevenlabs.io/v1/user
  ```

---

## 🔄 Redeployment

### Railway
```bash
# Just push to GitHub
git add .
git commit -m "Update backend"
git push

# Railway auto-deploys on push
```

### GCP
```bash
# From backend directory
gcloud app deploy
```

---

## 📊 Monitoring

### Railway Dashboard
- Real-time logs
- CPU/Memory usage
- Request metrics
- Deployment history

### GCP Console
```bash
# Metrics
gcloud app services browse default

# Logs
gcloud app logs read --limit=50
```

---

## 🔐 Security Best Practices

1. **Never commit `.env`** - Already in `.gitignore`
2. **Use service keys securely** - Environment variables only
3. **Enable HTTPS/WSS** - Both platforms provide SSL automatically
4. **Rotate API keys regularly** - Update in dashboard
5. **Monitor logs** - Watch for suspicious activity

---

## ✅ Verification Checklist

- [ ] Backend deployed successfully
- [ ] Health endpoint returns 200 OK
- [ ] WebSocket connection works
- [ ] 11Labs agent connects
- [ ] Transcripts save to Supabase
- [ ] Frontend can connect to backend
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Logs are accessible

---

## 🆘 Support Resources

**Railway:**
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
- Status: https://status.railway.app

**Google Cloud:**
- Docs: https://cloud.google.com/appengine/docs
- Support: https://cloud.google.com/support
- Status: https://status.cloud.google.com

---

## 📝 Next Steps

After deployment:
1. ✅ Test full call flow
2. ✅ Monitor logs for errors
3. ✅ Set up alerts/notifications
4. ✅ Document your deployment
5. ✅ Create backup/restore procedures

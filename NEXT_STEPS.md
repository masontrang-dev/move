# ✅ Phase 0 Progress Update

## Completed Automatically:
- ✅ Server dependencies installed
- ✅ Client dependencies installed  
- ✅ Environment files created (`.env` in both client and server)
- ✅ Git repository initialized and committed

## 🔴 Required: MongoDB Atlas Setup (5 minutes)

You don't have MongoDB installed locally, so you need to set up MongoDB Atlas:

### Step-by-Step:

1. **Go to MongoDB Atlas:**
   - Visit: https://www.mongodb.com/cloud/atlas
   - Click "Try Free" or "Sign In"

2. **Create Account:**
   - Sign up with Google/GitHub (fastest) or email

3. **Create a Free Cluster:**
   - Choose "M0 FREE" tier
   - Select a cloud provider (AWS recommended)
   - Choose a region close to you
   - Click "Create Cluster" (takes 1-3 minutes)

4. **Create Database User:**
   - Go to "Database Access" (left sidebar)
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `moveuser` (or anything you want)
   - Password: Click "Autogenerate Secure Password" and **copy it**
   - Database User Privileges: "Atlas admin"
   - Click "Add User"

5. **Whitelist Your IP:**
   - Go to "Network Access" (left sidebar)
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (adds `0.0.0.0/0`)
   - Click "Confirm"

6. **Get Connection String:**
   - Go to "Database" (left sidebar)
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like):
     ```
     mongodb+srv://moveuser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with the password you copied in step 4
   - Add database name at the end: `/body-motion-game`
   
   Final format:
   ```
   mongodb+srv://moveuser:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/body-motion-game?retryWrites=true&w=majority
   ```

7. **Update Your `.env` File:**
   - Open: `/Users/mason/Code/projects/move/server/.env`
   - Replace the `MONGODB_URI_ATLAS` line with your connection string
   - Change `NODE_ENV` to `production` if you want to use Atlas, or keep as `development` to use local MongoDB

## 🧪 Test the Server

Once MongoDB Atlas is set up:

```bash
# Start the server
cd /Users/mason/Code/projects/move/server
npm run dev
```

You should see:
```
✅ MongoDB connected
🚀 Server running on port 5000
```

Test the health endpoint:
```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{"status":"ok","message":"Body Motion Game API"}
```

## 🎨 Test the Client

In a new terminal:

```bash
# Start the client
cd /Users/mason/Code/projects/move/client
npm run dev
```

Visit: http://localhost:5173

## 🧪 Test Authentication

Once both are running, test the auth system:

**Register a user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"mason","email":"mason@example.com","password":"testpass123"}'
```

You should get back a token and user object.

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"mason@example.com","password":"testpass123"}'
```

## 📝 Optional: GitHub Setup

When you're ready to push to GitHub:

```bash
# Create repo at https://github.com/new
# Then:
git remote add origin https://github.com/YOUR_USERNAME/body-motion-game.git
git push -u origin main
```

## ⏭️ After Phase 0 is Working

Once you can:
- ✅ Start the server without errors
- ✅ Start the client without errors
- ✅ Successfully register/login via API

We'll move to **Phase 1: Vision Proof of Concept**
- Set up MoveNet
- Access webcam
- Draw skeleton on screen

---

**Current Status:** Waiting for you to set up MongoDB Atlas and test the servers.

Let me know once you have MongoDB Atlas configured and I'll help you test everything!

# Phase 0 Setup - Next Steps

## ✅ What's Already Done

- ✅ React app created with Vite
- ✅ Express server structure complete
- ✅ MongoDB connection code ready
- ✅ JWT authentication implemented (register, login, protected routes)
- ✅ Git repository initialized
- ✅ Deployment configs created (Vercel + Railway)
- ✅ Project documentation complete

## 🔧 What You Need to Do Now

### 1. Install Dependencies (5 minutes)

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Set Up MongoDB Atlas (5 minutes)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Create a new cluster (M0 Free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
6. In Network Access, add `0.0.0.0/0` to allow connections from anywhere

### 3. Create Environment Files

**Server** (`server/.env`):
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/body-motion-game
MONGODB_URI_ATLAS=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/body-motion-game
JWT_SECRET=Bai/Uo4oRh8Ij859fZfmVyfd5ALs95qqf025+pjCgy8=
NODE_ENV=development
```

**Client** (`client/.env`):
```bash
VITE_API_URL=http://localhost:5000/api
```

### 4. Test Locally (2 minutes)

```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend  
cd client
npm run dev
```

Visit: http://localhost:5173

Test the health endpoint: http://localhost:5000/api/health

### 5. Create GitHub Repository (2 minutes)

1. Go to [github.com/new](https://github.com/new)
2. Name: `body-motion-game` (or whatever you prefer)
3. Keep it **private** for now
4. **Don't** initialize with README (we already have one)
5. Click "Create repository"

Then push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/body-motion-game.git
git branch -M main
git push -u origin main
```

### 6. Deploy to Vercel (Frontend) - Optional for now

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your `body-motion-game` repo
5. Set Root Directory to `client`
6. Add environment variable:
   - `VITE_API_URL` = `https://your-backend-url.railway.app/api` (you'll get this after step 7)
7. Click "Deploy"

### 7. Deploy to Railway (Backend) - Optional for now

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `body-motion-game` repo
5. Set Root Directory to `server`
6. Add environment variables:
   - `MONGODB_URI_ATLAS` = your Atlas connection string
   - `JWT_SECRET` = `Bai/Uo4oRh8Ij859fZfmVyfd5ALs95qqf025+pjCgy8=`
   - `NODE_ENV` = `production`
7. Click "Deploy"
8. Copy the generated URL and update Vercel's `VITE_API_URL`

## 🧪 Testing the Auth System

Once running locally, test the API:

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Protected Route:**
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📁 Project Structure

```
/Users/mason/Code/projects/move/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/     # React UI components
│   │   ├── game/          # Canvas game logic (Phase 2+)
│   │   ├── vision/        # MoveNet integration (Phase 1)
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   └── services/      # API client
│   └── package.json
├── server/                 # Express backend
│   ├── routes/            # API routes (auth, sessions, leaderboard)
│   ├── models/            # Mongoose models (User, Session)
│   ├── middleware/        # Auth middleware
│   └── server.js
├── documentation/         # Project docs
└── README.md
```

## ✅ Phase 0 Checklist

- [x] Create React app (Vite)
- [x] Set up Node + Express server
- [x] MongoDB connection code ready
- [x] Basic JWT auth implemented
- [x] Deployment configs created
- [x] Git repository initialized
- [ ] **YOU DO**: Install dependencies
- [ ] **YOU DO**: Set up MongoDB Atlas
- [ ] **YOU DO**: Create .env files
- [ ] **YOU DO**: Test locally
- [ ] **YOU DO**: Create GitHub repo and push
- [ ] **YOU DO**: Deploy (optional - can wait until Phase 2)

## 🎯 Next: Phase 1 - Vision Proof of Concept

Once Phase 0 is complete and you can run the app locally, we'll move to Phase 1:
- Initialize MoveNet in the browser
- Access webcam
- Draw skeleton overlay on screen

See `documentation/ROADMAP.md` for full details.

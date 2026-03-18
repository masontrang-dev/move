# Body Motion Game

A browser-based, camera-powered movement game. Fun enough for a 9-year-old, intense enough for a real workout.

## Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- Webcam

### Installation

1. **Clone and install dependencies:**
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

2. **Set up environment variables:**

**Server** (`server/.env`):
```bash
cp server/.env.example server/.env
# Edit server/.env with your MongoDB connection string and JWT secret
```

**Client** (`client/.env`):
```bash
cp client/.env.example client/.env
# Default API URL is http://localhost:5000/api
```

3. **Start development servers:**

```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend
cd client
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:5000

## Project Structure

```
/client          - React frontend (Vite)
  /src
    /game        - Canvas game logic
    /vision      - MoveNet pose detection
    /components  - React UI components
    /hooks       - Custom React hooks
    /pages       - Page components
    /services    - API client

/server          - Express backend
  /routes        - API routes
  /models        - Mongoose models
  /middleware    - Auth middleware

/documentation   - Project docs
```

## Tech Stack

**Frontend:**
- React 19 + Vite
- TensorFlow.js (MoveNet)
- Canvas API
- Axios

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs

## Development Phases

See `documentation/ROADMAP.md` for detailed feature roadmap.

- ✅ **Phase 0**: Setup (current)
- **Phase 1**: Vision Proof of Concept
- **Phase 2**: First Mechanic
- **Phase 3**: Dodge Mechanic
- **Phase 4**: Game Session Loop
- **Phase 5**: Accounts and Persistence
- **Phase 6**: Polish and Feel
- **Phase 7**: Workout Mode (Future)

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (protected)

### Sessions
- `POST /api/sessions` - Save game session (protected)
- `GET /api/sessions/history` - Get user's session history (protected)
- `GET /api/sessions/stats` - Get user stats (protected)

### Leaderboard
- `GET /api/leaderboard?difficulty=all&limit=10` - Get top scores

## License

MIT

# Body Motion Game — Architecture

## High-Level Overview

```
Browser (React App)
│
├── UI Layer (React)
│   ├── Menus, difficulty selection, score display
│   ├── Session summary and history
│   └── User auth screens
│
├── Game Layer (Canvas API + requestAnimationFrame)
│   ├── Game loop (~60fps)
│   ├── Object spawner (targets, obstacles)
│   ├── Collision engine
│   ├── Difficulty escalator
│   └── Audio engine (Howler.js)
│
├── Vision Layer (TensorFlow.js — MoveNet)
│   ├── Camera feed (MediaDevices API)
│   ├── Pose detection (~30fps)
│   ├── Keypoint extractor (17 body points)
│   ├── Joint angle calculator
│   ├── Velocity tracker (per keypoint, frame-over-frame)
│   └── Confidence filter (ignore low-confidence keypoints)
│
└── Backend Client (REST / Axios)
    ├── Auth (JWT)
    ├── Save session results
    └── Fetch leaderboard / history

Node + Express Backend
│
├── Auth routes (register, login, JWT middleware)
├── Session routes (save workout, fetch history)
├── Leaderboard routes
└── MongoDB (Mongoose)
    ├── Users collection
    ├── Sessions collection
    └── Scores collection
```

---

## Key Technical Decisions

| Decision | Choice | Reason |
|---|---|---|
| Pose detection | MoveNet (TensorFlow.js) | Runs in-browser, Apache 2.0, fast, accurate for single player |
| Game rendering | HTML5 Canvas + rAF | React is too slow for 60fps game loops |
| App shell | React | You already know it; good for menus, auth, history UI |
| Audio | Howler.js | Simple, reliable, works with Web Audio API |
| Backend | Node + Express | Your existing stack from work |
| Database | MongoDB (Mongoose) | Your existing stack from work |
| Auth | JWT (jsonwebtoken) | Stateless, simple to implement |
| Styling | Tailwind CSS | Fast to build UI, works well with React |

---

## Vision Pipeline Detail

```
Webcam feed (MediaDevices API)
        ↓
Video element (hidden, mirrored)
        ↓
MoveNet inference (~30fps)
        ↓
17 keypoints [x, y, confidence]  ←— filter below confidence threshold (e.g. 0.4)
        ↓
Coordinate normalizer            ←— map from video space → canvas space, handle mirror flip
        ↓
  ┌─────────────────┬──────────────────┐
  ↓                 ↓                  ↓
Velocity        Joint angles      Body bounding box
tracker         (elbow, knee,     (for obstacle
(wrist speed)   hip, shoulder)    avoidance)
  ↓                 ↓                  ↓
  └─────────────────┴──────────────────┘
                    ↓
           Game collision engine
```

---

## Game Loop Detail

```
requestAnimationFrame (60fps)
│
├── 1. Read latest pose data (written async by MoveNet at ~30fps)
├── 2. Update game object positions (move targets + obstacles toward player)
├── 3. Run collision checks
│   ├── Wrist inside target zone + velocity above threshold → HIT
│   └── Any body keypoint inside obstacle zone → DODGE FAIL
├── 4. Update score, combo multiplier, health
├── 5. Trigger feedback (sound, screen flash, particle burst)
├── 6. Spawn new objects (rate controlled by difficulty engine)
├── 7. Clear canvas
└── 8. Draw frame
    ├── Game objects (targets, obstacles)
    ├── Skeleton overlay (keypoints + connecting lines)
    └── HUD (score, combo, timer, health)
```

---

## Folder Structure

```
/client
  /src
    /game               ← All canvas game logic (no React here)
      gameLoop.js       ← requestAnimationFrame loop
      spawner.js        ← Object spawn logic and timing
      collision.js      ← Hit detection math
      difficulty.js     ← Escalation engine
      renderer.js       ← Canvas draw calls
      audio.js          ← Howler.js wrapper
    /vision
      camera.js         ← MediaDevices setup
      movenet.js        ← TF.js MoveNet init and inference
      poseProcessor.js  ← Coordinate normalization, velocity, angles
    /components         ← React UI components
      GameCanvas.jsx    ← Mounts canvas, owns game lifecycle
      MainMenu.jsx
      SessionSummary.jsx
      Leaderboard.jsx
    /hooks
      usePose.js        ← Custom hook exposing pose data to React
      useAuth.js
    /pages
      Home.jsx
      Game.jsx
      History.jsx
    /services
      api.js            ← Axios calls to backend
    App.jsx
    main.jsx

/server
  /routes
    auth.js
    sessions.js
    leaderboard.js
  /models
    User.js
    Session.js
    Score.js
  /middleware
    authMiddleware.js
  server.js
  .env
```

---

## Integration Points

### React ↔ Canvas Game

The `GameCanvas.jsx` component mounts the canvas element and manages the game lifecycle:

```javascript
// GameCanvas.jsx owns:
- Canvas element ref
- Game start/stop/pause
- Passing pose data from usePose() hook to game loop
- Listening for game events (score updates, game over)
- Rendering React UI overlays (pause menu, HUD)
```

The game loop runs independently in pure JavaScript, reading pose data from a shared state object updated by the React hook.

### Vision ↔ Game

Pose data flows one-way from vision to game:

```javascript
// Shared pose state object (updated by vision layer)
{
  keypoints: [{x, y, confidence, name}, ...],
  velocities: {leftWrist: {x, y, magnitude}, ...},
  angles: {leftElbow: 45, ...},
  boundingBox: {x, y, width, height},
  timestamp: Date.now()
}
```

Game loop reads this object every frame. No callbacks, no events — just polling the latest data.

### Frontend ↔ Backend

REST API calls via Axios:

```javascript
// Auth
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me (protected)

// Sessions
POST /api/sessions (protected) — save game result
GET  /api/sessions (protected) — fetch user history

// Leaderboard
GET  /api/leaderboard — top scores (public)
```

JWT token stored in localStorage, attached to protected requests via Axios interceptor.

---

## Performance Considerations

### Frame Rate Budget

- **Game loop**: 60fps (16.67ms per frame)
- **Pose detection**: 30fps (33.33ms per frame)
- **Canvas rendering**: Must complete within game loop budget

### Optimization Strategies

1. **Pose detection runs async**: MoveNet inference happens in a separate async loop, writes to shared state. Game loop never waits for it.
2. **Object pooling**: Reuse target/obstacle objects instead of creating new ones every spawn.
3. **Spatial partitioning**: If object count grows, use a simple grid to avoid O(n²) collision checks.
4. **Canvas layers**: Consider separating static background from dynamic game objects if redraw becomes expensive.

---

## Key Libraries

| Library | Install | Purpose |
|---|---|---|
| `@tensorflow/tfjs` | `npm i @tensorflow/tfjs` | TensorFlow.js runtime |
| `@tensorflow-models/pose-detection` | `npm i @tensorflow-models/pose-detection` | MoveNet model wrapper |
| `howler` | `npm i howler` | Audio |
| `axios` | `npm i axios` | HTTP client |
| `jsonwebtoken` | `npm i jsonwebtoken` | JWT auth (server) |
| `mongoose` | `npm i mongoose` | MongoDB ODM |
| `express` | `npm i express` | Server framework |
| `cors` | `npm i cors` | CORS middleware |

---

*License note: MoveNet and TensorFlow.js are Apache 2.0 licensed. You are free to use them in a commercial product without royalties or open-sourcing your own code.*

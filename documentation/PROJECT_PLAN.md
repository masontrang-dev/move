# Body Motion Game — Project Plan

> A browser-based, camera-powered movement game. Fun enough for a 9-year-old, intense enough for a real workout. No headset, no install — just a webcam.

---

## Vision

Build an interactive game where the player uses their full body to dodge obstacles and hit targets on screen. The camera reads their pose in real time. Difficulty escalates from casual arm swings to full squats and jumps. The workout happens naturally — the player is too busy having fun to notice.

**North star reference:** Supernatural (Meta Quest) — but browser-based and headset-free.

---

## Application Architecture

### High-Level Overview

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

### Key Technical Decisions

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

### Vision Pipeline Detail

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

### Game Loop Detail

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

### Folder Structure

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

## Feature Roadmap

### Phase 0 — Setup (Week 1)

Get the project scaffolded and environment working before writing any game code.

- [ ] Create React app (Vite)
- [ ] Set up Node + Express server
- [ ] Connect MongoDB (local dev + Atlas for prod)
- [ ] Basic JWT auth (register, login, protected route)
- [ ] Deploy skeleton app to Vercel (frontend) + Railway or Render (backend)
- [ ] Set up GitHub repo with main/dev branches

---

### Phase 1 — Vision Proof of Concept (Weeks 2–3)

**Goal:** See your skeleton on screen. Nothing else. This phase is purely about proving the pipeline works and getting comfortable with MoveNet.

- [ ] Initialize MoveNet in the browser (TensorFlow.js)
- [ ] Access webcam via MediaDevices API
- [ ] Run inference and log raw keypoints to console
- [ ] Draw skeleton overlay on a `<canvas>` over the video feed
- [ ] Handle mirroring (camera is a mirror — flip x coordinates)
- [ ] Add confidence filtering (hide keypoints below threshold)
- [ ] Log wrist velocity frame-over-frame

**Done when:** You can see your skeleton moving smoothly on screen.

---

### Phase 2 — First Mechanic (Weeks 4–6)

**Goal:** One playable mechanic. Targets appear, you hit them with your hands. Score goes up.

- [ ] Build the game loop with `requestAnimationFrame`
- [ ] Spawn circular targets at random positions
- [ ] Move targets slowly across the screen
- [ ] Implement zone collision: wrist keypoint inside target circle
- [ ] Add velocity check: wrist must be moving to count as a hit
- [ ] Add score counter
- [ ] Add basic sound effect on hit (Howler.js)
- [ ] Add screen flash on hit
- [ ] Remove targets that reach the edge (miss = no penalty yet)

**Done when:** You can punch targets and it feels satisfying.

---

### Phase 3 — Dodge Mechanic (Weeks 7–8)

**Goal:** Add obstacles the player must avoid with their body.

- [ ] Spawn obstacle bars that sweep across the screen (horizontal beams)
- [ ] Check all major body keypoints against obstacle zone
- [ ] Implement health/lives system (3 hits = game over)
- [ ] Add low obstacles that require squatting (check head keypoint height)
- [ ] Add high obstacles that require ducking (check wrist/shoulder height)
- [ ] Visual feedback on collision (red flash, health bar drop)

**Done when:** Player must actively move their whole body, not just arms.

---

### Phase 4 — Game Session Loop (Weeks 9–11)

**Goal:** A complete game session with a start, escalating difficulty, and an end screen.

- [ ] Build main menu (React)
- [ ] Session timer (e.g. 3 minutes)
- [ ] Difficulty escalator: spawn rate and speed increase over time
- [ ] Combo multiplier (consecutive hits multiply score)
- [ ] Game over screen with score summary
- [ ] Pause / resume
- [ ] Difficulty presets: Easy (nephew mode), Medium, Hard (workout mode)

**Done when:** You can play a full session from menu to results screen.

---

### Phase 5 — Accounts and Persistence (Weeks 12–13)

**Goal:** Save progress, compare scores.

- [ ] Wire auth screens to backend (register, login, logout)
- [ ] Save session results to MongoDB after each game
- [ ] Personal history page (chart of scores over time)
- [ ] Local leaderboard (top scores across all users)
- [ ] Guest mode (play without account, no saving)

**Done when:** You can log in, play, and see your history.

---

### Phase 6 — Polish and Feel (Weeks 14–16)

**Goal:** Make it feel like a real game, not a prototype.

- [ ] Particle burst effect on hit
- [ ] Skeleton overlay color changes on good/bad form
- [ ] Countdown timer before session starts (3, 2, 1, GO)
- [ ] Background music support (Howler.js — player uploads or selects)
- [ ] Mobile-friendly layout for the menu (game itself requires a full camera view)
- [ ] Onboarding flow: position yourself, lighting check, camera test
- [ ] Loading state while MoveNet model downloads

**Done when:** Someone who didn't build it finds it immediately fun.

---

### Phase 7 — Workout Mode (Future)

**Goal:** Layer in the fitness program concept from the original idea.

- [ ] Pre-built workout sessions (5 min, 10 min, 20 min)
- [ ] Session intensity tracking (rough calorie estimate based on movement velocity)
- [ ] Post-session workout summary (active time, hits landed, difficulty reached)
- [ ] Weekly streak / consistency tracking

---

## Risks and Watchouts

| Risk | Mitigation |
|---|---|
| MoveNet latency (~100–200ms) makes hits feel laggy | Use predictive hit detection; trigger visual feedback immediately, confirm score after |
| Poor lighting / small rooms break pose detection | Build an onboarding setup screen that checks lighting and body visibility before starting |
| Game feels unfair on miss/dodge fail | Generous hit windows early, tighten with difficulty; always show the player what they missed |
| Scope creep — building too many features before validating fun | Strictly finish Phase 2 before adding anything. One great mechanic beats five mediocre ones |
| Backend complexity distracts from the game | Phase 5 is intentionally late — build and test the game in guest/local mode first |

---

## Additional Recommended Planning Documents

Beyond this file, consider creating:

- **`GAME_DESIGN.md`** — Document the exact game rules: hit window sizes, obstacle speeds at each difficulty level, scoring formula, combo rules. Treat these like calibration specs — your ME background will help here.
- **`DEVLOG.md`** — A running log of weekly progress, decisions made, and things you tried that didn't work. Invaluable for motivation and for sharing publicly if you ever want to build in public.
- **`MONETIZATION.md`** — When the time comes: pricing model, free vs paid features, platform considerations (web, potentially mobile via React Native + camera).

---

## Quick Reference — Key Libraries

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

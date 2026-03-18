# Body Motion Game — Feature Roadmap

## Phase 0 — Setup (Week 1) ✅

Get the project scaffolded and environment working before writing any game code.

- [x] Create React app (Vite)
- [x] Set up Node + Express server
- [x] Connect MongoDB (local dev + Atlas for prod)
- [x] Basic JWT auth (register, login, protected route)
- [x] Deploy skeleton app to Vercel (frontend) + Railway or Render (backend)
- [x] Set up GitHub repo with main/dev branches

---

## Phase 1 — Vision Proof of Concept (Weeks 2–3) ✅

**Goal:** See your skeleton on screen. Nothing else. This phase is purely about proving the pipeline works and getting comfortable with MoveNet.

- [x] Initialize MoveNet in the browser (TensorFlow.js)
- [x] Access webcam via MediaDevices API
- [x] Run inference and log raw keypoints to console
- [x] Draw skeleton overlay on a `<canvas>` over the video feed
- [x] Handle mirroring (camera is a mirror — flip x coordinates)
- [x] Add confidence filtering (hide keypoints below threshold)
- [x] Log wrist velocity frame-over-frame

**Done when:** You can see your skeleton moving smoothly on screen.

---

## Phase 2 — First Mechanic (Weeks 4–6) ✅

**Goal:** One playable mechanic. Targets appear, you hit them with your hands. Score goes up.

- [x] Build the game loop with `requestAnimationFrame`
- [x] Spawn circular targets at random positions
- [x] Move targets slowly across the screen
- [x] Implement zone collision: wrist keypoint inside target circle
- [x] Add velocity check: wrist must be moving to count as a hit
- [x] Add score counter
- [x] Add basic sound effect on hit (Web Audio API)
- [x] Add screen flash on hit
- [x] Remove targets that reach the edge (miss = no penalty yet)

**Done when:** You can punch targets and it feels satisfying.

---

## Phase 3 — Dodge Mechanic (Weeks 7–8) ✅

**Goal:** Add obstacles the player must avoid with their body.

- [x] Spawn obstacle bars that sweep across the screen (horizontal beams)
- [x] Check all major body keypoints against obstacle zone
- [x] Implement health/lives system (3 hits = game over)
- [x] Add low obstacles that require squatting (check head keypoint height)
- [x] Add high obstacles that require ducking (check wrist/shoulder height)
- [x] Visual feedback on collision (red flash, health bar drop)

**Done when:** Player must actively move their whole body, not just arms.

---

## Phase 4 — Game Session Loop (Weeks 9–11) ✅

**Goal:** A complete game session with a start, escalating difficulty, and an end screen.

- [x] Build main menu (React)
- [x] Session timer (e.g. 3 minutes)
- [x] Difficulty escalator: spawn rate and speed increase over time
- [x] Combo multiplier (consecutive hits multiply score)
- [x] Game over screen with score summary
- [x] Pause / resume
- [x] Difficulty presets: Easy (nephew mode), Medium, Hard (workout mode)

**Done when:** You can play a full session from menu to results screen.

---

## Phase 5 — Accounts and Persistence (Weeks 12–13)

**Goal:** Save progress, compare scores.

- [ ] Wire auth screens to backend (register, login, logout)
- [ ] Save session results to MongoDB after each game
- [ ] Personal history page (chart of scores over time)
- [ ] Local leaderboard (top scores across all users)
- [ ] Guest mode (play without account, no saving)

**Done when:** You can log in, play, and see your history.

---

## Phase 6 — Polish and Feel (Weeks 14–16)

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

## Phase 7 — Workout Mode (Future)

**Goal:** Layer in the fitness program concept from the original idea.

- [ ] Pre-built workout sessions (5 min, 10 min, 20 min)
- [ ] Session intensity tracking (rough calorie estimate based on movement velocity)
- [ ] Post-session workout summary (active time, hits landed, difficulty reached)
- [ ] Weekly streak / consistency tracking

---

## Risks and Mitigation

| Risk                                                           | Mitigation                                                                                   |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| MoveNet latency (~100–200ms) makes hits feel laggy             | Use predictive hit detection; trigger visual feedback immediately, confirm score after       |
| Poor lighting / small rooms break pose detection               | Build an onboarding setup screen that checks lighting and body visibility before starting    |
| Game feels unfair on miss/dodge fail                           | Generous hit windows early, tighten with difficulty; always show the player what they missed |
| Scope creep — building too many features before validating fun | Strictly finish Phase 2 before adding anything. One great mechanic beats five mediocre ones  |
| Backend complexity distracts from the game                     | Phase 5 is intentionally late — build and test the game in guest/local mode first            |

---

## Phase Dependencies

```
Phase 0 (Setup)
    ↓
Phase 1 (Vision PoC) ←— Must work before building game
    ↓
Phase 2 (First Mechanic) ←— Core gameplay validation
    ↓
Phase 3 (Dodge Mechanic) ←— Adds full-body requirement
    ↓
Phase 4 (Session Loop) ←— Makes it a complete game
    ↓
Phase 5 (Persistence) ←— Can be done in parallel with Phase 6
    ↓
Phase 6 (Polish) ←— Makes it shippable
    ↓
Phase 7 (Workout Mode) ←— Future enhancement
```

**Critical path:** Phases 0–4 must be done in order. Phase 5 and 6 can overlap. Phase 7 is post-MVP.

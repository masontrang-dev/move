# Body Motion Game — Coding Standards & Rules

> Coding conventions, architectural guidelines, and quality standards for the Body Motion Game project.

---

## General Principles

### Code Philosophy
- **Performance first**: This is a real-time game running at 60fps with pose detection at 30fps. Every frame counts.
- **Separation of concerns**: Keep React UI, Canvas game logic, and pose detection completely decoupled.
- **Fail gracefully**: Camera issues, poor lighting, and low-end devices are expected — handle them elegantly.
- **No premature optimization**: Build it working first, then profile and optimize hot paths.

### Project-Wide Rules
- **No React in the game loop**: React renders are too slow. Game logic lives in vanilla JS with Canvas API.
- **Async pose data**: MoveNet runs at ~30fps, game loop at 60fps. Always read the latest pose data without blocking.
- **Mirror coordinates**: Camera feed is mirrored. Always flip X coordinates for natural interaction.
- **Confidence thresholds**: Never trust keypoints below 0.4 confidence. Filter them out.

---

## JavaScript Standards

### General Style
- **ES6+ syntax**: Use modern JavaScript (arrow functions, destructuring, async/await, modules).
- **Semicolons**: Always use semicolons.
- **Quotes**: Single quotes for strings, backticks for templates.
- **Naming conventions**:
  - `camelCase` for variables and functions
  - `PascalCase` for classes and React components
  - `UPPER_SNAKE_CASE` for constants
  - Prefix boolean variables with `is`, `has`, `should` (e.g., `isGameActive`, `hasCollided`)

### File Organization
```javascript
// 1. Imports (grouped: external, internal, relative)
import React from 'react';
import axios from 'axios';
import { gameLoop } from './game/gameLoop';
import { initCamera } from '../vision/camera';

// 2. Constants
const MAX_TARGETS = 10;
const HIT_VELOCITY_THRESHOLD = 0.5;

// 3. Main code
// 4. Exports
```

### Functions
- **Pure functions when possible**: Easier to test and reason about.
- **Single responsibility**: Each function does one thing well.
- **Max function length**: ~50 lines. If longer, break it up.
- **Early returns**: Prefer guard clauses over nested conditionals.

```javascript
// Good
function checkHit(wrist, target, velocity) {
  if (!wrist || wrist.confidence < 0.4) return false;
  if (velocity < HIT_VELOCITY_THRESHOLD) return false;
  
  return isPointInCircle(wrist, target);
}

// Avoid
function checkHit(wrist, target, velocity) {
  if (wrist && wrist.confidence >= 0.4) {
    if (velocity >= HIT_VELOCITY_THRESHOLD) {
      return isPointInCircle(wrist, target);
    }
  }
  return false;
}
```

### Error Handling
- **Always handle camera/model failures**: Show user-friendly messages.
- **Log errors with context**: Include relevant state when logging.
- **No silent failures**: If something breaks, the user should know.

```javascript
try {
  await initMoveNet();
} catch (error) {
  console.error('Failed to initialize MoveNet:', error);
  showErrorMessage('Camera initialization failed. Please check permissions.');
}
```

---

## Game Logic Standards (`/client/src/game`)

### Performance Requirements
- **60fps target**: Game loop must complete in <16ms per frame.
- **No allocations in hot paths**: Reuse objects, avoid creating new arrays/objects in the game loop.
- **Batch canvas operations**: Minimize state changes (fillStyle, strokeStyle, etc.).

### Game Loop Structure
```javascript
// gameLoop.js pattern
let animationId;
let lastTimestamp = 0;

function gameLoop(timestamp) {
  const deltaTime = timestamp - lastTimestamp;
  lastTimestamp = timestamp;
  
  // 1. Read pose data (non-blocking)
  const pose = getPoseData();
  
  // 2. Update game state
  updateGameObjects(deltaTime);
  
  // 3. Collision detection
  checkCollisions(pose);
  
  // 4. Render
  render();
  
  animationId = requestAnimationFrame(gameLoop);
}

function startGame() {
  lastTimestamp = performance.now();
  animationId = requestAnimationFrame(gameLoop);
}

function stopGame() {
  cancelAnimationFrame(animationId);
}
```

### Object Pooling
- **Reuse game objects**: Don't create/destroy targets and obstacles every frame.
- **Pool pattern**: Maintain active and inactive object pools.

```javascript
const targetPool = {
  active: [],
  inactive: [],
  
  spawn(x, y) {
    const target = this.inactive.pop() || createTarget();
    target.reset(x, y);
    this.active.push(target);
    return target;
  },
  
  despawn(target) {
    const index = this.active.indexOf(target);
    if (index > -1) {
      this.active.splice(index, 1);
      this.inactive.push(target);
    }
  }
};
```

### Collision Detection
- **Use bounding boxes first**: Cheap AABB checks before expensive circle/polygon checks.
- **Spatial partitioning for >50 objects**: If you ever have that many (unlikely in this game).

---

## Vision Layer Standards (`/client/src/vision`)

### MoveNet Integration
- **Model loading**: Load model once on app init, show loading state.
- **Inference rate**: Target 30fps, measure actual FPS and display to user.
- **Keypoint indices**: Use named constants, not magic numbers.

```javascript
// Good
const KEYPOINT_NAMES = {
  NOSE: 0,
  LEFT_WRIST: 9,
  RIGHT_WRIST: 10,
  LEFT_KNEE: 13,
  RIGHT_KNEE: 14,
  // ... etc
};

const leftWrist = keypoints[KEYPOINT_NAMES.LEFT_WRIST];

// Avoid
const leftWrist = keypoints[9];
```

### Coordinate Normalization
- **Always normalize**: MoveNet returns normalized coords [0, 1]. Map to canvas space.
- **Handle mirroring**: Flip X coordinates so player's right is screen right.

```javascript
function normalizeKeypoint(keypoint, canvasWidth, canvasHeight) {
  return {
    x: canvasWidth - (keypoint.x * canvasWidth), // Mirror flip
    y: keypoint.y * canvasHeight,
    confidence: keypoint.score
  };
}
```

### Velocity Calculation
- **Frame-over-frame delta**: Store previous frame's keypoints.
- **Smooth velocity**: Consider exponential moving average to reduce jitter.

```javascript
function calculateVelocity(current, previous, deltaTime) {
  if (!previous) return 0;
  
  const dx = current.x - previous.x;
  const dy = current.y - previous.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  return distance / deltaTime; // pixels per ms
}
```

---

## React Standards (`/client/src/components`)

### Component Structure
```jsx
// 1. Imports
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// 2. Component
function GameCanvas({ onGameEnd, difficulty }) {
  // Hooks first
  const [score, setScore] = useState(0);
  const canvasRef = useRef(null);
  
  // Effects
  useEffect(() => {
    // Setup
    return () => {
      // Cleanup
    };
  }, []);
  
  // Event handlers
  const handlePause = () => {
    // ...
  };
  
  // Render
  return (
    <div className="game-container">
      <canvas ref={canvasRef} />
    </div>
  );
}

// 3. PropTypes
GameCanvas.propTypes = {
  onGameEnd: PropTypes.func.isRequired,
  difficulty: PropTypes.oneOf(['easy', 'medium', 'hard']).isRequired
};

// 4. Export
export default GameCanvas;
```

### Hooks Rules
- **Custom hooks for shared logic**: `usePose`, `useAuth`, `useGameState`.
- **Dependency arrays**: Always specify correctly. Use ESLint plugin.
- **Cleanup**: Always clean up timers, listeners, and animations in useEffect returns.

### Canvas Integration
- **Use refs**: Access canvas via `useRef`, never query the DOM.
- **Lifecycle management**: Start game loop in useEffect, stop in cleanup.
- **No React state in game loop**: Game state lives in vanilla JS, only sync to React for UI updates.

```jsx
function GameCanvas() {
  const canvasRef = useRef(null);
  const gameStateRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    gameStateRef.current = initGame(canvas);
    startGameLoop(gameStateRef.current);
    
    return () => {
      stopGameLoop(gameStateRef.current);
    };
  }, []);
  
  return <canvas ref={canvasRef} width={1280} height={720} />;
}
```

---

## Backend Standards (`/server`)

### API Design
- **RESTful routes**: Use standard HTTP verbs and resource naming.
- **Consistent responses**: Always return JSON with predictable structure.

```javascript
// Success response
{
  success: true,
  data: { /* payload */ }
}

// Error response
{
  success: false,
  error: {
    message: 'User-friendly error message',
    code: 'ERROR_CODE',
    details: { /* optional */ }
  }
}
```

### Route Structure
```javascript
// routes/sessions.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');

// POST /api/sessions - Save session
router.post('/', authMiddleware, async (req, res) => {
  try {
    const session = await Session.create({
      userId: req.user.id,
      ...req.body
    });
    
    res.json({ success: true, data: session });
  } catch (error) {
    console.error('Session save error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to save session' }
    });
  }
});

module.exports = router;
```

### Authentication
- **JWT tokens**: Store in httpOnly cookies or localStorage (document choice).
- **Middleware pattern**: Use authMiddleware for protected routes.
- **Password hashing**: Always use bcrypt, never store plain text.

```javascript
// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: 'No token provided' }
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { message: 'Invalid token' }
    });
  }
}
```

### Database (MongoDB/Mongoose)
- **Schema validation**: Define schemas with required fields and types.
- **Indexes**: Add indexes for frequently queried fields (userId, createdAt).
- **Timestamps**: Use `timestamps: true` in all schemas.

```javascript
// models/Session.js
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  score: { type: Number, required: true },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  duration: { type: Number, required: true }, // seconds
  hits: { type: Number, default: 0 },
  misses: { type: Number, default: 0 },
  dodges: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
```

### Environment Variables
- **Never commit secrets**: Use `.env` file, add to `.gitignore`.
- **Required vars**: Document all required env vars in README.

```bash
# .env.example
PORT=5000
MONGODB_URI=mongodb://localhost:27017/body-game
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

---

## Testing Standards

### Unit Tests
- **Test pure functions**: Collision detection, coordinate normalization, scoring logic.
- **Mock external dependencies**: Camera, MoveNet model, MongoDB.
- **Framework**: Jest for both frontend and backend.

```javascript
// collision.test.js
import { isPointInCircle, checkHit } from './collision';

describe('Collision Detection', () => {
  test('point inside circle returns true', () => {
    const point = { x: 100, y: 100 };
    const circle = { x: 100, y: 100, radius: 50 };
    expect(isPointInCircle(point, circle)).toBe(true);
  });
  
  test('low confidence keypoint returns false', () => {
    const wrist = { x: 100, y: 100, confidence: 0.3 };
    const target = { x: 100, y: 100, radius: 50 };
    expect(checkHit(wrist, target, 1.0)).toBe(false);
  });
});
```

### Integration Tests
- **API endpoints**: Test auth flow, session saving, leaderboard queries.
- **Use test database**: Separate DB for tests, clean up after each test.

### Manual Testing Checklist
- [ ] Game runs at 60fps on target hardware
- [ ] Pose detection works in various lighting conditions
- [ ] Collision detection feels fair (no phantom hits/misses)
- [ ] Audio plays without crackling or delay
- [ ] Game state persists correctly (pause/resume)
- [ ] Mobile menu is usable (game requires desktop/camera)

---

## Git Workflow

### Branch Strategy
- **`main`**: Production-ready code only
- **`dev`**: Integration branch for features
- **Feature branches**: `feature/phase-1-vision`, `feature/dodge-mechanic`
- **Hotfix branches**: `hotfix/collision-bug`

### Commit Messages
```
type(scope): brief description

- Detailed change 1
- Detailed change 2

Refs: #issue-number
```

**Types**: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `chore`

**Examples**:
- `feat(vision): add MoveNet skeleton overlay`
- `fix(collision): correct velocity threshold check`
- `perf(game): implement object pooling for targets`

### Pull Request Rules
- **One feature per PR**: Keep PRs focused and reviewable.
- **Self-review first**: Check your own diff before requesting review.
- **Test locally**: Ensure game runs before pushing.

---

## Performance Budgets

### Frontend
- **Initial load**: <3s on 4G connection
- **MoveNet model download**: <5s (show loading state)
- **Game loop**: 60fps (16ms per frame)
- **Pose inference**: 30fps minimum
- **Bundle size**: <500KB (before model)

### Backend
- **API response time**: <100ms for session save
- **Auth token generation**: <50ms
- **Leaderboard query**: <200ms

---

## Accessibility & UX

### Camera Permissions
- **Request gracefully**: Explain why camera is needed before requesting.
- **Handle denial**: Show clear message if permission denied.
- **Privacy**: Never send video feed to server. All processing is client-side.

### Error Messages
- **User-friendly**: No stack traces or technical jargon in UI.
- **Actionable**: Tell user what to do next.

```javascript
// Good
"Camera not detected. Please connect a webcam and refresh the page."

// Bad
"MediaDevices.getUserMedia() failed: NotFoundError"
```

### Loading States
- **Always show progress**: Model loading, camera initializing, saving session.
- **Skeleton screens**: Use placeholders while loading leaderboard/history.

---

## Security

### Frontend
- **No secrets in client code**: API keys, if needed, go in backend.
- **Sanitize user input**: Especially for username/profile fields.
- **HTTPS only**: Camera API requires secure context.

### Backend
- **Rate limiting**: Prevent API abuse (express-rate-limit).
- **Input validation**: Validate all request bodies (express-validator or Joi).
- **CORS**: Whitelist frontend domain only.
- **SQL injection**: Not applicable (using MongoDB), but still validate inputs.

```javascript
// Example: Rate limiting
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', apiLimiter);
```

---

## Documentation Standards

### Code Comments
- **Why, not what**: Explain reasoning, not obvious syntax.
- **Document magic numbers**: Explain thresholds, timings, calibration values.

```javascript
// Good
const HIT_VELOCITY_THRESHOLD = 0.5; // Minimum wrist speed (px/ms) to register hit - prevents accidental touches

// Unnecessary
// Set velocity threshold to 0.5
const HIT_VELOCITY_THRESHOLD = 0.5;
```

### README Files
- **Root README**: Project overview, setup instructions, tech stack.
- **Module READMEs**: Complex modules (`/game`, `/vision`) get their own docs.

### Inline Documentation
- **JSDoc for public APIs**: Document function parameters and return types.

```javascript
/**
 * Checks if a wrist keypoint hits a target
 * @param {Object} wrist - Keypoint with x, y, confidence
 * @param {Object} target - Target with x, y, radius
 * @param {number} velocity - Wrist velocity in px/ms
 * @returns {boolean} True if hit conditions are met
 */
function checkHit(wrist, target, velocity) {
  // ...
}
```

---

## Deployment

### Frontend (Vercel)
- **Environment**: Production build with minification
- **Environment vars**: API URL, public keys only
- **Preview deployments**: Automatic for PRs

### Backend (Railway/Render)
- **Environment**: Node.js with all env vars set
- **Health check endpoint**: `GET /health` returns 200
- **Logging**: Use structured logging (winston or pino)

### Database (MongoDB Atlas)
- **Backups**: Enable automatic backups
- **Connection pooling**: Configure Mongoose connection pool
- **Monitoring**: Set up alerts for high latency/errors

---

## Phase-Specific Guidelines

### Phase 1 (Vision POC)
- **Focus**: Get skeleton rendering smoothly, nothing else matters yet.
- **Acceptable**: Messy code, console logs everywhere, no UI polish.
- **Deliverable**: Working skeleton overlay that tracks your movement.

### Phase 2 (First Mechanic)
- **Focus**: Make hitting targets feel good.
- **Iterate on feel**: Adjust hit windows, velocity thresholds, feedback timing.
- **No backend yet**: Hard-code everything, save nothing.

### Phase 3-4 (Full Game Loop)
- **Refactor time**: Clean up Phase 1-2 code now that you understand the patterns.
- **Introduce architecture**: Separate concerns, add proper state management.

### Phase 5 (Backend)
- **Keep it simple**: Don't over-engineer. Basic CRUD is fine.
- **Guest mode**: Game must work without account.

### Phase 6 (Polish)
- **Juice it**: Particles, screen shake, sound design, color grading.
- **User testing**: Watch someone else play. Fix what confuses them.

---

## Tools & Linting

### Required Tools
- **ESLint**: Enforce code style
- **Prettier**: Auto-format on save
- **Husky**: Pre-commit hooks (lint, format)

### ESLint Config
```json
{
  "extends": ["eslint:recommended", "plugin:react/recommended"],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error",
    "semi": ["error", "always"],
    "quotes": ["error", "single"]
  }
}
```

---

## Resources & References

- **MoveNet docs**: https://github.com/tensorflow/tfjs-models/tree/master/pose-detection
- **Canvas performance**: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
- **Game loop patterns**: https://gameprogrammingpatterns.com/game-loop.html
- **Howler.js docs**: https://howlerjs.com/

---

**Last updated**: Phase 0 (Project Start)  
**Review cadence**: Update this document as patterns emerge during development.

---

This document is a living guide. When you discover better patterns or hit edge cases, update it. Future you will thank present you.

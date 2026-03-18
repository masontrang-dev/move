# Body Motion Game — Game Design Specification

> Treat this document like a calibration spec. All numbers here are starting points — tune them through playtesting.

---

## Core Mechanics

### 1. Target Hitting

**Objective:** Punch or swipe through circular targets with your hands.

**Rules:**
- Target appears on screen at random position
- Target moves toward the player (or across screen) at constant velocity
- Player must move their wrist through the target zone with sufficient velocity
- Hit registers only if wrist velocity exceeds threshold

**Parameters:**

| Parameter | Easy | Medium | Hard |
|---|---|---|---|
| Target radius | 80px | 60px | 40px |
| Target speed | 100px/s | 150px/s | 200px/s |
| Wrist velocity threshold | 0.5 m/s | 0.8 m/s | 1.2 m/s |
| Spawn rate (targets/sec) | 0.5 | 1.0 | 1.5 |
| Miss penalty | None | -10 points | -25 points |

**Scoring:**
- Base hit: **100 points**
- Combo multiplier: **1.0x → 1.5x → 2.0x → 2.5x** (resets on miss or obstacle hit)
- Perfect hit (center of target): **+50 bonus**

---

### 2. Obstacle Dodging

**Objective:** Move your body to avoid obstacles that sweep across the screen.

**Obstacle Types:**

1. **Horizontal Bar (Mid-height)**
   - Requires ducking or leaning
   - Checks: head, shoulders, elbows
   - Height: 60% of screen height

2. **Horizontal Bar (Low)**
   - Requires jumping or standing tall
   - Checks: hips, knees, ankles
   - Height: 30% of screen height

3. **Vertical Bar (Side sweep)**
   - Requires side-step or lean
   - Checks: all keypoints
   - Width: 15% of screen width

**Parameters:**

| Parameter | Easy | Medium | Hard |
|---|---|---|---|
| Obstacle speed | 120px/s | 180px/s | 250px/s |
| Obstacle thickness | 60px | 40px | 30px |
| Spawn rate (obstacles/sec) | 0.3 | 0.5 | 0.8 |
| Health points | 5 | 3 | 3 |
| Collision grace period | 200ms | 100ms | 50ms |

**Collision Detection:**
- Check if any major keypoint (confidence > 0.4) is inside obstacle bounding box
- Grace period: brief invulnerability after taking damage to prevent double-hits
- Visual feedback: red flash + health bar drop + sound effect

---

## Difficulty Escalation

### Dynamic Difficulty (within a session)

Difficulty increases over time during a single session:

```javascript
// Pseudo-code for escalation
function getDifficultyMultiplier(elapsedSeconds) {
  const baseMultiplier = 1.0;
  const escalationRate = 0.05; // 5% increase per 10 seconds
  return baseMultiplier + (elapsedSeconds / 10) * escalationRate;
}

// Apply to spawn rates and speeds
targetSpawnRate = baseSpawnRate * getDifficultyMultiplier(elapsed);
targetSpeed = baseSpeed * getDifficultyMultiplier(elapsed);
```

**Caps:**
- Max spawn rate: 3x base rate
- Max speed: 2x base speed
- Escalation plateaus after 3 minutes

### Preset Difficulty Modes

| Mode | Target Audience | Starting Values |
|---|---|---|
| **Easy** | Kids, beginners, warm-up | Low spawn rate, large targets, no miss penalty |
| **Medium** | Casual workout | Moderate spawn rate, medium targets, small miss penalty |
| **Hard** | Intense workout | High spawn rate, small targets, miss penalty, faster escalation |

---

## Session Structure

### Session Timer

- Default: **3 minutes**
- Optional: 1 min (quick), 5 min (standard), 10 min (endurance)

### Session Flow

```
1. Countdown (3, 2, 1, GO!) — 3 seconds
2. Warm-up phase (first 20 seconds) — reduced spawn rate, no obstacles
3. Main phase (remainder of session) — full difficulty, escalation active
4. Final 10 seconds — visual timer warning
5. Session end — freeze game, show summary
```

### Game Over Conditions

- **Time expires** (normal end)
- **Health reaches zero** (early end)
- **Player pauses and quits**

---

## Scoring System

### Base Scoring

```javascript
// Per hit
baseScore = 100;
comboMultiplier = Math.min(2.5, 1.0 + (consecutiveHits * 0.25));
centerBonus = (distanceFromCenter < targetRadius * 0.3) ? 50 : 0;

hitScore = (baseScore + centerBonus) * comboMultiplier;
```

### Combo System

- **Combo counter**: Increments on each hit
- **Combo multiplier**: 1.0x → 1.5x → 2.0x → 2.5x (caps at 2.5x)
- **Combo breaks on**:
  - Missing a target (target reaches edge of screen)
  - Hitting an obstacle
  - 3+ seconds without a hit

### Final Score

```javascript
finalScore = totalHitScore - (missedTargets * missPenalty) - (obstacleHits * 50);
```

---

## Visual Feedback

### Hit Feedback

- **Sound**: Punchy impact sound (Howler.js)
- **Visual**: 
  - Target explodes into particles
  - Screen flash (white, 50ms)
  - Score popup (+100, +150, etc.) fades upward
- **Haptic** (future): Vibration on mobile devices

### Miss Feedback

- **Sound**: Subtle "whoosh" as target exits screen
- **Visual**: Target fades out, no explosion
- **Score**: Red "-10" popup (if miss penalty enabled)

### Obstacle Hit Feedback

- **Sound**: Harsh "thud" or "clang"
- **Visual**:
  - Screen flash (red, 100ms)
  - Health bar drops
  - Skeleton overlay turns red briefly
- **Combo**: Reset to 1.0x

---

## Pose Detection Calibration

### Keypoint Confidence Threshold

- **Minimum confidence**: 0.4 (ignore keypoints below this)
- **High confidence**: 0.7+ (use for critical checks like obstacle collision)

### Coordinate Normalization

```javascript
// Map from video space (0–640, 0–480) to canvas space (0–1920, 0–1080)
function normalizeKeypoint(kp, videoWidth, videoHeight, canvasWidth, canvasHeight) {
  return {
    x: (kp.x / videoWidth) * canvasWidth,
    y: (kp.y / videoHeight) * canvasHeight,
    confidence: kp.confidence
  };
}

// Handle mirror flip (camera is mirrored)
normalizedX = canvasWidth - normalizedX;
```

### Velocity Calculation

```javascript
// Frame-over-frame velocity (pixels per second)
function calculateVelocity(currentPos, previousPos, deltaTime) {
  const dx = currentPos.x - previousPos.x;
  const dy = currentPos.y - previousPos.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance / (deltaTime / 1000); // px/s
}
```

### Joint Angle Calculation

```javascript
// Example: elbow angle
function calculateAngle(shoulder, elbow, wrist) {
  const v1 = { x: shoulder.x - elbow.x, y: shoulder.y - elbow.y };
  const v2 = { x: wrist.x - elbow.x, y: wrist.y - elbow.y };
  
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  
  return Math.acos(dot / (mag1 * mag2)) * (180 / Math.PI);
}
```

---

## Collision Detection

### Target Hit Detection

```javascript
function checkTargetHit(wristPos, wristVelocity, target) {
  const distance = Math.sqrt(
    (wristPos.x - target.x) ** 2 + 
    (wristPos.y - target.y) ** 2
  );
  
  const isInZone = distance < target.radius;
  const hasVelocity = wristVelocity > velocityThreshold;
  
  return isInZone && hasVelocity;
}
```

### Obstacle Collision Detection

```javascript
function checkObstacleCollision(keypoints, obstacle) {
  const majorKeypoints = ['nose', 'left_shoulder', 'right_shoulder', 
                          'left_elbow', 'right_elbow', 'left_hip', 'right_hip'];
  
  for (const kp of keypoints) {
    if (!majorKeypoints.includes(kp.name)) continue;
    if (kp.confidence < 0.4) continue;
    
    if (isPointInRect(kp, obstacle.boundingBox)) {
      return true;
    }
  }
  return false;
}
```

---

## Audio Design

### Sound Effects

| Event | Sound | Volume | Priority |
|---|---|---|---|
| Target hit | Punchy impact | 0.7 | High |
| Target miss | Soft whoosh | 0.3 | Low |
| Obstacle hit | Harsh thud | 0.8 | High |
| Combo milestone | Ascending chime | 0.5 | Medium |
| Game over | Descending tone | 0.6 | High |
| Countdown | Beep (3x) + GO! | 0.7 | High |

### Background Music

- **Optional**: Player can upload or select from library
- **Volume**: 0.3 (background level, doesn't interfere with SFX)
- **Looping**: Seamless loop for session duration

---

## Onboarding Flow

### First-Time Setup

1. **Camera permission request**
2. **Position check**: "Step back so your full body is visible"
3. **Lighting check**: Warn if confidence scores are consistently low
4. **Calibration**: Show skeleton overlay, ask player to move arms/legs
5. **Tutorial**: 30-second guided session (hit 3 targets, dodge 1 obstacle)

### Returning Player

- Skip directly to difficulty selection
- Optional: Quick camera check (1-button "Test Camera")

---

## UI/UX Guidelines

### HUD Elements (In-Game)

- **Top-left**: Score (large, bold)
- **Top-right**: Timer (countdown format: 2:45)
- **Top-center**: Combo counter (e.g., "5x COMBO!")
- **Bottom-center**: Health bar (visual hearts or bar)
- **Pause button**: Top-right corner (small, unobtrusive)

### Color Palette

- **Targets**: Bright cyan/blue (#00D9FF)
- **Obstacles**: Red/orange (#FF4444)
- **Hit feedback**: White flash
- **Obstacle hit**: Red flash
- **Background**: Dark gradient (not pure black — easier on eyes)

### Accessibility

- **High contrast mode**: Option for colorblind players
- **Audio cues**: All visual feedback has audio equivalent
- **Adjustable difficulty**: Easy mode is genuinely accessible

---

## Tuning Notes

> These parameters are starting points. Playtest and adjust based on feel.

**If the game feels too easy:**
- Decrease target radius by 10px
- Increase spawn rate by 0.2/sec
- Increase velocity threshold by 0.2 m/s

**If the game feels too hard:**
- Increase target radius by 10px
- Decrease spawn rate by 0.2/sec
- Remove or reduce miss penalty

**If hits feel unresponsive:**
- Lower velocity threshold
- Increase target radius
- Add predictive hit detection (register hit slightly before wrist enters zone)

**If obstacles feel unfair:**
- Increase obstacle thickness by 10px
- Slow down obstacle speed by 20px/s
- Add visual warning (flash obstacle before it enters screen)

---

## Future Enhancements

- **Power-ups**: Slow-motion, shield, double points
- **Target types**: Moving targets, shrinking targets, multi-hit targets
- **Obstacle patterns**: Synchronized obstacles, rhythm-based sequences
- **Multiplayer**: Side-by-side co-op or competitive modes
- **Custom sessions**: Player-created obstacle courses

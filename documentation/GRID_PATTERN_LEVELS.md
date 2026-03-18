# Grid Pattern Game Mode - Level System Design

## Overview

Progressive level-based system inspired by Activate Megagrid, with zone-based patterns (not random tiles), larger target areas, and a green home zone that both wrists can fit in simultaneously.

## Zone System

Instead of individual tiles, targets are **zones** made up of multiple tiles:

- **Small Zone**: 2x2 tiles (4 tiles total) - Early levels
- **Medium Zone**: 3x3 tiles (9 tiles total) - Mid levels
- **Large Zone**: 4x4 tiles (16 tiles total) - Home zone
- **Line Zone**: 1x5 or 5x1 tiles - Perimeter patterns

## Pattern-Based Layouts

Levels use predefined patterns, not random placement:

### Pattern Type 1: Perimeter Run

- Blue zones placed around the screen edges (top, right, bottom, left)
- Player runs around the perimeter hitting zones in sequence
- Green home zone in center (4x4 tiles)

### Pattern Type 2: Corner to Corner

- Blue zones at each corner of the screen
- Diagonal movement pattern
- Green home zone in center

### Pattern Type 3: Cross Pattern

- Blue zones form a + or X shape through the grid
- Sequential hitting from outside to center
- Green home zone at intersection

### Pattern Type 4: Zigzag

- Blue zones create a zigzag path through the grid
- Forces lateral movement
- Green home zone at end of path

### Pattern Type 5: Spiral

- Blue zones spiral from outside to inside (or vice versa)
- Progressive movement toward center
- Green home zone at spiral center/end

## Level Progression (1-15)

### Level 1-3: Tutorial/Easy

**Goal**: Learn the basic mechanics

- **Pattern**: Simple perimeter (4 corners only)
- **Blue Zones**: 4 zones (3x3 each) at screen corners
- **Red Penalties**: 0 (none)
- **Movement**: Static only
- **Time Limit**: 45 seconds
- **Home Zone**: 4x4 tiles in center (large, easy to hit with both wrists)

### Level 4-6: Introduction to Penalties

**Goal**: Introduce red penalty zones

- **Pattern**: Perimeter + center obstacles
- **Blue Zones**: 6 zones (2x2 each) around perimeter
- **Red Penalties**: 2 static zones (2x2 each) blocking direct paths
- **Movement**: Static only
- **Penalty**: -50 points, no health loss
- **Time Limit**: 40 seconds
- **Home Zone**: 4x4 tiles in center

### Level 7-9: Moving Penalties Begin

**Goal**: Add timing challenge with moving penalties

- **Pattern**: Cross or zigzag pattern
- **Blue Zones**: 8 zones (2x2 each) forming pattern
- **Red Penalties**: 2-3 zones that cycle through positions
- **Movement Speed**: Slow (3 seconds per position)
- **Penalty**: -100 points + 1 health damage
- **Time Limit**: 35 seconds
- **Home Zone**: 3x3 tiles (slightly smaller)

### Level 10-12: Moderate Challenge

**Goal**: Increase complexity and speed

- **Pattern**: Spiral or complex zigzag
- **Blue Zones**: 10 zones (2x2 each)
- **Red Penalties**: 3-4 zones moving in sweep patterns
- **Movement Speed**: Medium (2 seconds per position)
- **Penalty**: -150 points + 1 health damage
- **Time Limit**: 30 seconds
- **Home Zone**: 3x3 tiles

### Level 13-15: Advanced/Hard

**Goal**: Maximum challenge

- **Pattern**: Full perimeter + interior points
- **Blue Zones**: 12-15 zones (2x2 each)
- **Red Penalties**: 4-6 zones with complex movement
- **Movement Speed**: Fast (1.5 seconds per position)
- **Penalty**: -200 points + 1 health damage
- **Time Limit**: 25 seconds
- **Home Zone**: 3x3 tiles

## Red Penalty Tile Movement Patterns

### Pattern 1: Sequential Cycle

Red tiles appear in sequence, one at a time, cycling through predetermined positions

```
Position 1 → Position 2 → Position 3 → Position 1 (loop)
```

### Pattern 2: Horizontal Sweep

Red tiles sweep horizontally across the grid

```
Left to Right → Right to Left (repeat)
```

### Pattern 3: Vertical Sweep

Red tiles sweep vertically down/up the grid

```
Top to Bottom → Bottom to Top (repeat)
```

### Pattern 4: Diagonal Sweep

Red tiles move diagonally across the grid

```
Top-Left to Bottom-Right → Bottom-Left to Top-Right
```

### Pattern 5: Spiral Pattern

Red tiles spiral from outside to center or vice versa

### Pattern 6: Random Movement

Red tiles randomly teleport to new positions at intervals

## Timing Mechanics

### Red Tile Timing Challenge

- Red tiles occupy a position for a set duration (based on level)
- Player must time their movement to avoid red tiles
- If player's wrist is on a tile when it turns red → penalty
- Visual warning: Tile flashes orange 0.5 seconds before turning red

### Sequence Timing

- Each level has a time limit for completing the sequence
- Faster completion = higher score multiplier
- Running out of time = sequence fails, restart with penalty

## Scoring System

### Base Points

- Blue tile hit: 150 points
- Speed bonus: Up to 300 points (based on sequence completion time)
- Sequence completion: 400 points
- Level completion: 500 × level number

### Penalties

- Red tile hit: -50 to -200 points (level dependent)
- Health damage: 1 heart per red tile hit
- Time out: -100 points, restart sequence

### Multipliers

- Perfect sequence (no red hits): 2x multiplier
- Level streak (multiple levels without health loss): +0.5x per level

## Level Progression Logic

### Advancement

- Complete all sequences in a level to advance
- Sequences per level: 3-5 (increases with level)
- Can retry failed sequences (with score penalty)

### Failure Conditions

- Health reaches 0: Game over, restart from level 1 or last checkpoint
- Time runs out on all retry attempts: Level failed, restart level

### Checkpoints

- Checkpoint every 3 levels (Level 3, 6, 9, 12, 15)
- Can restart from last checkpoint on game over

## UI/UX Enhancements

### Level Display

- Current level number prominently displayed
- Progress bar showing sequences completed in level
- Next level preview after completion

### Visual Feedback

- Red tile warning flash (orange) before activation
- Movement trails for moving red tiles
- Level-up animation and sound
- Checkpoint celebration

### Instructions Per Level

- First time on each level tier: Show brief tutorial overlay
- Explain new mechanics (e.g., "Red tiles now move!")

## Implementation Phases

### Phase 1: Level Structure

- Create Level class/manager
- Define level configurations (targets, penalties, timing)
- Implement level progression logic
- Add level selection/restart UI

### Phase 2: Red Penalty Tiles

- Add red tile type to grid system
- Implement static red tiles (levels 4-6)
- Add penalty collision detection
- Visual feedback for red tiles

### Phase 3: Movement System

- Create movement pattern system
- Implement sequential cycling (levels 7-9)
- Add warning flash before red activation
- Timing-based collision detection

### Phase 4: Advanced Patterns

- Implement sweep patterns (horizontal, vertical, diagonal)
- Add spiral and random patterns
- Difficulty scaling based on level
- Movement speed adjustments

### Phase 5: Polish & Balance

- Tune difficulty curve through playtesting
- Add visual effects (trails, warnings, animations)
- Implement checkpoint system
- Add level-up celebrations
- Balance scoring and penalties

## Technical Considerations

### Red Tile Movement

```javascript
class RedTileMovement {
  constructor(pattern, speed, positions) {
    this.pattern = pattern; // 'cycle', 'sweep-h', 'sweep-v', etc.
    this.speed = speed; // milliseconds per position
    this.positions = positions; // array of tile positions
    this.currentIndex = 0;
    this.lastMoveTime = 0;
  }

  update(currentTime) {
    if (currentTime - this.lastMoveTime >= this.speed) {
      this.moveToNext();
      this.lastMoveTime = currentTime;
    }
  }

  getCurrentPosition() {
    return this.positions[this.currentIndex];
  }
}
```

### Warning System

- Track tiles that will become red in next 500ms
- Render with orange flash/pulse
- Audio cue for warning

### Collision Timing

- Check if wrist is on tile when it becomes red (not just when wrist enters)
- Grace period: 100ms after tile turns red (reaction time)

## Balancing Goals

### Difficulty Curve

- Levels 1-3: 90% success rate (tutorial)
- Levels 4-6: 70% success rate (learning)
- Levels 7-9: 50% success rate (challenge)
- Levels 10-12: 30% success rate (hard)
- Levels 13-15: 15% success rate (expert)

### Session Length

- Average level completion: 2-3 minutes
- Full game (15 levels): 30-45 minutes
- Checkpoint system allows shorter sessions

## Future Enhancements

- Endless mode after level 15
- Custom level editor
- Daily challenges with specific patterns
- Leaderboards per level
- Power-ups (freeze red tiles, slow time, shield)
- Different grid sizes per level
- Multiplayer race mode

## Questions to Resolve

1. Should health carry over between levels or reset?
2. Should there be a practice mode for individual levels?
3. Should red tiles be visible but inactive, or appear/disappear?
4. Should we show the red tile movement pattern preview before starting?
5. Should there be a "perfect run" bonus for completing all levels without damage?

# Phase 1 Setup Guide

## Overview
Phase 1 implements the Vision Proof of Concept - getting MoveNet pose detection working with webcam input and skeleton visualization.

## What Was Built

### Components Created
1. **`/client/src/vision/PoseDetector.jsx`** - Main pose detection component
   - Initializes MoveNet (SINGLEPOSE_LIGHTNING model)
   - Accesses webcam via MediaDevices API
   - Runs real-time pose inference
   - Draws skeleton overlay on canvas
   - Implements mirroring for natural camera view
   - Filters keypoints by confidence threshold (0.3)
   - Calculates and logs wrist velocity frame-by-frame

2. **`/client/src/pages/VisionDemo.jsx`** - Demo page for testing
   - Clean UI for testing pose detection
   - Shows Phase 1 checklist
   - Instructions for viewing console logs

3. **`/client/src/App.jsx`** - Updated with navigation
   - Simple home page with button to launch vision demo

## How to Run

1. **Start the development server:**
   ```bash
   cd client
   npm run dev
   ```

2. **Open the app in your browser** (usually http://localhost:5173)

3. **Click "Start Vision Demo"**

4. **Allow webcam access** when prompted

5. **Open browser console** (F12 or Cmd+Option+I) to see:
   - Raw keypoint data logged every frame
   - Left and right wrist velocity calculations

## What You Should See

- Your webcam feed (mirrored like a mirror)
- Green skeleton overlay tracking your body
- Red dots at each detected keypoint
- Skeleton connections between major body parts
- Console logs showing:
  - All 17 keypoints with x, y coordinates and confidence scores
  - Wrist velocity values as you move your hands

## Technical Details

### MoveNet Configuration
- Model: `SINGLEPOSE_LIGHTNING` (faster, good for real-time)
- Confidence threshold: 0.3 (filters out low-confidence detections)
- Video resolution: 640x480

### Keypoints Tracked
MoveNet detects 17 keypoints:
- Face: nose, left/right eye, left/right ear
- Upper body: left/right shoulder, left/right elbow, left/right wrist
- Lower body: left/right hip, left/right knee, left/right ankle

### Skeleton Connections
The overlay draws lines between:
- Shoulders
- Arms (shoulder → elbow → wrist)
- Torso (shoulders → hips)
- Legs (hip → knee → ankle)

### Mirroring Implementation
The video and canvas use `scaleX(-1)` transform and coordinate flipping to create a natural mirror effect, making it intuitive to move (raise your right hand, see the right side move).

## Phase 1 Completion Criteria

✅ All tasks completed:
- [x] Initialize MoveNet in the browser (TensorFlow.js)
- [x] Access webcam via MediaDevices API
- [x] Run inference and log raw keypoints to console
- [x] Draw skeleton overlay on canvas over video feed
- [x] Handle mirroring (camera is a mirror — flip x coordinates)
- [x] Add confidence filtering (hide keypoints below threshold)
- [x] Log wrist velocity frame-over-frame

**Phase 1 is complete when:** You can see your skeleton moving smoothly on screen. ✅

## Next Steps (Phase 2)

Phase 2 will build the first game mechanic:
- Game loop with requestAnimationFrame
- Spawning targets
- Collision detection between wrists and targets
- Velocity-based hit detection
- Score counter
- Sound effects

## Troubleshooting

**Camera not working?**
- Check browser permissions
- Make sure you're using HTTPS or localhost
- Try a different browser (Chrome/Edge recommended)

**Skeleton not appearing?**
- Check console for errors
- Ensure good lighting
- Stand back so your full body is visible
- Try adjusting the confidence threshold in PoseDetector.jsx

**Performance issues?**
- Close other tabs
- Ensure good lighting (helps detection speed)
- Consider using SINGLEPOSE_THUNDER model for even faster inference (lower accuracy)

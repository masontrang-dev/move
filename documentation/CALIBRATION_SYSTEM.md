# Calibration System for Shape Matching Mode

## Overview
The calibration system automatically scales shape templates to match the user's actual body dimensions, ensuring shapes are properly sized and positioned for each player.

## How It Works

### Calibration Flow
1. User selects "Shape Matching" mode and clicks "Start Game"
2. **Calibration screen appears** with instructions to hold a T-Pose
3. System collects 30 samples of body measurements over ~2-3 seconds
4. Progress bar shows calibration progress (0-100%)
5. User clicks "Finish Calibration" when bar is full
6. Shapes are automatically scaled to user's dimensions
7. Game begins with calibrated shapes

### What Gets Measured
- **Shoulder Width**: Distance between left and right shoulders
- **Shoulder Center**: Center point of shoulders (X, Y)
- **Arm Length**: Average length from shoulder to elbow to wrist
- **Arm Span**: Distance between wrists when arms are extended

### Calibration Requirements
- All 6 keypoints must be visible (wrists, elbows, shoulders)
- Confidence threshold: 0.5 minimum for all keypoints
- Minimum 10 samples required (out of 30 max)
- User should hold T-Pose (arms straight out) during calibration

## Shape Scaling Algorithm

### Normalization
- Default shapes use normalized coordinates (0-1 range)
- Default shoulder center: 0.5 (center of screen)
- Default shoulder width: 0.16 (16% of screen width)

### Scaling Process
1. **Calculate user's shoulder center** in normalized coordinates
2. **Calculate scale factor** based on user vs default shoulder width
3. **For each keypoint in shape**:
   - Get relative position from shoulder center
   - Scale horizontal distance by user's shoulder width ratio
   - Adjust vertical position based on user's shoulder height
   - Clamp to safe bounds (0.05 to 0.95)

### Example
```javascript
// User has wider shoulders than default
userShoulderWidth = 0.20  // 20% of screen
defaultShoulderWidth = 0.16  // 16% of screen
scaleX = 0.20 / 0.16 = 1.25

// Original left wrist at x=0.35
relativeX = 0.35 - 0.5 = -0.15
scaledRelativeX = -0.15 * 1.25 = -0.1875
scaledX = userShoulderCenter + scaledRelativeX
```

## Technical Implementation

### CalibrationSystem Class
**Location**: `/client/src/game/calibration.js`

**Key Methods**:
- `addSample(keypoints)` - Collects body measurements from pose data
- `finishCalibration()` - Averages samples and creates calibration data
- `scaleShapeToUser(shapeTemplate)` - Transforms shape to user's dimensions
- `reset()` - Clears calibration data for recalibration

### Integration Points

**GameLoop** (`gameLoop.js`):
- `startCalibration()` - Begins calibration mode
- `finishCalibration()` - Completes calibration
- `isCalibrationMode()` - Check if currently calibrating
- `getCalibrationProgress()` - Returns 0-1 progress value

**GameCanvas** (`GameCanvas.jsx`):
- Calibration state management
- "Finish Calibration" button appears during calibration
- Automatic calibration start for shape matching mode

## Visual Feedback

### Calibration Screen
- Dark overlay with instructions
- "Stand in a T-Pose with arms straight out"
- "Hold still while we measure your dimensions"
- Progress bar (0-100%)
- Skeleton overlay showing detected pose

### During Gameplay
- Shapes automatically scaled to user
- No visual indication (seamless experience)
- Shapes marked with `isScaled: true` flag

## Benefits

1. **Accessibility**: Works for users of all sizes (kids to adults)
2. **Accuracy**: Shapes match actual body proportions
3. **Fairness**: Same difficulty for all body types
4. **User Experience**: One-time calibration per session
5. **Flexibility**: Can recalibrate by restarting game

## Future Enhancements

Potential improvements:
- Save calibration data to localStorage for returning users
- "Skip Calibration" option if data exists
- "Recalibrate" button in pause menu
- Visual preview of calibrated shape before starting
- Support for different poses (not just T-Pose)

## Testing Recommendations

1. Test with users of different heights
2. Test with different camera distances
3. Verify shapes don't go off-screen
4. Check tolerance zones scale appropriately
5. Ensure calibration fails gracefully with poor lighting

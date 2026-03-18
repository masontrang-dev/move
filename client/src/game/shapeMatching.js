import { KEYPOINT_NAMES } from "./shapeTemplates.js";

class ShapeMatchingDetector {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.baseToleranceRadius = 0.08;
    this.difficultyMultiplier = 1.0;
  }

  setDifficultyMultiplier(multiplier) {
    this.difficultyMultiplier = multiplier;
  }

  getToleranceRadius() {
    return this.baseToleranceRadius / this.difficultyMultiplier;
  }

  getToleranceRadiusPixels() {
    const normalizedRadius = this.getToleranceRadius();
    return normalizedRadius * Math.max(this.canvasWidth, this.canvasHeight);
  }

  normalizeKeypoint(keypoint) {
    return {
      x: keypoint.x / this.canvasWidth,
      y: keypoint.y / this.canvasHeight,
      confidence: keypoint.confidence,
    };
  }

  denormalizePosition(normalizedPos) {
    return {
      x: normalizedPos.x * this.canvasWidth,
      y: normalizedPos.y * this.canvasHeight,
    };
  }

  checkKeypointMatch(playerKeypoint, targetPosition, toleranceRadius) {
    if (!playerKeypoint || playerKeypoint.confidence < 0.4) {
      return { matched: false, distance: Infinity };
    }

    const normalizedPlayer = this.normalizeKeypoint(playerKeypoint);
    const dx = normalizedPlayer.x - targetPosition.x;
    const dy = normalizedPlayer.y - targetPosition.y;
    const normalizedDistance = Math.sqrt(dx * dx + dy * dy);

    const matched = normalizedDistance <= toleranceRadius;
    const pixelDistance =
      normalizedDistance * Math.max(this.canvasWidth, this.canvasHeight);

    return { matched, distance: pixelDistance };
  }

  matchShape(playerKeypoints, targetShape) {
    if (!playerKeypoints || !targetShape) {
      return {
        isMatch: false,
        matchedKeypoints: [],
        totalKeypoints: KEYPOINT_NAMES.length,
        accuracy: 0,
        details: {},
      };
    }

    const toleranceRadius = this.getToleranceRadius();
    const results = {};
    let matchedCount = 0;
    let totalDistance = 0;

    KEYPOINT_NAMES.forEach((keypointName) => {
      const playerKp = playerKeypoints.find((kp) => kp.name === keypointName);
      const targetPos = targetShape.positions[keypointName];

      if (targetPos) {
        const result = this.checkKeypointMatch(
          playerKp,
          targetPos,
          toleranceRadius,
        );
        results[keypointName] = {
          matched: result.matched,
          distance: result.distance,
          targetPosition: this.denormalizePosition(targetPos),
          playerPosition: playerKp ? { x: playerKp.x, y: playerKp.y } : null,
          confidence: playerKp ? playerKp.confidence : 0,
          toleranceRadius: this.getToleranceRadiusPixels(),
        };

        if (result.matched) {
          matchedCount++;
        }
        totalDistance += result.distance;
      }
    });

    const accuracy = matchedCount / KEYPOINT_NAMES.length;
    const isMatch = accuracy >= 0.7;

    return {
      isMatch,
      matchedKeypoints: matchedCount,
      totalKeypoints: KEYPOINT_NAMES.length,
      accuracy,
      averageDistance: totalDistance / KEYPOINT_NAMES.length,
      toleranceRadius: this.getToleranceRadiusPixels(),
      details: results,
    };
  }

  calculateScore(matchResult, timeBonus = 0) {
    if (!matchResult.isMatch) {
      return 0;
    }

    let baseScore = 500;

    const accuracyBonus = Math.floor((matchResult.accuracy - 0.85) * 1000);

    const distanceScore = Math.max(0, 300 - matchResult.averageDistance);

    const perfectBonus = matchResult.accuracy === 1.0 ? 500 : 0;

    const totalScore =
      baseScore + accuracyBonus + distanceScore + timeBonus + perfectBonus;

    return Math.floor(totalScore);
  }
}

export default ShapeMatchingDetector;

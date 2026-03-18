import Spawner from "./spawner.js";
import Renderer from "./renderer.js";
import AudioManager from "./audio.js";
import { ObstacleManager } from "./obstacles.js";
import HealthManager from "./health.js";
import {
  checkTargetHit,
  checkObstacleCollision,
  getDistanceFromCenter,
} from "./collision.js";
import { ShapeGenerator } from "./shapeTemplates.js";
import ShapeMatchingDetector from "./shapeMatching.js";
import CalibrationSystem from "./calibration.js";
import GridPatternManager from "./gridPattern.js";

class GameLoop {
  constructor(canvas, config = {}) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.spawner = new Spawner(canvas.width, canvas.height);
    this.obstacleManager = new ObstacleManager(canvas.width, canvas.height);
    this.healthManager = new HealthManager();
    this.audioManager = new AudioManager();
    this.shapeGenerator = new ShapeGenerator();
    this.shapeMatchingDetector = new ShapeMatchingDetector(
      canvas.width,
      canvas.height,
    );
    this.calibrationSystem = new CalibrationSystem(canvas.width, canvas.height);
    this.gridPatternManager = new GridPatternManager(
      canvas.width,
      canvas.height,
    );

    this.targets = [];
    this.score = 0;
    this.combo = 1;
    this.consecutiveHits = 0;

    this.animationId = null;
    this.lastTimestamp = 0;
    this.isRunning = false;
    this.gameOver = false;
    this.obstaclesEnabled = true;
    this.isPaused = false;

    this.poseData = null;
    this.previousWristPositions = { left: null, right: null };
    this.wristVelocities = { left: 0, right: 0 };

    this.sessionDuration = config.sessionDuration || 180000;
    this.sessionStartTime = 0;
    this.elapsedTime = 0;
    this.pausedTime = 0;
    this.lastPauseTime = 0;

    this.difficulty = config.difficulty || "medium";
    this.difficultyMultiplier = 1.0;
    this.onSessionEnd = config.onSessionEnd || null;

    this.gameMode = config.gameMode || "targets";
    this.currentShape = null;
    this.currentMatchResult = null;
    this.shapesCompleted = 0;
    this.shapeHoldTime = 0;
    this.shapeHoldRequired = 1000;
    this.isCalibrating = false;
    this.calibrationComplete = false;
    this.shapeApproachTime = 5000;
    this.shapeStartTime = 0;
    this.shapeScale = 0.3;
    this.shapeAlpha = 0.3;
    this.calibrationCountdown = 3;
    this.calibrationCountdownStartTime = 0;
    this.isCalibrationCountdown = false;
    this.gridSequencesCompleted = 0;
  }

  setObstaclesEnabled(enabled) {
    this.obstaclesEnabled = enabled;
  }

  async init() {
    await this.audioManager.init();
  }

  setPoseData(keypoints) {
    if (!keypoints || keypoints.length === 0) {
      this.poseData = null;
      return;
    }

    const scale = 2;
    const normalizedKeypoints = keypoints.map((kp) => ({
      name: kp.name,
      x: this.canvas.width - kp.x * scale,
      y: kp.y * scale,
      confidence: kp.score,
    }));

    this.poseData = normalizedKeypoints;
    this.updateWristVelocities(normalizedKeypoints);
  }

  updateWristVelocities(keypoints) {
    const leftWrist = keypoints.find((kp) => kp.name === "left_wrist");
    const rightWrist = keypoints.find((kp) => kp.name === "right_wrist");

    if (leftWrist && leftWrist.confidence > 0.4) {
      if (this.previousWristPositions.left) {
        const dx = leftWrist.x - this.previousWristPositions.left.x;
        const dy = leftWrist.y - this.previousWristPositions.left.y;
        this.wristVelocities.left = Math.sqrt(dx * dx + dy * dy);
      }
      this.previousWristPositions.left = { x: leftWrist.x, y: leftWrist.y };
    }

    if (rightWrist && rightWrist.confidence > 0.4) {
      if (this.previousWristPositions.right) {
        const dx = rightWrist.x - this.previousWristPositions.right.x;
        const dy = rightWrist.y - this.previousWristPositions.right.y;
        this.wristVelocities.right = Math.sqrt(dx * dx + dy * dy);
      }
      this.previousWristPositions.right = { x: rightWrist.x, y: rightWrist.y };
    }
  }

  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.sessionStartTime = performance.now();
    this.lastTimestamp = this.sessionStartTime;
    this.animationId = requestAnimationFrame((timestamp) =>
      this.loop(timestamp),
    );
  }

  pause() {
    if (!this.isRunning || this.isPaused) return;
    this.isPaused = true;
    this.lastPauseTime = performance.now();
  }

  resume() {
    if (!this.isRunning || !this.isPaused) return;
    this.isPaused = false;
    const pauseDuration = performance.now() - this.lastPauseTime;
    this.pausedTime += pauseDuration;
    this.lastTimestamp = performance.now();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  reset() {
    this.targets = [];
    this.obstacleManager.clear();
    this.healthManager.reset();
    this.score = 0;
    this.combo = 1;
    this.consecutiveHits = 0;
    this.gameOver = false;
    this.isPaused = false;
    this.previousWristPositions = { left: null, right: null };
    this.wristVelocities = { left: 0, right: 0 };
    this.sessionStartTime = 0;
    this.elapsedTime = 0;
    this.pausedTime = 0;
    this.lastPauseTime = 0;
    this.difficultyMultiplier = 1.0;
    this.currentShape = null;
    this.currentMatchResult = null;
    this.shapesCompleted = 0;
    this.shapeHoldTime = 0;
    this.isCalibrating = false;
    this.calibrationComplete = false;
    this.shapeStartTime = 0;
    this.shapeScale = 0.3;
    this.shapeAlpha = 0.3;
    this.calibrationCountdown = 3;
    this.calibrationCountdownStartTime = 0;
    this.isCalibrationCountdown = false;
    if (this.calibrationSystem) {
      this.calibrationSystem.reset();
    }
    if (this.gridPatternManager) {
      this.gridPatternManager.reset();
    }
    this.gridSequencesCompleted = 0;
  }

  loop(timestamp) {
    if (!this.isRunning) return;

    if (this.isPaused) {
      this.animationId = requestAnimationFrame((ts) => this.loop(ts));
      return;
    }

    const deltaTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    this.elapsedTime = timestamp - this.sessionStartTime - this.pausedTime;

    this.update(deltaTime, timestamp);
    this.render(deltaTime);

    if (this.elapsedTime >= this.sessionDuration) {
      this.gameOver = true;
      this.stop();
      if (this.onSessionEnd) {
        this.onSessionEnd(this.getSessionStats());
      }
      return;
    }

    if (this.healthManager.isDead() && !this.gameOver) {
      this.gameOver = true;
      this.stop();
      if (this.onSessionEnd) {
        this.onSessionEnd(this.getSessionStats());
      }
      return;
    }

    this.animationId = requestAnimationFrame((ts) => this.loop(ts));
  }

  update(deltaTime, currentTime) {
    this.updateDifficulty();
    this.healthManager.update(currentTime);

    if (this.gameMode === "shapeMatching") {
      this.updateShapeMatching(deltaTime, currentTime);
    } else if (this.gameMode === "gridPattern") {
      this.updateGridPattern(deltaTime, currentTime);
    } else {
      this.spawner.setDifficultyMultiplier(this.difficultyMultiplier);
      if (this.spawner.shouldSpawn(currentTime)) {
        this.targets.push(this.spawner.createTarget());
      }

      if (this.obstaclesEnabled) {
        this.obstacleManager.setDifficultyMultiplier(this.difficultyMultiplier);
        this.obstacleManager.spawn(currentTime);
        this.obstacleManager.update(deltaTime);
      }

      this.targets.forEach((target) => {
        target.x += target.vx * (deltaTime / 1000);
        target.y += target.vy * (deltaTime / 1000);
      });

      this.checkCollisions();

      this.targets = this.targets.filter((target) => {
        if (this.spawner.isOffScreen(target)) {
          this.audioManager.playMiss();
          this.resetCombo();
          return false;
        }
        return true;
      });
    }
  }

  updateShapeMatching(deltaTime, currentTime) {
    if (this.isCalibrationCountdown) {
      const elapsed = currentTime - this.calibrationCountdownStartTime;
      const secondsRemaining = Math.ceil((3000 - elapsed) / 1000);

      if (elapsed >= 3000) {
        this.isCalibrationCountdown = false;
        this.isCalibrating = true;
      }
      return;
    }

    if (this.isCalibrating) {
      this.calibrationSystem.addSample(this.poseData);
      return;
    }

    if (!this.currentShape) {
      const difficultyLevel =
        this.difficulty === "easy"
          ? "easy"
          : this.difficulty === "hard"
            ? "hard"
            : "medium";
      let shape = this.shapeGenerator.generateRandomShape(difficultyLevel);

      if (this.calibrationComplete && this.calibrationSystem.isComplete()) {
        shape = this.calibrationSystem.scaleShapeToUser(shape);
      }

      this.currentShape = shape;
      this.shapeHoldTime = 0;
      this.shapeStartTime = currentTime;
      this.shapeScale = 0.3;
      this.shapeAlpha = 0.3;
    }

    const elapsed = currentTime - this.shapeStartTime;
    const progress = Math.min(1.0, elapsed / this.shapeApproachTime);
    this.shapeScale = 0.3 + progress * 0.7;
    this.shapeAlpha = 0.3 + progress * 0.7;

    const matchingWindow = this.shapeApproachTime * 0.3;
    const isInMatchingWindow =
      elapsed >= this.shapeApproachTime - matchingWindow;

    this.shapeMatchingDetector.setDifficultyMultiplier(
      this.difficultyMultiplier,
    );
    this.currentMatchResult = this.shapeMatchingDetector.matchShape(
      this.poseData,
      this.currentShape,
    );

    if (elapsed >= this.shapeApproachTime) {
      if (this.currentMatchResult.isMatch) {
        const timingBonus = 500;
        const points = this.shapeMatchingDetector.calculateScore(
          this.currentMatchResult,
          timingBonus,
        );
        this.score += points;
        this.shapesCompleted++;

        this.audioManager.playHit();
        this.renderer.triggerFlash();
        this.renderer.addScorePopup(
          this.canvas.width / 2,
          this.canvas.height / 2,
          points,
        );
      } else {
        this.audioManager.playMiss();
        this.renderer.triggerDamageFlash();
      }

      const difficultyLevel =
        this.difficulty === "easy"
          ? "easy"
          : this.difficulty === "hard"
            ? "hard"
            : "medium";
      let rawShape = this.shapeGenerator.generateRandomShape(difficultyLevel);

      let newShape = rawShape;
      if (this.calibrationComplete && this.calibrationSystem.isComplete()) {
        newShape = this.calibrationSystem.scaleShapeToUser(rawShape);
      }

      this.currentShape = newShape;
      this.currentMatchResult = null;
      this.shapeHoldTime = 0;
      this.shapeStartTime = currentTime;
      this.shapeScale = 0.3;
      this.shapeAlpha = 0.3;
    } else if (isInMatchingWindow && this.currentMatchResult.isMatch) {
      this.shapeHoldTime += deltaTime;
    } else {
      this.shapeHoldTime = 0;
    }
  }

  updateGridPattern(deltaTime, currentTime) {
    if (this.gridPatternManager.blueZones.length === 0) {
      this.gridPatternManager.generateNewSequence();
    }

    this.gridPatternManager.setDifficultyMultiplier(this.difficultyMultiplier);

    if (!this.poseData) return;

    const leftWrist = this.poseData.find((kp) => kp.name === "left_wrist");
    const rightWrist = this.poseData.find((kp) => kp.name === "right_wrist");

    const checkWrist = (wrist) => {
      const result = this.gridPatternManager.checkWristHit(wrist, currentTime);
      if (result.hit) {
        if (result.type === "target") {
          this.score += result.points;
          this.audioManager.playHit();
          this.renderer.triggerFlash();
          const center = result.zone.getCenterPosition(
            this.gridPatternManager.tileWidth,
            this.gridPatternManager.tileHeight,
          );
          this.renderer.addScorePopup(center.x, center.y, result.points);
        } else if (result.type === "penalty") {
          this.score = Math.max(0, this.score + result.points);
          this.healthManager.takeDamage();
          this.audioManager.playMiss();
          this.renderer.triggerDamageFlash();
          const center = result.zone.getCenterPosition(
            this.gridPatternManager.tileWidth,
            this.gridPatternManager.tileHeight,
          );
          this.renderer.addScorePopup(center.x, center.y, result.points);
        }
      }
    };

    checkWrist(leftWrist);
    checkWrist(rightWrist);

    const homeResult = this.gridPatternManager.checkBothWristsInHome(
      leftWrist,
      rightWrist,
      currentTime,
    );

    if (homeResult.hit && homeResult.type === "sequence_complete") {
      this.score += homeResult.points;
      this.audioManager.playHit();
      this.renderer.triggerFlash();
      const center = homeResult.zone.getCenterPosition(
        this.gridPatternManager.tileWidth,
        this.gridPatternManager.tileHeight,
      );
      this.renderer.addScorePopup(center.x, center.y, homeResult.points);
      this.gridSequencesCompleted++;
      this.gridPatternManager.generateNewSequence();
    }
  }

  startCalibration() {
    this.isCalibrationCountdown = true;
    this.calibrationCountdownStartTime = performance.now();
    this.isCalibrating = false;
    this.calibrationComplete = false;
    this.calibrationSystem.reset();
  }

  finishCalibration() {
    const success = this.calibrationSystem.finishCalibration();
    this.isCalibrating = false;
    this.calibrationComplete = success;
    return success;
  }

  getCalibrationProgress() {
    return (
      this.calibrationSystem.getSampleCount() /
      this.calibrationSystem.maxSamples
    );
  }

  isCalibrationMode() {
    return this.isCalibrating || this.isCalibrationCountdown;
  }

  updateDifficulty() {
    const progressPercent = this.elapsedTime / this.sessionDuration;

    let baseMultiplier = 1.0;
    let escalationRate = 0.5;

    switch (this.difficulty) {
      case "easy":
        baseMultiplier = 0.7;
        escalationRate = 0.3;
        break;
      case "medium":
        baseMultiplier = 1.0;
        escalationRate = 0.5;
        break;
      case "hard":
        baseMultiplier = 1.3;
        escalationRate = 0.8;
        break;
    }

    this.difficultyMultiplier =
      baseMultiplier + progressPercent * escalationRate;
  }

  checkCollisions() {
    if (!this.poseData) return;

    const leftWrist = this.poseData.find((kp) => kp.name === "left_wrist");
    const rightWrist = this.poseData.find((kp) => kp.name === "right_wrist");

    this.targets = this.targets.filter((target) => {
      const leftHit = checkTargetHit(
        leftWrist,
        target,
        this.wristVelocities.left,
      );
      const rightHit = checkTargetHit(
        rightWrist,
        target,
        this.wristVelocities.right,
      );

      if (leftHit || rightHit) {
        const wrist = leftHit ? leftWrist : rightWrist;
        this.handleHit(target, wrist);
        return false;
      }
      return true;
    });

    if (this.obstaclesEnabled) {
      const obstacles = this.obstacleManager.getObstacles();
      for (const obstacle of obstacles) {
        if (checkObstacleCollision(this.poseData, obstacle)) {
          this.handleObstacleHit();
          break;
        }
      }
    }
  }

  handleHit(target, wrist) {
    const distance = getDistanceFromCenter(wrist, target);
    const isPerfect = distance < target.radius * 0.3;

    let points = 100;
    if (isPerfect) {
      points += 50;
    }

    this.consecutiveHits++;
    this.combo = Math.min(2.5, 1.0 + (this.consecutiveHits - 1) * 0.5);

    const finalPoints = Math.floor(points * this.combo);
    this.score += finalPoints;

    this.audioManager.playHit();
    this.renderer.triggerFlash();
    this.renderer.addScorePopup(target.x, target.y, finalPoints);
  }

  handleObstacleHit() {
    const damaged = this.healthManager.takeDamage();
    if (damaged) {
      this.resetCombo();
      this.renderer.triggerDamageFlash();
    }
  }

  resetCombo() {
    this.consecutiveHits = 0;
    this.combo = 1;
  }

  render(deltaTime) {
    const timeRemaining = Math.max(0, this.sessionDuration - this.elapsedTime);

    if (this.gameMode === "shapeMatching") {
      this.renderShapeMatching(deltaTime, timeRemaining);
    } else if (this.gameMode === "gridPattern") {
      this.renderGridPattern(deltaTime, timeRemaining);
    } else {
      this.renderer.render(
        this.targets,
        this.obstacleManager.getObstacles(),
        this.poseData,
        this.score,
        this.combo,
        this.healthManager.getHealth(),
        this.healthManager.getMaxHealth(),
        deltaTime,
        timeRemaining,
        this.isPaused,
      );
    }
  }

  renderGridPattern(deltaTime, timeRemaining) {
    const progress = this.gridPatternManager.getProgress();
    const tiles = this.gridPatternManager.tiles;

    this.renderer.drawGridPattern(
      tiles,
      progress,
      this.poseData,
      this.score,
      this.healthManager.getHealth(),
      this.healthManager.getMaxHealth(),
      deltaTime,
      timeRemaining,
      this.isPaused,
    );
  }

  renderShapeMatching(deltaTime, timeRemaining) {
    this.renderer.clear();

    // ...
    if (this.isCalibrationCountdown) {
      this.renderer.drawSkeleton(this.poseData);
      this.drawCalibrationCountdown();
    } else if (this.isCalibrating) {
      this.renderer.drawSkeleton(this.poseData);
      this.drawCalibrationOverlay();
    } else {
      if (this.currentShape) {
        const elapsed = performance.now() - this.shapeStartTime;
        const timeRemaining = Math.max(0, this.shapeApproachTime - elapsed);

        this.renderer.drawShapeConnections(
          this.currentShape,
          this.poseData,
          this.currentMatchResult,
          this.shapeScale,
          this.shapeAlpha,
        );
        this.renderer.drawShapeTargets(
          this.currentShape,
          this.currentMatchResult,
          this.shapeScale,
          this.shapeAlpha,
        );

        this.drawApproachTimer(timeRemaining);
      }

      this.renderer.drawSkeleton(this.poseData);

      if (this.currentShape) {
        this.renderer.drawShapeInfo(this.currentShape, this.currentMatchResult);
      }

      this.renderer.drawHUD(
        this.score,
        this.combo,
        this.healthManager.getHealth(),
        this.healthManager.getMaxHealth(),
        timeRemaining,
      );

      const elapsed = performance.now() - this.shapeStartTime;
      const matchingWindow = this.shapeApproachTime * 0.3;
      const isInMatchingWindow =
        elapsed >= this.shapeApproachTime - matchingWindow;

      if (
        isInMatchingWindow &&
        this.currentMatchResult &&
        this.currentMatchResult.isMatch
      ) {
        const holdProgress = this.shapeHoldTime / this.shapeHoldRequired;
        this.drawMatchIndicator(holdProgress);
      }

      this.renderer.drawFlash();
      this.renderer.updateAndDrawScorePopups(deltaTime);

      if (this.isPaused) {
        this.renderer.drawPauseOverlay();
      }
    }
  }

  drawCalibrationCountdown() {
    const ctx = this.renderer.ctx;
    const elapsed = performance.now() - this.calibrationCountdownStartTime;
    const secondsRemaining = Math.max(0, Math.ceil((3000 - elapsed) / 1000));

    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      "GET READY FOR CALIBRATION",
      this.canvas.width / 2,
      this.canvas.height / 2 - 150,
    );

    ctx.font = "24px Arial";
    ctx.fillStyle = "#AAAAAA";
    ctx.fillText(
      "Stand in a T-Pose with arms straight out",
      this.canvas.width / 2,
      this.canvas.height / 2 - 100,
    );
    ctx.fillText(
      "Calibration will begin in...",
      this.canvas.width / 2,
      this.canvas.height / 2 - 60,
    );

    ctx.fillStyle = secondsRemaining <= 1 ? "#FF4444" : "#4CAF50";
    ctx.font = "bold 120px Arial";
    ctx.fillText(
      secondsRemaining.toString(),
      this.canvas.width / 2,
      this.canvas.height / 2 + 50,
    );
  }

  drawCalibrationOverlay() {
    const ctx = this.renderer.ctx;
    const progress = this.getCalibrationProgress();

    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      "CALIBRATION",
      this.canvas.width / 2,
      this.canvas.height / 2 - 100,
    );

    ctx.font = "24px Arial";
    ctx.fillStyle = "#AAAAAA";
    ctx.fillText(
      "Stand in a T-Pose with arms straight out",
      this.canvas.width / 2,
      this.canvas.height / 2 - 50,
    );
    ctx.fillText(
      "Hold still while we measure your dimensions",
      this.canvas.width / 2,
      this.canvas.height / 2 - 20,
    );

    const barWidth = 400;
    const barHeight = 40;
    const barX = this.canvas.width / 2 - barWidth / 2;
    const barY = this.canvas.height / 2 + 40;

    ctx.fillStyle = "#333";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(barX, barY, barWidth * progress, barHeight);

    ctx.strokeStyle = "#FFF";
    ctx.lineWidth = 3;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 20px Arial";
    const percentage = Math.floor(progress * 100);
    ctx.fillText(`${percentage}%`, this.canvas.width / 2, barY + 27);
  }

  drawApproachTimer(timeRemaining) {
    const ctx = this.renderer.ctx;
    const seconds = Math.ceil(timeRemaining / 1000);

    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(this.canvas.width / 2 - 60, 140, 120, 60);

    ctx.fillStyle = timeRemaining < 1500 ? "#FF4444" : "#FFFFFF";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText(seconds.toString(), this.canvas.width / 2, 185);

    ctx.font = "16px Arial";
    ctx.fillStyle = "#AAAAAA";
    ctx.fillText("seconds", this.canvas.width / 2, 205);
  }

  drawMatchIndicator(progress) {
    const ctx = this.renderer.ctx;
    const size = 100;
    const x = this.canvas.width / 2;
    const y = this.canvas.height / 2;

    ctx.beginPath();
    ctx.arc(
      x,
      y,
      size,
      -Math.PI / 2,
      -Math.PI / 2 + Math.PI * 2 * progress,
      false,
    );
    ctx.strokeStyle = "#00FF00";
    ctx.lineWidth = 10;
    ctx.stroke();

    ctx.fillStyle = "#00FF00";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("MATCHED!", x, y + 8);
  }

  getScore() {
    return this.score;
  }

  getSessionStats() {
    return {
      score: this.score,
      duration: this.elapsedTime,
      difficulty: this.difficulty,
      maxCombo: this.consecutiveHits,
      timeRemaining: Math.max(0, this.sessionDuration - this.elapsedTime),
      gameMode: this.gameMode,
      shapesCompleted: this.shapesCompleted,
      gridSequencesCompleted: this.gridSequencesCompleted,
    };
  }

  getRemainingTime() {
    return Math.max(0, this.sessionDuration - this.elapsedTime);
  }

  getIsPaused() {
    return this.isPaused;
  }

  getCalibrationSystem() {
    return this.calibrationSystem;
  }

  getShapeScale() {
    return this.shapeScale;
  }

  getShapeAlpha() {
    return this.shapeAlpha;
  }
}

export default GameLoop;

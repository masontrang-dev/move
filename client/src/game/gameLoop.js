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

class GameLoop {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.spawner = new Spawner(canvas.width, canvas.height);
    this.obstacleManager = new ObstacleManager(canvas.width, canvas.height);
    this.healthManager = new HealthManager();
    this.audioManager = new AudioManager();

    this.targets = [];
    this.score = 0;
    this.combo = 1;
    this.consecutiveHits = 0;

    this.animationId = null;
    this.lastTimestamp = 0;
    this.isRunning = false;
    this.gameOver = false;
    this.obstaclesEnabled = true;

    this.poseData = null;
    this.previousWristPositions = { left: null, right: null };
    this.wristVelocities = { left: 0, right: 0 };
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
    this.lastTimestamp = performance.now();
    this.animationId = requestAnimationFrame((timestamp) =>
      this.loop(timestamp),
    );
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
    this.previousWristPositions = { left: null, right: null };
    this.wristVelocities = { left: 0, right: 0 };
  }

  loop(timestamp) {
    if (!this.isRunning) return;

    const deltaTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    this.update(deltaTime, timestamp);
    this.render(deltaTime);

    if (this.healthManager.isDead() && !this.gameOver) {
      this.gameOver = true;
      this.stop();
      return;
    }

    this.animationId = requestAnimationFrame((ts) => this.loop(ts));
  }

  update(deltaTime, currentTime) {
    this.healthManager.update(currentTime);

    if (this.spawner.shouldSpawn(currentTime)) {
      this.targets.push(this.spawner.createTarget());
    }

    if (this.obstaclesEnabled) {
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
    this.renderer.render(
      this.targets,
      this.obstacleManager.getObstacles(),
      this.poseData,
      this.score,
      this.combo,
      this.healthManager.getHealth(),
      this.healthManager.getMaxHealth(),
      deltaTime,
    );
  }

  getScore() {
    return this.score;
  }
}

export default GameLoop;

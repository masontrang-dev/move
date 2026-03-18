const CONFIDENCE_THRESHOLD = 0.4;

class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.flashAlpha = 0;
    this.flashColor = "white";
    this.scorePopups = [];
    this.scale = 1;
  }

  setScale(scale) {
    this.scale = scale;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawTargets(targets) {
    targets.forEach((target) => {
      this.ctx.beginPath();
      this.ctx.arc(target.x, target.y, target.radius, 0, 2 * Math.PI);
      this.ctx.fillStyle = "#00D9FF";
      this.ctx.fill();
      this.ctx.strokeStyle = "#00FFFF";
      this.ctx.lineWidth = 3;
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.arc(target.x, target.y, target.radius * 0.3, 0, 2 * Math.PI);
      this.ctx.fillStyle = "#FFFFFF";
      this.ctx.fill();
    });
  }

  drawSkeleton(keypoints) {
    if (!keypoints || keypoints.length === 0) return;

    const connections = [
      ["left_shoulder", "right_shoulder"],
      ["left_shoulder", "left_elbow"],
      ["left_elbow", "left_wrist"],
      ["right_shoulder", "right_elbow"],
      ["right_elbow", "right_wrist"],
      ["left_shoulder", "left_hip"],
      ["right_shoulder", "right_hip"],
      ["left_hip", "right_hip"],
      ["left_hip", "left_knee"],
      ["left_knee", "left_ankle"],
      ["right_hip", "right_knee"],
      ["right_knee", "right_ankle"],
    ];

    connections.forEach(([startName, endName]) => {
      const start = keypoints.find((kp) => kp.name === startName);
      const end = keypoints.find((kp) => kp.name === endName);

      if (
        start &&
        end &&
        start.confidence > CONFIDENCE_THRESHOLD &&
        end.confidence > CONFIDENCE_THRESHOLD
      ) {
        this.ctx.beginPath();
        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(end.x, end.y);
        this.ctx.strokeStyle = "#00ff00";
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }
    });

    keypoints.forEach((keypoint) => {
      if (keypoint.confidence > CONFIDENCE_THRESHOLD) {
        this.ctx.beginPath();
        this.ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
        this.ctx.fillStyle = "#ff0000";
        this.ctx.fill();
      }
    });
  }

  drawObstacles(obstacles) {
    obstacles.forEach((obstacle) => {
      if (obstacle.isWarning) {
        this.ctx.fillStyle = "rgba(255, 68, 68, 0.3)";
        this.ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
        this.ctx.setLineDash([10, 10]);
      } else {
        this.ctx.fillStyle = "#FF4444";
        this.ctx.strokeStyle = "#FF0000";
        this.ctx.setLineDash([]);
      }

      this.ctx.fillRect(
        obstacle.x,
        obstacle.y,
        obstacle.width,
        obstacle.height,
      );

      this.ctx.lineWidth = 4;
      this.ctx.strokeRect(
        obstacle.x,
        obstacle.y,
        obstacle.width,
        obstacle.height,
      );

      this.ctx.setLineDash([]);
    });
  }

  drawHUD(score, combo, currentHealth, maxHealth) {
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.font = "bold 48px Arial";
    this.ctx.textAlign = "left";
    this.ctx.fillText(`Score: ${score}`, 20, 60);

    if (combo > 1) {
      this.ctx.fillStyle = "#FFD700";
      this.ctx.font = "bold 32px Arial";
      this.ctx.textAlign = "center";
      this.ctx.fillText(`${combo}x COMBO!`, this.canvas.width / 2, 60);
    }

    this.drawHealthBar(currentHealth, maxHealth);
  }

  drawHealthBar(currentHealth, maxHealth) {
    const heartSize = 40;
    const heartSpacing = 50;
    const startX = this.canvas.width - maxHealth * heartSpacing - 20;
    const startY = 20;

    for (let i = 0; i < maxHealth; i++) {
      const x = startX + i * heartSpacing;
      const y = startY;

      if (i < currentHealth) {
        this.ctx.fillStyle = "#FF0000";
      } else {
        this.ctx.fillStyle = "#444444";
      }

      this.ctx.font = `${heartSize}px Arial`;
      this.ctx.fillText("❤", x, y + heartSize);
    }
  }

  triggerFlash(color = "white") {
    this.flashAlpha = 0.5;
    this.flashColor = color;
  }

  triggerDamageFlash() {
    this.flashAlpha = 0.6;
    this.flashColor = "red";
  }

  drawFlash() {
    if (this.flashAlpha > 0) {
      const rgb = this.flashColor === "red" ? "255, 0, 0" : "255, 255, 255";
      this.ctx.fillStyle = `rgba(${rgb}, ${this.flashAlpha})`;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.flashAlpha -= 0.05;
    }
  }

  addScorePopup(x, y, points) {
    this.scorePopups.push({
      x,
      y,
      points,
      alpha: 1.0,
      offsetY: 0,
    });
  }

  updateAndDrawScorePopups(deltaTime) {
    this.scorePopups = this.scorePopups.filter((popup) => {
      popup.offsetY -= deltaTime * 0.1;
      popup.alpha -= deltaTime * 0.001;

      if (popup.alpha > 0) {
        this.ctx.fillStyle = `rgba(255, 215, 0, ${popup.alpha})`;
        this.ctx.font = "bold 32px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillText(`+${popup.points}`, popup.x, popup.y + popup.offsetY);
        return true;
      }
      return false;
    });
  }

  render(
    targets,
    obstacles,
    keypoints,
    score,
    combo,
    health,
    maxHealth,
    deltaTime,
  ) {
    this.ctx.save();
    this.ctx.scale(this.scale, this.scale);

    this.clear();
    this.drawObstacles(obstacles);
    this.drawTargets(targets);
    this.drawSkeleton(keypoints);
    this.drawHUD(score, combo, health, maxHealth);
    this.drawFlash();
    this.updateAndDrawScorePopups(deltaTime);

    this.ctx.restore();
  }
}

export default Renderer;

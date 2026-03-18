const OBSTACLE_TYPES = {
  HORIZONTAL_MID: "horizontal_mid",
  HORIZONTAL_LOW: "horizontal_low",
  VERTICAL: "vertical",
};

const BASE_OBSTACLE_SPEED = 120;
const BASE_OBSTACLE_SPAWN_RATE = 0.3;
const OBSTACLE_THICKNESS = 60;
const WARNING_DISTANCE = 400;

class ObstacleManager {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.obstacles = [];
    this.lastSpawnTime = 0;
    this.baseSpawnInterval = 1000 / BASE_OBSTACLE_SPAWN_RATE;
    this.difficultyMultiplier = 1.0;
  }

  setDifficultyMultiplier(multiplier) {
    this.difficultyMultiplier = multiplier;
  }

  shouldSpawn(currentTime) {
    const adjustedInterval = this.baseSpawnInterval / this.difficultyMultiplier;
    if (currentTime - this.lastSpawnTime >= adjustedInterval) {
      this.lastSpawnTime = currentTime;
      return true;
    }
    return false;
  }

  createObstacle() {
    const types = Object.values(OBSTACLE_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    const speed = BASE_OBSTACLE_SPEED * this.difficultyMultiplier;

    let obstacle = {
      type,
      id: Date.now() + Math.random(),
      thickness: OBSTACLE_THICKNESS,
      isWarning: true,
      warningAlpha: 0.3,
    };

    switch (type) {
      case OBSTACLE_TYPES.HORIZONTAL_MID:
        const fromTop = Math.random() > 0.5;
        obstacle.targetY = this.canvasHeight * 0.45;
        const widthPercent = 0.4 + Math.random() * 0.3;
        obstacle.width = this.canvasWidth * widthPercent;
        const xPosition = Math.random() * (this.canvasWidth - obstacle.width);
        obstacle.x = xPosition;
        obstacle.height = OBSTACLE_THICKNESS;
        obstacle.vx = 0;
        obstacle.vy = fromTop ? speed : -speed;
        obstacle.y = fromTop
          ? -OBSTACLE_THICKNESS
          : this.canvasHeight + OBSTACLE_THICKNESS;
        break;

      case OBSTACLE_TYPES.HORIZONTAL_LOW:
        const fromTopLow = Math.random() > 0.5;
        obstacle.targetY = this.canvasHeight * 0.75;
        const widthPercentLow = 0.4 + Math.random() * 0.3;
        obstacle.width = this.canvasWidth * widthPercentLow;
        const xPositionLow =
          Math.random() * (this.canvasWidth - obstacle.width);
        obstacle.x = xPositionLow;
        obstacle.height = OBSTACLE_THICKNESS;
        obstacle.vx = 0;
        obstacle.vy = fromTopLow ? speed : -speed;
        obstacle.y = fromTopLow
          ? -OBSTACLE_THICKNESS
          : this.canvasHeight + OBSTACLE_THICKNESS;
        break;

      case OBSTACLE_TYPES.VERTICAL:
        const fromLeft = Math.random() > 0.5;
        obstacle.targetX = fromLeft
          ? this.canvasWidth * 0.3
          : this.canvasWidth * 0.7;
        const heightPercent = 0.4 + Math.random() * 0.3;
        obstacle.height = this.canvasHeight * heightPercent;
        const yPosition = Math.random() * (this.canvasHeight - obstacle.height);
        obstacle.y = yPosition;
        obstacle.width = OBSTACLE_THICKNESS;
        obstacle.vx = fromLeft ? speed : -speed;
        obstacle.vy = 0;
        obstacle.x = fromLeft
          ? -OBSTACLE_THICKNESS
          : this.canvasWidth + OBSTACLE_THICKNESS;
        break;
    }

    return obstacle;
  }

  update(deltaTime) {
    this.obstacles.forEach((obstacle) => {
      obstacle.x += obstacle.vx * (deltaTime / 1000);
      obstacle.y += obstacle.vy * (deltaTime / 1000);

      if (
        obstacle.type === OBSTACLE_TYPES.VERTICAL &&
        obstacle.targetX !== undefined
      ) {
        const fromLeft = obstacle.vx > 0;
        if (
          (fromLeft && obstacle.x >= obstacle.targetX) ||
          (!fromLeft && obstacle.x <= obstacle.targetX)
        ) {
          obstacle.x = obstacle.targetX;
          obstacle.vx = 0;
          obstacle.isWarning = false;
        }
      } else if (obstacle.targetY !== undefined) {
        const fromTop = obstacle.vy > 0;
        if (
          (fromTop && obstacle.y >= obstacle.targetY) ||
          (!fromTop && obstacle.y <= obstacle.targetY)
        ) {
          obstacle.y = obstacle.targetY;
          obstacle.vy = 0;
          obstacle.isWarning = false;
        }
      }
    });

    this.obstacles = this.obstacles.filter((obstacle) => {
      return !this.isOffScreen(obstacle);
    });
  }

  isOffScreen(obstacle) {
    return (
      obstacle.x > this.canvasWidth + obstacle.width ||
      obstacle.x < -obstacle.width * 2 ||
      obstacle.y > this.canvasHeight + obstacle.height ||
      obstacle.y < -obstacle.height * 2
    );
  }

  spawn(currentTime) {
    if (this.shouldSpawn(currentTime)) {
      this.obstacles.push(this.createObstacle());
    }
  }

  getObstacles() {
    return this.obstacles;
  }

  clear() {
    this.obstacles = [];
  }
}

export { ObstacleManager, OBSTACLE_TYPES };

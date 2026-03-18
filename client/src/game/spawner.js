const TARGET_RADIUS = 80;
const BASE_TARGET_SPEED = 300;
const BASE_SPAWN_RATE = 1.0;

class Spawner {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.lastSpawnTime = 0;
    this.baseSpawnInterval = 1000 / BASE_SPAWN_RATE;
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

  createTarget() {
    const side = Math.floor(Math.random() * 4);
    const speed = BASE_TARGET_SPEED * this.difficultyMultiplier;
    let x, y, vx, vy;

    switch (side) {
      case 0:
        x = Math.random() * this.canvasWidth;
        y = -TARGET_RADIUS;
        vx = (Math.random() - 0.5) * speed * 0.5;
        vy = speed;
        break;
      case 1:
        x = this.canvasWidth + TARGET_RADIUS;
        y = Math.random() * this.canvasHeight;
        vx = -speed;
        vy = (Math.random() - 0.5) * speed * 0.5;
        break;
      case 2:
        x = Math.random() * this.canvasWidth;
        y = this.canvasHeight + TARGET_RADIUS;
        vx = (Math.random() - 0.5) * speed * 0.5;
        vy = -speed;
        break;
      case 3:
        x = -TARGET_RADIUS;
        y = Math.random() * this.canvasHeight;
        vx = speed;
        vy = (Math.random() - 0.5) * speed * 0.5;
        break;
    }

    return {
      x,
      y,
      vx,
      vy,
      radius: TARGET_RADIUS,
      id: Date.now() + Math.random(),
    };
  }

  isOffScreen(target) {
    return (
      target.x < -target.radius * 2 ||
      target.x > this.canvasWidth + target.radius * 2 ||
      target.y < -target.radius * 2 ||
      target.y > this.canvasHeight + target.radius * 2
    );
  }
}

export default Spawner;

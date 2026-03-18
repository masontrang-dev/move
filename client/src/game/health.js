const MAX_HEALTH = 3;
const INVULNERABILITY_DURATION = 500;

class HealthManager {
  constructor() {
    this.maxHealth = MAX_HEALTH;
    this.currentHealth = MAX_HEALTH;
    this.isInvulnerable = false;
    this.invulnerabilityTimer = 0;
    this.lastHitTime = 0;
  }

  reset() {
    this.currentHealth = this.maxHealth;
    this.isInvulnerable = false;
    this.invulnerabilityTimer = 0;
    this.lastHitTime = 0;
  }

  takeDamage() {
    if (this.isInvulnerable) {
      return false;
    }

    this.currentHealth = Math.max(0, this.currentHealth - 1);
    this.isInvulnerable = true;
    this.lastHitTime = performance.now();
    
    return true;
  }

  update(currentTime) {
    if (this.isInvulnerable) {
      const timeSinceHit = currentTime - this.lastHitTime;
      if (timeSinceHit >= INVULNERABILITY_DURATION) {
        this.isInvulnerable = false;
      }
    }
  }

  getHealth() {
    return this.currentHealth;
  }

  getMaxHealth() {
    return this.maxHealth;
  }

  isDead() {
    return this.currentHealth <= 0;
  }

  isInvulnerabilityActive() {
    return this.isInvulnerable;
  }
}

export default HealthManager;

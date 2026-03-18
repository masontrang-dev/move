class AudioManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
  }

  async init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.createHitSound();
      this.createMissSound();
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      this.enabled = false;
    }
  }

  createHitSound() {
    this.sounds.hit = () => {
      if (!this.enabled || !this.audioContext) return;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.1);
    };
  }

  createMissSound() {
    this.sounds.miss = () => {
      if (!this.enabled || !this.audioContext) return;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.15);

      gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.15);
    };
  }

  playHit() {
    if (this.sounds.hit) {
      this.sounds.hit();
    }
  }

  playMiss() {
    if (this.sounds.miss) {
      this.sounds.miss();
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }
}

export default AudioManager;

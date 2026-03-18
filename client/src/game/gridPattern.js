import PatternManager from "./patternManager.js";

class GridPatternManager {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    this.gridCols = 25;
    this.gridRows = 15;
    this.tileWidth = canvasWidth / this.gridCols;
    this.tileHeight = canvasHeight / this.gridRows;

    this.patternManager = new PatternManager(this.gridRows, this.gridCols);
    this.currentLevel = 1;
    this.blueZones = [];
    this.homeZone = null;
    this.redZones = [];
    this.zonesCollected = 0;
    this.completedSequences = 0;
    this.lastHitTime = 0;
    this.sequenceStartTime = 0;
    this.difficultyMultiplier = 1.0;
    this.hitCooldown = 200;

    this.tiles = this.initializeGrid();
  }

  initializeGrid() {
    const tiles = [];
    for (let row = 0; row < this.gridRows; row++) {
      for (let col = 0; col < this.gridCols; col++) {
        tiles.push({
          row,
          col,
          x: col * this.tileWidth,
          y: row * this.tileHeight,
          width: this.tileWidth,
          height: this.tileHeight,
          type: "empty",
          centerX: col * this.tileWidth + this.tileWidth / 2,
          centerY: row * this.tileHeight + this.tileHeight / 2,
        });
      }
    }
    return tiles;
  }

  getTileAt(x, y) {
    const col = Math.floor(x / this.tileWidth);
    const row = Math.floor(y / this.tileHeight);

    if (col < 0 || col >= this.gridCols || row < 0 || row >= this.gridRows) {
      return null;
    }

    return this.tiles[row * this.gridCols + col];
  }

  getRandomEmptyTile() {
    const emptyTiles = this.tiles.filter((t) => t.type === "empty");
    if (emptyTiles.length === 0) return null;
    return emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
  }

  setDifficultyMultiplier(multiplier) {
    this.difficultyMultiplier = multiplier;
  }

  generateNewSequence() {
    this.tiles.forEach((tile) => (tile.type = "empty"));

    const pattern = this.patternManager.getPatternForLevel(this.currentLevel);
    this.patternManager.addPenaltyZones(pattern, this.currentLevel);

    this.blueZones = pattern.blueZones;
    this.homeZone = pattern.homeZone;
    this.redZones = pattern.redZones;

    this.blueZones.forEach((zone) => {
      const tileIndices = zone.getTileIndices(this.gridCols);
      tileIndices.forEach((index) => {
        if (this.tiles[index]) {
          this.tiles[index].type = "target";
          this.tiles[index].zone = zone;
        }
      });
    });

    if (this.homeZone) {
      const homeTileIndices = this.homeZone.getTileIndices(this.gridCols);
      homeTileIndices.forEach((index) => {
        if (this.tiles[index]) {
          this.tiles[index].type = "home";
          this.tiles[index].zone = this.homeZone;
        }
      });
    }

    this.redZones.forEach((zone) => {
      const tileIndices = zone.getTileIndices(this.gridCols);
      tileIndices.forEach((index) => {
        if (this.tiles[index]) {
          this.tiles[index].type = "penalty";
          this.tiles[index].zone = zone;
        }
      });
    });

    this.zonesCollected = 0;
    this.sequenceStartTime = performance.now();
  }

  getActiveTiles() {
    return this.tiles.filter((t) => t.type !== "empty");
  }

  checkWristHit(wrist, currentTime) {
    if (!wrist || wrist.confidence < 0.4) {
      return { hit: false, type: null, points: 0, zone: null };
    }

    if (currentTime - this.lastHitTime < this.hitCooldown) {
      return { hit: false, type: null, points: 0, zone: null };
    }

    for (const zone of this.blueZones) {
      if (
        zone.active &&
        zone.containsPoint(wrist.x, wrist.y, this.tileWidth, this.tileHeight)
      ) {
        const basePoints = 150;
        zone.active = false;

        const tileIndices = zone.getTileIndices(this.gridCols);
        tileIndices.forEach((index) => {
          if (this.tiles[index]) {
            this.tiles[index].type = "empty";
          }
        });

        this.zonesCollected++;
        this.lastHitTime = currentTime;

        return { hit: true, type: "target", points: basePoints, zone };
      }
    }

    for (const zone of this.redZones) {
      if (
        zone.active &&
        zone.containsPoint(wrist.x, wrist.y, this.tileWidth, this.tileHeight)
      ) {
        this.lastHitTime = currentTime;
        return { hit: true, type: "penalty", points: -100, zone };
      }
    }

    return { hit: false, type: null, points: 0, zone: null };
  }

  checkBothWristsInHome(leftWrist, rightWrist, currentTime) {
    if (!leftWrist || !rightWrist) {
      return { hit: false, type: null, points: 0, zone: null };
    }

    if (leftWrist.confidence < 0.4 || rightWrist.confidence < 0.4) {
      return { hit: false, type: null, points: 0, zone: null };
    }

    if (this.zonesCollected < this.blueZones.length) {
      return { hit: false, type: null, points: 0, zone: null };
    }

    if (currentTime - this.lastHitTime < this.hitCooldown) {
      return { hit: false, type: null, points: 0, zone: null };
    }

    if (!this.homeZone) {
      return { hit: false, type: null, points: 0, zone: null };
    }

    const leftInHome = this.homeZone.containsPoint(
      leftWrist.x,
      leftWrist.y,
      this.tileWidth,
      this.tileHeight,
    );
    const rightInHome = this.homeZone.containsPoint(
      rightWrist.x,
      rightWrist.y,
      this.tileWidth,
      this.tileHeight,
    );

    if (leftInHome && rightInHome) {
      const sequenceTime = currentTime - this.sequenceStartTime;
      const speedBonus = Math.max(0, 500 - Math.floor(sequenceTime / 100));
      const sequenceBonus = 400;
      const totalPoints = speedBonus + sequenceBonus;

      this.completedSequences++;
      this.currentLevel++;
      this.lastHitTime = currentTime;

      return {
        hit: true,
        type: "sequence_complete",
        points: totalPoints,
        zone: this.homeZone,
      };
    }

    return { hit: false, type: null, points: 0, zone: null };
  }

  isSequenceComplete() {
    return this.zonesCollected >= this.blueZones.length;
  }

  allTargetsCollected() {
    return this.zonesCollected >= this.blueZones.length;
  }

  getRemainingZones() {
    return this.blueZones.filter((z) => z.active);
  }

  getProgress() {
    return {
      current: this.zonesCollected,
      total: this.blueZones.length,
      completedSequences: this.completedSequences,
      allCollected: this.allTargetsCollected(),
      currentLevel: this.currentLevel,
    };
  }

  reset() {
    this.currentLevel = 1;
    this.blueZones = [];
    this.homeZone = null;
    this.redZones = [];
    this.zonesCollected = 0;
    this.completedSequences = 0;
    this.lastHitTime = 0;
    this.sequenceStartTime = 0;
    this.tiles.forEach((tile) => (tile.type = "empty"));
  }
}

export default GridPatternManager;

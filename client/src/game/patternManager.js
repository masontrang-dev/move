import Zone from "./zone.js";

class PatternManager {
  constructor(gridRows, gridCols) {
    this.gridRows = gridRows;
    this.gridCols = gridCols;
  }

  getPatternForLevel(level) {
    const patterns = [
      this.createFourCornersPattern,
      this.createPerimeterPattern,
      this.createCrossPattern,
      this.createZigzagPattern,
      this.createDiamondPattern,
    ];

    const patternIndex = ((level - 1) % patterns.length);
    return patterns[patternIndex].call(this);
  }

  createFourCornersPattern() {
    return {
      name: "Four Corners",
      blueZones: [
        new Zone(1, 1, 3, 3, "target"),
        new Zone(1, 21, 3, 3, "target"),
        new Zone(11, 1, 3, 3, "target"),
        new Zone(11, 21, 3, 3, "target"),
      ],
      homeZone: new Zone(6, 11, 4, 4, "home"),
      redZones: [],
    };
  }

  createPerimeterPattern() {
    return {
      name: "Perimeter Run",
      blueZones: [
        new Zone(1, 5, 2, 2, "target"),
        new Zone(1, 18, 2, 2, "target"),
        new Zone(5, 22, 2, 2, "target"),
        new Zone(9, 22, 2, 2, "target"),
        new Zone(12, 18, 2, 2, "target"),
        new Zone(12, 5, 2, 2, "target"),
        new Zone(9, 1, 2, 2, "target"),
        new Zone(5, 1, 2, 2, "target"),
      ],
      homeZone: new Zone(6, 11, 4, 4, "home"),
      redZones: [],
    };
  }

  createCrossPattern() {
    return {
      name: "Cross Pattern",
      blueZones: [
        new Zone(7, 2, 2, 2, "target"),
        new Zone(7, 8, 2, 2, "target"),
        new Zone(7, 16, 2, 2, "target"),
        new Zone(7, 21, 2, 2, "target"),
        new Zone(2, 11, 2, 2, "target"),
        new Zone(5, 11, 2, 2, "target"),
        new Zone(9, 11, 2, 2, "target"),
        new Zone(12, 11, 2, 2, "target"),
      ],
      homeZone: new Zone(6, 10, 4, 4, "home"),
      redZones: [],
    };
  }

  createZigzagPattern() {
    return {
      name: "Zigzag",
      blueZones: [
        new Zone(2, 2, 2, 2, "target"),
        new Zone(4, 8, 2, 2, "target"),
        new Zone(6, 2, 2, 2, "target"),
        new Zone(8, 8, 2, 2, "target"),
        new Zone(10, 2, 2, 2, "target"),
        new Zone(12, 8, 2, 2, "target"),
        new Zone(2, 21, 2, 2, "target"),
        new Zone(4, 15, 2, 2, "target"),
        new Zone(6, 21, 2, 2, "target"),
        new Zone(8, 15, 2, 2, "target"),
        new Zone(10, 21, 2, 2, "target"),
        new Zone(12, 15, 2, 2, "target"),
      ],
      homeZone: new Zone(6, 11, 4, 4, "home"),
      redZones: [],
    };
  }

  createDiamondPattern() {
    return {
      name: "Diamond",
      blueZones: [
        new Zone(1, 11, 2, 2, "target"),
        new Zone(4, 17, 2, 2, "target"),
        new Zone(7, 21, 2, 2, "target"),
        new Zone(10, 17, 2, 2, "target"),
        new Zone(13, 11, 2, 2, "target"),
        new Zone(10, 5, 2, 2, "target"),
        new Zone(7, 2, 2, 2, "target"),
        new Zone(4, 5, 2, 2, "target"),
      ],
      homeZone: new Zone(6, 11, 4, 4, "home"),
      redZones: [],
    };
  }

  addPenaltyZones(pattern, level) {
    if (level < 4) return pattern;

    const penaltyCount = Math.min(Math.floor((level - 3) / 2), 4);
    const penaltyZones = [];

    const possiblePositions = [
      { row: 3, col: 11 },
      { row: 9, col: 11 },
      { row: 6, col: 5 },
      { row: 6, col: 17 },
      { row: 4, col: 7 },
      { row: 8, col: 15 },
    ];

    for (let i = 0; i < Math.min(penaltyCount, possiblePositions.length); i++) {
      const pos = possiblePositions[i];
      penaltyZones.push(new Zone(pos.row, pos.col, 2, 2, "penalty"));
    }

    pattern.redZones = penaltyZones;
    return pattern;
  }
}

export default PatternManager;

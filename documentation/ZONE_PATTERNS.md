# Zone-Based Pattern Definitions

## Zone System Overview
Zones are multi-tile areas that act as single targets. This makes them easier to hit and allows both wrists to fit in the home zone simultaneously.

## Grid: 25 columns × 15 rows

## Zone Definitions

### Home Zone (Green)
**Size**: 4×4 tiles (16 tiles total)
**Position**: Usually center of grid
**Coordinates**: Rows 6-9, Cols 11-14 (centered)
**Purpose**: Both wrists must be in this zone to complete level

### Blue Target Zones
**Sizes**: 
- Small: 2×2 tiles (4 tiles)
- Medium: 3×3 tiles (9 tiles)
- Large: 4×4 tiles (16 tiles)

### Red Penalty Zones
**Sizes**: 2×2 tiles (4 tiles)
**Behavior**: Static or moving

## Pattern Layouts

### Level 1: Four Corners
```
Blue zones at corners:
- Top-Left: (row 1-3, col 1-3) - 3×3
- Top-Right: (row 1-3, col 22-24) - 3×3
- Bottom-Left: (row 12-14, col 1-3) - 3×3
- Bottom-Right: (row 12-14, col 22-24) - 3×3

Home zone (center):
- (row 6-9, col 11-14) - 4×4
```

### Level 2: Perimeter Run (8 zones)
```
Top edge: 2 zones
- (row 1-2, col 5-6) - 2×2
- (row 1-2, col 19-20) - 2×2

Right edge: 2 zones
- (row 5-6, col 23-24) - 2×2
- (row 9-10, col 23-24) - 2×2

Bottom edge: 2 zones
- (row 13-14, col 19-20) - 2×2
- (row 13-14, col 5-6) - 2×2

Left edge: 2 zones
- (row 9-10, col 1-2) - 2×2
- (row 5-6, col 1-2) - 2×2

Home zone (center):
- (row 6-9, col 11-14) - 4×4
```

### Level 3: Cross Pattern
```
Horizontal line (left to right):
- (row 7-8, col 2-3) - 2×2
- (row 7-8, col 8-9) - 2×2
- (row 7-8, col 16-17) - 2×2
- (row 7-8, col 22-23) - 2×2

Vertical line (top to bottom):
- (row 2-3, col 12-13) - 2×2
- (row 5-6, col 12-13) - 2×2
- (row 9-10, col 12-13) - 2×2
- (row 12-13, col 12-13) - 2×2

Home zone (center):
- (row 6-9, col 11-14) - 4×4
```

### Level 4: Zigzag Pattern
```
Row 1: (row 2-3, col 2-3) - 2×2
Row 2: (row 4-5, col 8-9) - 2×2
Row 3: (row 6-7, col 2-3) - 2×2
Row 4: (row 8-9, col 8-9) - 2×2
Row 5: (row 10-11, col 2-3) - 2×2
Row 6: (row 12-13, col 8-9) - 2×2

Mirror on right side:
Row 1: (row 2-3, col 22-23) - 2×2
Row 2: (row 4-5, col 16-17) - 2×2
Row 3: (row 6-7, col 22-23) - 2×2
Row 4: (row 8-9, col 16-17) - 2×2
Row 5: (row 10-11, col 22-23) - 2×2
Row 6: (row 12-13, col 16-17) - 2×2

Home zone (center):
- (row 6-9, col 11-14) - 4×4
```

### Level 5: Diamond Pattern
```
Top: (row 1-2, col 12-13) - 2×2
Right: (row 7-8, col 22-23) - 2×2
Bottom: (row 13-14, col 12-13) - 2×2
Left: (row 7-8, col 2-3) - 2×2

Mid-points:
- Top-Right: (row 4-5, col 17-18) - 2×2
- Bottom-Right: (row 10-11, col 17-18) - 2×2
- Bottom-Left: (row 10-11, col 7-8) - 2×2
- Top-Left: (row 4-5, col 7-8) - 2×2

Home zone (center):
- (row 6-9, col 11-14) - 4×4
```

## Implementation Notes

### Zone Class
```javascript
class Zone {
  constructor(startRow, startCol, rows, cols, type) {
    this.startRow = startRow;
    this.startCol = startCol;
    this.rows = rows;
    this.cols = cols;
    this.type = type; // 'home', 'target', 'penalty', 'empty'
    this.tiles = []; // Array of tile references
  }
  
  containsTile(row, col) {
    return row >= this.startRow && 
           row < this.startRow + this.rows &&
           col >= this.startCol && 
           col < this.startCol + this.cols;
  }
  
  containsPoint(x, y, tileWidth, tileHeight) {
    const col = Math.floor(x / tileWidth);
    const row = Math.floor(y / tileHeight);
    return this.containsTile(row, col);
  }
}
```

### Pattern Manager
```javascript
class PatternManager {
  constructor(gridRows, gridCols) {
    this.gridRows = gridRows;
    this.gridCols = gridCols;
    this.patterns = this.definePatterns();
  }
  
  definePatterns() {
    return {
      fourCorners: this.createFourCornersPattern(),
      perimeterRun: this.createPerimeterPattern(),
      crossPattern: this.createCrossPattern(),
      zigzag: this.createZigzagPattern(),
      diamond: this.createDiamondPattern()
    };
  }
  
  getPatternForLevel(level) {
    const patternNames = ['fourCorners', 'perimeterRun', 'crossPattern', 'zigzag', 'diamond'];
    const patternIndex = (level - 1) % patternNames.length;
    return this.patterns[patternNames[patternIndex]];
  }
}
```

## Benefits of Zone System

1. **Easier to Hit**: Larger target areas reduce precision requirements
2. **Both Wrists Fit**: 4×4 home zone (16 tiles) easily accommodates both wrists
3. **Pattern-Based**: Feels more like Activate game with intentional layouts
4. **Physical Movement**: Encourages running between zones
5. **Visual Clarity**: Zones are visually distinct from individual tiles
6. **Scalable Difficulty**: Can adjust zone size per level

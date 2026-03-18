class Zone {
  constructor(startRow, startCol, rows, cols, type) {
    this.startRow = startRow;
    this.startCol = startCol;
    this.rows = rows;
    this.cols = cols;
    this.type = type; // 'home', 'target', 'penalty', 'empty'
    this.tiles = [];
    this.active = true;
  }

  containsTile(row, col) {
    return (
      row >= this.startRow &&
      row < this.startRow + this.rows &&
      col >= this.startCol &&
      col < this.startCol + this.cols
    );
  }

  containsPoint(x, y, tileWidth, tileHeight) {
    const col = Math.floor(x / tileWidth);
    const row = Math.floor(y / tileHeight);
    return this.containsTile(row, col);
  }

  getTileIndices(gridCols) {
    const indices = [];
    for (let r = this.startRow; r < this.startRow + this.rows; r++) {
      for (let c = this.startCol; c < this.startCol + this.cols; c++) {
        indices.push(r * gridCols + c);
      }
    }
    return indices;
  }

  getCenterPosition(tileWidth, tileHeight) {
    const centerRow = this.startRow + this.rows / 2;
    const centerCol = this.startCol + this.cols / 2;
    return {
      x: centerCol * tileWidth,
      y: centerRow * tileHeight,
    };
  }

  getBounds(tileWidth, tileHeight) {
    return {
      x: this.startCol * tileWidth,
      y: this.startRow * tileHeight,
      width: this.cols * tileWidth,
      height: this.rows * tileHeight,
    };
  }
}

export default Zone;

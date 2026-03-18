const KEYPOINT_NAMES = [
  'left_wrist',
  'left_elbow',
  'left_shoulder',
  'right_shoulder',
  'right_elbow',
  'right_wrist'
];

const SHAPE_TEMPLATES = {
  tPose: {
    name: 'T-Pose',
    difficulty: 'easy',
    description: 'Arms straight out to the sides',
    positions: {
      left_wrist: { x: 0.15, y: 0.45 },
      left_elbow: { x: 0.30, y: 0.45 },
      left_shoulder: { x: 0.42, y: 0.40 },
      right_shoulder: { x: 0.58, y: 0.40 },
      right_elbow: { x: 0.70, y: 0.45 },
      right_wrist: { x: 0.85, y: 0.45 }
    }
  },
  
  handsUp: {
    name: 'Hands Up',
    difficulty: 'easy',
    description: 'Both hands raised above head',
    positions: {
      left_wrist: { x: 0.35, y: 0.15 },
      left_elbow: { x: 0.38, y: 0.28 },
      left_shoulder: { x: 0.42, y: 0.40 },
      right_shoulder: { x: 0.58, y: 0.40 },
      right_elbow: { x: 0.62, y: 0.28 },
      right_wrist: { x: 0.65, y: 0.15 }
    }
  },
  
  handsDown: {
    name: 'Hands Down',
    difficulty: 'easy',
    description: 'Both hands at your sides',
    positions: {
      left_wrist: { x: 0.38, y: 0.65 },
      left_elbow: { x: 0.40, y: 0.52 },
      left_shoulder: { x: 0.42, y: 0.40 },
      right_shoulder: { x: 0.58, y: 0.40 },
      right_elbow: { x: 0.60, y: 0.52 },
      right_wrist: { x: 0.62, y: 0.65 }
    }
  },
  
  leftArmUp: {
    name: 'Left Arm Up',
    difficulty: 'medium',
    description: 'Left arm raised, right arm down',
    positions: {
      left_wrist: { x: 0.35, y: 0.15 },
      left_elbow: { x: 0.38, y: 0.28 },
      left_shoulder: { x: 0.42, y: 0.40 },
      right_shoulder: { x: 0.58, y: 0.40 },
      right_elbow: { x: 0.60, y: 0.52 },
      right_wrist: { x: 0.62, y: 0.65 }
    }
  },
  
  rightArmUp: {
    name: 'Right Arm Up',
    difficulty: 'medium',
    description: 'Right arm raised, left arm down',
    positions: {
      left_wrist: { x: 0.38, y: 0.65 },
      left_elbow: { x: 0.40, y: 0.52 },
      left_shoulder: { x: 0.42, y: 0.40 },
      right_shoulder: { x: 0.58, y: 0.40 },
      right_elbow: { x: 0.62, y: 0.28 },
      right_wrist: { x: 0.65, y: 0.15 }
    }
  },
  
  crossArms: {
    name: 'Cross Arms',
    difficulty: 'medium',
    description: 'Arms crossed in front of chest',
    positions: {
      left_wrist: { x: 0.62, y: 0.45 },
      left_elbow: { x: 0.50, y: 0.48 },
      left_shoulder: { x: 0.42, y: 0.40 },
      right_shoulder: { x: 0.58, y: 0.40 },
      right_elbow: { x: 0.50, y: 0.48 },
      right_wrist: { x: 0.38, y: 0.45 }
    }
  },
  
  yPose: {
    name: 'Y-Pose',
    difficulty: 'medium',
    description: 'Arms raised in a Y shape',
    positions: {
      left_wrist: { x: 0.25, y: 0.20 },
      left_elbow: { x: 0.35, y: 0.30 },
      left_shoulder: { x: 0.42, y: 0.40 },
      right_shoulder: { x: 0.58, y: 0.40 },
      right_elbow: { x: 0.65, y: 0.30 },
      right_wrist: { x: 0.75, y: 0.20 }
    }
  },
  
  leftPointRight: {
    name: 'Point Right',
    difficulty: 'hard',
    description: 'Left arm pointing right, right arm down',
    positions: {
      left_wrist: { x: 0.75, y: 0.40 },
      left_elbow: { x: 0.58, y: 0.42 },
      left_shoulder: { x: 0.42, y: 0.40 },
      right_shoulder: { x: 0.58, y: 0.40 },
      right_elbow: { x: 0.60, y: 0.52 },
      right_wrist: { x: 0.62, y: 0.65 }
    }
  },
  
  rightPointLeft: {
    name: 'Point Left',
    difficulty: 'hard',
    description: 'Right arm pointing left, left arm down',
    positions: {
      left_wrist: { x: 0.38, y: 0.65 },
      left_elbow: { x: 0.40, y: 0.52 },
      left_shoulder: { x: 0.42, y: 0.40 },
      right_shoulder: { x: 0.58, y: 0.40 },
      right_elbow: { x: 0.42, y: 0.42 },
      right_wrist: { x: 0.25, y: 0.40 }
    }
  },
  
  diagonalArms: {
    name: 'Diagonal Arms',
    difficulty: 'hard',
    description: 'Left arm up-right, right arm down-left',
    positions: {
      left_wrist: { x: 0.65, y: 0.20 },
      left_elbow: { x: 0.52, y: 0.30 },
      left_shoulder: { x: 0.42, y: 0.40 },
      right_shoulder: { x: 0.58, y: 0.40 },
      right_elbow: { x: 0.48, y: 0.55 },
      right_wrist: { x: 0.35, y: 0.70 }
    }
  },
  
  wPose: {
    name: 'W-Pose',
    difficulty: 'hard',
    description: 'Arms bent up like a W',
    positions: {
      left_wrist: { x: 0.30, y: 0.25 },
      left_elbow: { x: 0.38, y: 0.38 },
      left_shoulder: { x: 0.42, y: 0.40 },
      right_shoulder: { x: 0.58, y: 0.40 },
      right_elbow: { x: 0.62, y: 0.38 },
      right_wrist: { x: 0.70, y: 0.25 }
    }
  }
};

class ShapeGenerator {
  constructor() {
    this.currentShape = null;
    this.shapeStartTime = 0;
    this.shapeDuration = 5000;
  }

  getShapesByDifficulty(difficulty) {
    return Object.entries(SHAPE_TEMPLATES)
      .filter(([_, shape]) => shape.difficulty === difficulty)
      .map(([key, _]) => key);
  }

  generateRandomShape(difficulty = 'medium') {
    const shapes = this.getShapesByDifficulty(difficulty);
    if (shapes.length === 0) {
      const allShapes = Object.keys(SHAPE_TEMPLATES);
      const randomKey = allShapes[Math.floor(Math.random() * allShapes.length)];
      return SHAPE_TEMPLATES[randomKey];
    }
    
    const randomKey = shapes[Math.floor(Math.random() * shapes.length)];
    return SHAPE_TEMPLATES[randomKey];
  }

  setShape(shapeName) {
    if (SHAPE_TEMPLATES[shapeName]) {
      this.currentShape = SHAPE_TEMPLATES[shapeName];
      this.shapeStartTime = performance.now();
      return this.currentShape;
    }
    return null;
  }

  getCurrentShape() {
    return this.currentShape;
  }

  getShapeTemplate(shapeName) {
    return SHAPE_TEMPLATES[shapeName];
  }

  getAllShapes() {
    return SHAPE_TEMPLATES;
  }

  setShapeDuration(duration) {
    this.shapeDuration = duration;
  }

  isShapeExpired(currentTime) {
    if (!this.currentShape || !this.shapeStartTime) return false;
    return (currentTime - this.shapeStartTime) >= this.shapeDuration;
  }
}

export { ShapeGenerator, SHAPE_TEMPLATES, KEYPOINT_NAMES };

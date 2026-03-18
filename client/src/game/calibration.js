class CalibrationSystem {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.isCalibrated = false;
    this.calibrationData = null;
    this.samples = [];
    this.maxSamples = 30;
  }

  addSample(keypoints) {
    if (!keypoints || keypoints.length === 0) return;

    const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder');
    const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder');
    const leftWrist = keypoints.find(kp => kp.name === 'left_wrist');
    const rightWrist = keypoints.find(kp => kp.name === 'right_wrist');
    const leftElbow = keypoints.find(kp => kp.name === 'left_elbow');
    const rightElbow = keypoints.find(kp => kp.name === 'right_elbow');

    if (
      leftShoulder && rightShoulder && 
      leftWrist && rightWrist &&
      leftElbow && rightElbow &&
      leftShoulder.confidence > 0.5 &&
      rightShoulder.confidence > 0.5 &&
      leftWrist.confidence > 0.5 &&
      rightWrist.confidence > 0.5 &&
      leftElbow.confidence > 0.5 &&
      rightElbow.confidence > 0.5
    ) {
      const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x);
      const shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2;
      const shoulderCenterY = (leftShoulder.y + rightShoulder.y) / 2;

      const leftArmLength = this.calculateDistance(leftShoulder, leftElbow) +
                           this.calculateDistance(leftElbow, leftWrist);
      const rightArmLength = this.calculateDistance(rightShoulder, rightElbow) +
                            this.calculateDistance(rightElbow, rightWrist);
      const avgArmLength = (leftArmLength + rightArmLength) / 2;

      const armSpan = Math.abs(rightWrist.x - leftWrist.x);

      this.samples.push({
        shoulderWidth,
        shoulderCenterX,
        shoulderCenterY,
        avgArmLength,
        armSpan,
        leftShoulderX: leftShoulder.x,
        rightShoulderX: rightShoulder.x,
      });

      if (this.samples.length > this.maxSamples) {
        this.samples.shift();
      }
    }
  }

  calculateDistance(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  finishCalibration() {
    if (this.samples.length < 10) {
      return false;
    }

    const avgSample = this.samples.reduce((acc, sample) => {
      return {
        shoulderWidth: acc.shoulderWidth + sample.shoulderWidth,
        shoulderCenterX: acc.shoulderCenterX + sample.shoulderCenterX,
        shoulderCenterY: acc.shoulderCenterY + sample.shoulderCenterY,
        avgArmLength: acc.avgArmLength + sample.avgArmLength,
        armSpan: acc.armSpan + sample.armSpan,
        leftShoulderX: acc.leftShoulderX + sample.leftShoulderX,
        rightShoulderX: acc.rightShoulderX + sample.rightShoulderX,
      };
    }, {
      shoulderWidth: 0,
      shoulderCenterX: 0,
      shoulderCenterY: 0,
      avgArmLength: 0,
      armSpan: 0,
      leftShoulderX: 0,
      rightShoulderX: 0,
    });

    const count = this.samples.length;
    this.calibrationData = {
      shoulderWidth: avgSample.shoulderWidth / count,
      shoulderCenterX: avgSample.shoulderCenterX / count,
      shoulderCenterY: avgSample.shoulderCenterY / count,
      avgArmLength: avgSample.avgArmLength / count,
      armSpan: avgSample.armSpan / count,
      leftShoulderX: avgSample.leftShoulderX / count,
      rightShoulderX: avgSample.rightShoulderX / count,
      canvasWidth: this.canvasWidth,
      canvasHeight: this.canvasHeight,
    };

    this.isCalibrated = true;
    return true;
  }

  getCalibrationData() {
    return this.calibrationData;
  }

  isComplete() {
    return this.isCalibrated;
  }

  getSampleCount() {
    return this.samples.length;
  }

  reset() {
    this.samples = [];
    this.isCalibrated = false;
    this.calibrationData = null;
  }

  scaleShapeToUser(shapeTemplate) {
    if (!this.calibrationData || !shapeTemplate) {
      return shapeTemplate;
    }

    const calibration = this.calibrationData;
    const scaledPositions = {};

    const normalizedShoulderCenter = 0.5;
    const normalizedShoulderWidth = 0.16;

    const userShoulderCenterX = calibration.shoulderCenterX / calibration.canvasWidth;
    const userShoulderWidth = calibration.shoulderWidth / calibration.canvasWidth;
    const userArmReach = calibration.avgArmLength / calibration.canvasWidth;

    const scaleX = userShoulderWidth / normalizedShoulderWidth;

    Object.keys(shapeTemplate.positions).forEach(keypointName => {
      const originalPos = shapeTemplate.positions[keypointName];
      
      const relativeX = originalPos.x - normalizedShoulderCenter;
      const scaledRelativeX = relativeX * scaleX;
      const scaledX = userShoulderCenterX + scaledRelativeX;

      const relativeY = originalPos.y - 0.40;
      const scaledY = (calibration.shoulderCenterY / calibration.canvasHeight) + relativeY;

      scaledPositions[keypointName] = {
        x: Math.max(0.05, Math.min(0.95, scaledX)),
        y: Math.max(0.05, Math.min(0.95, scaledY))
      };
    });

    return {
      ...shapeTemplate,
      positions: scaledPositions,
      isScaled: true
    };
  }
}

export default CalibrationSystem;

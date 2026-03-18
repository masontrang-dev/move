const HIT_VELOCITY_THRESHOLD = 0.5;
const CONFIDENCE_THRESHOLD = 0.4;

const MAJOR_KEYPOINTS = [
  "nose",
  "left_shoulder",
  "right_shoulder",
  "left_elbow",
  "right_elbow",
  "left_wrist",
  "right_wrist",
  "left_hip",
  "right_hip",
  "left_knee",
  "right_knee",
];

function isPointInCircle(point, circle) {
  if (!point || !circle) return false;

  const dx = point.x - circle.x;
  const dy = point.y - circle.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance < circle.radius;
}

function isPointInRect(point, rect) {
  if (!point || !rect) return false;

  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

function checkTargetHit(wrist, target, velocity) {
  if (!wrist || wrist.confidence < CONFIDENCE_THRESHOLD) return false;
  if (velocity < HIT_VELOCITY_THRESHOLD) return false;

  return isPointInCircle(wrist, target);
}

function checkObstacleCollision(keypoints, obstacle) {
  if (!keypoints || keypoints.length === 0) return false;
  if (obstacle.isWarning) return false;

  for (const kp of keypoints) {
    if (!MAJOR_KEYPOINTS.includes(kp.name)) continue;
    if (kp.confidence < CONFIDENCE_THRESHOLD) continue;

    if (isPointInRect(kp, obstacle)) {
      return true;
    }
  }

  return false;
}

function getDistanceFromCenter(point, circle) {
  if (!point || !circle) return Infinity;

  const dx = point.x - circle.x;
  const dy = point.y - circle.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export {
  isPointInCircle,
  isPointInRect,
  checkTargetHit,
  checkObstacleCollision,
  getDistanceFromCenter,
  HIT_VELOCITY_THRESHOLD,
  CONFIDENCE_THRESHOLD,
};

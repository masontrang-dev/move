const HIT_VELOCITY_THRESHOLD = 0.5;
const CONFIDENCE_THRESHOLD = 0.4;

function isPointInCircle(point, circle) {
  if (!point || !circle) return false;
  
  const dx = point.x - circle.x;
  const dy = point.y - circle.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  return distance < circle.radius;
}

function checkTargetHit(wrist, target, velocity) {
  if (!wrist || wrist.confidence < CONFIDENCE_THRESHOLD) return false;
  if (velocity < HIT_VELOCITY_THRESHOLD) return false;
  
  return isPointInCircle(wrist, target);
}

function getDistanceFromCenter(point, circle) {
  if (!point || !circle) return Infinity;
  
  const dx = point.x - circle.x;
  const dy = point.y - circle.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export { isPointInCircle, checkTargetHit, getDistanceFromCenter, HIT_VELOCITY_THRESHOLD, CONFIDENCE_THRESHOLD };

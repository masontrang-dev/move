import PoseDetector from '../vision/PoseDetector';

const VisionDemo = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      padding: '2rem',
      minHeight: '100vh',
      backgroundColor: '#1a1a1a'
    }}>
      <h1 style={{ color: '#fff', marginBottom: '1rem' }}>
        Phase 1: Vision Proof of Concept
      </h1>
      <p style={{ color: '#aaa', marginBottom: '2rem', maxWidth: '600px', textAlign: 'center' }}>
        Testing MoveNet pose detection. Open the browser console to see raw keypoints and wrist velocity logs.
      </p>
      <div style={{ 
        border: '2px solid #333', 
        borderRadius: '8px', 
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
      }}>
        <PoseDetector />
      </div>
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        backgroundColor: '#2a2a2a', 
        borderRadius: '8px',
        maxWidth: '600px',
        color: '#fff'
      }}>
        <h3>Phase 1 Checklist:</h3>
        <ul style={{ textAlign: 'left', lineHeight: '1.8' }}>
          <li>✅ Initialize MoveNet in the browser</li>
          <li>✅ Access webcam via MediaDevices API</li>
          <li>✅ Run inference and log raw keypoints to console</li>
          <li>✅ Draw skeleton overlay on canvas over video feed</li>
          <li>✅ Handle mirroring (camera is a mirror — flip x coordinates)</li>
          <li>✅ Add confidence filtering (hide keypoints below threshold)</li>
          <li>✅ Log wrist velocity frame-over-frame</li>
        </ul>
      </div>
    </div>
  );
};

export default VisionDemo;

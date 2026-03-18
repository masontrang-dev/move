import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import * as poseDetection from "@tensorflow-models/pose-detection";

const PoseDetector = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const [detector, setDetector] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const previousWristPositions = useRef({ left: null, right: null });
  const animationFrameId = useRef(null);

  const CONFIDENCE_THRESHOLD = 0.3;

  useEffect(() => {
    initializePoseDetection();
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const initializePoseDetection = async () => {
    try {
      await tf.setBackend("webgl");
      await tf.ready();

      const model = poseDetection.SupportedModels.MoveNet;
      const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      };

      const poseDetector = await poseDetection.createDetector(
        model,
        detectorConfig,
      );
      detectorRef.current = poseDetector;
      setDetector(poseDetector);
      console.log("Detector initialized:", !!poseDetector);

      await startWebcam();
      setIsLoading(false);
    } catch (err) {
      console.error("Error initializing pose detection:", err);
      setError("Failed to initialize pose detection: " + err.message);
      setIsLoading(false);
    }
  };

  const startWebcam = async () => {
    try {
      console.log("Starting webcam...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: "user",
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded, starting playback");
          videoRef.current.play();
          console.log("Starting pose detection loop");
          detectPose();
        };
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
      setError("Failed to access webcam: " + err.message);
    }
  };

  const detectPose = async () => {
    console.log(
      "detectPose called - detector:",
      !!detectorRef.current,
      "video:",
      !!videoRef.current,
      "canvas:",
      !!canvasRef.current,
    );

    if (!detectorRef.current || !videoRef.current || !canvasRef.current) {
      console.log("Missing dependencies, retrying...");
      animationFrameId.current = requestAnimationFrame(detectPose);
      return;
    }

    const video = videoRef.current;
    console.log("Video readyState:", video.readyState);

    if (video.readyState < 2) {
      console.log("Video not ready, retrying...");
      animationFrameId.current = requestAnimationFrame(detectPose);
      return;
    }

    try {
      const poses = await detectorRef.current.estimatePoses(video);
      console.log("Poses detected:", poses.length);

      if (poses.length > 0) {
        const pose = poses[0];
        console.log("Raw keypoints:", pose.keypoints);

        drawSkeleton(pose.keypoints);
        calculateWristVelocity(pose.keypoints);
      } else {
        console.log("No poses detected");
      }
    } catch (err) {
      console.error("Error detecting pose:", err);
    }

    animationFrameId.current = requestAnimationFrame(detectPose);
  };

  const calculateWristVelocity = (keypoints) => {
    const leftWrist = keypoints.find((kp) => kp.name === "left_wrist");
    const rightWrist = keypoints.find((kp) => kp.name === "right_wrist");

    if (leftWrist && leftWrist.score > CONFIDENCE_THRESHOLD) {
      if (previousWristPositions.current.left) {
        const dx = leftWrist.x - previousWristPositions.current.left.x;
        const dy = leftWrist.y - previousWristPositions.current.left.y;
        const velocity = Math.sqrt(dx * dx + dy * dy);
        console.log("Left wrist velocity:", velocity.toFixed(2));
      }
      previousWristPositions.current.left = { x: leftWrist.x, y: leftWrist.y };
    }

    if (rightWrist && rightWrist.score > CONFIDENCE_THRESHOLD) {
      if (previousWristPositions.current.right) {
        const dx = rightWrist.x - previousWristPositions.current.right.x;
        const dy = rightWrist.y - previousWristPositions.current.right.y;
        const velocity = Math.sqrt(dx * dx + dy * dy);
        console.log("Right wrist velocity:", velocity.toFixed(2));
      }
      previousWristPositions.current.right = {
        x: rightWrist.x,
        y: rightWrist.y,
      };
    }
  };

  const drawSkeleton = (keypoints) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const video = videoRef.current;

    if (!video.videoWidth || !video.videoHeight) {
      console.log("Video dimensions not ready");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    console.log(`Canvas size: ${canvas.width}x${canvas.height}`);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const connections = [
      ["left_shoulder", "right_shoulder"],
      ["left_shoulder", "left_elbow"],
      ["left_elbow", "left_wrist"],
      ["right_shoulder", "right_elbow"],
      ["right_elbow", "right_wrist"],
      ["left_shoulder", "left_hip"],
      ["right_shoulder", "right_hip"],
      ["left_hip", "right_hip"],
      ["left_hip", "left_knee"],
      ["left_knee", "left_ankle"],
      ["right_hip", "right_knee"],
      ["right_knee", "right_ankle"],
    ];

    connections.forEach(([startName, endName]) => {
      const start = keypoints.find((kp) => kp.name === startName);
      const end = keypoints.find((kp) => kp.name === endName);

      if (
        start &&
        end &&
        start.score > CONFIDENCE_THRESHOLD &&
        end.score > CONFIDENCE_THRESHOLD
      ) {
        ctx.beginPath();
        ctx.moveTo(canvas.width - start.x, start.y);
        ctx.lineTo(canvas.width - end.x, end.y);
        ctx.strokeStyle = "#00ff00";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    keypoints.forEach((keypoint) => {
      if (keypoint.score > CONFIDENCE_THRESHOLD) {
        ctx.beginPath();
        ctx.arc(canvas.width - keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "#ff0000";
        ctx.fill();
      }
    });
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <h2>Loading MoveNet model...</h2>
        <p>This may take a few moments on first load.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "red" }}>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <video
        ref={videoRef}
        style={{
          transform: "scaleX(-1)",
          width: "640px",
          height: "480px",
          backgroundColor: "#000",
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "640px",
          height: "480px",
        }}
      />
    </div>
  );
};

export default PoseDetector;

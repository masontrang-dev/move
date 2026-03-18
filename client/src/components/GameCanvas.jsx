import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import * as poseDetection from "@tensorflow-models/pose-detection";
import GameLoop from "../game/gameLoop.js";

const GameCanvas = ({ onGameEnd }) => {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const gameLoopRef = useRef(null);
  const detectorRef = useRef(null);
  const poseAnimationRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    initializeGame();

    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (poseAnimationRef.current) {
      cancelAnimationFrame(poseAnimationRef.current);
    }
    if (gameLoopRef.current) {
      gameLoopRef.current.stop();
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }
  };

  const initializeGame = async () => {
    try {
      if (!canvasRef.current || !videoRef.current) {
        return;
      }

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

      await startWebcam();

      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth * 2;
      canvas.height = video.videoHeight * 2;

      const gameLoop = new GameLoop(canvas);
      await gameLoop.init();
      gameLoopRef.current = gameLoop;

      setIsLoading(false);
    } catch (err) {
      console.error("Error initializing game:", err);
      setError("Failed to initialize game: " + err.message);
      setIsLoading(false);
    }
  };

  const startWebcam = async () => {
    try {
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
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            resolve();
          };
        });
        detectPose();
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
      throw new Error("Failed to access webcam: " + err.message);
    }
  };

  const detectPose = async () => {
    if (!detectorRef.current || !videoRef.current || !gameLoopRef.current) {
      poseAnimationRef.current = requestAnimationFrame(detectPose);
      return;
    }

    const video = videoRef.current;
    if (video.readyState < 2) {
      poseAnimationRef.current = requestAnimationFrame(detectPose);
      return;
    }

    try {
      const poses = await detectorRef.current.estimatePoses(video);
      if (poses.length > 0) {
        const pose = poses[0];
        gameLoopRef.current.setPoseData(pose.keypoints);
      }
    } catch (err) {
      console.error("Error detecting pose:", err);
    }

    poseAnimationRef.current = requestAnimationFrame(detectPose);
  };

  const handleStartGame = () => {
    if (gameLoopRef.current) {
      gameLoopRef.current.reset();
      gameLoopRef.current.start();
      setIsPlaying(true);
    }
  };

  const handleStopGame = () => {
    if (gameLoopRef.current) {
      gameLoopRef.current.stop();
      setIsPlaying(false);
      if (onGameEnd) {
        onGameEnd(gameLoopRef.current.getScore());
      }
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#1a1a1a",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem",
      }}
    >
      <h1 style={{ color: "#fff", marginBottom: "1rem" }}>
        Phase 2: First Mechanic
      </h1>

      <div style={{ position: "relative", marginBottom: "1rem" }}>
        {isLoading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "1280px",
              height: "960px",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              zIndex: 10,
              borderRadius: "8px",
            }}
          >
            <h2>Loading Game...</h2>
            <p>Initializing MoveNet and camera...</p>
          </div>
        )}
        {error && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "1280px",
              height: "960px",
              backgroundColor: "rgba(0, 0, 0, 0.9)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#ff4444",
              zIndex: 10,
              borderRadius: "8px",
            }}
          >
            <h2>Error</h2>
            <p>{error}</p>
          </div>
        )}
        <video
          ref={videoRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "1280px",
            height: "960px",
            transform: "scaleX(-1)",
            opacity: 0.3,
            pointerEvents: "none",
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            border: "2px solid #333",
            borderRadius: "8px",
            backgroundColor: "#000",
            width: "1280px",
            height: "960px",
          }}
        />
      </div>

      <div style={{ display: "flex", gap: "1rem" }}>
        {!isPlaying ? (
          <button
            onClick={handleStartGame}
            style={{
              padding: "1rem 2rem",
              fontSize: "1.2rem",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Start Game
          </button>
        ) : (
          <button
            onClick={handleStopGame}
            style={{
              padding: "1rem 2rem",
              fontSize: "1.2rem",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Stop Game
          </button>
        )}
      </div>

      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          backgroundColor: "#2a2a2a",
          borderRadius: "8px",
          maxWidth: "800px",
          color: "#fff",
        }}
      >
        <h3>How to Play:</h3>
        <ul style={{ textAlign: "left", lineHeight: "1.8" }}>
          <li>🎯 Punch the cyan targets with your hands</li>
          <li>⚡ Move your wrists fast enough to register hits</li>
          <li>🔥 Build combos by hitting consecutive targets</li>
          <li>💯 Hit the center of targets for bonus points</li>
          <li>⏰ Targets that reach the edge will reset your combo</li>
        </ul>
      </div>
    </div>
  );
};

export default GameCanvas;

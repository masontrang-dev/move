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
  const [obstaclesEnabled, setObstaclesEnabled] = useState(true);
  const [difficulty, setDifficulty] = useState("medium");
  const [sessionDuration, setSessionDuration] = useState(180);
  const [gameMode, setGameMode] = useState("targets");
  const [isCalibrating, setIsCalibrating] = useState(false);

  useEffect(() => {
    initializeGame();

    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape" && isPlaying && gameLoopRef.current) {
        if (gameLoopRef.current.getIsPaused()) {
          gameLoopRef.current.resume();
        } else {
          gameLoopRef.current.pause();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isPlaying]);

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

      const gameConfig = {
        sessionDuration: sessionDuration * 1000,
        difficulty: difficulty,
        onSessionEnd: handleSessionEnd,
        gameMode: gameMode,
      };
      const gameLoop = new GameLoop(canvas, gameConfig);
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

  const handleSessionEnd = (stats) => {
    setIsPlaying(false);
    if (onGameEnd) {
      onGameEnd(stats);
    }
  };

  const handleStartGame = () => {
    if (gameLoopRef.current) {
      gameLoopRef.current.reset();
      gameLoopRef.current.setObstaclesEnabled(obstaclesEnabled);
      gameLoopRef.current.difficulty = difficulty;
      gameLoopRef.current.sessionDuration = sessionDuration * 1000;
      gameLoopRef.current.onSessionEnd = handleSessionEnd;
      gameLoopRef.current.gameMode = gameMode;

      if (gameMode === "shapeMatching") {
        setIsCalibrating(true);
        gameLoopRef.current.startCalibration();
        gameLoopRef.current.start();
        setIsPlaying(true);
      } else {
        gameLoopRef.current.start();
        setIsPlaying(true);
      }
    }
  };

  const handleFinishCalibration = () => {
    if (gameLoopRef.current) {
      const success = gameLoopRef.current.finishCalibration();
      if (success) {
        setIsCalibrating(false);
      } else {
        alert("Calibration failed. Please try again and hold a T-Pose.");
        gameLoopRef.current.startCalibration();
      }
    }
  };

  const handlePauseResume = () => {
    if (gameLoopRef.current) {
      if (gameLoopRef.current.getIsPaused()) {
        gameLoopRef.current.resume();
      } else {
        gameLoopRef.current.pause();
      }
    }
  };

  const handleStopGame = () => {
    if (gameLoopRef.current) {
      gameLoopRef.current.stop();
      setIsPlaying(false);
      if (onGameEnd) {
        onGameEnd(gameLoopRef.current.getSessionStats());
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
        Body Motion Game - Phase 4
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

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        {!isPlaying && (
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  alignItems: "center",
                }}
              >
                <label
                  style={{
                    color: "#fff",
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                  }}
                >
                  Game Mode:
                </label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => setGameMode("targets")}
                    style={{
                      padding: "0.75rem 1.5rem",
                      fontSize: "1rem",
                      backgroundColor:
                        gameMode === "targets" ? "#4CAF50" : "#666",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    🎯 Target Punching
                  </button>
                  <button
                    onClick={() => setGameMode("shapeMatching")}
                    style={{
                      padding: "0.75rem 1.5rem",
                      fontSize: "1rem",
                      backgroundColor:
                        gameMode === "shapeMatching" ? "#4CAF50" : "#666",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    🤸 Shape Matching
                  </button>
                  <button
                    onClick={() => setGameMode("gridPattern")}
                    style={{
                      padding: "0.75rem 1.5rem",
                      fontSize: "1rem",
                      backgroundColor:
                        gameMode === "gridPattern" ? "#4CAF50" : "#666",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    ⚡ Grid Pattern
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", gap: "2rem" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <label
                    style={{
                      color: "#fff",
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                    }}
                  >
                    Difficulty:
                  </label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {["easy", "medium", "hard"].map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        style={{
                          padding: "0.5rem 1.5rem",
                          fontSize: "1rem",
                          backgroundColor:
                            difficulty === level ? "#4CAF50" : "#666",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: "bold",
                          textTransform: "capitalize",
                        }}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <label
                    style={{
                      color: "#fff",
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                    }}
                  >
                    Session Duration:
                  </label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {[60, 180, 300].map((duration) => (
                      <button
                        key={duration}
                        onClick={() => setSessionDuration(duration)}
                        style={{
                          padding: "0.5rem 1.5rem",
                          fontSize: "1rem",
                          backgroundColor:
                            sessionDuration === duration ? "#4CAF50" : "#666",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        {duration / 60} min
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {gameMode === "targets" && (
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "#fff",
                  fontSize: "1.1rem",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={obstaclesEnabled}
                  onChange={(e) => setObstaclesEnabled(e.target.checked)}
                  style={{
                    width: "20px",
                    height: "20px",
                    cursor: "pointer",
                  }}
                />
                Enable Obstacles (Phase 3)
              </label>
            )}
          </>
        )}

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
          ) : isCalibrating ? (
            <button
              onClick={handleFinishCalibration}
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
              Finish Calibration
            </button>
          ) : (
            <>
              <button
                onClick={handlePauseResume}
                style={{
                  padding: "1rem 2rem",
                  fontSize: "1.2rem",
                  backgroundColor: "#FF9800",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                {gameLoopRef.current?.getIsPaused() ? "Resume" : "Pause"} (ESC)
              </button>
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
                End Session
              </button>
            </>
          )}
        </div>
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
        {gameMode === "targets" ? (
          <ul style={{ textAlign: "left", lineHeight: "1.8" }}>
            <li>🎯 Punch the cyan targets with your hands</li>
            <li>⚡ Move your wrists fast enough to register hits</li>
            <li>🔥 Build combos by hitting consecutive targets</li>
            <li>💯 Hit the center of targets for bonus points</li>
            <li>⏰ Complete the session before time runs out</li>
            <li>🚧 Dodge obstacles to keep your health</li>
            <li>⏸️ Press ESC to pause/resume the game</li>
            <li>📈 Difficulty increases as time progresses</li>
          </ul>
        ) : gameMode === "shapeMatching" ? (
          <ul style={{ textAlign: "left", lineHeight: "1.8" }}>
            <li>🤸 Match your body position to the displayed shape</li>
            <li>
              🎯 Position all 6 keypoints (wrists, elbows, shoulders) in the
              target zones
            </li>
            <li>⏱️ Hold the correct position for 1.5 seconds to score</li>
            <li>
              ✅ Green circles = correctly positioned, Yellow = needs adjustment
            </li>
            <li>💯 Perfect matches earn bonus points</li>
            <li>⏰ Complete as many shapes as possible before time runs out</li>
            <li>⏸️ Press ESC to pause/resume the game</li>
            <li>
              📈 Shapes get harder and tolerance zones shrink as difficulty
              increases
            </li>
          </ul>
        ) : (
          <ul style={{ textAlign: "left", lineHeight: "1.8" }}>
            <li>⚡ Screen is divided into a visible grid of tiles</li>
            <li>🔵 Collect all BLUE tiles by touching them with your wrists</li>
            <li>
              🟢 Once all blues are collected, put BOTH WRISTS in the GREEN home
              tile to complete the level
            </li>
            <li>⚪ Gray tiles are neutral - they don't do anything</li>
            <li>🔴 Avoid RED penalty tiles (coming soon)</li>
            <li>⏱️ Faster completion = higher score bonuses</li>
            <li>💯 Complete as many levels as possible before time runs out</li>
            <li>⏸️ Press ESC to pause/resume the game</li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default GameCanvas;

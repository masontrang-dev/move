import { useState } from "react";
import GameCanvas from "../components/GameCanvas";

const Game = ({ onBack }) => {
  const [sessionStats, setSessionStats] = useState(null);

  const handleGameEnd = (stats) => {
    setSessionStats(stats);
  };

  const handlePlayAgain = () => {
    setSessionStats(null);
  };

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (sessionStats !== null) {
    const sessionCompleted = sessionStats.timeRemaining === 0;

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1a1a1a",
          color: "#fff",
          padding: "2rem",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            marginBottom: "1rem",
            color: sessionCompleted ? "#4CAF50" : "#FF9800",
          }}
        >
          {sessionCompleted ? "🎉 Session Complete!" : "⏱️ Session Ended"}
        </h1>

        <div
          style={{
            backgroundColor: "#2a2a2a",
            padding: "2rem",
            borderRadius: "12px",
            marginBottom: "2rem",
            minWidth: "400px",
          }}
        >
          <h2
            style={{
              fontSize: "4rem",
              color: "#FFD700",
              marginBottom: "1rem",
              textAlign: "center",
            }}
          >
            {sessionStats.score}
          </h2>
          <p
            style={{
              fontSize: "1.5rem",
              marginBottom: "2rem",
              textAlign: "center",
              color: "#aaa",
            }}
          >
            Final Score
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              fontSize: "1.1rem",
            }}
          >
            <div
              style={{
                textAlign: "center",
                padding: "1rem",
                backgroundColor: "#1a1a1a",
                borderRadius: "8px",
              }}
            >
              <div style={{ color: "#aaa", marginBottom: "0.5rem" }}>
                Duration
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                {formatTime(sessionStats.duration)}
              </div>
            </div>

            <div
              style={{
                textAlign: "center",
                padding: "1rem",
                backgroundColor: "#1a1a1a",
                borderRadius: "8px",
              }}
            >
              <div style={{ color: "#aaa", marginBottom: "0.5rem" }}>
                Difficulty
              </div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  textTransform: "capitalize",
                }}
              >
                {sessionStats.difficulty}
              </div>
            </div>

            <div
              style={{
                textAlign: "center",
                padding: "1rem",
                backgroundColor: "#1a1a1a",
                borderRadius: "8px",
              }}
            >
              <div style={{ color: "#aaa", marginBottom: "0.5rem" }}>
                Max Combo
              </div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#FFD700",
                }}
              >
                {sessionStats.maxCombo}x
              </div>
            </div>

            <div
              style={{
                textAlign: "center",
                padding: "1rem",
                backgroundColor: "#1a1a1a",
                borderRadius: "8px",
              }}
            >
              <div style={{ color: "#aaa", marginBottom: "0.5rem" }}>
                Status
              </div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: sessionCompleted ? "#4CAF50" : "#FF9800",
                }}
              >
                {sessionCompleted ? "Complete" : "Ended Early"}
              </div>
            </div>

            {sessionStats.gameMode === "shapeMatching" &&
              sessionStats.shapesCompleted !== undefined && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "1rem",
                    backgroundColor: "#1a1a1a",
                    borderRadius: "8px",
                    gridColumn: "1 / -1",
                  }}
                >
                  <div style={{ color: "#aaa", marginBottom: "0.5rem" }}>
                    Shapes Completed
                  </div>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      color: "#4CAF50",
                    }}
                  >
                    {sessionStats.shapesCompleted}
                  </div>
                </div>
              )}
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={handlePlayAgain}
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
            Play Again
          </button>
          <button
            onClick={onBack}
            style={{
              padding: "1rem 2rem",
              fontSize: "1.2rem",
              backgroundColor: "#666",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return <GameCanvas onGameEnd={handleGameEnd} />;
};

export default Game;

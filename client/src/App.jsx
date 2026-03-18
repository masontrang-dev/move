import { useState } from "react";
import VisionDemo from "./pages/VisionDemo";
import Game from "./pages/Game";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  if (currentPage === "vision") {
    return <VisionDemo />;
  }

  if (currentPage === "game") {
    return <Game onBack={() => setCurrentPage("home")} />;
  }

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
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>
        Body Motion Game
      </h1>
      <p style={{ fontSize: "1.2rem", color: "#aaa", marginBottom: "3rem" }}>
        Punch targets with your body motion!
      </p>

      <div style={{ display: "flex", gap: "1rem", flexDirection: "column" }}>
        <button
          onClick={() => setCurrentPage("game")}
          style={{
            padding: "1.5rem 3rem",
            fontSize: "1.5rem",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#45a049")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#4CAF50")}
        >
          🎮 Play Game (Phase 4)
        </button>

        <button
          onClick={() => setCurrentPage("vision")}
          style={{
            padding: "1rem 2rem",
            fontSize: "1.2rem",
            backgroundColor: "#666",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#555")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#666")}
        >
          👁️ Vision Demo (Phase 1)
        </button>
      </div>
    </div>
  );
}

export default App;

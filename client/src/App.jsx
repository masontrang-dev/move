import { useState } from "react";
import VisionDemo from "./pages/VisionDemo";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  if (currentPage === "vision") {
    return <VisionDemo />;
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
        Phase 1: Vision Proof of Concept
      </p>
      <button
        onClick={() => setCurrentPage("vision")}
        style={{
          padding: "1rem 2rem",
          fontSize: "1.2rem",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          transition: "background-color 0.3s",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#45a049")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#4CAF50")}
      >
        Start Vision Demo
      </button>
    </div>
  );
}

export default App;

import { useState } from 'react';
import GameCanvas from '../components/GameCanvas';

const Game = ({ onBack }) => {
  const [finalScore, setFinalScore] = useState(null);

  const handleGameEnd = (score) => {
    setFinalScore(score);
  };

  const handlePlayAgain = () => {
    setFinalScore(null);
  };

  if (finalScore !== null) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
        color: '#fff',
        padding: '2rem'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Game Over!</h1>
        <h2 style={{ fontSize: '4rem', color: '#FFD700', marginBottom: '2rem' }}>
          {finalScore}
        </h2>
        <p style={{ fontSize: '1.5rem', marginBottom: '3rem' }}>Final Score</p>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={handlePlayAgain}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.2rem',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Play Again
          </button>
          <button
            onClick={onBack}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.2rem',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
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

import React from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import Car from './components/Car';
import Obstacle from './components/Obstacle';
import Road from './components/Road';
import GameUI from './components/GameUI';

function App() {
  const {
    gameState,
    carPosition,
    obstacles,
    score,
    speed,
    crashed,
    scrollOffset,
    startGame,
    resetGame,
    gameWidth,
    gameHeight
  } = useGameEngine();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center p-4">
      <div className="relative bg-gray-800 rounded-lg shadow-2xl overflow-hidden border-4 border-gray-700">
        <div 
          className="relative"
          style={{ width: gameWidth, height: gameHeight }}
        >
          {/* Road */}
          <Road scrollOffset={scrollOffset} />
          
          {/* Game elements */}
          {gameState === 'playing' && (
            <>
              <Car position={carPosition} crashed={crashed} />
              {obstacles.map(obstacle => (
                <Obstacle
                  key={obstacle.id}
                  position={obstacle.position}
                  type={obstacle.type}
                />
              ))}
            </>
          )}
          
          {/* UI Overlay */}
          <GameUI
            score={score}
            speed={speed}
            gameState={gameState}
            onStart={startGame}
            onRestart={resetGame}
          />
        </div>
      </div>
      
      {/* Instructions */}
      {gameState === 'playing' && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center bg-black bg-opacity-50 px-4 py-2 rounded-lg">
          <p className="text-sm">Use ← → or A D to steer</p>
        </div>
      )}
    </div>
  );
}

export default App;
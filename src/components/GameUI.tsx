import React from 'react';

interface GameUIProps {
  score: number;
  speed: number;
  gameState: 'menu' | 'playing' | 'gameOver';
  onStart: () => void;
  onRestart: () => void;
}

const GameUI: React.FC<GameUIProps> = ({ score, speed, gameState, onStart, onRestart }) => {
  if (gameState === 'menu') {
    return (
      <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-4 text-blue-400">🏎️ Highway Rush</h1>
          <p className="text-xl mb-8">Dodge traffic and survive as long as you can!</p>
          <div className="mb-8 text-gray-300">
            <p>Use ARROW KEYS or WASD to steer</p>
            <p>Avoid other cars and obstacles</p>
          </div>
          <button
            onClick={onStart}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg text-xl font-semibold transition-colors"
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'gameOver') {
    return (
      <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-4xl font-bold mb-4 text-red-400">💥 Game Over!</h2>
          <p className="text-2xl mb-4">Final Score: {score}</p>
          <p className="text-lg mb-8 text-gray-300">You traveled {Math.floor(score / 10)} meters</p>
          <button
            onClick={onRestart}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg text-xl font-semibold transition-colors"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  // Playing state UI
  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between items-start text-white">
      <div className="bg-black bg-opacity-50 px-4 py-2 rounded-lg">
        <div className="text-2xl font-bold">Score: {score}</div>
        <div className="text-sm">Distance: {Math.floor(score / 10)}m</div>
      </div>
      <div className="bg-black bg-opacity-50 px-4 py-2 rounded-lg">
        <div className="text-lg font-semibold">Speed: {speed} km/h</div>
        <div className="text-xs text-yellow-300">Level {Math.floor(speed / 10)}</div>
      </div>
    </div>
  );
};

export default GameUI;
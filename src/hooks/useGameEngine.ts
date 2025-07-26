import { useState, useEffect, useCallback } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Obstacle {
  id: number;
  position: Position;
  type: 'car' | 'construction' | 'oil';
}

export const useGameEngine = () => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu');
  const [carPosition, setCarPosition] = useState<Position>({ x: 200, y: 500 });
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(50);
  const [crashed, setCrashed] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [keys, setKeys] = useState<Set<string>>(new Set());

  const gameWidth = 400;
  const gameHeight = 600;
  const carWidth = 48;
  const carHeight = 80;
  const lanes = [120, 200, 280]; // Three lanes

  const resetGame = useCallback(() => {
    setCarPosition({ x: 200, y: 500 });
    setObstacles([]);
    setScore(0);
    setSpeed(50);
    setCrashed(false);
    setScrollOffset(0);
    setKeys(new Set());
  }, []);

  const startGame = useCallback(() => {
    resetGame();
    setGameState('playing');
  }, [resetGame]);

  const endGame = useCallback(() => {
    setGameState('gameOver');
    setCrashed(true);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'playing') {
        setKeys(prev => new Set(prev).add(e.key.toLowerCase()));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(e.key.toLowerCase());
        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing' || crashed) return;

    const gameLoop = setInterval(() => {
      // Update car position based on keys
      setCarPosition(prev => {
        let newX = prev.x;
        
        if (keys.has('arrowleft') || keys.has('a')) {
          newX = Math.max(100, prev.x - 5);
        }
        if (keys.has('arrowright') || keys.has('d')) {
          newX = Math.min(300, prev.x + 5);
        }
        
        return { ...prev, x: newX };
      });

      // Update scroll offset
      setScrollOffset(prev => (prev + speed / 10) % 800);

      // Update obstacles
      setObstacles(prev => {
        const newObstacles = prev
          .map(obstacle => ({
            ...obstacle,
            position: {
              ...obstacle.position,
              y: obstacle.position.y + speed / 8
            }
          }))
          .filter(obstacle => obstacle.position.y < gameHeight + 100);

        // Add new obstacles
        if (Math.random() < 0.02 + speed / 10000) {
          const lane = lanes[Math.floor(Math.random() * lanes.length)];
          const types: ('car' | 'construction' | 'oil')[] = ['car', 'construction', 'oil'];
          const type = types[Math.floor(Math.random() * types.length)];
          
          newObstacles.push({
            id: Date.now() + Math.random(),
            position: { x: lane, y: -50 },
            type
          });
        }

        return newObstacles;
      });

      // Update score and speed
      setScore(prev => prev + 1);
      setSpeed(prev => Math.min(120, 50 + Math.floor(prev / 100)));
    }, 50);

    return () => clearInterval(gameLoop);
  }, [gameState, crashed, keys, speed]);

  // Collision detection
  useEffect(() => {
    if (gameState !== 'playing' || crashed) return;

    const checkCollisions = () => {
      obstacles.forEach(obstacle => {
        const obstacleRect = {
          x: obstacle.position.x,
          y: obstacle.position.y,
          width: obstacle.type === 'car' ? 48 : obstacle.type === 'construction' ? 32 : 40,
          height: obstacle.type === 'car' ? 64 : obstacle.type === 'construction' ? 32 : 24
        };

        const carRect = {
          x: carPosition.x,
          y: carPosition.y,
          width: carWidth,
          height: carHeight
        };

        if (
          carRect.x < obstacleRect.x + obstacleRect.width &&
          carRect.x + carRect.width > obstacleRect.x &&
          carRect.y < obstacleRect.y + obstacleRect.height &&
          carRect.y + carRect.height > obstacleRect.y
        ) {
          endGame();
        }
      });
    };

    checkCollisions();
  }, [carPosition, obstacles, gameState, crashed, endGame]);

  return {
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
  };
};
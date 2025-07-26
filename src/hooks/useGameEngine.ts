import { useState, useEffect, useCallback, useRef } from 'react';

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
  const [speed, setSpeed] = useState(60);
  const [crashed, setCrashed] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [keys, setKeys] = useState<Set<string>>(new Set());
  
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const gameWidth = 400;
  const gameHeight = 600;
  const carWidth = 48;
  const carHeight = 80;
  const lanes = [120, 200, 280]; // Three lanes

  const resetGame = useCallback(() => {
    setCarPosition({ x: 200, y: 500 });
    setObstacles([]);
    setScore(0);
    setSpeed(60);
    setCrashed(false);
    setScrollOffset(0);
    setKeys(new Set());
    lastTimeRef.current = 0;
  }, []);

  const startGame = useCallback(() => {
    resetGame();
    setGameState('playing');
  }, [resetGame]);

  const endGame = useCallback(() => {
    setGameState('gameOver');
    setCrashed(true);
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'playing') {
        e.preventDefault();
        setKeys(prev => new Set(prev).add(e.key.toLowerCase()));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      e.preventDefault();
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

  // Smooth game loop using requestAnimationFrame
  useEffect(() => {
    if (gameState !== 'playing' || crashed) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      return;
    }

    const gameLoop = (currentTime: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }

      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Target 60 FPS - only update if enough time has passed
      if (deltaTime >= 16.67) {
        // Update car position with smoother movement
        setCarPosition(prev => {
          let newX = prev.x;
          const moveSpeed = 8; // Increased movement speed for smoother feel
          
          if (keys.has('arrowleft') || keys.has('a')) {
            newX = Math.max(100, prev.x - moveSpeed);
          }
          if (keys.has('arrowright') || keys.has('d')) {
            newX = Math.min(300, prev.x + moveSpeed);
          }
          
          return { ...prev, x: newX };
        });

        // Update scroll offset
        setScrollOffset(prev => (prev + speed / 8) % 800);

        // Update obstacles
        setObstacles(prev => {
          const newObstacles = prev
            .map(obstacle => ({
              ...obstacle,
              position: {
                ...obstacle.position,
                y: obstacle.position.y + speed / 6
              }
            }))
            .filter(obstacle => obstacle.position.y < gameHeight + 100);

          // Add new obstacles with better spacing
          if (Math.random() < 0.015 + speed / 15000) {
            const lane = lanes[Math.floor(Math.random() * lanes.length)];
            const types: ('car' | 'construction' | 'oil')[] = ['car', 'car', 'construction', 'oil'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            // Ensure minimum distance between obstacles in same lane
            const sameLineObstacles = newObstacles.filter(obs => 
              Math.abs(obs.position.x - lane) < 30 && obs.position.y < 200
            );
            
            if (sameLineObstacles.length === 0) {
              newObstacles.push({
                id: Date.now() + Math.random(),
                position: { x: lane, y: -80 },
                type
              });
            }
          }

          return newObstacles;
        });

        // Update score and speed
        setScore(prev => prev + 1);
        setSpeed(prev => Math.min(140, 60 + Math.floor(prev / 150)));
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, crashed, keys, speed]);

  // Collision detection
  useEffect(() => {
    if (gameState !== 'playing' || crashed) return;

    const checkCollisions = () => {
      obstacles.forEach(obstacle => {
        const obstacleRect = {
          x: obstacle.position.x - 2,
          y: obstacle.position.y - 2,
          width: obstacle.type === 'car' ? 52 : obstacle.type === 'construction' ? 36 : 44,
          height: obstacle.type === 'car' ? 68 : obstacle.type === 'construction' ? 36 : 28
        };

        const carRect = {
          x: carPosition.x + 4,
          y: carPosition.y + 4,
          width: carWidth - 8,
          height: carHeight - 8
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
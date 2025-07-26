import React from 'react';

interface ObstacleProps {
  position: { x: number; y: number };
  type: 'car' | 'construction' | 'oil';
}

const Obstacle: React.FC<ObstacleProps> = ({ position, type }) => {
  const renderObstacle = () => {
    switch (type) {
      case 'car':
        return (
          <div className="w-12 h-16 bg-red-600 rounded-lg shadow-lg">
            <div className="absolute top-1 left-1 right-1 h-4 bg-red-300 rounded-t-lg opacity-80"></div>
            <div className="absolute bottom-1 left-1 w-2 h-2 bg-yellow-200 rounded-full"></div>
            <div className="absolute bottom-1 right-1 w-2 h-2 bg-yellow-200 rounded-full"></div>
            <div className="absolute -left-1 top-2 w-2 h-2 bg-gray-700 rounded"></div>
            <div className="absolute -right-1 top-2 w-2 h-2 bg-gray-700 rounded"></div>
            <div className="absolute -left-1 bottom-3 w-2 h-2 bg-gray-700 rounded"></div>
            <div className="absolute -right-1 bottom-3 w-2 h-2 bg-gray-700 rounded"></div>
          </div>
        );
      case 'construction':
        return (
          <div className="w-8 h-8 bg-orange-500 transform rotate-45 border-2 border-orange-600">
            <div className="absolute inset-1 bg-orange-300 transform -rotate-45">
              <div className="text-xs text-center leading-5">🚧</div>
            </div>
          </div>
        );
      case 'oil':
        return (
          <div className="w-10 h-6 bg-gray-800 rounded-full opacity-80 animate-pulse">
            <div className="absolute inset-1 bg-gray-600 rounded-full"></div>
            <div className="absolute top-1 left-2 w-2 h-1 bg-gray-900 rounded-full"></div>
            <div className="absolute bottom-1 right-2 w-2 h-1 bg-gray-900 rounded-full"></div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="absolute"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {renderObstacle()}
    </div>
  );
};

export default Obstacle;
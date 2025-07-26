import React from 'react';

interface CarProps {
  position: { x: number; y: number };
  crashed: boolean;
}

const Car: React.FC<CarProps> = ({ position, crashed }) => {
  return (
    <div
      className={`absolute ${
        crashed ? 'animate-pulse' : ''
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: crashed ? 'rotate(25deg)' : 'rotate(0deg)',
        transition: crashed ? 'transform 0.3s ease-out' : 'none',
      }}
    >
      <div className={`w-12 h-20 relative ${crashed ? 'opacity-70' : ''}`}>
        {/* Car body */}
        <div className={`w-full h-full rounded-lg ${crashed ? 'bg-red-500' : 'bg-blue-500'} shadow-lg`}>
          {/* Car windshield */}
          <div className="absolute top-2 left-1 right-1 h-6 bg-blue-200 rounded-t-lg opacity-80"></div>
          {/* Car lights */}
          <div className="absolute bottom-1 left-1 w-2 h-2 bg-yellow-300 rounded-full"></div>
          <div className="absolute bottom-1 right-1 w-2 h-2 bg-yellow-300 rounded-full"></div>
          {/* Car wheels */}
          <div className="absolute -left-1 top-3 w-2 h-3 bg-gray-800 rounded"></div>
          <div className="absolute -right-1 top-3 w-2 h-3 bg-gray-800 rounded"></div>
          <div className="absolute -left-1 bottom-4 w-2 h-3 bg-gray-800 rounded"></div>
          <div className="absolute -right-1 bottom-4 w-2 h-3 bg-gray-800 rounded"></div>
        </div>
        {crashed && (
          <div className="absolute -top-2 -left-2 text-2xl animate-bounce">💥</div>
        )}
      </div>
    </div>
  );
};

export default Car;
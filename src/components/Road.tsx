import React from 'react';

interface RoadProps {
  scrollOffset: number;
}

const Road: React.FC<RoadProps> = ({ scrollOffset }) => {
  const lineSpacing = 100;
  const lines = [];
  
  for (let i = -2; i < 10; i++) {
    const y = (i * lineSpacing + scrollOffset) % 800;
    lines.push(
      <div
        key={i}
        className="absolute w-1 h-16 bg-yellow-300 left-1/2 transform -translate-x-1/2"
        style={{ top: `${y}px` }}
      />
    );
  }

  return (
    <div className="absolute inset-0 bg-gray-600">
      {/* Road surface */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-500 to-gray-700">
        {/* Lane dividers */}
        {lines}
        
        {/* Road edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-green-500"></div>
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-green-500"></div>
        
        {/* Road shoulders */}
        <div className="absolute left-16 top-0 bottom-0 w-4 bg-gray-800"></div>
        <div className="absolute right-16 top-0 bottom-0 w-4 bg-gray-800"></div>
      </div>
    </div>
  );
};

export default Road;
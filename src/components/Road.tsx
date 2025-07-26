import React from 'react';

interface RoadProps {
  scrollOffset: number;
}

const Road: React.FC<RoadProps> = ({ scrollOffset }) => {
  const lineSpacing = 80;
  const lines = [];
  
  for (let i = -3; i < 12; i++) {
    const y = (i * lineSpacing + scrollOffset) % 800;
    lines.push(
      <div
        key={i}
        className="absolute w-2 h-20 bg-yellow-300 left-1/2 transform -translate-x-1/2 opacity-90"
        style={{ top: `${y}px` }}
      />
    );
  }

  return (
    <div className="absolute inset-0 bg-gray-700">
      {/* Road surface */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-600 to-gray-800">
        {/* Lane dividers */}
        {lines}
        
        {/* Road edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-green-600 to-green-500"></div>
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-green-600 to-green-500"></div>
        
        {/* Road shoulders */}
        <div className="absolute left-16 top-0 bottom-0 w-4 bg-gray-900"></div>
        <div className="absolute right-16 top-0 bottom-0 w-4 bg-gray-900"></div>
      </div>
    </div>
  );
};

export default Road;
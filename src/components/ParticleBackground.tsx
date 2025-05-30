'use client'

import React, { useState, useEffect, useMemo } from 'react';

interface ParticleBackgroundProps {
  mousePosition: { x: number; y: number };
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ mousePosition }) => {
  const [isClient, setIsClient] = useState(false);

  // Generate dense, visible particles with coverage for 5x movement
  const particleData = useMemo(() => {
    if (!isClient) return [];
    
    return Array.from({ length: 3000 }, (_, i) => ({
      id: i,
      // Need much larger coverage for 5x movement
      // If mouse moves to edge (50% of viewport), particles move 250% (5x50%)
      // So we need coverage from -300% to +400% to handle all mouse positions
      left: (Math.random() * 700) - 300, // -300% to 400%
      top: (Math.random() * 700) - 300,  // -300% to 400%
      animationDelay: Math.random() * 4,
      animationDuration: 3 + Math.random() * 4, // 3-7 seconds
      size: Math.random() * 2 + 1, // 1-3px
      opacity: Math.random() * 0.6 + 0.4, // 0.4-1.0 opacity (much more visible)
      color: Math.random() < 0.7 ? 'bg-blue-400' : Math.random() < 0.5 ? 'bg-purple-400' : 'bg-cyan-400'
    }));
  }, [isClient]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Use CSS transform on the container instead of inline transforms on 3000 elements */}
      <div 
        className="absolute inset-0 w-full h-full will-change-transform"
        style={{
          // Single transform for the entire particle field - much more performant
          transform: `translate(${(mousePosition.x - (typeof window !== 'undefined' ? window.innerWidth / 2 : 960)) * 5}px, ${(mousePosition.y - (typeof window !== 'undefined' ? window.innerHeight / 2 : 540)) * 5}px)`
        }}
      >
        {particleData.map((particle) => (
          <div
            key={particle.id}
            className={`absolute rounded-full ${particle.color} animate-pulse`}
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              animationDelay: `${particle.animationDelay}s`,
              animationDuration: `${particle.animationDuration}s`,
              // Remove individual transforms - now handled by parent container
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ParticleBackground;
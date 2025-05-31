'use client'

import React, { useState, useEffect, useMemo } from 'react';

interface ParticleBackgroundProps {
  mousePosition?: { x: number; y: number };
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ mousePosition: externalMousePosition }) => {
  const [isClient, setIsClient] = useState(false);
  const [internalMousePosition, setInternalMousePosition] = useState({ x: 0, y: 0 });
  
  // Use external mouse position if provided, otherwise use internal
  const mousePosition = externalMousePosition || internalMousePosition;

  // Generate stable particle data only on client
  const particleData = useMemo(() => {
    if (!isClient) return [];
    
    return Array.from({ length: 3000 }, (_, i) => ({ // Doubled from 1500 to 3000
      id: i,
      left: (Math.random() * 800) - 300, // -300% to 500% (huge coverage area)
      top: (Math.random() * 800) - 300,  // -300% to 500% (huge coverage area)
      animationDelay: Math.random() * 3,
      animationDuration: 2 + Math.random() * 3,
      transformX: (Math.random() - 0.5) * 20,
      transformY: (Math.random() - 0.5) * 20
    }));
  }, [isClient]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Add internal mouse tracking if no external position is provided
  useEffect(() => {
    if (externalMousePosition) return; // Don't track if external position is provided
    
    const handleMouseMove = (e: MouseEvent) => {
      setInternalMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [externalMousePosition]);

  return (
    <>
      {isClient && (
        <div 
          className="fixed inset-0 pointer-events-none"
          style={{
            transform: `translate(${(mousePosition.x - window.innerWidth / 2) * 5}px, ${(mousePosition.y - window.innerHeight / 2) * 5}px)`
          }}
        >
          {particleData.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-30 animate-pulse"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.animationDelay}s`,
                animationDuration: `${particle.animationDuration}s`,
                transform: `translate(${particle.transformX}px, ${particle.transformY}px)`
              }}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default ParticleBackground;
'use client'

import React from 'react';

interface NavigationProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentSection, onSectionChange }) => {
  return (
    <nav className="relative z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => onSectionChange('home')}
            className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:scale-105 transition-transform"
          >
            Brian Thomas
          </button>
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => onSectionChange('home')} 
              className={`hover:text-blue-400 transition-colors ${currentSection === 'home' ? 'text-blue-400' : ''}`}
            >
              Home
            </button>
            <button 
              onClick={() => onSectionChange('resume')} 
              className={`hover:text-blue-400 transition-colors ${currentSection === 'resume' ? 'text-blue-400' : ''}`}
            >
              Resume
            </button>
            <a href="mailto:brianjamesthomas@outlook.com" className="hover:text-blue-400 transition-colors">Contact</a>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400">Live</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
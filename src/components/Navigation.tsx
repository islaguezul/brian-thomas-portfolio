'use client'

import React from 'react';

interface NavigationProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentSection, onSectionChange }) => {
  return (
    <nav className="relative z-50 bg-slate-900/60 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => onSectionChange('home')}
            className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:scale-105 transition-all duration-300 hover:drop-shadow-[0_0_20px_rgba(96,165,250,0.5)]"
          >
            Brian Thomas
          </button>
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => onSectionChange('home')} 
              className={`relative hover:text-blue-400 transition-all duration-300 font-medium ${currentSection === 'home' ? 'text-blue-400' : ''}`}
            >
              Home
              {currentSection === 'home' && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"></span>
              )}
            </button>
            <button 
              onClick={() => onSectionChange('resume')} 
              className={`relative hover:text-blue-400 transition-all duration-300 font-medium ${currentSection === 'resume' ? 'text-blue-400' : ''}`}
            >
              Resume
              {currentSection === 'resume' && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"></span>
              )}
            </button>
            <a href="mailto:brianjamesthomas@outlook.com" className="hover:text-blue-400 transition-all duration-300 font-medium">Contact</a>
            <div className="flex items-center space-x-2 text-sm px-3 py-1 rounded-full bg-green-400/10 border border-green-400/20">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>
              <span className="text-green-400">Live</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
'use client'

import React from 'react';
import { Mail } from 'lucide-react';

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
            <a 
              href="mailto:brianjamesthomas@outlook.com" 
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 hover:border-blue-400/50 transition-all duration-300 text-blue-300 hover:text-blue-200 font-medium"
            >
              <Mail className="w-4 h-4" />
              <span>Email Brian</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
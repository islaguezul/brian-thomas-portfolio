'use client'

import React from 'react';
import { Mail } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavigationProps {
  currentSection?: string;
  onSectionChange?: (section: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentSection, onSectionChange }) => {
  const pathname = usePathname();

  // Determine active state based on pathname for route-based navigation
  const isExperiencePage = pathname === '/';
  const isProjectsPage = pathname === '/projects';

  const handleNavClick = (section: string) => {
    if (onSectionChange) {
      onSectionChange(section);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/60 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:scale-105 transition-all duration-300 hover:drop-shadow-[0_0_20px_rgba(96,165,250,0.5)]"
          >
            Brian Thomas
          </Link>
          <div className="flex items-center space-x-6">
            <Link
              href="/"
              onClick={() => handleNavClick('home')}
              className={`relative hover:text-blue-400 transition-all duration-300 font-medium ${
                isExperiencePage || currentSection === 'home' ? 'text-blue-400' : ''
              }`}
            >
              Experience
              {(isExperiencePage || currentSection === 'home') && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"></span>
              )}
            </Link>
            <Link
              href="/projects"
              onClick={() => handleNavClick('projects')}
              className={`relative hover:text-blue-400 transition-all duration-300 font-medium ${
                isProjectsPage || currentSection === 'projects' ? 'text-blue-400' : ''
              }`}
            >
              Projects
              {(isProjectsPage || currentSection === 'projects') && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"></span>
              )}
            </Link>
            <a
              href="mailto:brianjamesthomas@outlook.com"
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 hover:border-blue-400/50 transition-all duration-300 text-blue-300 hover:text-blue-200 font-medium"
            >
              <Mail className="w-4 h-4" />
              <span>Contact</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
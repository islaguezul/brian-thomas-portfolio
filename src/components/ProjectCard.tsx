'use client'

import React from 'react';
import { Activity, Users, Globe, Database, Layers, Cpu } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  status: string;
  description: string;
  tech: string[];
  stage: string;
  progress: number;
  impact: Record<string, string | undefined>;
  features: string[];
  experimental: boolean;
  legacy?: boolean;
}

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect }) => {
  const getStageColor = (stage: string): string => {
    switch (stage) {
      case 'production': return 'bg-green-500';
      case 'mvp': return 'bg-blue-500';
      case 'backend': return 'bg-purple-500';
      case 'concept': return 'bg-yellow-500';
      case 'research': return 'bg-orange-500';
      case 'legacy': return 'bg-slate-500';
      default: return 'bg-gray-500';
    }
  };

  const getProjectIcon = (projectId: string): React.JSX.Element => {
    switch (projectId) {
      case 'crypto-bot': return <Activity className="w-8 h-8 text-blue-400" />;
      case 'konnosaur': return <Users className="w-8 h-8 text-purple-400" />;
      case 'ecco-stream': return <Globe className="w-8 h-8 text-green-400" />;
      case 'process-hub': return <Database className="w-8 h-8 text-orange-400" />;
      case 'portfolio-site': return <Layers className="w-8 h-8 text-cyan-400" />;
      case 'knowledge-management': return <Database className="w-8 h-8 text-slate-400" />;
      default: return <Cpu className="w-8 h-8 text-gray-400" />;
    }
  };

  return (
    <div
      className="group bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all duration-500 overflow-hidden transform hover:scale-[1.01] cursor-pointer"
      onClick={() => onSelect(project)}
    >
      <div className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start space-x-4 flex-1">
            <div className="flex-shrink-0 p-3 bg-slate-700/30 rounded-xl">
              {getProjectIcon(project.id)}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center mb-2 flex-wrap gap-3">
                <h3 className="text-2xl font-bold group-hover:text-blue-400 transition-colors">
                  {project.name}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStageColor(project.stage)}`}>
                  {project.status}
                </span>
                {project.experimental && (
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 animate-pulse">
                    Experimental
                  </span>
                )}
                {project.legacy && (
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-500/20 text-slate-400 border border-slate-500/30">
                    Legacy
                  </span>
                )}
              </div>
              
            </div>
          </div>

          <div className="flex-shrink-0 ml-6">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-slate-700"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - project.progress / 100)}`}
                  className="text-blue-400 transition-all duration-1000"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-blue-400">{project.progress}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {Object.entries(project.impact).map(([key, value]) => (
            <div key={key} className="text-center bg-slate-700/20 rounded-lg p-4 hover:bg-slate-700/30 transition-colors">
              <div className="text-xl font-bold text-blue-400">{value}</div>
              <div className="text-xs text-slate-400 capitalize">{key.replace('-', ' ')}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {project.tech.slice(0, 6).map((tech) => (
            <span key={tech} className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-sm hover:bg-slate-600/50 transition-colors">
              {tech}
            </span>
          ))}
          {project.tech.length > 6 && (
            <span className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-sm">
              +{project.tech.length - 6} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
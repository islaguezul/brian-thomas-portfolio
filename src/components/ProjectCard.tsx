'use client'

import React from 'react';
import { Activity, Users, Globe, Database, Layers, Cpu } from 'lucide-react';
import ProjectThumbnail from './ProjectThumbnail';

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
  screenshots?: Array<{ filePath: string; altText?: string }>;
}

// Helper to format metric keys while preserving acronyms
const ACRONYMS = ['roi', 'api', 'apis', 'seo', 'kpi', 'sql', 'css', 'html', 'aws', 'gcp', 'sdk', 'ui', 'ux'];

function formatMetricKey(key: string): string {
  return key
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => {
      const lower = word.toLowerCase();
      if (ACRONYMS.includes(lower)) {
        return lower.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
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
      case 'crypto-bot': return <Activity className="w-6 h-6 text-blue-400" />;
      case 'konnosaur': return <Users className="w-6 h-6 text-purple-400" />;
      case 'ecco-stream': return <Globe className="w-6 h-6 text-green-400" />;
      case 'process-hub': return <Database className="w-6 h-6 text-orange-400" />;
      case 'portfolio-site': return <Layers className="w-6 h-6 text-cyan-400" />;
      case 'knowledge-management': return <Database className="w-6 h-6 text-slate-400" />;
      default: return <Cpu className="w-6 h-6 text-gray-400" />;
    }
  };

  // Check if project has valid screenshots
  const hasScreenshots = project.screenshots && project.screenshots.length > 0 &&
    project.screenshots[0].filePath && !project.screenshots[0].filePath.includes('/api/placeholder');

  return (
    <div
      className="group bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all duration-500 overflow-hidden transform hover:scale-[1.01] cursor-pointer flex flex-col"
      onClick={() => onSelect(project)}
    >
      {/* Title Header - Above Thumbnail */}
      <div className="p-4 pb-0">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 bg-slate-700/30 rounded-lg">
            {getProjectIcon(project.id)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold group-hover:text-blue-400 transition-colors truncate">
              {project.name}
            </h3>
            <p className="text-sm text-slate-400 line-clamp-2 mt-1">
              {project.description}
            </p>
          </div>
        </div>
      </div>

      {/* Thumbnail Section */}
      <div className="relative mt-4">
        {hasScreenshots ? (
          <div className="aspect-video overflow-hidden">
            <img
              src={project.screenshots![0].filePath}
              alt={project.screenshots![0].altText || project.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ) : (
          <ProjectThumbnail
            projectId={project.id}
            projectName={project.name}
            tech={project.tech}
            stage={project.stage}
          />
        )}

        {/* Status badge overlay */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStageColor(project.stage)} shadow-lg`}>
            {project.status}
          </span>
          {project.experimental && (
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-500/90 text-yellow-900 shadow-lg animate-pulse">
              Experimental
            </span>
          )}
          {project.legacy && (
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-600/90 text-slate-200 shadow-lg">
              Legacy
            </span>
          )}
        </div>

        {/* Progress indicator overlay */}
        <div className="absolute top-3 right-3">
          <div className="relative w-12 h-12 bg-slate-900/80 backdrop-blur-sm rounded-full">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 48 48">
              <circle
                cx="24"
                cy="24"
                r="18"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                className="text-slate-700"
              />
              <circle
                cx="24"
                cy="24"
                r="18"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 18}`}
                strokeDashoffset={`${2 * Math.PI * 18 * (1 - project.progress / 100)}`}
                className="text-blue-400 transition-all duration-1000"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-blue-400">{project.progress}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Content Section */}
      <div className="p-4 pt-4 flex-1 flex flex-col gap-4">
        {/* Impact metrics */}
        {Object.keys(project.impact).length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(project.impact).slice(0, 3).map(([key, value]) => (
              <div key={key} className="text-center bg-slate-700/20 rounded-lg p-2 hover:bg-slate-700/30 transition-colors">
                <div className="text-sm font-bold text-blue-400">
                  {value && value !== 'undefined' && value !== 'null' ? value : 'N/A'}
                </div>
                <div className="text-xs text-slate-400 truncate">{formatMetricKey(key)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tech stack */}
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {project.tech.slice(0, 5).map((tech) => (
            <span key={tech} className="px-2 py-0.5 bg-slate-700/50 text-slate-300 rounded-full text-xs hover:bg-slate-600/50 transition-colors">
              {tech}
            </span>
          ))}
          {project.tech.length > 5 && (
            <span className="px-2 py-0.5 bg-slate-700/50 text-slate-400 rounded-full text-xs">
              +{project.tech.length - 5}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import { X, GithubIcon, ExternalLink, Play, Expand } from 'lucide-react';
import type { ProjectScreenshot } from '@/lib/database/types';

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
  screenshots?: (string | ProjectScreenshot)[];
  detailedDescription?: string;
  challenges?: string[];
  outcomes?: string[];
  links?: {
    live?: string;
    github?: string;
    demo?: string;
  };
}

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ project, isOpen, onClose }) => {
  const [expandedScreenshot, setExpandedScreenshot] = useState<{ src: string; alt: string } | null>(null);
  
  if (!isOpen || !project) return null;

  const getStageColor = (stage: string): string => {
    switch (stage) {
      case 'production': return 'bg-green-500';
      case 'mvp': return 'bg-blue-500';
      case 'backend': return 'bg-purple-500';
      case 'concept': return 'bg-yellow-500';
      case 'research': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-3xl font-bold text-blue-400">{project.name}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${getStageColor(project.stage)}`}>
                {project.status}
              </span>
              {project.experimental && (
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 animate-pulse">
                  Experimental
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Screenshots Section */}
          {project.screenshots && project.screenshots.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-4 text-slate-200">Screenshots</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {project.screenshots.map((screenshot, index) => {
                  // Handle both string paths and ProjectScreenshot objects
                  const imageSrc = typeof screenshot === 'string' ? screenshot : screenshot.filePath;
                  const imageAlt = typeof screenshot === 'string' 
                    ? `${project.name} screenshot ${index + 1}` 
                    : screenshot.altText || `${project.name} screenshot ${index + 1}`;
                  
                  return (
                    <div 
                      key={index} 
                      className="relative group cursor-pointer"
                      onClick={() => setExpandedScreenshot({ src: imageSrc, alt: imageAlt })}
                    >
                      <div className="relative aspect-video w-full">
                        <Image 
                          src={imageSrc} 
                          alt={imageAlt}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                          quality={90}
                          className="object-cover rounded-lg border border-slate-700 hover:border-blue-500 transition-all duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 rounded-lg flex items-center justify-center">
                          <Expand className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-slate-200">Project Overview</h3>
            <p className="text-slate-300 text-lg leading-relaxed">{project.description}</p>
            {project.detailedDescription && (
              <div className="mt-4 p-4 bg-slate-800/30 rounded-lg">
                <p className="text-slate-300 leading-relaxed">{project.detailedDescription}</p>
              </div>
            )}
          </div>

          {/* Progress and Metrics */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Progress */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-slate-200">Development Progress</h3>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300">Overall Completion</span>
                  <span className="text-blue-400 font-bold">{project.progress}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Impact Metrics */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-slate-200">Key Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(project.impact).map(([key, value]) => (
                  <div key={key} className="bg-slate-800/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">{value}</div>
                    <div className="text-sm text-slate-400 capitalize">{key.replace('-', ' ')}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Features */}
          {project.features.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-4 text-slate-200">Key Features</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {project.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-lg">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technology Stack */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-slate-200">Technology Stack</h3>
            <div className="flex flex-wrap gap-3">
              {project.tech.map((tech) => (
                <span key={tech} className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-full text-sm hover:bg-slate-600/50 transition-colors">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Challenges & Solutions */}
          {project.challenges && project.challenges.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-4 text-slate-200">Key Challenges & Solutions</h3>
              <div className="space-y-3">
                {project.challenges.map((challenge, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-slate-800/30 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-slate-300">{challenge}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Outcomes & Impact */}
          {project.outcomes && project.outcomes.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-4 text-slate-200">Outcomes & Impact</h3>
              <div className="space-y-3">
                {project.outcomes.map((outcome, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-slate-800/30 rounded-lg">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-slate-300">{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-700">
            {project.links?.live && (
              <a 
                href={project.links.live}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
                <span>View Live</span>
              </a>
            )}
            {project.links?.github && (
              <a 
                href={project.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                <GithubIcon className="w-5 h-5" />
                <span>Source Code</span>
              </a>
            )}
            {project.links?.demo && (
              <a 
                href={project.links.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                <Play className="w-5 h-5" />
                <span>Demo</span>
              </a>
            )}
          </div>
        </div>
      </div>
      
      {/* Full-screen image overlay */}
      {expandedScreenshot && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8 md:p-12 lg:p-16 bg-black/95 backdrop-blur-sm"
          onClick={() => setExpandedScreenshot(null)}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpandedScreenshot(null);
              }}
              className="absolute top-4 right-4 sm:top-8 sm:right-8 p-3 bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <div className="relative w-full h-full max-w-[1920px] max-h-[1080px]">
              <Image 
                src={expandedScreenshot.src} 
                alt={expandedScreenshot.alt}
                fill
                sizes="100vw"
                quality={100}
                className="object-contain"
                onClick={(e) => e.stopPropagation()}
                priority
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectModal;
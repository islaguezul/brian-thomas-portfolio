'use client'

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Layers, Users, Target, BarChart3, Clock, Award } from 'lucide-react';

interface LegacyProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string;
    name: string;
    description: string;
    tech: string[];
    features: string[];
    impact: Record<string, string | undefined>;
  };
}

const LegacyProjectModal: React.FC<LegacyProjectModalProps> = ({ isOpen, onClose, project }) => {
  const [currentScreenshot, setCurrentScreenshot] = useState(0);

  if (!isOpen) return null;

  // Define screenshots for the knowledge management project
  const screenshots = project.id === 'knowledge-management' ? [
    {
      src: '/screenshots/km-process-overview.png',
      alt: 'Process Overview Dashboard',
      caption: 'Interactive process visualization showing organizational workflows and dependencies'
    },
    {
      src: '/screenshots/km-role-dashboard.png',
      alt: 'Role-Based Dashboard',
      caption: 'Personalized dashboard delivering role-specific content and training materials'
    },
    {
      src: '/screenshots/km-workflow-detail.png',
      alt: 'Workflow Detail View',
      caption: 'Detailed process view with upstream/downstream connections and resource links'
    },
    {
      src: '/screenshots/km-training-module.png',
      alt: 'Integrated Training',
      caption: 'Context-aware training modules accessible within two clicks from any task'
    }
  ] : [];

  const handlePrevious = () => {
    setCurrentScreenshot((prev) => (prev === 0 ? screenshots.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentScreenshot((prev) => (prev === screenshots.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-slate-700 shadow-2xl">
        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
            <h2 className="text-2xl font-bold text-white">{project.name}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            {/* Main Content */}
            <div className="p-6 space-y-8">
              {/* Project Overview */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Layers className="w-5 h-5 mr-2 text-slate-400" />
                  Project Overview
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {project.description}
                </p>
                <p className="text-slate-300 leading-relaxed mt-4">
                  This enterprise-scale knowledge management system transformed how 2,500+ employees accessed 
                  critical information and training. By implementing custom process modeling on a SharePoint 
                  backend with HTML/CSS/JavaScript frontend, we created an intuitive system where users could 
                  understand their role in the broader organizational context and access exactly what they 
                  needed, when they needed it.
                </p>
              </div>

              {/* Screenshot Gallery */}
              {screenshots.length > 0 && (
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                  <h3 className="text-xl font-semibold text-white mb-4">Project Screenshots</h3>
                  <div className="relative">
                    <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden">
                      <img
                        src={screenshots[currentScreenshot].src}
                        alt={screenshots[currentScreenshot].alt}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-between px-4">
                      <button
                        onClick={handlePrevious}
                        className="p-2 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition-all"
                      >
                        <ChevronLeft className="w-6 h-6 text-white" />
                      </button>
                      <button
                        onClick={handleNext}
                        className="p-2 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition-all"
                      >
                        <ChevronRight className="w-6 h-6 text-white" />
                      </button>
                    </div>
                  </div>
                  <p className="text-center text-sm text-slate-400 mt-4">
                    {screenshots[currentScreenshot].caption}
                  </p>
                  <div className="flex justify-center mt-4 space-x-2">
                    {screenshots.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentScreenshot(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentScreenshot ? 'bg-blue-400 w-8' : 'bg-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Key Achievements */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-blue-400" />
                    Key Objectives Achieved
                  </h3>
                  <ul className="space-y-3 text-slate-300">
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      <span>Reduced time to find critical information from 15+ minutes to under 2 minutes</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      <span>Connected siloed departments through visual process mapping</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      <span>Achieved 85% self-service rate for training and job aids</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      <span>Eliminated redundant documentation across 12 departments</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-green-400" />
                    Impact Metrics
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(project.impact).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-slate-400 capitalize">{key.replace('-', ' ')}</span>
                        <span className="text-xl font-semibold text-green-400">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Technical Implementation */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-xl font-semibold text-white mb-4">Technical Implementation</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-medium text-slate-300 mb-3">Architecture</h4>
                    <ul className="space-y-2 text-slate-400 text-sm">
                      <li>• SharePoint 2016 as the content management backbone</li>
                      <li>• Custom JavaScript framework for interactive visualizations</li>
                      <li>• SQL Server for analytics and performance tracking</li>
                      <li>• Custom-built SVG graphics for process modeling</li>
                      <li>• REST APIs for real-time data synchronization</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-slate-300 mb-3">Key Features</h4>
                    <ul className="space-y-2 text-slate-400 text-sm">
                      <li>• Dynamic process visualization using custom-built SVG graphics</li>
                      <li>• Context-aware content delivery based on user role</li>
                      <li>• Integrated training modules with progress tracking</li>
                      <li>• Real-time collaboration on process documentation</li>
                      <li>• Advanced search with semantic understanding</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Technologies Used */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-xl font-semibold text-white mb-4">Technologies Used</h3>
                <div className="flex flex-wrap gap-3">
                  {project.tech.map((tech) => (
                    <span
                      key={tech}
                      className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg border border-slate-600/50"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Lessons Learned */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-yellow-400" />
                  Key Takeaways
                </h3>
                <div className="space-y-3 text-slate-300">
                  <p>
                    This project demonstrated the power of thoughtful information architecture combined 
                    with user-centered design. By focusing on the "two-click rule" and understanding 
                    how different roles interact with processes, we created a system that became 
                    indispensable to daily operations.
                  </p>
                  <p>
                    The success of this platform led to its adoption as the enterprise standard for 
                    process documentation and training delivery, saving an estimated $2.3M annually 
                    in reduced training costs and improved operational efficiency.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegacyProjectModal;
'use client'

import React from 'react'
import { Activity, Users, Globe, Database, Layers, Cpu, Code, Server, Cloud, Zap } from 'lucide-react'

interface ProjectThumbnailProps {
  projectId: string
  projectName: string
  tech: string[]
  stage: string
  className?: string
}

const ProjectThumbnail: React.FC<ProjectThumbnailProps> = ({
  projectId,
  projectName,
  tech,
  stage,
  className = ''
}) => {
  // Get a consistent color scheme based on project stage
  const getStageGradient = (stage: string): string => {
    switch (stage) {
      case 'production':
        return 'from-green-500/20 via-emerald-500/10 to-teal-500/20'
      case 'mvp':
        return 'from-blue-500/20 via-indigo-500/10 to-purple-500/20'
      case 'backend':
        return 'from-purple-500/20 via-violet-500/10 to-fuchsia-500/20'
      case 'concept':
        return 'from-yellow-500/20 via-amber-500/10 to-orange-500/20'
      case 'research':
        return 'from-orange-500/20 via-red-500/10 to-rose-500/20'
      case 'legacy':
        return 'from-slate-500/20 via-gray-500/10 to-zinc-500/20'
      default:
        return 'from-blue-500/20 via-purple-500/10 to-cyan-500/20'
    }
  }

  const getStageBorderColor = (stage: string): string => {
    switch (stage) {
      case 'production':
        return 'border-green-500/30'
      case 'mvp':
        return 'border-blue-500/30'
      case 'backend':
        return 'border-purple-500/30'
      case 'concept':
        return 'border-yellow-500/30'
      case 'research':
        return 'border-orange-500/30'
      case 'legacy':
        return 'border-slate-500/30'
      default:
        return 'border-blue-500/30'
    }
  }

  // Get project icon
  const getProjectIcon = (projectId: string): React.ReactNode => {
    const iconClass = 'w-12 h-12 opacity-60'
    switch (projectId) {
      case 'crypto-bot':
        return <Activity className={`${iconClass} text-blue-400`} />
      case 'konnosaur':
        return <Users className={`${iconClass} text-purple-400`} />
      case 'ecco-stream':
        return <Globe className={`${iconClass} text-green-400`} />
      case 'process-hub':
        return <Database className={`${iconClass} text-orange-400`} />
      case 'portfolio-site':
        return <Layers className={`${iconClass} text-cyan-400`} />
      case 'knowledge-management':
        return <Database className={`${iconClass} text-slate-400`} />
      default:
        return <Cpu className={`${iconClass} text-gray-400`} />
    }
  }

  // Map tech names to icons
  const getTechIcon = (techName: string): React.ReactNode => {
    const iconClass = 'w-4 h-4'
    const lowerTech = techName.toLowerCase()

    if (lowerTech.includes('react') || lowerTech.includes('next')) {
      return <Code className={iconClass} />
    }
    if (lowerTech.includes('node') || lowerTech.includes('express')) {
      return <Server className={iconClass} />
    }
    if (lowerTech.includes('aws') || lowerTech.includes('cloud') || lowerTech.includes('docker')) {
      return <Cloud className={iconClass} />
    }
    if (lowerTech.includes('python') || lowerTech.includes('tensorflow')) {
      return <Zap className={iconClass} />
    }
    if (lowerTech.includes('sql') || lowerTech.includes('mongo') || lowerTech.includes('database')) {
      return <Database className={iconClass} />
    }
    return <Code className={iconClass} />
  }

  // Get initials for the project
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  return (
    <div
      className={`relative w-full aspect-video rounded-xl overflow-hidden bg-gradient-to-br ${getStageGradient(stage)} border ${getStageBorderColor(stage)} ${className}`}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }} />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-4 right-4 opacity-20">
        {getProjectIcon(projectId)}
      </div>

      {/* Main content */}
      <div className="relative h-full flex flex-col items-center justify-center p-6">
        {/* Project initials badge */}
        <div className="w-16 h-16 rounded-2xl bg-slate-800/60 backdrop-blur-sm border border-slate-600/30 flex items-center justify-center mb-4">
          <span className="text-2xl font-bold bg-gradient-to-br from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {getInitials(projectName)}
          </span>
        </div>

        {/* Tech stack pills */}
        <div className="flex flex-wrap gap-2 justify-center max-w-[80%]">
          {tech.slice(0, 4).map((t, index) => (
            <div
              key={index}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-600/30 text-xs text-slate-300"
            >
              {getTechIcon(t)}
              <span>{t}</span>
            </div>
          ))}
          {tech.length > 4 && (
            <div className="px-2.5 py-1 bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-600/30 text-xs text-slate-400">
              +{tech.length - 4}
            </div>
          )}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-900/40 to-transparent" />
    </div>
  )
}

export default ProjectThumbnail

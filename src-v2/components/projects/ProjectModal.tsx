'use client'

import { useEffect } from 'react'
import type { Project } from '@/lib/database/types'

interface ProjectModalProps {
  project: Project
  onClose: () => void
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal content */}
      <div
        className="relative max-w-2xl w-full max-h-[85vh] overflow-y-auto rounded-2xl p-6 md:p-8"
        style={{
          background: 'var(--warm-black)',
          border: '1px solid rgba(212, 168, 85, 0.12)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-lg"
          style={{ color: 'rgba(245, 222, 179, 0.4)' }}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header */}
        <div className="mb-6">
          <span
            className="text-[10px] font-space uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{
              color: 'var(--accretion)',
              border: '1px solid rgba(212, 168, 85, 0.2)',
            }}
          >
            {project.stage}
          </span>
          <h2
            className="font-space text-xl font-bold mt-3"
            style={{ color: 'var(--floral)' }}
          >
            {project.name}
          </h2>
          {project.description && (
            <p
              className="text-sm mt-2 leading-relaxed"
              style={{ color: 'rgba(245, 222, 179, 0.6)' }}
            >
              {project.description}
            </p>
          )}
        </div>

        {/* Detailed description */}
        {project.detailedDescription && (
          <div className="mb-6">
            <h3
              className="font-space text-xs uppercase tracking-wider mb-2"
              style={{ color: 'var(--accretion)' }}
            >
              Details
            </h3>
            <p
              className="text-xs leading-relaxed"
              style={{ color: 'rgba(245, 222, 179, 0.5)' }}
            >
              {project.detailedDescription}
            </p>
          </div>
        )}

        {/* Impact metrics */}
        {project.impacts && project.impacts.length > 0 && (
          <div className="mb-6">
            <h3
              className="font-space text-xs uppercase tracking-wider mb-3"
              style={{ color: 'var(--accretion)' }}
            >
              Impact
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {project.impacts.map((impact) => (
                <div
                  key={impact.id ?? impact.metricKey}
                  className="p-3 rounded-lg"
                  style={{ background: 'rgba(212, 168, 85, 0.04)', border: '1px solid rgba(212, 168, 85, 0.08)' }}
                >
                  <div className="text-sm font-semibold" style={{ color: 'var(--accretion)' }}>
                    {impact.metricValue}
                  </div>
                  <div className="text-[10px]" style={{ color: 'rgba(245, 222, 179, 0.4)' }}>
                    {impact.metricKey}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technologies */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="mb-6">
            <h3
              className="font-space text-xs uppercase tracking-wider mb-3"
              style={{ color: 'var(--accretion)' }}
            >
              Technologies
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="text-xs px-3 py-1 rounded-full"
                  style={{
                    background: 'rgba(212, 168, 85, 0.08)',
                    color: 'var(--accretion)',
                    border: '1px solid rgba(212, 168, 85, 0.15)',
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        <div className="flex gap-3 mt-6">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-4 py-2 rounded-full"
              style={{
                background: 'rgba(46, 196, 182, 0.15)',
                color: 'var(--deep-teal)',
                border: '1px solid rgba(46, 196, 182, 0.25)',
              }}
            >
              Live Site →
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-4 py-2 rounded-full"
              style={{
                background: 'rgba(212, 168, 85, 0.08)',
                color: 'var(--accretion)',
                border: '1px solid rgba(212, 168, 85, 0.15)',
              }}
            >
              GitHub →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

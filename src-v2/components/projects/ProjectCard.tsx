import type { Project } from '@/lib/database/types'

interface ProjectCardProps {
  project: Project
  onClick: () => void
}

const STAGE_COLORS: Record<string, string> = {
  production: 'var(--deep-teal)',
  mvp: 'var(--accretion)',
  backend: 'var(--dark-gold)',
  concept: 'var(--wheat-light)',
  research: 'rgba(245, 222, 179, 0.5)',
  legacy: 'rgba(245, 222, 179, 0.3)',
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const stageColor = STAGE_COLORS[project.stage] || 'var(--wheat-light)'

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl p-5 transition-transform hover:scale-[1.02] cursor-pointer"
      style={{
        background: 'rgba(212, 168, 85, 0.04)',
        border: '1px solid rgba(212, 168, 85, 0.1)',
      }}
    >
      {/* Stage badge */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-[10px] font-space uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{
            color: stageColor,
            border: `1px solid ${stageColor}`,
            opacity: 0.7,
          }}
        >
          {project.stage}
        </span>
        {project.progress !== undefined && (
          <span
            className="text-[10px]"
            style={{ color: 'rgba(245, 222, 179, 0.3)' }}
          >
            {project.progress}%
          </span>
        )}
      </div>

      {/* Title + description */}
      <h3
        className="font-space text-sm font-semibold mb-2"
        style={{ color: 'var(--floral)' }}
      >
        {project.name}
      </h3>
      {project.description && (
        <p
          className="text-xs leading-relaxed mb-3 line-clamp-2"
          style={{ color: 'rgba(245, 222, 179, 0.5)' }}
        >
          {project.description}
        </p>
      )}

      {/* Tech tags */}
      {project.technologies && project.technologies.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.technologies.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{
                background: 'rgba(212, 168, 85, 0.06)',
                color: 'rgba(245, 222, 179, 0.4)',
                border: '1px solid rgba(212, 168, 85, 0.08)',
              }}
            >
              {tech}
            </span>
          ))}
          {project.technologies.length > 4 && (
            <span
              className="text-[10px] px-2 py-0.5"
              style={{ color: 'rgba(245, 222, 179, 0.25)' }}
            >
              +{project.technologies.length - 4}
            </span>
          )}
        </div>
      )}
    </button>
  )
}

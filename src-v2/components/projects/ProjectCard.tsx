import type { Project } from '@/lib/database/types'

interface ProjectCardProps {
  project: Project
  onClick: () => void
}

const TAG_COLORS = [
  { bg: 'rgba(212, 168, 85, 0.08)', border: 'rgba(212, 168, 85, 0.2)', text: 'var(--accretion)' },
  { bg: 'rgba(107, 143, 181, 0.1)', border: 'rgba(107, 143, 181, 0.25)', text: 'var(--steel-blue)' },
  { bg: 'rgba(160, 124, 176, 0.1)', border: 'rgba(160, 124, 176, 0.25)', text: 'var(--dusty-violet)' },
  { bg: 'rgba(196, 120, 120, 0.1)', border: 'rgba(196, 120, 120, 0.25)', text: 'var(--muted-rose)' },
  { bg: 'rgba(74, 111, 143, 0.1)', border: 'rgba(74, 111, 143, 0.25)', text: 'var(--deep-steel)' },
]

const STAGE_COLORS: Record<string, string> = {
  production: 'var(--steel-blue)',
  mvp: 'var(--accretion)',
  backend: 'var(--dark-gold)',
  concept: 'var(--wheat-light)',
  research: 'rgba(245, 222, 179, 0.6)',
  legacy: 'rgba(245, 222, 179, 0.4)',
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const stageColor = STAGE_COLORS[project.stage] || 'var(--wheat-light)'
  const firstScreenshot = project.screenshots?.[0]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const screenshotPath = firstScreenshot?.filePath || (firstScreenshot as any)?.file_path
  const hasScreenshot = screenshotPath && !screenshotPath.startsWith('data:')

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl overflow-hidden transition-transform hover:scale-[1.02] cursor-pointer"
      style={{
        background: 'rgba(212, 168, 85, 0.04)',
        border: '1px solid rgba(212, 168, 85, 0.1)',
      }}
    >
      {/* Screenshot thumbnail */}
      {hasScreenshot && (
        <div
          className="w-full h-40 overflow-hidden"
          style={{ borderBottom: '1px solid rgba(212, 168, 85, 0.08)' }}
        >
          <img
            src={screenshotPath}
            alt={firstScreenshot?.altText || project.name}
            className="w-full h-full object-cover object-top"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-5">
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
            style={{ color: 'rgba(245, 222, 179, 0.4)' }}
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
          style={{ color: 'rgba(245, 222, 179, 0.6)' }}
        >
          {project.description}
        </p>
      )}

      {/* Tech tags */}
      {project.technologies && project.technologies.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.technologies.slice(0, 4).map((tech, i) => {
            const color = TAG_COLORS[i % TAG_COLORS.length]
            return (
              <span
                key={tech}
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{
                  background: color.bg,
                  border: `1px solid ${color.border}`,
                  color: color.text,
                }}
              >
                {tech}
              </span>
            )
          })}
          {project.technologies.length > 4 && (
            <span
              className="text-[10px] px-2 py-0.5"
              style={{ color: 'rgba(245, 222, 179, 0.35)' }}
            >
              +{project.technologies.length - 4}
            </span>
          )}
        </div>
      )}
      </div>
    </button>
  )
}

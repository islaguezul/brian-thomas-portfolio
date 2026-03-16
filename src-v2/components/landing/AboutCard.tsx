import GlassCard from './GlassCard'
import type { PersonalInfo } from '@/lib/database/types'

interface AboutCardProps {
  personalInfo: PersonalInfo
}

export default function AboutCard({ personalInfo }: AboutCardProps) {
  return (
    <GlassCard className="w-full max-w-xl mx-auto">
      <div className="p-6 md:p-8">
        <div
          className="font-space text-[10px] tracking-[2px] uppercase mb-3"
          style={{ color: 'var(--accretion)' }}
        >
          About
        </div>
        {personalInfo.tagline && (
          <h2
            className="font-space text-lg md:text-xl font-semibold mb-3"
            style={{ color: 'var(--floral)' }}
          >
            {personalInfo.tagline}
          </h2>
        )}
        {personalInfo.executiveSummary && (
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'rgba(245, 222, 179, 0.65)' }}
          >
            {personalInfo.executiveSummary}
          </p>
        )}
      </div>
    </GlassCard>
  )
}

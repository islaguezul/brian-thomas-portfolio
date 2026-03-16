'use client'

import type { TechStackItem } from '@/lib/database/types'

interface SkillsSectionProps {
  items: TechStackItem[]
}

const TAG_COLORS = [
  { bg: 'rgba(212, 168, 85, 0.15)', border: 'rgba(212, 168, 85, 0.35)', text: 'var(--accretion)' },
  { bg: 'rgba(107, 143, 181, 0.15)', border: 'rgba(107, 143, 181, 0.35)', text: 'var(--steel-blue)' },
  { bg: 'rgba(160, 124, 176, 0.15)', border: 'rgba(160, 124, 176, 0.35)', text: 'var(--dusty-violet)' },
  { bg: 'rgba(196, 120, 120, 0.15)', border: 'rgba(196, 120, 120, 0.35)', text: 'var(--muted-rose)' },
  { bg: 'rgba(74, 111, 143, 0.15)', border: 'rgba(74, 111, 143, 0.35)', text: 'var(--wheat-light)' },
]

export default function SkillsSection({ items }: SkillsSectionProps) {
  if (!items || items.length === 0) return null

  return (
    <div className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div
          className="font-space text-xs tracking-[2px] uppercase mb-8"
          style={{ color: 'var(--accretion)' }}
        >
          Skills & Tech Stack
        </div>

        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => {
            const color = TAG_COLORS[i % TAG_COLORS.length]
            return (
              <span
                key={item.id ?? item.name}
                className="text-xs px-4 py-2 rounded-full"
                style={{
                  background: color.bg,
                  border: `1px solid ${color.border}`,
                  color: color.text,
                }}
              >
                {item.name}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}

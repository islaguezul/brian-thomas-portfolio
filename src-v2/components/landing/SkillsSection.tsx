import type { SkillCategory } from '@/lib/database/types'

interface SkillsSectionProps {
  categories: SkillCategory[]
}

const TAG_COLORS = [
  { bg: 'rgba(212, 168, 85, 0.15)', border: 'rgba(212, 168, 85, 0.35)', text: 'var(--accretion)' },
  { bg: 'rgba(107, 143, 181, 0.15)', border: 'rgba(107, 143, 181, 0.35)', text: 'var(--steel-blue)' },
  { bg: 'rgba(160, 124, 176, 0.15)', border: 'rgba(160, 124, 176, 0.35)', text: 'var(--dusty-violet)' },
  { bg: 'rgba(196, 120, 120, 0.15)', border: 'rgba(196, 120, 120, 0.35)', text: 'var(--muted-rose)' },
  { bg: 'rgba(74, 111, 143, 0.15)', border: 'rgba(74, 111, 143, 0.35)', text: 'var(--wheat-light)' },
]

export default function SkillsSection({ categories }: SkillsSectionProps) {
  const nonEmpty = categories.filter(
    (cat) => cat.skills && cat.skills.length > 0
  )

  if (nonEmpty.length === 0) return null

  return (
    <div className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div
          className="font-space text-xs tracking-[2px] uppercase mb-8"
          style={{ color: 'var(--accretion)' }}
        >
          Skills
        </div>

        <div className="flex flex-col gap-6">
          {nonEmpty.map((category, catIndex) => {
            const color = TAG_COLORS[catIndex % TAG_COLORS.length]
            return (
              <div key={category.id ?? category.name}>
                <div
                  className="font-space text-xs tracking-[2px] uppercase mb-3"
                  style={{ color: color.text, opacity: 0.6 }}
                >
                  {category.icon && (
                    <span className="mr-2">{category.icon}</span>
                  )}
                  {category.name}
                </div>

                <div className="flex flex-wrap gap-2">
                  {category.skills!.map((skill) => (
                    <span
                      key={skill.id ?? (skill.skillName || skill.skill_name)}
                      className="text-xs px-4 py-2 rounded-full"
                      style={{
                        background: color.bg,
                        border: `1px solid ${color.border}`,
                        color: color.text,
                      }}
                    >
                      {skill.skillName || skill.skill_name}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

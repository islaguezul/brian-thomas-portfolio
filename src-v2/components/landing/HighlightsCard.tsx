import GlassCard from './GlassCard'

interface HighlightsCardProps {
  yearsExperience: number
  projectCount: number
  specialization: string
}

export default function HighlightsCard({
  yearsExperience,
  projectCount,
  specialization,
}: HighlightsCardProps) {
  const highlights = [
    { value: `${yearsExperience}+`, label: 'Years Experience', color: 'var(--accretion)' },
    { value: `${projectCount}+`, label: 'Products Shipped', color: 'var(--wheat-light)' },
    { value: specialization, label: 'Specialization', color: 'var(--dark-gold)' },
  ]

  return (
    <GlassCard className="w-full max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto">
      <div className="p-6 md:p-8">
        <div
          className="font-space text-[10px] tracking-[2px] uppercase mb-4"
          style={{ color: 'var(--accretion)' }}
        >
          Key Highlights
        </div>
        <div className="grid grid-cols-3 gap-3">
          {highlights.map((h) => (
            <div
              key={h.label}
              className="text-center p-3 md:p-4 rounded-xl"
              style={{ background: 'rgba(212, 168, 85, 0.06)', border: '1px solid rgba(212, 168, 85, 0.1)' }}
            >
              <div
                className="font-space text-xl md:text-2xl font-bold"
                style={{ color: h.color }}
              >
                {h.value}
              </div>
              <div
                className="text-[10px] mt-1"
                style={{ color: 'rgba(245, 222, 179, 0.4)' }}
              >
                {h.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  )
}

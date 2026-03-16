'use client'

import { useState, useEffect } from 'react'
import type { WorkExperience } from '@/lib/database/types'

function formatDate(date?: Date | string): string {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default function ExperienceSection() {
  const [experiences, setExperiences] = useState<WorkExperience[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/resume/experience')
        if (res.ok) {
          setExperiences(await res.json())
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div
            className="font-space text-xs tracking-[2px] uppercase mb-8"
            style={{ color: 'var(--accretion)' }}
          >
            Work Experience
          </div>
          <div style={{ color: 'rgba(245,222,179,0.3)' }} className="text-sm">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div
          className="font-space text-xs tracking-[2px] uppercase mb-8"
          style={{ color: 'var(--accretion)' }}
        >
          Work Experience
        </div>

        <div
          className="border-l-2 pl-6 flex flex-col gap-4"
          style={{ borderColor: 'rgba(212, 168, 85, 0.15)' }}
        >
          {experiences.map((exp) => {
            const startDate = exp.startDate || exp.start_date
            const endDate = exp.endDate || exp.end_date
            const isCurrent = exp.isCurrent || exp.is_current
            const responsibilities = exp.responsibilities || []

            return (
              <div
                key={exp.id}
                className="rounded-xl p-5"
                style={{
                  background: 'rgba(212, 168, 85, 0.04)',
                  border: '1px solid rgba(212, 168, 85, 0.08)',
                }}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3
                    className="font-space text-sm font-semibold"
                    style={{ color: 'var(--floral)' }}
                  >
                    {exp.title}
                  </h3>
                  <span
                    className="text-xs whitespace-nowrap ml-4"
                    style={{ color: 'rgba(245, 222, 179, 0.3)' }}
                  >
                    {formatDate(startDate)} – {isCurrent ? 'Present' : formatDate(endDate)}
                  </span>
                </div>
                <div
                  className="text-xs mb-3"
                  style={{ color: 'var(--accretion)' }}
                >
                  {exp.company}
                </div>
                {responsibilities.length > 0 && (
                  <ul className="space-y-1">
                    {responsibilities.map((r) => (
                      <li
                        key={r.id}
                        className="text-xs leading-relaxed"
                        style={{ color: 'rgba(245, 222, 179, 0.5)' }}
                      >
                        • {r.responsibility}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

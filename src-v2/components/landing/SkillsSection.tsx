'use client'

import { useState, useEffect } from 'react'
import type { TechStackItem } from '@/lib/database/types'

const TAG_COLORS = [
  { bg: 'rgba(212, 168, 85, 0.08)', border: 'rgba(212, 168, 85, 0.2)', text: 'var(--accretion)' },
  { bg: 'rgba(245, 222, 179, 0.06)', border: 'rgba(245, 222, 179, 0.15)', text: 'var(--wheat-light)' },
  { bg: 'rgba(139, 105, 20, 0.12)', border: 'rgba(139, 105, 20, 0.25)', text: 'var(--dark-gold)' },
  { bg: 'rgba(46, 196, 182, 0.08)', border: 'rgba(46, 196, 182, 0.2)', text: 'var(--deep-teal)' },
]

export default function SkillsSection() {
  const [items, setItems] = useState<TechStackItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/tech-stack')
        if (res.ok) {
          setItems(await res.json())
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
            Skills & Tech Stack
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

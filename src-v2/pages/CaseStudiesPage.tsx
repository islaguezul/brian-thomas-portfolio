'use client'

import { useState, useCallback } from 'react'
import type { CaseStudy } from '@/lib/database/types'
import Navbar from '@v2/components/layout/Navbar'
import Footer from '@v2/components/layout/Footer'
import CaseStudyGrid from '@v2/components/case-studies/CaseStudyGrid'
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates'

interface CaseStudiesPageProps {
  initialCaseStudies: CaseStudy[]
  contactEmail?: string
}

export default function CaseStudiesPage({ initialCaseStudies, contactEmail }: CaseStudiesPageProps) {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>(initialCaseStudies)

  const fetchCaseStudies = useCallback(async () => {
    try {
      const response = await fetch('/api/case-studies')
      if (response.ok) {
        setCaseStudies(await response.json())
      }
    } catch {
      // Keep existing data on error
    }
  }, [])

  useRealtimeUpdates((message) => {
    if (message.type === 'content-update' && message.data?.contentType === 'Case Studies') {
      fetchCaseStudies()
    }
  })

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>
      <Navbar contactEmail={contactEmail} />

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div
            className="font-space text-xs tracking-[2px] uppercase mb-2"
            style={{ color: 'var(--accretion)' }}
          >
            Leadership
          </div>
          <h1
            className="font-space text-2xl md:text-3xl font-bold mb-3"
            style={{ color: 'var(--floral)' }}
          >
            Professional Case Studies
          </h1>
          <p
            className="text-sm mb-8 max-w-2xl"
            style={{ color: 'rgba(245, 222, 179, 0.6)' }}
          >
            Programs and initiatives I&apos;ve led as a Technical Product Manager — focused on decisions and outcomes.
          </p>

          {caseStudies.length === 0 ? (
            <div style={{ color: 'rgba(245,222,179,0.4)' }} className="text-sm">
              No case studies yet.
            </div>
          ) : (
            <CaseStudyGrid caseStudies={caseStudies} />
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

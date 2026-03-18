'use client'

import { useState } from 'react'
import type { CaseStudy } from '@/lib/database/types'
import CaseStudyCard from './CaseStudyCard'
import CaseStudyModal from './CaseStudyModal'

interface CaseStudyGridProps {
  caseStudies: CaseStudy[]
}

export default function CaseStudyGrid({ caseStudies }: CaseStudyGridProps) {
  const [selected, setSelected] = useState<CaseStudy | null>(null)

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {caseStudies.map((cs) => (
          <CaseStudyCard
            key={cs.id}
            caseStudy={cs}
            onClick={() => setSelected(cs)}
          />
        ))}
      </div>
      {selected && (
        <CaseStudyModal
          caseStudy={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}

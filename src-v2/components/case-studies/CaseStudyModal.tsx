'use client'

import { useEffect } from 'react'
import type { CaseStudy } from '@/lib/database/types'

interface CaseStudyModalProps {
  caseStudy: CaseStudy
  onClose: () => void
}

const COMPLEXITY_COLORS: Record<string, string> = {
  high: 'var(--muted-rose)',
  medium: 'var(--accretion)',
  low: 'var(--steel-blue)',
}

export default function CaseStudyModal({ caseStudy, onClose }: CaseStudyModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-study-title"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative max-w-3xl w-full max-h-[85vh] overflow-y-auto rounded-2xl p-8"
        style={{
          background: 'var(--warm-black)',
          border: '1px solid rgba(212, 168, 85, 0.12)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-lg"
          style={{ color: 'rgba(245, 222, 179, 0.5)' }}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header */}
        <div className="mb-6">
          {caseStudy.category && (
            <span
              className="text-[10px] font-space uppercase tracking-wider"
              style={{ color: 'var(--accretion)' }}
            >
              {caseStudy.category}
            </span>
          )}
          <h2 id="case-study-title" className="font-space text-xl font-bold mt-1" style={{ color: 'var(--floral)' }}>
            {caseStudy.title}
          </h2>
          {caseStudy.summary && (
            <p
              className="text-sm mt-2 leading-relaxed"
              style={{ color: 'rgba(245, 222, 179, 0.7)' }}
            >
              {caseStudy.summary}
            </p>
          )}
        </div>

        {/* Context bar */}
        <div
          className="flex flex-wrap gap-x-4 gap-y-2 mb-6 text-xs py-3 px-4 rounded-lg"
          style={{
            background: 'rgba(212, 168, 85, 0.04)',
            border: '1px solid rgba(212, 168, 85, 0.08)',
          }}
        >
          {caseStudy.industry && (
            <div>
              <span style={{ color: 'rgba(245, 222, 179, 0.4)' }}>Industry: </span>
              <span style={{ color: 'rgba(245, 222, 179, 0.7)' }}>{caseStudy.industry}</span>
            </div>
          )}
          {caseStudy.orgScale && (
            <div>
              <span style={{ color: 'rgba(245, 222, 179, 0.4)' }}>Scale: </span>
              <span style={{ color: 'rgba(245, 222, 179, 0.7)' }}>{caseStudy.orgScale}</span>
            </div>
          )}
          {caseStudy.timeline && (
            <div>
              <span style={{ color: 'rgba(245, 222, 179, 0.4)' }}>Timeline: </span>
              <span style={{ color: 'rgba(245, 222, 179, 0.7)' }}>{caseStudy.timeline}</span>
            </div>
          )}
          {caseStudy.teamScope && (
            <div>
              <span style={{ color: 'rgba(245, 222, 179, 0.4)' }}>Team: </span>
              <span style={{ color: 'rgba(245, 222, 179, 0.7)' }}>{caseStudy.teamScope}</span>
            </div>
          )}
          {caseStudy.stakeholderCount && (
            <div>
              <span style={{ color: 'rgba(245, 222, 179, 0.4)' }}>Stakeholders: </span>
              <span style={{ color: 'rgba(245, 222, 179, 0.7)' }}>{caseStudy.stakeholderCount}</span>
            </div>
          )}
        </div>

        {/* Problem */}
        {caseStudy.problem && (
          <div className="mb-6">
            <h3
              className="font-space text-xs uppercase tracking-wider mb-2"
              style={{ color: 'var(--accretion)' }}
            >
              The Challenge
            </h3>
            <p
              className="text-xs leading-relaxed"
              style={{ color: 'rgba(245, 222, 179, 0.6)' }}
            >
              {caseStudy.problem}
            </p>
          </div>
        )}

        {/* Approach */}
        {caseStudy.approaches && caseStudy.approaches.length > 0 && (
          <div className="mb-6">
            <h3
              className="font-space text-xs uppercase tracking-wider mb-3"
              style={{ color: 'var(--accretion)' }}
            >
              Approach
            </h3>
            <div className="space-y-2">
              {caseStudy.approaches.map((a, i) => (
                <div key={i} className="flex gap-3">
                  <span
                    className="text-[10px] font-space mt-0.5 w-5 shrink-0 text-right"
                    style={{ color: 'var(--steel-blue)' }}
                  >
                    {i + 1}.
                  </span>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: 'rgba(245, 222, 179, 0.6)' }}
                  >
                    {a.stepText}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outcomes */}
        {caseStudy.outcomes && caseStudy.outcomes.length > 0 && (
          <div className="mb-6">
            <h3
              className="font-space text-xs uppercase tracking-wider mb-3"
              style={{ color: 'var(--accretion)' }}
            >
              Outcomes
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {caseStudy.outcomes.map((o, i) => (
                <div
                  key={i}
                  className="rounded-lg p-3"
                  style={{
                    background: 'rgba(212, 168, 85, 0.04)',
                    border: '1px solid rgba(212, 168, 85, 0.08)',
                  }}
                >
                  <div className="text-sm font-semibold" style={{ color: 'var(--accretion)' }}>
                    {o.result}
                  </div>
                  <div className="text-[10px]" style={{ color: 'rgba(245, 222, 179, 0.5)' }}>
                    {o.metric}
                  </div>
                  {o.context && (
                    <div className="text-[10px] mt-1" style={{ color: 'rgba(245, 222, 179, 0.35)' }}>
                      {o.context}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills demonstrated */}
        {caseStudy.skills && caseStudy.skills.length > 0 && (
          <div className="mb-6">
            <h3
              className="font-space text-xs uppercase tracking-wider mb-2"
              style={{ color: 'var(--accretion)' }}
            >
              Skills Demonstrated
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {caseStudy.skills.map((s, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{
                    background: 'rgba(107, 143, 181, 0.1)',
                    border: '1px solid rgba(107, 143, 181, 0.25)',
                    color: 'var(--steel-blue)',
                  }}
                >
                  {s.skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Complexity signals */}
        {(caseStudy.ambiguity || caseStudy.technicalDepth || caseStudy.organizationalComplexity || caseStudy.regulatoryConstraints) && (
          <div>
            <h3
              className="font-space text-xs uppercase tracking-wider mb-3"
              style={{ color: 'var(--accretion)' }}
            >
              Complexity Profile
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Ambiguity', level: caseStudy.ambiguity, detail: caseStudy.ambiguityDetail },
                { label: 'Technical Depth', level: caseStudy.technicalDepth, detail: caseStudy.technicalDepthDetail },
                { label: 'Org Complexity', level: caseStudy.organizationalComplexity, detail: caseStudy.organizationalComplexityDetail },
                { label: 'Regulatory', level: caseStudy.regulatoryConstraints, detail: caseStudy.regulatoryConstraintsDetail },
              ]
                .filter((c) => c.level)
                .map((c, i) => (
                  <div
                    key={i}
                    className="rounded-lg p-3"
                    style={{
                      background: 'rgba(212, 168, 85, 0.04)',
                      border: '1px solid rgba(212, 168, 85, 0.08)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px]" style={{ color: 'rgba(245, 222, 179, 0.5)' }}>
                        {c.label}
                      </span>
                      <span
                        className="text-[10px] font-semibold uppercase"
                        style={{ color: COMPLEXITY_COLORS[c.level || ''] || 'var(--wheat-light)' }}
                      >
                        {c.level}
                      </span>
                    </div>
                    {c.detail && (
                      <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(245, 222, 179, 0.4)' }}>
                        {c.detail}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

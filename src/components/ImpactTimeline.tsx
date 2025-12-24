'use client'

import React, { useState, useEffect } from 'react'
import { ChevronRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import type { WorkExperience } from '@/lib/database/types'

interface ImpactTimelineProps {
  className?: string
}

const ImpactTimeline: React.FC<ImpactTimelineProps> = ({ className = '' }) => {
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWorkExperience = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/resume/experience')
        if (!response.ok) {
          throw new Error('Failed to fetch work experience')
        }
        const data = await response.json()
        setWorkExperience(data)
      } catch (err) {
        console.error('Error fetching work experience:', err)
        setError('Unable to load experience data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkExperience()
  }, [])

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-20 ${className}`}>
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        <span className="ml-3 text-slate-400">Loading experience...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-center py-20 ${className}`}>
        <p className="text-slate-400">{error}</p>
      </div>
    )
  }

  if (workExperience.length === 0) {
    return (
      <div className={`text-center py-20 ${className}`}>
        <p className="text-slate-400">No experience data available</p>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Timeline vertical line */}
      <div className="absolute left-0 md:left-1/2 transform md:-translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-cyan-500 hidden md:block" />

      <div className="space-y-12">
        {workExperience.map((exp, index) => {
          const startDate = exp.startDate || exp.start_date
          const endDate = exp.endDate || exp.end_date
          const isCurrent = exp.isCurrent || exp.is_current

          const dateRange = isCurrent
            ? `${formatDate(startDate)} - Present`
            : `${formatDate(startDate)} - ${formatDate(endDate)}`

          const isEven = index % 2 === 0

          return (
            <div
              key={exp.id}
              className={`relative flex flex-col md:flex-row ${
                isEven ? 'md:flex-row' : 'md:flex-row-reverse'
              } items-start`}
            >
              {/* Timeline dot */}
              <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-4 border-slate-900 z-10 hidden md:block" />

              {/* Left side (Company/Date) */}
              <div
                className={`w-full md:w-1/2 ${
                  isEven ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'
                } mb-4 md:mb-0`}
              >
                <h3 className="text-xl font-bold text-white">{exp.company}</h3>
                <p className="text-blue-400 font-semibold">{exp.title}</p>
                <p className="text-slate-400 text-sm mt-2">{dateRange}</p>
              </div>

              {/* Right side (Impact/Responsibilities) */}
              <div
                className={`w-full md:w-1/2 ${
                  isEven ? 'md:pl-12' : 'md:pr-12'
                }`}
              >
                <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-500 hover-lift">
                  {exp.responsibilities && exp.responsibilities.length > 0 ? (
                    <ul className="space-y-3">
                      {exp.responsibilities.slice(0, 3).map((resp) => (
                        <li
                          key={resp.id}
                          className="text-slate-300 leading-relaxed flex items-start"
                        >
                          <span className="text-blue-400 mr-2 mt-1">•</span>
                          <span>{resp.responsibility}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-400 italic">Details coming soon...</p>
                  )}

                  {/* View Case Study link */}
                  <Link
                    href="/case-studies"
                    className="inline-flex items-center gap-2 mt-4 text-blue-400 hover:text-blue-300 transition-colors group text-sm font-medium"
                  >
                    View Related Projects
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ImpactTimeline

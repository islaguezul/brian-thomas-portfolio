'use client'

import React, { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import type { TechStackItem } from '@/lib/database/types'

// Fallback tech stack in case API fails or returns empty
const FALLBACK_TECH_STACK = [
  'AWS',
  'JIRA',
  'SQL',
  'React',
  'Python',
  'Kubernetes',
  'CI/CD',
  'Agile',
]

interface TechTickerProps {
  className?: string
  speed?: 'slow' | 'normal' | 'fast'
}

const TechTicker: React.FC<TechTickerProps> = ({
  className = '',
  speed = 'normal'
}) => {
  const [techStack, setTechStack] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTechStack = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/tech-stack')
        if (!response.ok) {
          throw new Error('Failed to fetch tech stack')
        }
        const data: TechStackItem[] = await response.json()

        if (data && data.length > 0) {
          // Extract just the names for the ticker
          const techNames = data.map(item => item.name)
          setTechStack(techNames)
        } else {
          // Use fallback if no data
          setTechStack(FALLBACK_TECH_STACK)
        }
      } catch (error) {
        console.error('Error fetching tech stack:', error)
        setTechStack(FALLBACK_TECH_STACK)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTechStack()
  }, [])

  // Duplicate the array for seamless infinite scroll
  const duplicatedTech = [...techStack, ...techStack]

  const speedClass = {
    slow: 'animate-[scroll_40s_linear_infinite]',
    normal: 'animate-[scroll_25s_linear_infinite]',
    fast: 'animate-[scroll_15s_linear_infinite]',
  }[speed]

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-6 ${className}`}>
        <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
        <span className="ml-2 text-slate-400 text-sm">Loading skills...</span>
      </div>
    )
  }

  if (techStack.length === 0) {
    return null
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 80px, black calc(100% - 80px), transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 80px, black calc(100% - 80px), transparent)'
      }}
    >
      {/* Scrolling container */}
      <div className={`flex gap-8 ${speedClass}`}>
        {duplicatedTech.map((tech, index) => (
          <div
            key={`${tech}-${index}`}
            className="flex items-center gap-3 px-6 py-3 bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 whitespace-nowrap shrink-0"
          >
            <span className="text-slate-300 font-medium">{tech}</span>
          </div>
        ))}
      </div>

      {/* Inline keyframes style */}
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  )
}

export default TechTicker

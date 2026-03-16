'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { FrameLoadResult } from '@v2/lib/frame-loader'
import type { PersonalInfo, WorkExperience, TechStackItem } from '@/lib/database/types'
import FrameLoader from '@v2/components/landing/FrameLoader'
import ScrollVideo from '@v2/components/landing/ScrollVideo'
import HeroOverlay from '@v2/components/landing/HeroOverlay'
import AboutCard from '@v2/components/landing/AboutCard'
import HighlightsCard from '@v2/components/landing/HighlightsCard'
import Navbar from '@v2/components/layout/Navbar'
import ExperienceSection from '@v2/components/landing/ExperienceSection'
import SkillsSection from '@v2/components/landing/SkillsSection'
import Footer from '@v2/components/layout/Footer'

interface HomePageProps {
  personalInfo: PersonalInfo
  projectCount: number
  experiences: WorkExperience[]
  techStack: TechStackItem[]
}

export default function HomePage({ personalInfo, projectCount, experiences, techStack }: HomePageProps) {
  const [frameData, setFrameData] = useState<FrameLoadResult | null>(null)
  const handleFramesLoaded = useCallback((result: FrameLoadResult) => {
    setFrameData(result)
  }, [])

  const hasFrames = frameData && frameData.frames.length > 0

  // Track scroll for "Scroll to explore" fade — lives at HomePage level
  // so the fixed element has no intermediate ancestors
  const [scrollHintVisible, setScrollHintVisible] = useState(true)
  useEffect(() => {
    if (!hasFrames) return
    const handleScroll = () => {
      // Hide once user has scrolled at all — the CSS transition handles the fade
      if (window.scrollY > 10) setScrollHintVisible(false)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasFrames])

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>
      {/* Navbar — always visible */}
      <Navbar contactEmail={personalInfo.email} />

      {/* Loading screen — unmounted after frames load */}
      {!frameData && <FrameLoader onLoaded={handleFramesLoaded} />}

      {/* Fixed "Scroll to explore" — top-level so position:fixed is reliable */}
      {hasFrames && (
        <div
          className="pointer-events-none fixed inset-0 z-30 flex items-start justify-center pt-[48vh]"
          style={{
            opacity: scrollHintVisible ? 1 : 0,
            transition: 'opacity 0.6s ease-out',
          }}
        >
          <div
            className="text-sm md:text-base tracking-[3px] uppercase animate-pulse font-medium font-space"
            style={{
              color: '#000',
            }}
          >
            Scroll to explore
          </div>
        </div>
      )}

      {/* Video section with sticky canvas + glass cards as children */}
      {hasFrames && (
        <div className="relative">
          {/* Scroll video — hero + glass cards scroll together */}
          <ScrollVideo
            frames={frameData.frames}
            totalFrames={frameData.totalFrames}
            heroOverlay={() => (
              <HeroOverlay
                name={personalInfo.name}
                title={personalInfo.title}
              />
            )}
          >
            <div className="flex flex-col gap-8 w-full px-6 max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto pb-32">
              <AboutCard personalInfo={personalInfo} />
              <HighlightsCard
                yearsExperience={personalInfo.yearsExperience ?? 10}
                projectCount={projectCount}
                specialization={personalInfo.title?.includes('AI') ? 'AI' : personalInfo.title?.split(' ')[0] ?? 'Tech'}
              />
            </div>
          </ScrollVideo>
        </div>
      )}

      {/* Fallback: no frames loaded, show static content */}
      {frameData && !hasFrames && (
        <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="text-center px-6">
            <h1
              className="font-space text-4xl md:text-6xl font-bold mb-4"
              style={{ color: 'var(--floral)' }}
            >
              {personalInfo.name}
            </h1>
            <p className="text-sm" style={{ color: 'var(--accretion)' }}>
              {personalInfo.title}
            </p>
          </div>
        </div>
      )}

      {/* Post-video content */}
      <div style={{ background: 'var(--void)', position: 'relative', zIndex: 2 }}>
        <ExperienceSection experiences={experiences} />
        <SkillsSection items={techStack} />
        <Footer name={personalInfo.name} />
      </div>
    </div>
  )
}

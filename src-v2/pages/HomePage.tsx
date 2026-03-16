'use client'

import { useState, useCallback, useEffect } from 'react'
import type { FrameLoadResult } from '@v2/lib/frame-loader'
import type { PersonalInfo } from '@/lib/database/types'
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
}

export default function HomePage({ personalInfo, projectCount }: HomePageProps) {
  const [frameData, setFrameData] = useState<FrameLoadResult | null>(null)
  const [heroOpacity, setHeroOpacity] = useState(1)

  const handleFramesLoaded = useCallback((result: FrameLoadResult) => {
    setFrameData(result)
  }, [])

  // Fade out hero overlay as user scrolls into the first ~30% of the video section
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const fadeStart = window.innerHeight * 0.2
      const fadeEnd = window.innerHeight * 0.8
      if (scrollY <= fadeStart) {
        setHeroOpacity(1)
      } else if (scrollY >= fadeEnd) {
        setHeroOpacity(0)
      } else {
        setHeroOpacity(1 - (scrollY - fadeStart) / (fadeEnd - fadeStart))
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const hasFrames = frameData && frameData.frames.length > 0

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>
      {/* Navbar — always visible */}
      <Navbar contactEmail={personalInfo.email} />

      {/* Loading screen — unmounted after frames load */}
      {!frameData && <FrameLoader onLoaded={handleFramesLoaded} />}

      {/* Video section with sticky canvas + glass cards as children */}
      {hasFrames && (
        <div className="relative">
          {/* Hero overlay — fixed, fades out on scroll */}
          <HeroOverlay
            name={personalInfo.name}
            title={personalInfo.title}
            style={{ opacity: heroOpacity, transition: 'opacity 0.1s ease' }}
          />

          {/* Scroll video — glass cards are children so they scroll inside the wrapper */}
          <ScrollVideo
            frames={frameData.frames}
            totalFrames={frameData.totalFrames}
          >
            <div className="flex flex-col gap-8 w-full px-6 max-w-xl mx-auto pb-32">
              <AboutCard personalInfo={personalInfo} />
              <HighlightsCard
                yearsExperience={personalInfo.yearsExperience ?? 10}
                projectCount={projectCount}
                specialization="AI"
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
        <ExperienceSection />
        <SkillsSection />
        <Footer />
      </div>
    </div>
  )
}

'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import { useScrollVideo } from '@v2/hooks/useScrollVideo'

interface ScrollVideoProps {
  frames: HTMLImageElement[]
  totalFrames: number
  heroOverlay?: (scrollProgress: number) => React.ReactNode
  children?: React.ReactNode
}

export default function ScrollVideo({ frames, totalFrames, heroOverlay, children }: ScrollVideoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const isMobileRef = useRef(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  // Detect mobile (using ref to avoid re-render / draw accumulation on resize)
  useEffect(() => {
    isMobileRef.current = window.innerWidth < 768
    const handleResize = () => { isMobileRef.current = window.innerWidth < 768 }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Draw a frame to the canvas with cover-fit
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const img = frames[frameIndex]
    if (!canvas || !ctx || !img) return

    const dpr = window.devicePixelRatio || 1
    const displayWidth = canvas.clientWidth
    const displayHeight = canvas.clientHeight

    // Set canvas resolution for retina (only when dimensions change)
    const targetW = displayWidth * dpr
    const targetH = displayHeight * dpr
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW
      canvas.height = targetH
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    // Cover-fit: scale image to fill canvas, crop overflow
    const imgRatio = img.naturalWidth / img.naturalHeight
    const canvasRatio = displayWidth / displayHeight
    const isMobile = isMobileRef.current

    let drawWidth: number, drawHeight: number

    if (isMobile) {
      // Zoomed contain-fit on mobile
      const scale = 1.2
      if (imgRatio > canvasRatio) {
        drawHeight = displayHeight * scale
        drawWidth = drawHeight * imgRatio
      } else {
        drawWidth = displayWidth * scale
        drawHeight = drawWidth / imgRatio
      }
    } else {
      // Cover-fit on desktop
      if (imgRatio > canvasRatio) {
        drawHeight = displayHeight
        drawWidth = drawHeight * imgRatio
      } else {
        drawWidth = displayWidth
        drawHeight = drawWidth / imgRatio
      }
    }

    const drawX = (displayWidth - drawWidth) / 2
    const drawY = (displayHeight - drawHeight) / 2

    ctx.clearRect(0, 0, displayWidth, displayHeight)
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
  }, [frames])

  // Draw initial frame
  useEffect(() => {
    if (frames.length > 0) {
      drawFrame(0)
    }
  }, [frames, drawFrame])

  // Connect scroll to frame rendering (wrap in useCallback-stable ref)
  const drawFrameRef = useRef(drawFrame)
  drawFrameRef.current = drawFrame

  const stableOnFrameChange = useCallback((index: number) => {
    drawFrameRef.current(index)
  }, [])

  useScrollVideo({
    totalFrames,
    wrapperRef,
    onFrameChange: stableOnFrameChange,
  })

  // Track scroll progress for hero fade
  useEffect(() => {
    const handleScroll = () => {
      const wrapper = wrapperRef.current
      if (!wrapper) return
      const rect = wrapper.getBoundingClientRect()
      const scrollableDistance = wrapper.offsetHeight - window.innerHeight
      const scrolled = -rect.top
      setScrollProgress(Math.max(0, Math.min(1, scrolled / scrollableDistance)))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Default to desktop height for SSR consistency; update on mount for mobile
  const scrollHeightRef = useRef('200vh')
  useEffect(() => {
    if (window.innerWidth < 768) {
      scrollHeightRef.current = '170vh'
      if (wrapperRef.current) wrapperRef.current.style.height = '170vh'
    }
  }, [])

  return (
    <div
      ref={wrapperRef}
      style={{ height: scrollHeightRef.current, position: 'relative' }}
    >
      {/* Sticky canvas — stays fixed while wrapper scrolls */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'sticky',
          top: 0,
          width: '100vw',
          height: '100vh',
          display: 'block',
        }}
      />

      {/* Hero + cards scroll together in normal flow, overlapping the sticky canvas */}
      <div
        className="relative z-10"
        style={{ marginTop: '-100vh' }}
      >
        {/* Hero — positioned in upper third, shorter so first card peeks into view */}
        {heroOverlay && (
          <div className="flex items-start justify-center pt-[28vh]" style={{ height: '70vh' }}>
            {heroOverlay(scrollProgress)}
          </div>
        )}

        {children}
      </div>
    </div>
  )
}

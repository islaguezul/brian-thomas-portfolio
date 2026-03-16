'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseScrollVideoOptions {
  /** Total number of frames */
  totalFrames: number
  /** Ref to the scroll wrapper element (the tall container) */
  wrapperRef: React.RefObject<HTMLElement | null>
  /** Called with the current frame index on scroll */
  onFrameChange: (frameIndex: number) => void
}

/**
 * Maps scroll position within a wrapper element to a frame index.
 * The wrapper should be a tall element (e.g., 350vh) containing a sticky canvas.
 * Scroll progress through the wrapper = video progress through frames.
 */
export function useScrollVideo({
  totalFrames,
  wrapperRef,
  onFrameChange,
}: UseScrollVideoOptions) {
  const rafId = useRef<number>(0)
  const lastFrame = useRef<number>(-1)

  const handleScroll = useCallback(() => {
    if (rafId.current) return

    rafId.current = requestAnimationFrame(() => {
      rafId.current = 0
      const wrapper = wrapperRef.current
      if (!wrapper || totalFrames === 0) return

      const rect = wrapper.getBoundingClientRect()
      const wrapperHeight = wrapper.offsetHeight
      const viewportHeight = window.innerHeight

      // How far the wrapper has scrolled past the top of the viewport
      // 0 = wrapper top is at viewport top
      // wrapperHeight - viewportHeight = wrapper bottom is at viewport bottom (sticky releases)
      const scrollableDistance = wrapperHeight - viewportHeight
      const scrolled = -rect.top

      const progress = Math.max(0, Math.min(1, scrolled / scrollableDistance))
      const frameIndex = Math.min(
        totalFrames - 1,
        Math.floor(progress * totalFrames)
      )

      if (frameIndex !== lastFrame.current) {
        lastFrame.current = frameIndex
        onFrameChange(frameIndex)
      }
    })
  }, [totalFrames, wrapperRef, onFrameChange])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    // Trigger initial frame
    handleScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [handleScroll])
}

# Portfolio Redesign — Scroll-Stop Black Hole Landing Page

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin the public frontend of brian-thomas-portfolio with an immersive scroll-driven black hole video landing page, keeping the existing backend untouched.

**Architecture:** New frontend code lives in `src-v2/` with a `@v2/*` path alias. Existing `src/app/` page routes become thin wrappers importing from `src-v2/`. Admin, API, middleware, database, and auth remain in `src/` unchanged. Video frames extracted via FFmpeg are served from `public/frames/`.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Space Grotesk + Inter fonts, CSS `backdrop-filter` for glass effects, `<canvas>` for scroll-driven video.

**Spec:** `docs/superpowers/specs/2026-03-15-portfolio-redesign-design.md`

---

## Chunk 1: Foundation — Branch, Config, Frame Extraction

### Task 1: Create Feature Branch and Directory Structure

**Files:**
- Create: `src-v2/` directory structure
- Modify: none

- [x] **Step 1: Create the feature branch**

```bash
git checkout -b redesign/v2
```

- [x] **Step 2: Create the src-v2 directory tree**

```bash
mkdir -p src-v2/components/layout
mkdir -p src-v2/components/landing
mkdir -p src-v2/components/projects
mkdir -p src-v2/pages
mkdir -p src-v2/hooks
mkdir -p src-v2/lib
mkdir -p src-v2/styles
```

- [x] **Step 3: Add .gitkeep files so empty dirs are tracked**

```bash
touch src-v2/components/layout/.gitkeep
touch src-v2/components/landing/.gitkeep
touch src-v2/components/projects/.gitkeep
touch src-v2/pages/.gitkeep
touch src-v2/hooks/.gitkeep
touch src-v2/lib/.gitkeep
touch src-v2/styles/.gitkeep
```

- [x] **Step 4: Commit**

```bash
git add src-v2/
git commit -m "chore: scaffold src-v2 directory structure for redesign"
```

---

### Task 2: Update Config — Path Alias, Tailwind, Fonts

**Files:**
- Modify: `tsconfig.json` (add `@v2/*` path alias)
- Modify: `tailwind.config.ts` (add `src-v2/` to content paths, extend theme)
- Modify: `src/app/layout.tsx` (add Space Grotesk font)

- [x] **Step 1: Add @v2 path alias to tsconfig.json**

In `tsconfig.json`, add to the `paths` object:

```json
"@v2/*": ["./src-v2/*"]
```

So paths becomes:
```json
"paths": {
  "@/*": ["./src/*"],
  "@v2/*": ["./src-v2/*"]
}
```

- [x] **Step 2: Update tailwind.config.ts**

**Important:** Read the existing file first. Add to it — do not replace it. The changes are:

1. Add `'./src-v2/**/*.{js,ts,jsx,tsx,mdx}'` to the `content` array
2. Add these to `theme.extend`:

```typescript
// Add to theme.extend.colors:
colors: {
  void: '#02040a',
  'warm-black': '#0d0a06',
  'deep-amber': '#1a1008',
  'dark-gold': '#8b6914',
  'accretion': '#d4a855',
  'wheat-light': '#f5deb3',
  'floral': '#fffaf0',
  'deep-teal': '#2ec4b6',
},
// Add to theme.extend.animation (alongside existing 'pulse-slow'):
'border-rotate': 'border-rotate 8s linear infinite',
// Add to theme.extend (new key):
keyframes: {
  'border-rotate': {
    to: { '--angle': '495deg' },
  },
},
// Add to theme.extend (new key):
fontFamily: {
  'space': ['Space Grotesk', 'sans-serif'],
},
```

Keep all existing config entries (backgroundImage, plugins, etc.).

- [x] **Step 3: Add Space Grotesk font to layout.tsx**

**Important:** Read the existing `src/app/layout.tsx` first. Only make these targeted changes — do NOT replace the file (it may contain providers, wrappers, or other config needed by admin/auth):

1. Add the import: `import { Space_Grotesk } from 'next/font/google'`
2. Add font instance: `const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' })`
3. If Inter is already imported without a `variable` prop, add `variable: '--font-inter'` to its config
4. Add the font variables to the `<body>` className: `${spaceGrotesk.variable}` (and `${inter.variable}` if not already there)

Do not modify metadata, providers, or any other existing content in this file.

- [x] **Step 4: Verify the build still works**

```bash
npm run build
```

Expected: Build succeeds with no errors. Admin and API routes unaffected.

- [x] **Step 5: Commit**

```bash
git add tsconfig.json tailwind.config.ts src/app/layout.tsx
git commit -m "chore: add @v2 path alias, extend Tailwind theme, add Space Grotesk font"
```

---

### Task 3: Extract Video Frames

**Files:**
- Create: `public/frames/frame_0001.webp` through `frame_NNNN.webp`
- Modify: `.gitignore` (add frames to avoid bloating repo)

**Prerequisites:** FFmpeg must be installed (`brew install ffmpeg` if not available).

- [x] **Step 1: Check FFmpeg availability**

```bash
ffmpeg -version
```

If not installed, run `brew install ffmpeg`.

- [x] **Step 2: Create the frames directory**

```bash
mkdir -p public/frames
```

- [x] **Step 3: Extract frames from the video**

```bash
ffmpeg -i "/Users/brian/3D Website Asset Generation/blackhole_disc.mp4" \
  -vf "fps=15" -q:v 2 -f image2 \
  public/frames/frame_%04d.webp
```

This extracts frames at 15fps. Check the output count — aim for ~100 frames. If too many/few, adjust the fps value:
- More frames = smoother scroll but more bandwidth
- Fewer frames = choppier but lighter

- [x] **Step 4: Verify frame count and total size**

```bash
ls public/frames/ | wc -l
du -sh public/frames/
```

Expected: ~60-150 frames, ~3-5MB total. If frames are too large (>50KB each), re-extract with lower quality: `-q:v 5`.

- [x] **Step 5: Add frames to .gitignore**

Add to `.gitignore`:
```
# Extracted video frames (too large for git, regenerate with ffmpeg)
public/frames/
```

- [x] **Step 6: Commit**

```bash
git add .gitignore
git commit -m "chore: add public/frames to gitignore (extracted video frames)"
```

---

### Task 4: Global CSS — Deep Space Theme

**Files:**
- Create: `src-v2/styles/globals.css`

- [x] **Step 1: Create the global CSS file**

Create `src-v2/styles/globals.css`:

```css
/* Deep Space Theme — Warm Cosmic Palette */

/* CSS custom properties for the palette */
:root {
  --void: #02040a;
  --warm-black: #0d0a06;
  --deep-amber: #1a1008;
  --dark-gold: #8b6914;
  --accretion: #d4a855;
  --wheat-light: #f5deb3;
  --floral: #fffaf0;
  --deep-teal: #2ec4b6;
}

/* @property for animated gradient border (Chrome, Safari 16.4+) */
@property --angle {
  syntax: '<angle>';
  initial-value: 135deg;
  inherits: false;
}

/* Liquid Glass Card */
.glass-card {
  background: rgba(13, 10, 6, 0.42);
  backdrop-filter: blur(10px) saturate(1.2);
  -webkit-backdrop-filter: blur(10px) saturate(1.2);
  border-radius: 16px;
  overflow: hidden;
  position: relative;
}

/* Animated gradient border wrapper */
.glass-border {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  padding: 1px;
  background: linear-gradient(
    var(--angle, 135deg),
    rgba(212, 168, 85, 0.35),
    rgba(46, 196, 182, 0.15),
    rgba(245, 222, 179, 0.25),
    rgba(212, 168, 85, 0.35)
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: border-rotate 8s linear infinite;
  pointer-events: none;
}

@keyframes border-rotate {
  to { --angle: 495deg; }
}

/* Specular top highlight */
.glass-highlight {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 10%,
    rgba(245, 222, 179, 0.3) 30%,
    rgba(245, 222, 179, 0.5) 50%,
    rgba(245, 222, 179, 0.3) 70%,
    transparent 90%
  );
  pointer-events: none;
}

/* Inner radial glow */
.glass-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 50%;
  bottom: 50%;
  background: radial-gradient(
    ellipse at 30% 20%,
    rgba(245, 222, 179, 0.06) 0%,
    transparent 70%
  );
  pointer-events: none;
}

/* Outer glow around glass cards */
.glass-outer-glow {
  position: absolute;
  inset: -1px;
  border-radius: 17px;
  background: linear-gradient(
    135deg,
    rgba(212, 168, 85, 0.25) 0%,
    rgba(46, 196, 182, 0.08) 50%,
    rgba(212, 168, 85, 0.15) 100%
  );
  filter: blur(1px);
  pointer-events: none;
}

/* Glass navbar variant (more subtle) */
.glass-nav {
  background: rgba(13, 10, 6, 0.5);
  backdrop-filter: blur(12px) saturate(1.1);
  -webkit-backdrop-filter: blur(12px) saturate(1.1);
  border-bottom: 1px solid rgba(212, 168, 85, 0.08);
  transition: background 0.4s ease;
}

.glass-nav--opaque {
  background: rgba(13, 10, 6, 0.85);
  border-bottom-color: rgba(212, 168, 85, 0.15);
}

/* Full-screen loader */
.loader-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: var(--void);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: opacity 0.6s ease;
}

.loader-overlay--hidden {
  opacity: 0;
  pointer-events: none;
}

.loader-bar {
  width: 200px;
  height: 2px;
  background: rgba(212, 168, 85, 0.15);
  border-radius: 1px;
  overflow: hidden;
}

.loader-bar-fill {
  height: 100%;
  background: var(--accretion);
  border-radius: 1px;
  transition: width 0.3s ease;
}
```

- [x] **Step 2: Verify the file was created correctly**

```bash
cat src-v2/styles/globals.css | head -5
```

Expected: Shows the CSS custom properties block.

- [x] **Step 3: Commit**

```bash
git add src-v2/styles/globals.css
git commit -m "feat: add deep space theme CSS with liquid glass effects"
```

---

## Chunk 2: Scroll Video System

### Task 5: Frame Loader Utility

**Files:**
- Create: `src-v2/lib/frame-loader.ts`

This module preloads extracted video frames as `HTMLImageElement` objects.

- [x] **Step 1: Create frame-loader.ts**

Create `src-v2/lib/frame-loader.ts`:

```typescript
export interface FrameLoadResult {
  frames: HTMLImageElement[]
  totalFrames: number
}

export type ProgressCallback = (loaded: number, total: number) => void

/**
 * Detects the number of frames available in public/frames/ by probing
 * frame URLs until a 404 is hit. Starts from frame_0001.webp.
 */
async function detectFrameCount(): Promise<number> {
  // Binary search for the last valid frame
  let low = 1
  let high = 300 // reasonable upper bound

  while (low < high) {
    const mid = Math.ceil((low + high) / 2)
    const url = `/frames/frame_${String(mid).padStart(4, '0')}.webp`
    try {
      const res = await fetch(url, { method: 'HEAD' })
      if (res.ok) {
        low = mid
      } else {
        high = mid - 1
      }
    } catch {
      high = mid - 1
    }
  }

  return low
}

/**
 * Preloads all video frames as Image elements.
 * Calls onProgress with (loadedCount, totalCount) after each frame loads.
 * Returns the array of loaded frames.
 */
export async function loadFrames(
  onProgress?: ProgressCallback
): Promise<FrameLoadResult> {
  const totalFrames = await detectFrameCount()
  const frames: HTMLImageElement[] = new Array(totalFrames)
  let loaded = 0
  let retryCount = 0
  const MAX_RETRIES = 3

  const loadSingleFrame = (index: number): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error(`Failed to load frame ${index + 1}`))
      img.src = `/frames/frame_${String(index + 1).padStart(4, '0')}.webp`
    })
  }

  // Load frames in batches of 10 for performance
  const BATCH_SIZE = 10
  let batchStart = 0

  while (batchStart < totalFrames) {
    const batchEnd = Math.min(batchStart + BATCH_SIZE, totalFrames)
    const batch = []

    for (let j = batchStart; j < batchEnd; j++) {
      batch.push(
        loadSingleFrame(j).then((img) => {
          frames[j] = img
          loaded++
          onProgress?.(loaded, totalFrames)
          return img
        })
      )
    }

    try {
      await Promise.all(batch)
      batchStart = batchEnd // advance to next batch
    } catch {
      retryCount++
      if (retryCount > MAX_RETRIES) {
        // Return contiguous frames from index 0 up to the first gap
        const contiguous: HTMLImageElement[] = []
        for (let k = 0; k < totalFrames; k++) {
          if (frames[k]) contiguous.push(frames[k])
          else break
        }
        return { frames: contiguous, totalFrames: contiguous.length }
      }
      // Retry same batch (batchStart unchanged)
    }
  }

  return { frames, totalFrames }
}
```

- [x] **Step 2: Commit**

```bash
git add src-v2/lib/frame-loader.ts
git commit -m "feat: add frame preloader with batched loading and retry logic"
```

---

### Task 6: useScrollVideo Hook

**Files:**
- Create: `src-v2/hooks/useScrollVideo.ts`

This hook maps scroll position within a container to a frame index.

- [x] **Step 1: Create useScrollVideo.ts**

Create `src-v2/hooks/useScrollVideo.ts`:

```typescript
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
```

- [x] **Step 2: Commit**

```bash
git add src-v2/hooks/useScrollVideo.ts
git commit -m "feat: add useScrollVideo hook for scroll-to-frame mapping"
```

---

### Task 7: ScrollVideo Component (Canvas Renderer)

**Files:**
- Create: `src-v2/components/landing/ScrollVideo.tsx`

The core canvas component that renders video frames synced to scroll.

- [x] **Step 1: Create ScrollVideo.tsx**

Create `src-v2/components/landing/ScrollVideo.tsx`:

```tsx
'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import { useScrollVideo } from '@v2/hooks/useScrollVideo'

interface ScrollVideoProps {
  frames: HTMLImageElement[]
  totalFrames: number
  children?: React.ReactNode  // Glass cards are passed as children so they scroll naturally inside the wrapper
}

export default function ScrollVideo({ frames, totalFrames, children }: ScrollVideoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const isMobileRef = useRef(false)

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

  const scrollHeight = typeof window !== 'undefined' && window.innerWidth < 768 ? '250vh' : '350vh'

  return (
    <div
      ref={wrapperRef}
      style={{ height: scrollHeight, position: 'relative' }}
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

      {/* Children (glass cards) are placed inside the wrapper in normal flow.
          They start after the 100vh canvas, so they naturally scroll up
          and overlap the sticky canvas as the user scrolls through the wrapper.
          backdrop-filter on the glass cards picks up the canvas below them. */}
      {children && (
        <div
          className="relative z-10"
          style={{ marginTop: '-100vh', paddingTop: '20vh' }}
        >
          {children}
        </div>
      )}
    </div>
  )
}
```

**Key architecture note:** Glass cards are passed as `children` to `ScrollVideo` so they live inside the same scroll wrapper as the sticky canvas. This means they scroll naturally through the sticky region, overlapping the canvas from below. The `marginTop: -100vh` pulls the children container back up to overlap the canvas area, and `paddingTop: 20vh` offsets them so they don't appear immediately. The `z-index: 10` on the children ensures they render above the canvas, and `backdrop-filter` on the glass cards picks up the canvas pixels below them.

- [x] **Step 2: Commit**

```bash
git add src-v2/components/landing/ScrollVideo.tsx
git commit -m "feat: add ScrollVideo canvas component with scroll-driven frame rendering"
```

---

### Task 8: FrameLoader Component (Loading Screen)

**Files:**
- Create: `src-v2/components/landing/FrameLoader.tsx`

Full-screen loader displayed while frames preload.

- [x] **Step 1: Create FrameLoader.tsx**

Create `src-v2/components/landing/FrameLoader.tsx`:

```tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { loadFrames, type FrameLoadResult } from '@v2/lib/frame-loader'

interface FrameLoaderProps {
  onLoaded: (result: FrameLoadResult) => void
}

export default function FrameLoader({ onLoaded }: FrameLoaderProps) {
  const [progress, setProgress] = useState(0)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState(false)
  const [retries, setRetries] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const startLoading = useCallback(async () => {
    setError(false)
    setIsLoading(true)
    setProgress(0)

    try {
      const result = await loadFrames((loaded, totalFrames) => {
        setProgress(loaded)
        setTotal(totalFrames)
      })

      if (result.frames.length === 0) {
        throw new Error('No frames loaded')
      }

      onLoaded(result)
    } catch {
      setError(true)
      setIsLoading(false)
    }
  }, [onLoaded])

  useEffect(() => {
    startLoading()
  }, [startLoading])

  const handleRetry = () => {
    if (retries >= 2) {
      // After 3 total attempts, give up gracefully
      // loadFrames already returns partial results as fallback
      onLoaded({ frames: [], totalFrames: 0 })
      return
    }
    setRetries((r) => r + 1)
    startLoading()
  }

  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0

  // Note: Parent component (HomePage) unmounts this component after onLoaded fires.
  // The CSS transition on .loader-overlay handles the fade-out.

  return (
    <div className={`loader-overlay ${!isLoading && !error ? 'loader-overlay--hidden' : ''}`}>
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            color: 'var(--accretion)',
            fontSize: '12px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginBottom: '24px',
            fontFamily: 'var(--font-space)',
          }}
        >
          {error ? 'Connection Issue' : 'Loading Experience'}
        </div>

        {error ? (
          <div>
            <p style={{ color: 'var(--wheat-light)', fontSize: '14px', marginBottom: '16px', opacity: 0.6 }}>
              {retries >= 2
                ? 'Unable to load. Continuing without animation.'
                : 'Failed to load assets. Check your connection.'}
            </p>
            <button
              onClick={handleRetry}
              style={{
                background: 'rgba(46, 196, 182, 0.15)',
                color: 'var(--deep-teal)',
                border: '1px solid rgba(46, 196, 182, 0.3)',
                borderRadius: '20px',
                padding: '8px 24px',
                fontSize: '13px',
                cursor: 'pointer',
                fontFamily: 'var(--font-space)',
              }}
            >
              {retries >= 2 ? 'Continue' : 'Retry'}
            </button>
          </div>
        ) : (
          <>
            <div className="loader-bar">
              <div
                className="loader-bar-fill"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div
              style={{
                color: 'var(--wheat-light)',
                fontSize: '11px',
                marginTop: '12px',
                opacity: 0.4,
              }}
            >
              {percentage}%
            </div>
          </>
        )}
      </div>
    </div>
  )
}
```

- [x] **Step 2: Commit**

```bash
git add src-v2/components/landing/FrameLoader.tsx
git commit -m "feat: add FrameLoader component with progress bar and retry logic"
```

---

## Chunk 3: Glass Cards and Landing Page Content

### Task 9: GlassCard Component

**Files:**
- Create: `src-v2/components/landing/GlassCard.tsx`

Reusable liquid glass card with all the CSS enhancements.

- [x] **Step 1: Create GlassCard.tsx**

Create `src-v2/components/landing/GlassCard.tsx`:

```tsx
interface GlassCardProps {
  children: React.ReactNode
  className?: string
}

export default function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Outer glow */}
      <div className="glass-outer-glow" />

      {/* Animated border */}
      <div className="glass-border" />

      {/* Glass surface */}
      <div className="glass-card">
        {/* Specular highlight */}
        <div className="glass-highlight" />

        {/* Inner glow */}
        <div className="glass-glow" />

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  )
}
```

- [x] **Step 2: Commit**

```bash
git add src-v2/components/landing/GlassCard.tsx
git commit -m "feat: add GlassCard component with liquid glass effects"
```

---

### Task 10: HeroOverlay Component

**Files:**
- Create: `src-v2/components/landing/HeroOverlay.tsx`

Name, title, and scroll prompt displayed over the video at the top of the page.

- [x] **Step 1: Create HeroOverlay.tsx**

Create `src-v2/components/landing/HeroOverlay.tsx`:

```tsx
interface HeroOverlayProps {
  name: string
  title: string
  style?: React.CSSProperties
}

export default function HeroOverlay({ name, title, style }: HeroOverlayProps) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-10 flex flex-col items-center justify-center"
      style={{ mixBlendMode: 'screen', ...style }}
    >
      <div
        className="text-center"
        style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
      >
        <div
          className="font-space text-xs tracking-[3px] uppercase mb-2"
          style={{ color: 'var(--accretion)' }}
        >
          {title}
        </div>
        <h1
          className="font-space text-4xl md:text-6xl font-bold mb-4"
          style={{ color: 'var(--floral)' }}
        >
          {name}
        </h1>
        <div
          className="text-xs tracking-wide animate-pulse"
          style={{ color: 'rgba(245, 222, 179, 0.4)' }}
        >
          Scroll to explore
        </div>
      </div>
    </div>
  )
}
```

- [x] **Step 2: Commit**

```bash
git add src-v2/components/landing/HeroOverlay.tsx
git commit -m "feat: add HeroOverlay component"
```

---

### Task 11: AboutCard Component

**Files:**
- Create: `src-v2/components/landing/AboutCard.tsx`

Glass card displaying bio content from the personal_info API.

- [x] **Step 1: Create AboutCard.tsx**

Create `src-v2/components/landing/AboutCard.tsx`:

```tsx
import GlassCard from './GlassCard'
import type { PersonalInfo } from '@/lib/database/types'

interface AboutCardProps {
  personalInfo: PersonalInfo
}

export default function AboutCard({ personalInfo }: AboutCardProps) {
  return (
    <GlassCard className="w-full max-w-xl mx-auto">
      <div className="p-6 md:p-8">
        <div
          className="font-space text-[10px] tracking-[2px] uppercase mb-3"
          style={{ color: 'var(--accretion)' }}
        >
          About
        </div>
        {personalInfo.tagline && (
          <h2
            className="font-space text-lg md:text-xl font-semibold mb-3"
            style={{ color: 'var(--floral)' }}
          >
            {personalInfo.tagline}
          </h2>
        )}
        {personalInfo.executiveSummary && (
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'rgba(245, 222, 179, 0.65)' }}
          >
            {personalInfo.executiveSummary}
          </p>
        )}
      </div>
    </GlassCard>
  )
}
```

- [x] **Step 2: Commit**

```bash
git add src-v2/components/landing/AboutCard.tsx
git commit -m "feat: add AboutCard component"
```

---

### Task 12: HighlightsCard Component

**Files:**
- Create: `src-v2/components/landing/HighlightsCard.tsx`

Glass card with key metrics derived from existing data.

- [x] **Step 1: Create HighlightsCard.tsx**

Create `src-v2/components/landing/HighlightsCard.tsx`:

```tsx
import GlassCard from './GlassCard'

interface HighlightsCardProps {
  yearsExperience: number
  projectCount: number
  specialization: string
}

export default function HighlightsCard({
  yearsExperience,
  projectCount,
  specialization,
}: HighlightsCardProps) {
  const highlights = [
    { value: `${yearsExperience}+`, label: 'Years Experience', color: 'var(--accretion)' },
    { value: `${projectCount}+`, label: 'Products Shipped', color: 'var(--wheat-light)' },
    { value: specialization, label: 'Specialization', color: 'var(--dark-gold)' },
  ]

  return (
    <GlassCard className="w-full max-w-xl mx-auto">
      <div className="p-6 md:p-8">
        <div
          className="font-space text-[10px] tracking-[2px] uppercase mb-4"
          style={{ color: 'var(--accretion)' }}
        >
          Key Highlights
        </div>
        <div className="grid grid-cols-3 gap-3">
          {highlights.map((h) => (
            <div
              key={h.label}
              className="text-center p-3 md:p-4 rounded-xl"
              style={{ background: 'rgba(212, 168, 85, 0.06)', border: '1px solid rgba(212, 168, 85, 0.1)' }}
            >
              <div
                className="font-space text-xl md:text-2xl font-bold"
                style={{ color: h.color }}
              >
                {h.value}
              </div>
              <div
                className="text-[10px] mt-1"
                style={{ color: 'rgba(245, 222, 179, 0.4)' }}
              >
                {h.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  )
}
```

- [x] **Step 2: Commit**

```bash
git add src-v2/components/landing/HighlightsCard.tsx
git commit -m "feat: add HighlightsCard component"
```

---

## Chunk 4: Post-Video Sections, Navbar, Footer, Wiring

### Task 13: ExperienceSection Component

**Files:**
- Create: `src-v2/components/landing/ExperienceSection.tsx`

Vertical timeline displaying work experience.

- [ ] **Step 1: Create ExperienceSection.tsx**

Create `src-v2/components/landing/ExperienceSection.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import type { WorkExperience } from '@/lib/database/types'

function formatDate(date?: Date | string): string {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default function ExperienceSection() {
  const [experiences, setExperiences] = useState<WorkExperience[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/resume/experience')
        if (res.ok) {
          setExperiences(await res.json())
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
            Work Experience
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
          Work Experience
        </div>

        <div
          className="border-l-2 pl-6 flex flex-col gap-4"
          style={{ borderColor: 'rgba(212, 168, 85, 0.15)' }}
        >
          {experiences.map((exp) => {
            const startDate = exp.startDate || exp.start_date
            const endDate = exp.endDate || exp.end_date
            const isCurrent = exp.isCurrent || exp.is_current
            const responsibilities = exp.responsibilities || []

            return (
              <div
                key={exp.id}
                className="rounded-xl p-5"
                style={{
                  background: 'rgba(212, 168, 85, 0.04)',
                  border: '1px solid rgba(212, 168, 85, 0.08)',
                }}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3
                    className="font-space text-sm font-semibold"
                    style={{ color: 'var(--floral)' }}
                  >
                    {exp.title}
                  </h3>
                  <span
                    className="text-xs whitespace-nowrap ml-4"
                    style={{ color: 'rgba(245, 222, 179, 0.3)' }}
                  >
                    {formatDate(startDate)} – {isCurrent ? 'Present' : formatDate(endDate)}
                  </span>
                </div>
                <div
                  className="text-xs mb-3"
                  style={{ color: 'var(--accretion)' }}
                >
                  {exp.company}
                </div>
                {responsibilities.length > 0 && (
                  <ul className="space-y-1">
                    {responsibilities.map((r) => (
                      <li
                        key={r.id}
                        className="text-xs leading-relaxed"
                        style={{ color: 'rgba(245, 222, 179, 0.5)' }}
                      >
                        • {r.responsibility}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src-v2/components/landing/ExperienceSection.tsx
git commit -m "feat: add ExperienceSection timeline component"
```

---

### Task 14: SkillsSection Component

**Files:**
- Create: `src-v2/components/landing/SkillsSection.tsx`

Tech stack display with pill tags.

- [ ] **Step 1: Create SkillsSection.tsx**

Create `src-v2/components/landing/SkillsSection.tsx`:

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src-v2/components/landing/SkillsSection.tsx
git commit -m "feat: add SkillsSection component with tech stack pills"
```

---

### Task 15: Navbar Component

**Files:**
- Create: `src-v2/components/layout/Navbar.tsx`

Always-visible glass navbar with contact CTA.

- [ ] **Step 1: Create Navbar.tsx**

Create `src-v2/components/layout/Navbar.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface NavbarProps {
  contactEmail?: string
}

export default function Navbar({ contactEmail }: NavbarProps) {
  const [isOpaque, setIsOpaque] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Switch to opaque after scrolling past the video section (~350vh on desktop, ~250vh on mobile)
      const videoSectionHeight = window.innerWidth < 768
        ? window.innerHeight * 2.5
        : window.innerHeight * 3.5
      setIsOpaque(window.scrollY > videoSectionHeight * 0.85)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/case-studies', label: 'Projects' },
  ]

  const contactHref = contactEmail ? `mailto:${contactEmail}` : '#'

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 glass-nav ${isOpaque ? 'glass-nav--opaque' : ''}`}
    >
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo / Name */}
        <Link
          href="/"
          className="font-space text-sm font-semibold tracking-wide"
          style={{ color: 'var(--floral)' }}
        >
          Brian Thomas
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs transition-colors hover:opacity-80"
              style={{ color: 'rgba(245, 222, 179, 0.5)' }}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={contactHref}
            className="text-xs px-4 py-1.5 rounded-full transition-colors"
            style={{
              background: 'rgba(46, 196, 182, 0.15)',
              color: 'var(--deep-teal)',
              border: '1px solid rgba(46, 196, 182, 0.25)',
            }}
          >
            Contact
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1 p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span
            className="block w-5 h-0.5 rounded transition-transform"
            style={{
              background: 'var(--accretion)',
              transform: isMobileMenuOpen ? 'rotate(45deg) translateY(6px)' : 'none',
            }}
          />
          <span
            className="block w-5 h-0.5 rounded transition-opacity"
            style={{
              background: 'var(--accretion)',
              opacity: isMobileMenuOpen ? 0 : 1,
            }}
          />
          <span
            className="block w-5 h-0.5 rounded transition-transform"
            style={{
              background: 'var(--accretion)',
              transform: isMobileMenuOpen ? 'rotate(-45deg) translateY(-6px)' : 'none',
            }}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden px-6 pb-4 flex flex-col gap-3"
          style={{ borderTop: '1px solid rgba(212, 168, 85, 0.08)' }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm py-1"
              style={{ color: 'rgba(245, 222, 179, 0.6)' }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={contactHref}
            className="text-sm py-1"
            style={{ color: 'var(--deep-teal)' }}
          >
            Contact
          </a>
        </div>
      )}
    </nav>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src-v2/components/layout/Navbar.tsx
git commit -m "feat: add glass Navbar with mobile hamburger menu"
```

---

### Task 16: Footer Component

**Files:**
- Create: `src-v2/components/layout/Footer.tsx`

- [ ] **Step 1: Create Footer.tsx**

Create `src-v2/components/layout/Footer.tsx`:

```tsx
export default function Footer() {
  return (
    <footer
      className="py-8 px-6 text-center"
      style={{
        borderTop: '1px solid rgba(212, 168, 85, 0.08)',
        color: 'rgba(245, 222, 179, 0.25)',
      }}
    >
      <div className="text-xs">
        © {new Date().getFullYear()} Brian Thomas
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src-v2/components/layout/Footer.tsx
git commit -m "feat: add minimal Footer component"
```

---

### Task 17: HomePage — Orchestrate Landing Page

**Files:**
- Create: `src-v2/pages/HomePage.tsx`

This component assembles all landing page parts: loader → video + hero + glass cards → experience + skills + footer.

- [ ] **Step 1: Create HomePage.tsx**

Create `src-v2/pages/HomePage.tsx`:

```tsx
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
```

**Note:** HeroOverlay now accepts a `style` prop for the opacity fade. Update HeroOverlay (Task 10) to pass `style` to the outer div:

```tsx
interface HeroOverlayProps {
  name: string
  title: string
  style?: React.CSSProperties
}

export default function HeroOverlay({ name, title, style }: HeroOverlayProps) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-10 flex flex-col items-center justify-center"
      style={{ mixBlendMode: 'screen', ...style }}
    >
```

- [ ] **Step 2: Commit**

```bash
git add src-v2/pages/HomePage.tsx
git commit -m "feat: add HomePage orchestrator component"
```

---

### Task 18: Wire Up Page Routes

**Files:**
- Modify: `src/app/page.tsx` (import from src-v2)
- Modify: `src/app/globals.css` (import v2 styles)

- [ ] **Step 1: Update src/app/page.tsx to use new HomePage**

Replace `src/app/page.tsx` contents:

```tsx
import HomePage from '@v2/pages/HomePage'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getPersonalInfo, getProjects } from '@/lib/database/db'
import type { Tenant } from '@/middleware'

export const metadata: Metadata = {
  title: 'Brian Thomas | Technical Product Manager',
  description: 'Technical Product Manager with 10+ years transforming complex technical challenges into scalable business solutions.',
}

export default async function Home() {
  const headersList = await headers()
  const tenant = (headersList.get('x-tenant') || 'internal') as Tenant

  // Direct database calls — no self-fetch anti-pattern
  const [personalInfo, projects] = await Promise.all([
    getPersonalInfo(tenant).catch(() => ({
      name: 'Brian Thomas',
      title: 'Technical Product Manager',
      email: '',
    })),
    getProjects(tenant).catch(() => []),
  ])

  return (
    <HomePage
      personalInfo={personalInfo}
      projectCount={projects.length}
    />
  )
}
```

**Note:** Check the actual function names in `src/lib/database/db.ts` — they may be `getPersonalInfo(tenant)` or similar. Read the file to confirm the exact export names and signatures before implementing.

- [ ] **Step 2: Add v2 CSS imports to globals.css**

At the top of `src/app/globals.css`, add:

```css
@import '../../src-v2/styles/globals.css';
```

Keep existing CSS below it (admin pages still need their styles).

- [ ] **Step 3: Run dev server and verify landing page loads**

```bash
npm run dev
```

Open `http://localhost:3000`. Expected:
- Full-screen loader appears with progress bar
- After frames load, black hole video plays on scroll
- Glass cards appear over the video
- Post-video content shows experience and skills sections
- Navbar is visible and functional

- [ ] **Step 4: Verify admin still works**

Navigate to `http://localhost:3000/admin`. Expected: Admin panel loads normally, no style conflicts.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/app/globals.css
git commit -m "feat: wire up new HomePage and import v2 styles"
```

---

## Chunk 5: Projects Page Redesign

### Task 19: ProjectCard Component

**Files:**
- Create: `src-v2/components/projects/ProjectCard.tsx`

Project card in the deep space theme.

- [ ] **Step 1: Create ProjectCard.tsx**

Create `src-v2/components/projects/ProjectCard.tsx`:

```tsx
import type { Project } from '@/lib/database/types'

interface ProjectCardProps {
  project: Project
  onClick: () => void
}

const STAGE_COLORS: Record<string, string> = {
  production: 'var(--deep-teal)',
  mvp: 'var(--accretion)',
  backend: 'var(--dark-gold)',
  concept: 'var(--wheat-light)',
  research: 'rgba(245, 222, 179, 0.5)',
  legacy: 'rgba(245, 222, 179, 0.3)',
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const stageColor = STAGE_COLORS[project.stage] || 'var(--wheat-light)'

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl p-5 transition-transform hover:scale-[1.02] cursor-pointer"
      style={{
        background: 'rgba(212, 168, 85, 0.04)',
        border: '1px solid rgba(212, 168, 85, 0.1)',
      }}
    >
      {/* Stage badge */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-[10px] font-space uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{
            color: stageColor,
            border: `1px solid ${stageColor}`,
            opacity: 0.7,
          }}
        >
          {project.stage}
        </span>
        {project.progress !== undefined && (
          <span
            className="text-[10px]"
            style={{ color: 'rgba(245, 222, 179, 0.3)' }}
          >
            {project.progress}%
          </span>
        )}
      </div>

      {/* Title + description */}
      <h3
        className="font-space text-sm font-semibold mb-2"
        style={{ color: 'var(--floral)' }}
      >
        {project.name}
      </h3>
      {project.description && (
        <p
          className="text-xs leading-relaxed mb-3 line-clamp-2"
          style={{ color: 'rgba(245, 222, 179, 0.5)' }}
        >
          {project.description}
        </p>
      )}

      {/* Tech tags */}
      {project.technologies && project.technologies.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.technologies.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{
                background: 'rgba(212, 168, 85, 0.06)',
                color: 'rgba(245, 222, 179, 0.4)',
                border: '1px solid rgba(212, 168, 85, 0.08)',
              }}
            >
              {tech}
            </span>
          ))}
          {project.technologies.length > 4 && (
            <span
              className="text-[10px] px-2 py-0.5"
              style={{ color: 'rgba(245, 222, 179, 0.25)' }}
            >
              +{project.technologies.length - 4}
            </span>
          )}
        </div>
      )}
    </button>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src-v2/components/projects/ProjectCard.tsx
git commit -m "feat: add ProjectCard component with deep space theme"
```

---

### Task 20: ProjectModal Component

**Files:**
- Create: `src-v2/components/projects/ProjectModal.tsx`

Modal overlay with full project details.

- [ ] **Step 1: Create ProjectModal.tsx**

Create `src-v2/components/projects/ProjectModal.tsx`:

```tsx
'use client'

import { useEffect } from 'react'
import type { Project } from '@/lib/database/types'

interface ProjectModalProps {
  project: Project
  onClose: () => void
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal content */}
      <div
        className="relative max-w-2xl w-full max-h-[85vh] overflow-y-auto rounded-2xl p-6 md:p-8"
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
          style={{ color: 'rgba(245, 222, 179, 0.4)' }}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header */}
        <div className="mb-6">
          <span
            className="text-[10px] font-space uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{
              color: 'var(--accretion)',
              border: '1px solid rgba(212, 168, 85, 0.2)',
            }}
          >
            {project.stage}
          </span>
          <h2
            className="font-space text-xl font-bold mt-3"
            style={{ color: 'var(--floral)' }}
          >
            {project.name}
          </h2>
          {project.description && (
            <p
              className="text-sm mt-2 leading-relaxed"
              style={{ color: 'rgba(245, 222, 179, 0.6)' }}
            >
              {project.description}
            </p>
          )}
        </div>

        {/* Detailed description */}
        {project.detailedDescription && (
          <div className="mb-6">
            <h3
              className="font-space text-xs uppercase tracking-wider mb-2"
              style={{ color: 'var(--accretion)' }}
            >
              Details
            </h3>
            <p
              className="text-xs leading-relaxed"
              style={{ color: 'rgba(245, 222, 179, 0.5)' }}
            >
              {project.detailedDescription}
            </p>
          </div>
        )}

        {/* Impact metrics */}
        {project.impacts && project.impacts.length > 0 && (
          <div className="mb-6">
            <h3
              className="font-space text-xs uppercase tracking-wider mb-3"
              style={{ color: 'var(--accretion)' }}
            >
              Impact
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {project.impacts.map((impact) => (
                <div
                  key={impact.id ?? impact.metricKey}
                  className="p-3 rounded-lg"
                  style={{ background: 'rgba(212, 168, 85, 0.04)', border: '1px solid rgba(212, 168, 85, 0.08)' }}
                >
                  <div className="text-sm font-semibold" style={{ color: 'var(--accretion)' }}>
                    {impact.metricValue}
                  </div>
                  <div className="text-[10px]" style={{ color: 'rgba(245, 222, 179, 0.4)' }}>
                    {impact.metricKey}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technologies */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="mb-6">
            <h3
              className="font-space text-xs uppercase tracking-wider mb-3"
              style={{ color: 'var(--accretion)' }}
            >
              Technologies
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="text-xs px-3 py-1 rounded-full"
                  style={{
                    background: 'rgba(212, 168, 85, 0.08)',
                    color: 'var(--accretion)',
                    border: '1px solid rgba(212, 168, 85, 0.15)',
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        <div className="flex gap-3 mt-6">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-4 py-2 rounded-full"
              style={{
                background: 'rgba(46, 196, 182, 0.15)',
                color: 'var(--deep-teal)',
                border: '1px solid rgba(46, 196, 182, 0.25)',
              }}
            >
              Live Site →
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-4 py-2 rounded-full"
              style={{
                background: 'rgba(212, 168, 85, 0.08)',
                color: 'var(--accretion)',
                border: '1px solid rgba(212, 168, 85, 0.15)',
              }}
            >
              GitHub →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src-v2/components/projects/ProjectModal.tsx
git commit -m "feat: add ProjectModal component"
```

---

### Task 21: ProjectGrid and ProjectsPage

**Files:**
- Create: `src-v2/components/projects/ProjectGrid.tsx`
- Create: `src-v2/pages/ProjectsPage.tsx`
- Modify: `src/app/case-studies/page.tsx`

- [ ] **Step 1: Create ProjectGrid.tsx**

Create `src-v2/components/projects/ProjectGrid.tsx`:

```tsx
'use client'

import { useState } from 'react'
import type { Project } from '@/lib/database/types'
import ProjectCard from './ProjectCard'
import ProjectModal from './ProjectModal'

interface ProjectGridProps {
  projects: Project[]
}

export default function ProjectGrid({ projects }: ProjectGridProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <ProjectCard
            key={project.id ?? project.name}
            project={project}
            onClick={() => setSelectedProject(project)}
          />
        ))}
      </div>

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </>
  )
}
```

- [ ] **Step 2: Create ProjectsPage.tsx**

Create `src-v2/pages/ProjectsPage.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import type { Project } from '@/lib/database/types'
import Navbar from '@v2/components/layout/Navbar'
import ProjectGrid from '@v2/components/projects/ProjectGrid'
import Footer from '@v2/components/layout/Footer'
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      if (res.ok) {
        setProjects(await res.json())
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  // Real-time updates
  useRealtimeUpdates((message) => {
    if (message.type === 'content-update' && message.data?.contentType === 'Projects') {
      fetchProjects()
    }
  })

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>
      <Navbar />

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div
            className="font-space text-xs tracking-[2px] uppercase mb-2"
            style={{ color: 'var(--accretion)' }}
          >
            Portfolio
          </div>
          <h1
            className="font-space text-2xl md:text-3xl font-bold mb-8"
            style={{ color: 'var(--floral)' }}
          >
            Projects & Case Studies
          </h1>

          {isLoading ? (
            <div style={{ color: 'rgba(245,222,179,0.3)' }} className="text-sm">
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div style={{ color: 'rgba(245,222,179,0.3)' }} className="text-sm">
              No projects yet.
            </div>
          ) : (
            <ProjectGrid projects={projects} />
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
```

- [ ] **Step 3: Update src/app/case-studies/page.tsx**

Replace contents:

```tsx
import ProjectsPage from '@v2/pages/ProjectsPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Projects & Case Studies | Brian Thomas',
  description: 'Technical implementations and architectural wins.',
}

export default function CaseStudies() {
  return <ProjectsPage />
}
```

- [ ] **Step 4: Run dev server and verify projects page**

```bash
npm run dev
```

Navigate to `http://localhost:3000/case-studies`. Expected: Projects load in a grid with deep space theme. Clicking a card opens a modal with full details.

- [ ] **Step 5: Run full build to verify no errors**

```bash
npm run build
```

Expected: Build succeeds. No TypeScript errors. All routes compile.

- [ ] **Step 6: Commit**

```bash
git add src-v2/components/projects/ProjectGrid.tsx src-v2/pages/ProjectsPage.tsx src/app/case-studies/page.tsx
git commit -m "feat: add projects page with card grid and modal in deep space theme"
```

---

### Task 22: Final Cleanup and Verification

- [ ] **Step 1: Remove .gitkeep files from populated directories**

```bash
find src-v2 -name .gitkeep -delete
```

- [ ] **Step 2: Run full verification**

```bash
npm run build
npm run dev
```

Test checklist:
- [ ] Landing page: loader → video scroll → glass cards → experience → skills → footer
- [ ] Navbar: visible, glass effect, contact CTA works
- [ ] Projects page: grid loads, cards clickable, modal opens/closes
- [ ] Admin panel: still works at `/admin`
- [ ] Mobile viewport: responsive layout, hamburger menu
- [ ] Tenant override: `?tenant=external` shows different content

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: clean up gitkeep files and finalize redesign/v2 branch"
```

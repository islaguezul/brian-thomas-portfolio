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

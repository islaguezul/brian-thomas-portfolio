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

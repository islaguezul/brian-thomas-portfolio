'use client';

import { usePusherUpdates } from './usePusherUpdates';
import { usePollingUpdates } from './usePollingUpdates';

// Automatically use Pusher if configured, otherwise fall back to polling
export function useRealtimeUpdates(onUpdate?: (message: any) => void) {
  const pusherConfigured = !!(process.env.NEXT_PUBLIC_PUSHER_KEY && process.env.NEXT_PUBLIC_PUSHER_CLUSTER);
  
  // Use Pusher if configured
  if (pusherConfigured) {
    return usePusherUpdates(onUpdate);
  }
  
  // Otherwise use polling
  return usePollingUpdates(onUpdate);
}
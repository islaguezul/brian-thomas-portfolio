'use client';

import { usePusherUpdates } from './usePusherUpdates';
import { usePollingUpdates } from './usePollingUpdates';

interface UpdateMessage {
  type: string;
  data?: Record<string, unknown>;
  message?: string;
  timestamp?: string;
}

// Automatically use Pusher if configured, otherwise fall back to polling
export function useRealtimeUpdates(onUpdate?: (message: UpdateMessage) => void) {
  const pusherConfigured = !!(process.env.NEXT_PUBLIC_PUSHER_KEY && process.env.NEXT_PUBLIC_PUSHER_CLUSTER);
  
  // Call both hooks unconditionally to satisfy React rules
  const pusherResult = usePusherUpdates(pusherConfigured ? onUpdate : undefined);
  const pollingResult = usePollingUpdates(!pusherConfigured ? onUpdate : undefined);
  
  // Return the appropriate result based on configuration
  return pusherConfigured ? pusherResult : pollingResult;
}
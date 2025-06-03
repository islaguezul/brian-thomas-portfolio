'use client';

import { useEffect, useState, useRef } from 'react';

interface UpdateMessage {
  type: string;
  data?: Record<string, unknown>;
  message?: string;
  timestamp?: string;
}

// Simple polling-based updates as a fallback when Pusher is not configured
export function usePollingUpdates(onUpdate?: (message: UpdateMessage) => void) {
  const [lastUpdate, setLastUpdate] = useState<UpdateMessage | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<string>(() => new Date().toISOString());
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    // Only start polling if we have an onUpdate callback
    if (!onUpdate) {
      return;
    }

    const checkForUpdates = async () => {
      try {
        const response = await fetch(`/api/updates?since=${lastCheckTime}`);
        if (response.ok) {
          const data = await response.json();
          if (data.hasUpdates) {
            const message: UpdateMessage = {
              type: 'content-update',
              data: data.updates,
              message: 'Content has been updated',
              timestamp: new Date().toISOString(),
            };
            setLastUpdate(message);
            setLastCheckTime(new Date().toISOString());
            
            if (onUpdate) {
              onUpdate(message);
            }
          }
        }
      } catch {
        // Silently ignore errors during polling
        // This prevents console spam when database is not available
      }
    };

    // Start checking after a delay to avoid immediate fetch on mount
    const timeoutId = setTimeout(() => {
      // Initial check
      checkForUpdates();
      
      // Then check every 30 seconds
      intervalRef.current = setInterval(checkForUpdates, 30000);
    }, 5000); // Wait 5 seconds before starting polling

    return () => {
      clearTimeout(timeoutId);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [lastCheckTime, onUpdate]);

  return { lastUpdate, isConnected: true };
}
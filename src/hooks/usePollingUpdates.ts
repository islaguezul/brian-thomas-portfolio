'use client';

import { useEffect, useState, useRef } from 'react';

interface UpdateMessage {
  type: string;
  data?: any;
  message?: string;
  timestamp?: string;
}

// Simple polling-based updates as a fallback when Pusher is not configured
export function usePollingUpdates(onUpdate?: (message: UpdateMessage) => void) {
  const [lastUpdate, setLastUpdate] = useState<UpdateMessage | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<string>(() => new Date().toISOString());
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
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
      } catch (error) {
        console.error('Failed to check for updates:', error);
      }
    };

    // Check every 30 seconds
    intervalRef.current = setInterval(checkForUpdates, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [lastCheckTime, onUpdate]);

  return { lastUpdate, isConnected: true };
}
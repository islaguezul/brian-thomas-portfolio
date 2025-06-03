'use client';

import { useEffect, useState, useCallback } from 'react';
import PusherClient from 'pusher-js';
import { ADMIN_UPDATE_CHANNEL, UPDATE_EVENTS } from '@/lib/pusher';

interface UpdateMessage {
  type: string;
  data?: any;
  message?: string;
  timestamp?: string;
}

export function usePusherUpdates(onUpdate?: (message: UpdateMessage) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<UpdateMessage | null>(null);

  useEffect(() => {
    // Check if we have the required environment variables
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
      console.warn('Pusher credentials not configured. Real-time updates disabled.');
      return;
    }

    // Create Pusher client instance
    const pusherClient = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      }
    );

    // Subscribe to the admin updates channel
    const channel = pusherClient.subscribe(ADMIN_UPDATE_CHANNEL);

    channel.bind('pusher:subscription_succeeded', () => {
      console.log('Connected to Pusher updates');
      setIsConnected(true);
    });

    channel.bind('pusher:subscription_error', (error: any) => {
      console.error('Pusher subscription error:', error);
      setIsConnected(false);
    });

    // Listen for content updates
    channel.bind(UPDATE_EVENTS.CONTENT_UPDATE, (data: any) => {
      const message: UpdateMessage = {
        type: 'content-update',
        data,
        timestamp: new Date().toISOString(),
      };
      
      setLastUpdate(message);
      
      if (onUpdate) {
        onUpdate(message);
      }
    });

    // Cleanup on unmount
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusherClient.disconnect();
    };
  }, [onUpdate]);

  return { isConnected, lastUpdate };
}
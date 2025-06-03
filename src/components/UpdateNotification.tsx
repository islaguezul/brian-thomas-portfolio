'use client';

import { useState, useEffect } from 'react';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

export function UpdateNotification() {
  const [showNotification, setShowNotification] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  
  useRealtimeUpdates((message) => {
    if (message.type === 'content-update') {
      const msg = message.data?.message;
      setUpdateMessage(typeof msg === 'string' ? msg : 'Page content has been updated');
      setShowNotification(true);
    }
  });

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowNotification(false);
  };

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 30000);
      
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  if (!showNotification) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white px-4 py-3 shadow-lg animate-slide-down">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm md:text-base">{updateMessage}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="px-4 py-1 bg-white text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-blue-700 rounded-md transition-colors"
            aria-label="Dismiss"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
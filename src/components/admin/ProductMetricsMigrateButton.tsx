'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { adminFetch } from '@/lib/admin-fetch';

export default function ProductMetricsMigrateButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleMigrate = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await adminFetch('/api/admin/database/migrate-product-metrics', {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Migration failed');
      }

      setMessage({ type: 'success', text: 'Product metrics tables created successfully!' });
    } catch (error) {
      console.error('Migration error:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to run migration' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleMigrate}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Running Migration...
          </>
        ) : (
          'Create Product Metrics Tables'
        )}
      </button>

      {message && (
        <div className={`mt-4 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
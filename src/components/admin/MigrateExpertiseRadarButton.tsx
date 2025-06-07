'use client';

import { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Radar } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MigrateExpertiseRadarButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleMigrate = async () => {
    setLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const response = await fetch('/api/admin/database/migrate-expertise-radar', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message || 'Expertise radar populated successfully!');
        setTimeout(() => {
          router.refresh();
        }, 2000);
      } else {
        setStatus('error');
        setMessage(data.error || data.message || 'Failed to migrate expertise radar');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleMigrate}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        {loading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Migrating...
          </>
        ) : (
          <>
            <Radar className="w-4 h-4" />
            Populate Expertise Radar
          </>
        )}
      </button>

      {status !== 'idle' && (
        <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
          status === 'success' 
            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {status === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {message}
        </div>
      )}
    </div>
  );
}
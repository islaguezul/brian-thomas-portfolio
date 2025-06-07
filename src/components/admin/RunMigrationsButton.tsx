'use client';

import { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Database } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RunMigrationsButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState<{
    results?: Array<{
      filename: string;
      success: boolean;
      error?: string;
    }>;
    failedMigrations?: Array<{
      filename: string;
      success: boolean;
      error?: string;
    }>;
  } | null>(null);
  const router = useRouter();

  const handleRunMigrations = async () => {
    setLoading(true);
    setStatus('idle');
    setMessage('');
    setDetails(null);

    try {
      const response = await fetch('/api/admin/database/run-migrations', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message || 'All migrations completed successfully!');
        setTimeout(() => {
          router.refresh();
        }, 2000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Some migrations failed');
        setDetails(data);
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
        onClick={handleRunMigrations}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        {loading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Running Migrations...
          </>
        ) : (
          <>
            <Database className="w-4 h-4" />
            Run Database Migrations
          </>
        )}
      </button>

      {status !== 'idle' && (
        <div className={`p-3 rounded-lg text-sm ${
          status === 'success' 
            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {status === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {message}
          </div>
          
          {details && details.results && (
            <div className="mt-2 space-y-1 text-xs">
              {details.results.map((result, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="w-3 h-3 text-green-400" />
                  ) : (
                    <AlertCircle className="w-3 h-3 text-red-400" />
                  )}
                  <span className={result.success ? 'text-green-300' : 'text-red-300'}>
                    {result.filename}
                  </span>
                  {result.error && (
                    <span className="text-red-400">- {result.error}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
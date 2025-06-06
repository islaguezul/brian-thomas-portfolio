'use client';

import { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { adminFetch } from '@/lib/admin-fetch';

interface SeedButtonProps {
  disabled?: boolean;
}

export default function SeedButton({ disabled }: SeedButtonProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSeed = async () => {
    setLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const response = await adminFetch('/api/admin/database/seed', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage('Database seeded successfully!');
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to seed database');
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
        onClick={handleSeed}
        disabled={loading || disabled}
        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        {loading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Seeding...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Seed Database
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

      {disabled && (
        <p className="text-yellow-400 text-xs">
          Initialize the database first before seeding.
        </p>
      )}
    </div>
  );
}
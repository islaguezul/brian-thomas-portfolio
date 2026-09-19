'use client';

import { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { adminFetch } from '@/lib/admin-fetch';
import type { TenantContentUpdateResult } from '@/lib/database/content-updates/2026-09-director-ai-automation';

interface ContentUpdateButtonProps {
  endpoint: string;
  label: string;
  confirmText: string;
  disabled?: boolean;
}

function describeResult(result: TenantContentUpdateResult): string {
  const parts = [
    result.personalInfoUpdated ? 'personal info updated' : 'no personal info row',
    result.previousRoleClosed ? 'Blue Origin closed out' : 'Blue Origin already closed',
    result.newRoleInserted
      ? 'Frontier role added'
      : result.newRoleExperienceId !== null
        ? 'Frontier role already present'
        : 'Frontier role not added',
  ];
  return `${result.tenant}: ${parts.join(' · ')}`;
}

export default function ContentUpdateButton({ endpoint, label, confirmText, disabled }: ContentUpdateButtonProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState<string[]>([]);
  const router = useRouter();

  const apply = async () => {
    if (!window.confirm(confirmText)) return;

    setLoading(true);
    setStatus('idle');
    setMessage('');
    setDetails([]);

    try {
      const response = await adminFetch(endpoint, { method: 'POST' });
      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage('Content update applied. The public site now reads the new values.');
        setDetails((data.results as TenantContentUpdateResult[]).map(describeResult));
        router.refresh();
      } else {
        setStatus('error');
        setMessage(data.details || data.error || 'Failed to apply content update');
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
        onClick={apply}
        disabled={loading || disabled}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        {loading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Applying...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            {label}
          </>
        )}
      </button>

      {status !== 'idle' && (
        <div
          className={`p-3 rounded-lg text-sm ${
            status === 'success'
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {status === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {message}
          </div>
          {details.length > 0 && (
            <ul className="mt-2 space-y-1 text-gray-300">
              {details.map((line) => (
                <li key={line}>• {line}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

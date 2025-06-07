'use client';

import { useState } from 'react';
import { Code } from 'lucide-react';

export default function MigrateTechStackButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleMigrate = async () => {
    setLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const response = await fetch('/api/admin/database/migrate-tech-stack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage(data.message || 'Tech stack migration completed successfully');
        // Refresh the page after a short delay to show updated data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setStatus('error');
        setMessage(data.error || data.message || 'Migration failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error occurred');
      console.error('Migration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleMigrate}
        disabled={loading}
        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
      >
        <Code className="w-4 h-4" />
        {loading ? 'Migrating...' : 'Migrate Tech Stack'}
      </button>
      
      {message && (
        <div className={`text-xs p-2 rounded ${
          status === 'success' 
            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
            : status === 'error'
            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}
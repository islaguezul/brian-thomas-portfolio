'use client';

import { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Upload, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { adminFetch } from '@/lib/admin-fetch';

interface MigrateButtonProps {
  disabled?: boolean;
}

interface ExistingData {
  personal: number;
  projects: number;
  experience: number;
  education: number;
  skills: number;
  techStack: number;
  hasData: boolean;
}

export default function MigrateButton({ disabled }: MigrateButtonProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'checking' | 'conflict' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [existingData, setExistingData] = useState<ExistingData | null>(null);
  const router = useRouter();

  const checkForConflicts = async () => {
    setLoading(true);
    setStatus('checking');
    setMessage('Checking for existing data...');

    try {
      const response = await adminFetch('/api/admin/database/migrate-hardcoded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'check' })
      });

      const data = await response.json();

      if (data.existingData?.hasData) {
        setStatus('conflict');
        setExistingData(data.existingData);
        setMessage('');
      } else {
        // No conflicts, proceed with migration
        await performMigration('append');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const performMigration = async (mode: 'append' | 'replace') => {
    setLoading(true);
    setStatus('idle');
    setMessage(mode === 'replace' ? 'Clearing existing data and migrating...' : 'Migrating data...');

    try {
      const response = await adminFetch('/api/admin/database/migrate-hardcoded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(mode === 'replace' 
          ? 'Existing data cleared and new data migrated successfully!' 
          : 'All hardcoded data has been migrated successfully!');
        setTimeout(() => {
          router.refresh();
        }, 2000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to migrate data');
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
      {status !== 'conflict' ? (
        <button
          onClick={checkForConflicts}
          disabled={loading || disabled}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              {status === 'checking' ? 'Checking...' : 'Migrating...'}
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Migrate Hardcoded Data
            </>
          )}
        </button>
      ) : null}

      {status === 'conflict' && existingData && (
        <div className="space-y-4">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-yellow-400 font-medium mb-2">Existing Data Found</h4>
                <div className="text-sm text-gray-300 space-y-1">
                  {existingData.personal > 0 && <p>• Personal Info: {existingData.personal} record(s)</p>}
                  {existingData.projects > 0 && <p>• Projects: {existingData.projects} record(s)</p>}
                  {existingData.experience > 0 && <p>• Work Experience: {existingData.experience} record(s)</p>}
                  {existingData.education > 0 && <p>• Education: {existingData.education} record(s)</p>}
                  {existingData.skills > 0 && <p>• Skill Categories: {existingData.skills} record(s)</p>}
                  {existingData.techStack > 0 && <p>• Tech Stack: {existingData.techStack} record(s)</p>}
                </div>
                <p className="text-sm text-gray-400 mt-3">
                  Choose how to proceed:
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => performMigration('replace')}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Replace All
            </button>
            <button
              onClick={() => performMigration('append')}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              Add Alongside
            </button>
          </div>
          
          <button
            onClick={() => {
              setStatus('idle');
              setExistingData(null);
            }}
            className="w-full text-sm text-gray-400 hover:text-gray-300"
          >
            Cancel
          </button>
        </div>
      )}

      {(status === 'success' || status === 'error' || (status === 'idle' && message)) && (
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
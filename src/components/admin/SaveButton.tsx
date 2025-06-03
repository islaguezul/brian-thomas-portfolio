'use client';

import { Save, CheckCircle, AlertCircle } from 'lucide-react';

interface SaveButtonProps {
  onClick: () => void;
  loading?: boolean;
  status?: 'idle' | 'success' | 'error';
  successMessage?: string;
  errorMessage?: string;
  className?: string;
}

export default function SaveButton({ 
  onClick, 
  loading = false, 
  status = 'idle',
  successMessage = 'Changes saved successfully!',
  errorMessage = 'Failed to save changes',
  className = ''
}: SaveButtonProps) {
  return (
    <div className={`flex items-center justify-end gap-4 ${className}`}>
      {status !== 'idle' && (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
          status === 'success' 
            ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {status === 'success' ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>{successMessage}</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4" />
              <span>{errorMessage}</span>
            </>
          )}
        </div>
      )}
      <button
        onClick={onClick}
        disabled={loading}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
      >
        <Save className="w-4 h-4" />
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}
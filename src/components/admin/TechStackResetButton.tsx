'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

export default function TechStackResetButton() {
  const [isResetting, setIsResetting] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleReset = async () => {
    setIsResetting(true);
    setResult('');
    
    try {
      // First, try to run the migration to support decimal values
      setResult('Running database migration...');
      const migrationResponse = await fetch('/api/admin/database/migrate-002', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      
      // Continue with the update regardless of migration result (it might already be applied)
      setResult('Updating tech stack levels to 0.5 years...');
      const response = await fetch('/api/admin/database/update-tech-levels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(`Success! ${data.message}`);
        // Refresh the page after 2 seconds to show updated values
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setResult(`Error: ${data.error}`);
      }
    } catch (error) {
      setResult('Error: Failed to connect to server');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleReset}
        disabled={isResetting}
        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors w-full"
      >
        <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
        {isResetting ? 'Resetting...' : 'Reset Tech Stack Years'}
      </button>
      
      {result && (
        <div className={`p-3 rounded-lg text-sm ${
          result.startsWith('Success') 
            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {result}
        </div>
      )}
    </div>
  );
}
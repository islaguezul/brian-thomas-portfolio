'use client';

import React, { useState } from 'react';
import { Trash2, RefreshCw } from 'lucide-react';
import { adminFetch } from '@/lib/admin-fetch';

export default function CleanupExpertiseRadarButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleCleanup = async () => {
    if (!confirm(
      'This will DELETE ALL current expertise radar items and replace them with the 6 items from the reference screenshot. Are you sure?'
    )) {
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await adminFetch('/api/admin/database/cleanup-expertise-radar', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data.message);
        // Refresh the page after 2 seconds to show the updated data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        const errorData = await response.json();
        setResult(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Cleanup failed:', error);
      setResult('Cleanup failed. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <RefreshCw className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Clean Up Expertise Radar
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Replace all current expertise radar items with the 6 items from the reference screenshot:
                Technical Architecture Strategy, API & Integration Design, Agile & DevOps Transformation, 
                Data Strategy & Analytics, Technical Risk Management, and Stakeholder Technical Translation.
              </p>
            </div>
            <div className="mt-4">
              <button
                onClick={handleCleanup}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Cleaning up...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Clean Up & Replace All Items
                  </>
                )}
              </button>
            </div>
            {result && (
              <div className="mt-3 text-sm text-gray-600 bg-white p-2 rounded border">
                {result}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
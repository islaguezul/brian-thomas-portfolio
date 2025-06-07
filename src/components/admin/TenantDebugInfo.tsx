'use client';

import { useState, useEffect } from 'react';
import { adminFetch } from '@/lib/admin-fetch';

interface TenantDebugData {
  tenants: {
    admin: string;
    public: string;
    server: string;
  };
  data: {
    admin: { count: number; items: { id: number; name: string }[] };
    public: { count: number; items: { id: number; name: string }[] };
    server: { count: number; items: { id: number; name: string }[] };
  };
  headers: {
    'x-admin-tenant': string | null;
    'x-tenant': string | null;
    'user-agent': string;
  };
}

export default function TenantDebugInfo() {
  const [debugData, setDebugData] = useState<TenantDebugData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDebugData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminFetch('/api/admin/debug/tech-stack-tenants');
      if (response.ok) {
        const data = await response.json();
        setDebugData(data);
      } else {
        setError('Failed to fetch debug data');
      }
    } catch (err) {
      setError('Error fetching debug data');
      console.error('Debug fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebugData();
  }, []);

  if (!debugData && !loading && !error) return null;

  return (
    <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-yellow-400 font-medium">🔍 Tenant Debug Info</h3>
        <button
          onClick={fetchDebugData}
          disabled={loading}
          className="text-xs text-yellow-400 hover:text-yellow-300 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {error && (
        <div className="text-red-400 text-sm mb-2">Error: {error}</div>
      )}
      
      {debugData && (
        <div className="space-y-3 text-sm">
          <div>
            <h4 className="text-yellow-300 font-medium mb-1">Tenant Values:</h4>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-gray-400">Admin:</span> 
                <span className="text-white ml-1">{debugData.tenants.admin}</span>
              </div>
              <div>
                <span className="text-gray-400">Public:</span> 
                <span className="text-white ml-1">{debugData.tenants.public}</span>
              </div>
              <div>
                <span className="text-gray-400">Server:</span> 
                <span className="text-white ml-1">{debugData.tenants.server}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-yellow-300 font-medium mb-1">Tech Stack Counts:</h4>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-gray-400">Admin:</span> 
                <span className="text-white ml-1">{debugData.data.admin.count} items</span>
              </div>
              <div>
                <span className="text-gray-400">Public:</span> 
                <span className="text-white ml-1">{debugData.data.public.count} items</span>
              </div>
              <div>
                <span className="text-gray-400">Server:</span> 
                <span className="text-white ml-1">{debugData.data.server.count} items</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-yellow-300 font-medium mb-1">Request Headers:</h4>
            <div className="text-xs space-y-1">
              <div>
                <span className="text-gray-400">x-admin-tenant:</span> 
                <span className="text-white ml-1">{debugData.headers['x-admin-tenant'] || 'null'}</span>
              </div>
              <div>
                <span className="text-gray-400">x-tenant:</span> 
                <span className="text-white ml-1">{debugData.headers['x-tenant'] || 'null'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
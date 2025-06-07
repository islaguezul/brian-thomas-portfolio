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

interface DatabaseDebugData {
  byTenant: { tenant: string; count: string; names: string[] }[];
  tableStructure: { column_name: string; data_type: string; is_nullable: string }[];
  totalCount: string;
  recentRecords: { id: number; name: string; tenant: string; created_at: string; updated_at: string }[];
  noTenantCount: string;
  timestamp: string;
}

export default function TenantDebugInfo() {
  const [debugData, setDebugData] = useState<TenantDebugData | null>(null);
  const [dbData, setDbData] = useState<DatabaseDebugData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDebugData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tenantsResponse, dbResponse] = await Promise.all([
        adminFetch('/api/admin/debug/tech-stack-tenants'),
        adminFetch('/api/admin/debug/database-contents')
      ]);
      
      if (tenantsResponse.ok) {
        const data = await tenantsResponse.json();
        setDebugData(data);
      } else {
        setError('Failed to fetch tenant debug data');
      }
      
      if (dbResponse.ok) {
        const data = await dbResponse.json();
        setDbData(data);
      } else {
        setError('Failed to fetch database debug data');
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
        <div className="space-y-4 text-sm">
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
            <h4 className="text-yellow-300 font-medium mb-1">Tech Stack Counts by Query Method:</h4>
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
        </div>
      )}
      
      {dbData && (
        <div className="space-y-4 text-sm border-t border-yellow-600/30 pt-4 mt-4">
          <div>
            <h4 className="text-yellow-300 font-medium mb-2">Database Analysis:</h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-gray-400">Total records in tech_stack:</span> 
                <span className="text-white ml-1">{dbData.totalCount}</span>
              </div>
              <div>
                <span className="text-gray-400">Records without tenant:</span> 
                <span className="text-white ml-1">{dbData.noTenantCount}</span>
              </div>
            </div>
          </div>
          
          {dbData.byTenant.length > 0 && (
            <div>
              <h4 className="text-yellow-300 font-medium mb-1">Records by Tenant:</h4>
              <div className="space-y-1 text-xs">
                {dbData.byTenant.map((tenant, i) => (
                  <div key={i}>
                    <span className="text-gray-400">{tenant.tenant}:</span> 
                    <span className="text-white ml-1">{tenant.count} items</span>
                    {tenant.names && tenant.names.length > 0 && (
                      <div className="ml-4 text-gray-500">
                        {tenant.names.slice(0, 3).join(', ')}
                        {tenant.names.length > 3 && ` +${tenant.names.length - 3} more`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {dbData.recentRecords.length > 0 && (
            <div>
              <h4 className="text-yellow-300 font-medium mb-1">Recent Records:</h4>
              <div className="space-y-1 text-xs">
                {dbData.recentRecords.slice(0, 3).map((record, i) => (
                  <div key={i} className="text-gray-400">
                    <span className="text-white">{record.name}</span> 
                    <span className="ml-2">({record.tenant})</span>
                    <span className="ml-2">{new Date(record.updated_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
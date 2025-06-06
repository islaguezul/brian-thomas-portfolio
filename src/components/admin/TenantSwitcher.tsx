'use client';

import { useState, useEffect } from 'react';
import type { Tenant } from '@/middleware';
import { TENANT_NAMES, isValidTenant } from '@/lib/tenant-utils';

export default function TenantSwitcher() {
  const [selectedTenant, setSelectedTenant] = useState<Tenant>('internal');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load saved tenant from cookie first, then localStorage
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('adminSelectedTenant='))
      ?.split('=')[1];
    
    if (cookieValue && isValidTenant(cookieValue)) {
      setSelectedTenant(cookieValue);
      localStorage.setItem('adminSelectedTenant', cookieValue);
    } else {
      // Fall back to localStorage
      const savedTenant = localStorage.getItem('adminSelectedTenant');
      if (savedTenant && isValidTenant(savedTenant)) {
        setSelectedTenant(savedTenant);
        document.cookie = `adminSelectedTenant=${savedTenant}; path=/; max-age=31536000`;
      }
    }
  }, []);

  const handleTenantChange = async (newTenant: Tenant) => {
    if (newTenant === selectedTenant) return;
    
    setIsLoading(true);
    setSelectedTenant(newTenant);
    
    // Save to localStorage and cookie
    localStorage.setItem('adminSelectedTenant', newTenant);
    document.cookie = `adminSelectedTenant=${newTenant}; path=/; max-age=31536000`; // 1 year
    
    // Force a hard refresh to reload all data
    // This ensures all API calls use the new tenant
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-gray-100 border-b">
      <span className="text-sm font-medium text-gray-700">Editing Site:</span>
      <div className="flex gap-2">
        <button
          onClick={() => handleTenantChange('internal')}
          disabled={isLoading}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            selectedTenant === 'internal'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {TENANT_NAMES.internal}
        </button>
        <button
          onClick={() => handleTenantChange('external')}
          disabled={isLoading}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            selectedTenant === 'external'
              ? 'bg-green-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {TENANT_NAMES.external}
        </button>
      </div>
      {isLoading && (
        <span className="text-sm text-gray-500 ml-4">Switching...</span>
      )}
    </div>
  );
}
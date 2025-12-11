'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Tenant } from '@/middleware';
import type { CrossTenantEntityType } from '@/lib/cross-tenant';
import { getOppositeTenant } from '@/lib/cross-tenant';
import { isValidTenant } from '@/lib/tenant-utils';

interface UseOtherTenantDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  otherTenant: Tenant;
}

export function useOtherTenantData<T>(
  entityType: CrossTenantEntityType
): UseOtherTenantDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTenant, setCurrentTenant] = useState<Tenant>('internal');

  // Get the current tenant from localStorage/cookie
  useEffect(() => {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('adminSelectedTenant='))
      ?.split('=')[1];

    if (cookieValue && isValidTenant(cookieValue)) {
      setCurrentTenant(cookieValue);
    } else {
      const savedTenant = localStorage.getItem('adminSelectedTenant');
      if (savedTenant && isValidTenant(savedTenant)) {
        setCurrentTenant(savedTenant);
      }
    }
  }, []);

  const otherTenant = getOppositeTenant(currentTenant);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/cross-tenant/${entityType}`, {
        headers: {
          'x-admin-tenant': currentTenant,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${entityType} from other tenant`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [entityType, currentTenant]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    otherTenant,
  };
}

// Hook for fetching a single entity from the other tenant by ID
export function useOtherTenantEntity<T>(
  entityType: CrossTenantEntityType,
  entityId: number | null
): UseOtherTenantDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTenant, setCurrentTenant] = useState<Tenant>('internal');

  useEffect(() => {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('adminSelectedTenant='))
      ?.split('=')[1];

    if (cookieValue && isValidTenant(cookieValue)) {
      setCurrentTenant(cookieValue);
    } else {
      const savedTenant = localStorage.getItem('adminSelectedTenant');
      if (savedTenant && isValidTenant(savedTenant)) {
        setCurrentTenant(savedTenant);
      }
    }
  }, []);

  const otherTenant = getOppositeTenant(currentTenant);

  const fetchData = useCallback(async () => {
    if (entityId === null) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/cross-tenant/${entityType}?id=${entityId}`,
        {
          headers: {
            'x-admin-tenant': currentTenant,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch ${entityType} from other tenant`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId, currentTenant]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    otherTenant,
  };
}

// Helper function to get current tenant from client
export function getCurrentTenantFromClient(): Tenant {
  if (typeof window === 'undefined') return 'internal';

  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('adminSelectedTenant='))
    ?.split('=')[1];

  if (cookieValue && isValidTenant(cookieValue)) {
    return cookieValue;
  }

  const savedTenant = localStorage.getItem('adminSelectedTenant');
  if (savedTenant && isValidTenant(savedTenant)) {
    return savedTenant;
  }

  return 'internal';
}

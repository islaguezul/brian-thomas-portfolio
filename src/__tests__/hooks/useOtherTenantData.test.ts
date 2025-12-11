/**
 * Unit tests for useOtherTenantData hook
 * Tests the custom React hook for fetching data from the other tenant
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { useOtherTenantData, useOtherTenantEntity, getCurrentTenantFromClient } from '@/hooks/useOtherTenantData';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: '',
});

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('useOtherTenantData hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
    document.cookie = '';
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('getCurrentTenantFromClient', () => {
    it('should return "internal" by default when no cookie or localStorage', () => {
      const tenant = getCurrentTenantFromClient();
      expect(tenant).toBe('internal');
    });

    it('should return tenant from cookie if set', () => {
      document.cookie = 'adminSelectedTenant=external';
      const tenant = getCurrentTenantFromClient();
      expect(tenant).toBe('external');
    });

    it('should return tenant from localStorage if cookie not set', () => {
      document.cookie = '';
      mockLocalStorage.getItem.mockReturnValue('external');
      const tenant = getCurrentTenantFromClient();
      expect(tenant).toBe('external');
    });

    it('should prioritize cookie over localStorage', () => {
      document.cookie = 'adminSelectedTenant=internal';
      mockLocalStorage.getItem.mockReturnValue('external');
      const tenant = getCurrentTenantFromClient();
      expect(tenant).toBe('internal');
    });

    it('should return "internal" for invalid cookie value', () => {
      document.cookie = 'adminSelectedTenant=invalid';
      const tenant = getCurrentTenantFromClient();
      expect(tenant).toBe('internal');
    });

    it('should return "internal" for invalid localStorage value', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid');
      const tenant = getCurrentTenantFromClient();
      expect(tenant).toBe('internal');
    });
  });

  describe('useOtherTenantData', () => {
    it('should fetch data from the other tenant API', async () => {
      const mockData = [{ id: 1, name: 'Test Project' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockData, sourceTenant: 'external' }),
      });

      const { result } = renderHook(() => useOtherTenantData<typeof mockData>('projects'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual({ data: mockData, sourceTenant: 'external' });
      expect(result.current.error).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/admin/cross-tenant/projects',
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-admin-tenant': 'internal',
          }),
        })
      );
    });

    it('should set error state when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useOtherTenantData('projects'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe('Failed to fetch projects from other tenant');
    });

    it('should set error state when fetch throws', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useOtherTenantData('projects'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe('Network error');
    });

    it('should return the opposite tenant', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      const { result } = renderHook(() => useOtherTenantData('projects'));

      // Default tenant is 'internal', so other tenant should be 'external'
      expect(result.current.otherTenant).toBe('external');
    });

    it('should provide refetch function', async () => {
      const mockData1 = [{ id: 1, name: 'Test 1' }];
      const mockData2 = [{ id: 2, name: 'Test 2' }];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockData1 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockData2 }),
        });

      const { result } = renderHook(() => useOtherTenantData('projects'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual({ data: mockData1 });

      await act(async () => {
        await result.current.refetch();
      });

      expect(result.current.data).toEqual({ data: mockData2 });
    });

    it('should use tenant from cookie when available', async () => {
      document.cookie = 'adminSelectedTenant=external';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      const { result } = renderHook(() => useOtherTenantData('projects'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.otherTenant).toBe('internal');
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/admin/cross-tenant/projects',
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-admin-tenant': 'external',
          }),
        })
      );
    });
  });

  describe('useOtherTenantEntity', () => {
    it('should not fetch when entityId is null', async () => {
      const { result } = renderHook(() => useOtherTenantEntity('projects', null));

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should fetch specific entity when entityId is provided', async () => {
      const mockEntity = { id: 1, name: 'Test Project' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEntity,
      });

      const { result } = renderHook(() => useOtherTenantEntity('projects', 1));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockEntity);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/admin/cross-tenant/projects?id=1',
        expect.any(Object)
      );
    });

    it('should refetch when entityId changes', async () => {
      const mockEntity1 = { id: 1, name: 'Project 1' };
      const mockEntity2 = { id: 2, name: 'Project 2' };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockEntity1,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockEntity2,
        });

      const { result, rerender } = renderHook(
        ({ entityId }) => useOtherTenantEntity('projects', entityId),
        { initialProps: { entityId: 1 } }
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(mockEntity1);
      });

      rerender({ entityId: 2 });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockEntity2);
      });
    });

    it('should handle errors when fetching entity', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const { result } = renderHook(() => useOtherTenantEntity('projects', 999));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe('Failed to fetch projects from other tenant');
    });
  });
});

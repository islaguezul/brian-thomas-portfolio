'use client';

/**
 * Custom fetch wrapper for admin routes that includes the selected tenant
 */
export async function adminFetch(url: string, options?: RequestInit) {
  // Get the selected tenant from localStorage
  const selectedTenant = localStorage.getItem('adminSelectedTenant') || 'internal';
  
  // Merge headers with the admin tenant header
  const headers = new Headers(options?.headers);
  headers.set('x-admin-tenant', selectedTenant);
  
  return fetch(url, {
    ...options,
    headers,
  });
}
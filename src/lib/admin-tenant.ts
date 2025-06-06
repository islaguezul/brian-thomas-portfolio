import type { Tenant } from '@/middleware';
import { getTenantFromHeaders, isValidTenant } from './tenant';

/**
 * Get tenant for admin operations.
 * Admin routes should respect the tenant selected in the admin UI,
 * which is passed via x-admin-tenant header.
 * Falls back to the regular tenant detection if not specified.
 */
export function getAdminTenant(headers: Headers): Tenant {
  // First check for admin-selected tenant
  const adminTenant = headers.get('x-admin-tenant');
  if (adminTenant && isValidTenant(adminTenant)) {
    return adminTenant;
  }
  
  // Fall back to regular tenant detection
  return getTenantFromHeaders(headers);
}
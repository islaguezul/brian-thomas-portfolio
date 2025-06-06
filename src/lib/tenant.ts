import { headers } from 'next/headers';
import type { Tenant } from '@/middleware';

// Re-export client-safe utilities
export { isValidTenant, TENANT_NAMES, getOppositeTenant } from './tenant-utils';

// Server-side function to get tenant from headers
export async function getTenant(): Promise<Tenant> {
  const headersList = await headers();
  const tenant = headersList.get('x-tenant') as Tenant;
  return tenant || 'internal';
}

// Utility function to get tenant from headers in API routes
export function getTenantFromHeaders(headers: Headers): Tenant {
  const tenant = headers.get('x-tenant') as Tenant;
  return tenant || 'internal';
}
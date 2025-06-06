import { cookies } from 'next/headers';
import type { Tenant } from '@/middleware';
import { isValidTenant } from './tenant-utils';
import { getTenant } from './tenant';

/**
 * Get the admin-selected tenant from cookies in server components
 * Falls back to the regular tenant if not set
 */
export async function getAdminSelectedTenant(): Promise<Tenant> {
  const cookieStore = await cookies();
  const adminTenant = cookieStore.get('adminSelectedTenant')?.value;
  
  if (adminTenant && isValidTenant(adminTenant)) {
    return adminTenant;
  }
  
  // Fall back to regular tenant detection
  return await getTenant();
}
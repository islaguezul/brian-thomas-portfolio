import type { Tenant } from '@/middleware';

// Type guard to check if a string is a valid tenant
export function isValidTenant(value: string): value is Tenant {
  return value === 'internal' || value === 'external';
}

// Constants for tenant display names
export const TENANT_NAMES: Record<Tenant, string> = {
  internal: 'Internal (briantpm.com)',
  external: 'External (brianthomastpm.com)'
};

// Helper to get opposite tenant
export function getOppositeTenant(tenant: Tenant): Tenant {
  return tenant === 'internal' ? 'external' : 'internal';
}
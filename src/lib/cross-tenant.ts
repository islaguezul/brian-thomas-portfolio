import type { Tenant } from '@/middleware';
import { TENANT_NAMES, getOppositeTenant } from './tenant-utils';

export { getOppositeTenant };

// Short display names for UI elements
export const TENANT_SHORT_NAMES: Record<Tenant, string> = {
  internal: 'briantpm.com',
  external: 'brianthomastpm.com'
};

// Get the short name for a tenant
export function getTenantShortName(tenant: Tenant): string {
  return TENANT_SHORT_NAMES[tenant];
}

// Get the full display name for a tenant
export function getTenantDisplayName(tenant: Tenant): string {
  return TENANT_NAMES[tenant];
}

// Supported entity types for cross-tenant operations
export type CrossTenantEntityType =
  | 'projects'
  | 'experience'
  | 'education'
  | 'tech-stack'
  | 'skills'
  | 'personal'
  | 'expertise-radar'
  | 'process-strategies';

// Conflict resolution options
export type ConflictResolution = 'skip' | 'replace' | 'create-new';

// Entity type display names
export const ENTITY_TYPE_NAMES: Record<CrossTenantEntityType, string> = {
  'projects': 'Project',
  'experience': 'Work Experience',
  'education': 'Education',
  'tech-stack': 'Tech Stack Item',
  'skills': 'Skill Category',
  'personal': 'Personal Info',
  'expertise-radar': 'Expertise Radar Item',
  'process-strategies': 'Process Strategy'
};

// Get display name for entity type
export function getEntityTypeName(entityType: CrossTenantEntityType): string {
  return ENTITY_TYPE_NAMES[entityType];
}

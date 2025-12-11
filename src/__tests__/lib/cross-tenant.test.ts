/**
 * Unit tests for cross-tenant utility functions
 * Tests the core utility functions used for cross-tenant operations
 */

import {
  getOppositeTenant,
  getTenantShortName,
  getTenantDisplayName,
  getEntityTypeName,
  TENANT_SHORT_NAMES,
  ENTITY_TYPE_NAMES,
  type CrossTenantEntityType,
} from '@/lib/cross-tenant';
import { isValidTenant, TENANT_NAMES } from '@/lib/tenant-utils';
import type { Tenant } from '@/middleware';

describe('cross-tenant utility functions', () => {
  describe('getOppositeTenant', () => {
    it('should return "external" when given "internal"', () => {
      expect(getOppositeTenant('internal')).toBe('external');
    });

    it('should return "internal" when given "external"', () => {
      expect(getOppositeTenant('external')).toBe('internal');
    });

    it('should be symmetric - calling twice returns original', () => {
      const original: Tenant = 'internal';
      const opposite = getOppositeTenant(original);
      const backToOriginal = getOppositeTenant(opposite);
      expect(backToOriginal).toBe(original);
    });
  });

  describe('getTenantShortName', () => {
    it('should return "briantpm.com" for internal tenant', () => {
      expect(getTenantShortName('internal')).toBe('briantpm.com');
    });

    it('should return "brianthomastpm.com" for external tenant', () => {
      expect(getTenantShortName('external')).toBe('brianthomastpm.com');
    });

    it('should match TENANT_SHORT_NAMES constant', () => {
      expect(getTenantShortName('internal')).toBe(TENANT_SHORT_NAMES.internal);
      expect(getTenantShortName('external')).toBe(TENANT_SHORT_NAMES.external);
    });
  });

  describe('getTenantDisplayName', () => {
    it('should return full display name for internal tenant', () => {
      expect(getTenantDisplayName('internal')).toBe(TENANT_NAMES.internal);
    });

    it('should return full display name for external tenant', () => {
      expect(getTenantDisplayName('external')).toBe(TENANT_NAMES.external);
    });

    it('should include domain name in display name', () => {
      expect(getTenantDisplayName('internal')).toContain('briantpm.com');
      expect(getTenantDisplayName('external')).toContain('brianthomastpm.com');
    });
  });

  describe('getEntityTypeName', () => {
    const entityTypeTestCases: Array<{ type: CrossTenantEntityType; expected: string }> = [
      { type: 'projects', expected: 'Project' },
      { type: 'experience', expected: 'Work Experience' },
      { type: 'education', expected: 'Education' },
      { type: 'tech-stack', expected: 'Tech Stack Item' },
      { type: 'skills', expected: 'Skill Category' },
      { type: 'personal', expected: 'Personal Info' },
      { type: 'expertise-radar', expected: 'Expertise Radar Item' },
      { type: 'process-strategies', expected: 'Process Strategy' },
    ];

    it.each(entityTypeTestCases)(
      'should return "$expected" for entity type "$type"',
      ({ type, expected }) => {
        expect(getEntityTypeName(type)).toBe(expected);
      }
    );

    it('should match ENTITY_TYPE_NAMES constant', () => {
      entityTypeTestCases.forEach(({ type }) => {
        expect(getEntityTypeName(type)).toBe(ENTITY_TYPE_NAMES[type]);
      });
    });
  });

  describe('isValidTenant', () => {
    it('should return true for "internal"', () => {
      expect(isValidTenant('internal')).toBe(true);
    });

    it('should return true for "external"', () => {
      expect(isValidTenant('external')).toBe(true);
    });

    it('should return false for invalid tenant strings', () => {
      expect(isValidTenant('invalid')).toBe(false);
      expect(isValidTenant('')).toBe(false);
      expect(isValidTenant('Internal')).toBe(false);
      expect(isValidTenant('INTERNAL')).toBe(false);
      expect(isValidTenant('test')).toBe(false);
    });
  });

  describe('TENANT_SHORT_NAMES constant', () => {
    it('should have entries for both tenants', () => {
      expect(TENANT_SHORT_NAMES).toHaveProperty('internal');
      expect(TENANT_SHORT_NAMES).toHaveProperty('external');
    });

    it('should have different values for each tenant', () => {
      expect(TENANT_SHORT_NAMES.internal).not.toBe(TENANT_SHORT_NAMES.external);
    });
  });

  describe('ENTITY_TYPE_NAMES constant', () => {
    it('should have entries for all entity types', () => {
      const expectedTypes: CrossTenantEntityType[] = [
        'projects',
        'experience',
        'education',
        'tech-stack',
        'skills',
        'personal',
        'expertise-radar',
        'process-strategies',
      ];

      expectedTypes.forEach((type) => {
        expect(ENTITY_TYPE_NAMES).toHaveProperty(type);
        expect(typeof ENTITY_TYPE_NAMES[type]).toBe('string');
        expect(ENTITY_TYPE_NAMES[type].length).toBeGreaterThan(0);
      });
    });
  });
});

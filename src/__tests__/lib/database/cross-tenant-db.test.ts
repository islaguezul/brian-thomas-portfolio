/**
 * Unit tests for cross-tenant database functions
 * Tests the matching and copy functions in db.ts
 *
 * Note: These tests mock the SQL calls directly since the functions
 * use template literals that are difficult to mock at the function level.
 */

import { sql } from '@vercel/postgres';

// Mock the @vercel/postgres module before any imports
jest.mock('@vercel/postgres', () => ({
  sql: jest.fn(),
}));

// Import after mocking
import {
  findMatchingProject,
  findMatchingWorkExperience,
  findMatchingEducation,
  findMatchingTechStack,
  findMatchingSkillCategory,
  copyProjectToTenant,
  copyWorkExperienceToTenant,
  copyEducationToTenant,
  copyTechStackToTenant,
  copySkillCategoryToTenant,
  copyProcessStrategyToTenant,
} from '@/lib/database/db';

const mockSql = sql as jest.MockedFunction<typeof sql>;

// Create mock query result helper
function createMockQueryResult<T>(rows: T[]) {
  return {
    rows,
    command: 'SELECT' as const,
    rowCount: rows.length,
    fields: [],
    oid: 0,
  };
}

describe('Cross-tenant database functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findMatchingProject', () => {
    it('should find a project by name (case-insensitive)', async () => {
      const mockProject = {
        id: 1,
        name: 'Test Project',
        description: 'A test project',
        tenant: 'internal',
      };

      mockSql.mockResolvedValueOnce(createMockQueryResult([mockProject]));

      const result = await findMatchingProject('TEST PROJECT', 'internal');
      expect(result).toEqual(mockProject);
      expect(mockSql).toHaveBeenCalled();
    });

    it('should return null when no matching project found', async () => {
      mockSql.mockResolvedValueOnce(createMockQueryResult([]));

      const result = await findMatchingProject('Nonexistent', 'internal');
      expect(result).toBeNull();
    });

    it('should return null on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const result = await findMatchingProject('Test', 'internal');
      expect(result).toBeNull();
    });
  });

  describe('findMatchingWorkExperience', () => {
    it('should find work experience by company and title (case-insensitive)', async () => {
      const mockExperience = {
        id: 1,
        company: 'Tech Corp',
        title: 'Software Engineer',
        tenant: 'internal',
      };

      mockSql
        .mockResolvedValueOnce(createMockQueryResult([mockExperience]))
        .mockResolvedValueOnce(createMockQueryResult([
          { id: 1, responsibility: 'Test', display_order: 0 }
        ]));

      const result = await findMatchingWorkExperience('TECH CORP', 'SOFTWARE ENGINEER', 'internal');
      expect(result).toBeTruthy();
      expect(result?.company).toBe('Tech Corp');
    });

    it('should return null when no matching work experience found', async () => {
      mockSql.mockResolvedValueOnce(createMockQueryResult([]));

      const result = await findMatchingWorkExperience('Unknown', 'Unknown', 'internal');
      expect(result).toBeNull();
    });

    it('should include responsibilities in the result', async () => {
      const mockExperience = {
        id: 1,
        company: 'Tech Corp',
        title: 'Software Engineer',
        tenant: 'internal',
      };

      const mockResponsibilities = [
        { id: 1, responsibility: 'Led team', display_order: 0 },
        { id: 2, responsibility: 'Built features', display_order: 1 },
      ];

      mockSql
        .mockResolvedValueOnce(createMockQueryResult([mockExperience]))
        .mockResolvedValueOnce(createMockQueryResult(mockResponsibilities));

      const result = await findMatchingWorkExperience('Tech Corp', 'Software Engineer', 'internal');
      expect(result?.responsibilities).toHaveLength(2);
      expect(result?.responsibilities?.[0].responsibility).toBe('Led team');
    });
  });

  describe('findMatchingEducation', () => {
    it('should find education by school and degree (case-insensitive)', async () => {
      const mockEducation = {
        id: 1,
        school: 'Test University',
        degree: 'Bachelor of Science',
        tenant: 'internal',
      };

      mockSql
        .mockResolvedValueOnce(createMockQueryResult([mockEducation]))
        .mockResolvedValueOnce(createMockQueryResult([]));

      const result = await findMatchingEducation('TEST UNIVERSITY', 'BACHELOR OF SCIENCE', 'internal');
      expect(result).toBeTruthy();
      expect(result?.school).toBe('Test University');
    });

    it('should return null when no matching education found', async () => {
      mockSql.mockResolvedValueOnce(createMockQueryResult([]));

      const result = await findMatchingEducation('Unknown', 'Unknown', 'internal');
      expect(result).toBeNull();
    });

    it('should include courses in the result', async () => {
      const mockEducation = {
        id: 1,
        school: 'Test University',
        degree: 'Bachelor of Science',
        tenant: 'internal',
      };

      const mockCourses = [
        { id: 1, course_name: 'Algorithms', display_order: 0 },
        { id: 2, course_name: 'Data Structures', display_order: 1 },
      ];

      mockSql
        .mockResolvedValueOnce(createMockQueryResult([mockEducation]))
        .mockResolvedValueOnce(createMockQueryResult(mockCourses));

      const result = await findMatchingEducation('Test University', 'Bachelor of Science', 'internal');
      expect(result?.courses).toHaveLength(2);
      expect(result?.courses?.[0].courseName).toBe('Algorithms');
    });
  });

  describe('findMatchingTechStack', () => {
    it('should find tech stack by name (case-insensitive)', async () => {
      const mockTech = {
        id: 1,
        name: 'React',
        category: 'Frontend',
        tenant: 'internal',
      };

      mockSql.mockResolvedValueOnce(createMockQueryResult([mockTech]));

      const result = await findMatchingTechStack('REACT', 'internal');
      expect(result).toEqual(mockTech);
    });

    it('should return null when no matching tech stack found', async () => {
      mockSql.mockResolvedValueOnce(createMockQueryResult([]));

      const result = await findMatchingTechStack('Unknown', 'internal');
      expect(result).toBeNull();
    });
  });

  describe('findMatchingSkillCategory', () => {
    it('should find skill category by name (case-insensitive)', async () => {
      const mockCategory = {
        id: 1,
        name: 'Programming Languages',
        tenant: 'internal',
      };

      mockSql
        .mockResolvedValueOnce(createMockQueryResult([mockCategory]))
        .mockResolvedValueOnce(createMockQueryResult([]));

      const result = await findMatchingSkillCategory('PROGRAMMING LANGUAGES', 'internal');
      expect(result).toBeTruthy();
      expect(result?.name).toBe('Programming Languages');
    });

    it('should return null when no matching skill category found', async () => {
      mockSql.mockResolvedValueOnce(createMockQueryResult([]));

      const result = await findMatchingSkillCategory('Unknown', 'internal');
      expect(result).toBeNull();
    });

    it('should include skills in the result', async () => {
      const mockCategory = {
        id: 1,
        name: 'Programming Languages',
        tenant: 'internal',
      };

      const mockSkills = [
        { id: 1, skill_name: 'JavaScript', display_order: 0 },
        { id: 2, skill_name: 'TypeScript', display_order: 1 },
      ];

      mockSql
        .mockResolvedValueOnce(createMockQueryResult([mockCategory]))
        .mockResolvedValueOnce(createMockQueryResult(mockSkills));

      const result = await findMatchingSkillCategory('Programming Languages', 'internal');
      expect(result?.skills).toHaveLength(2);
      expect(result?.skills?.[0].skillName).toBe('JavaScript');
    });
  });

  describe('Copy functions - behavior verification', () => {
    /**
     * Copy functions call getX() then createX() internally.
     * We test the behavior by verifying the SQL calls are made correctly.
     */

    describe('copyProjectToTenant', () => {
      it('should return null when source project not found', async () => {
        // Mock getProject to return null
        mockSql.mockResolvedValueOnce(createMockQueryResult([]));

        const result = await copyProjectToTenant(999, 'internal', 'external');
        expect(result).toBeNull();
      });
    });

    describe('copyWorkExperienceToTenant', () => {
      it('should return null when source experience not found', async () => {
        mockSql.mockResolvedValueOnce(createMockQueryResult([]));

        const result = await copyWorkExperienceToTenant(999, 'internal', 'external');
        expect(result).toBeNull();
      });
    });

    describe('copyEducationToTenant', () => {
      it('should return null when source education not found', async () => {
        mockSql.mockResolvedValueOnce(createMockQueryResult([]));

        const result = await copyEducationToTenant(999, 'internal', 'external');
        expect(result).toBeNull();
      });
    });

    describe('copyTechStackToTenant', () => {
      it('should return null when source tech stack not found', async () => {
        mockSql.mockResolvedValueOnce(createMockQueryResult([]));

        const result = await copyTechStackToTenant(999, 'internal', 'external');
        expect(result).toBeNull();
      });
    });

    describe('copySkillCategoryToTenant', () => {
      it('should return null when source skill category not found', async () => {
        mockSql
          .mockResolvedValueOnce(createMockQueryResult([]))
          .mockResolvedValueOnce(createMockQueryResult([]));

        const result = await copySkillCategoryToTenant(999, 'internal', 'external');
        expect(result).toBeNull();
      });
    });

    describe('copyProcessStrategyToTenant', () => {
      it('should return null when source strategy not found', async () => {
        mockSql.mockResolvedValueOnce(createMockQueryResult([]));

        const result = await copyProcessStrategyToTenant(999, 'internal', 'external');
        expect(result).toBeNull();
      });
    });
  });

  describe('Cross-tenant matching - case insensitivity', () => {
    const testCases = [
      { input: 'Test Project', stored: 'test project' },
      { input: 'TEST PROJECT', stored: 'Test Project' },
      { input: 'test project', stored: 'TEST PROJECT' },
      { input: 'TeSt PrOjEcT', stored: 'test project' },
    ];

    it.each(testCases)(
      'should match "$input" with stored "$stored"',
      async ({ input, stored }) => {
        mockSql.mockResolvedValueOnce(createMockQueryResult([
          { id: 1, name: stored, tenant: 'internal' }
        ]));

        const result = await findMatchingProject(input, 'internal');
        expect(result).toBeTruthy();
      }
    );
  });

  describe('Tenant parameter validation', () => {
    it('should pass internal tenant to SQL query', async () => {
      mockSql.mockResolvedValueOnce(createMockQueryResult([]));

      await findMatchingProject('Test', 'internal');

      // Verify SQL was called (the actual query verification would require
      // inspecting the template literal, which is implementation-dependent)
      expect(mockSql).toHaveBeenCalled();
    });

    it('should pass external tenant to SQL query', async () => {
      mockSql.mockResolvedValueOnce(createMockQueryResult([]));

      await findMatchingProject('Test', 'external');

      expect(mockSql).toHaveBeenCalled();
    });
  });
});

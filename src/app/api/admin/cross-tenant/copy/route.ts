import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getAdminTenant } from '@/lib/admin-tenant';
import { getOppositeTenant } from '@/lib/cross-tenant';
import type { ConflictResolution, CrossTenantEntityType } from '@/lib/cross-tenant';
import {
  copyProjectToTenant,
  copyWorkExperienceToTenant,
  copyEducationToTenant,
  copyTechStackToTenant,
  copySkillCategoryToTenant,
  copyProcessStrategyToTenant,
  getProject,
  getWorkExperience,
  getEducation,
  getTechStack,
  getSkillCategories,
  getProcessStrategies,
  updateProject,
  updateWorkExperience,
  updateEducation,
  updateTechStack,
  updateSkillCategory,
  updateProcessStrategy,
  getPersonalInfo,
  updatePersonalInfo,
} from '@/lib/database/db';
import { sql } from '@vercel/postgres';
import { notifyContentUpdate } from '@/lib/notify-updates';

interface CopyRequest {
  entityType: CrossTenantEntityType;
  entityId: number;
  conflictResolution?: ConflictResolution;
  // If provided, uses this as the target ID for replacement
  targetEntityId?: number;
}

interface CopyPersonalInfoRequest {
  entityType: 'personal';
  field?: string; // Optional - if provided, only copy this field
}

// POST - Copy an entity from the other tenant to the current tenant
export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const currentTenant = getAdminTenant(request.headers);
    const otherTenant = getOppositeTenant(currentTenant);
    const body = await request.json();

    // Handle personal info separately since it's a singleton
    if (body.entityType === 'personal') {
      return handlePersonalInfoCopy(body as CopyPersonalInfoRequest, otherTenant, currentTenant);
    }

    const { entityType, entityId, conflictResolution = 'create-new', targetEntityId } = body as CopyRequest;

    if (!entityType || entityId === undefined) {
      return NextResponse.json(
        { error: 'entityType and entityId are required' },
        { status: 400 }
      );
    }

    let result;
    let entityName = '';

    switch (entityType) {
      case 'projects': {
        const source = await getProject(otherTenant, entityId);
        if (!source) {
          return NextResponse.json(
            { error: 'Source project not found' },
            { status: 404 }
          );
        }
        entityName = source.name;

        if (conflictResolution === 'replace' && targetEntityId) {
          // Replace existing project
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...projectData } = source;
          result = await updateProject(currentTenant, targetEntityId, projectData);
        } else {
          // Create new copy
          result = await copyProjectToTenant(entityId, otherTenant, currentTenant);
        }
        break;
      }

      case 'experience': {
        const experiences = await getWorkExperience(otherTenant);
        const source = experiences.find(exp => exp.id === entityId);
        if (!source) {
          return NextResponse.json(
            { error: 'Source work experience not found' },
            { status: 404 }
          );
        }
        entityName = `${source.title} at ${source.company}`;

        if (conflictResolution === 'replace' && targetEntityId) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...expData } = source;
          result = await updateWorkExperience(currentTenant, targetEntityId, expData);
        } else {
          result = await copyWorkExperienceToTenant(entityId, otherTenant, currentTenant);
        }
        break;
      }

      case 'education': {
        const educationList = await getEducation(otherTenant);
        const source = educationList.find(edu => edu.id === entityId);
        if (!source) {
          return NextResponse.json(
            { error: 'Source education not found' },
            { status: 404 }
          );
        }
        entityName = `${source.degree} from ${source.school}`;

        if (conflictResolution === 'replace' && targetEntityId) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...eduData } = source;
          result = await updateEducation(currentTenant, targetEntityId, eduData);
        } else {
          result = await copyEducationToTenant(entityId, otherTenant, currentTenant);
        }
        break;
      }

      case 'tech-stack': {
        const techStack = await getTechStack(otherTenant);
        const source = techStack.find(item => item.id === entityId);
        if (!source) {
          return NextResponse.json(
            { error: 'Source tech stack item not found' },
            { status: 404 }
          );
        }
        entityName = source.name;

        if (conflictResolution === 'replace' && targetEntityId) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...techData } = source;
          result = await updateTechStack(currentTenant, targetEntityId, techData);
        } else {
          result = await copyTechStackToTenant(entityId, otherTenant, currentTenant);
        }
        break;
      }

      case 'skills': {
        const categories = await getSkillCategories(otherTenant);
        const source = categories.find(cat => cat.id === entityId);
        if (!source) {
          return NextResponse.json(
            { error: 'Source skill category not found' },
            { status: 404 }
          );
        }
        entityName = source.name;

        if (conflictResolution === 'replace' && targetEntityId) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, skills, ...catData } = source;
          result = await updateSkillCategory(currentTenant, targetEntityId, catData);
        } else {
          result = await copySkillCategoryToTenant(entityId, otherTenant, currentTenant);
        }
        break;
      }

      case 'process-strategies': {
        const strategies = await getProcessStrategies(otherTenant);
        const source = strategies.find(s => s.id === entityId);
        if (!source) {
          return NextResponse.json(
            { error: 'Source process strategy not found' },
            { status: 404 }
          );
        }
        entityName = source.title;

        if (conflictResolution === 'replace' && targetEntityId) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...strategyData } = source;
          result = await updateProcessStrategy(currentTenant, targetEntityId, strategyData);
        } else {
          result = await copyProcessStrategyToTenant(entityId, otherTenant, currentTenant);
        }
        break;
      }

      case 'expertise-radar': {
        // Handle expertise radar separately since it's not in db.ts
        const sourceResult = await sql`
          SELECT * FROM expertise_radar
          WHERE tenant_id = ${otherTenant} AND id = ${entityId}
        `;
        const source = sourceResult.rows[0];
        if (!source) {
          return NextResponse.json(
            { error: 'Source expertise radar item not found' },
            { status: 404 }
          );
        }
        entityName = source.skill_name;

        if (conflictResolution === 'replace' && targetEntityId) {
          const updateResult = await sql`
            UPDATE expertise_radar
            SET skill_name = ${source.skill_name},
                skill_level = ${source.skill_level},
                category = ${source.category},
                description = ${source.description},
                color = ${source.color},
                display_order = ${source.display_order},
                is_active = ${source.is_active}
            WHERE tenant_id = ${currentTenant} AND id = ${targetEntityId}
            RETURNING *
          `;
          result = updateResult.rows[0];
        } else {
          const insertResult = await sql`
            INSERT INTO expertise_radar (
              tenant_id, skill_name, skill_level, category, description, color, display_order, is_active
            ) VALUES (
              ${currentTenant}, ${source.skill_name}, ${source.skill_level}, ${source.category},
              ${source.description}, ${source.color}, ${source.display_order}, ${source.is_active}
            ) RETURNING *
          `;
          result = insertResult.rows[0];
        }
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown entity type: ${entityType}` },
          { status: 400 }
        );
    }

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to copy entity' },
        { status: 500 }
      );
    }

    // Notify about the update
    await notifyContentUpdate(entityType, {
      action: conflictResolution === 'replace' ? 'updated' : 'created',
      name: entityName,
      crossTenantCopy: true,
      sourceTenant: otherTenant,
    });

    return NextResponse.json({
      success: true,
      result,
      action: conflictResolution === 'replace' ? 'replaced' : 'created',
      entityName,
    });
  } catch (error) {
    console.error('Error copying cross-tenant entity:', error);
    return NextResponse.json(
      { error: 'Failed to copy entity' },
      { status: 500 }
    );
  }
}

// Handle personal info copy (single field or all fields)
async function handlePersonalInfoCopy(
  body: CopyPersonalInfoRequest,
  sourceTenant: string,
  targetTenant: string
) {
  const sourceInfo = await getPersonalInfo(sourceTenant as 'internal' | 'external');
  if (!sourceInfo) {
    return NextResponse.json(
      { error: 'Source personal info not found' },
      { status: 404 }
    );
  }

  const targetInfo = await getPersonalInfo(targetTenant as 'internal' | 'external');

  if (body.field) {
    // Copy only a specific field
    const fieldValue = sourceInfo[body.field as keyof typeof sourceInfo];
    if (fieldValue === undefined) {
      return NextResponse.json(
        { error: `Field ${body.field} not found in source` },
        { status: 400 }
      );
    }

    const updatedInfo = {
      ...(targetInfo || sourceInfo),
      [body.field]: fieldValue,
    };

    const result = await updatePersonalInfo(targetTenant as 'internal' | 'external', updatedInfo);

    return NextResponse.json({
      success: true,
      result,
      action: 'field-copied',
      field: body.field,
    });
  } else {
    // Copy all fields (except id)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...infoData } = sourceInfo;
    const result = await updatePersonalInfo(targetTenant as 'internal' | 'external', infoData);

    await notifyContentUpdate('personal', {
      action: 'updated',
      crossTenantCopy: true,
      sourceTenant,
    });

    return NextResponse.json({
      success: true,
      result,
      action: 'all-copied',
    });
  }
}

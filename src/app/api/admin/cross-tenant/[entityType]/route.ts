import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getAdminTenant } from '@/lib/admin-tenant';
import { getOppositeTenant } from '@/lib/cross-tenant';
import {
  getProjects,
  getProject,
  getWorkExperience,
  getEducation,
  getTechStack,
  getSkillCategories,
  getPersonalInfo,
  getProcessStrategies,
} from '@/lib/database/db';
import { sql } from '@vercel/postgres';
import type { CrossTenantEntityType } from '@/lib/cross-tenant';

// GET - Fetch data from the OTHER tenant (opposite of the admin-selected tenant)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entityType: string }> }
) {
  try {
    await requireAuth();

    const { entityType } = await params;
    const currentTenant = getAdminTenant(request.headers);
    const otherTenant = getOppositeTenant(currentTenant);

    // Check for specific entity ID query param
    const url = new URL(request.url);
    const entityId = url.searchParams.get('id');

    let data;

    switch (entityType as CrossTenantEntityType) {
      case 'projects':
        if (entityId) {
          data = await getProject(otherTenant, parseInt(entityId));
        } else {
          data = await getProjects(otherTenant);
        }
        break;

      case 'experience':
        data = await getWorkExperience(otherTenant);
        if (entityId) {
          data = data.find(exp => exp.id === parseInt(entityId)) || null;
        }
        break;

      case 'education':
        data = await getEducation(otherTenant);
        if (entityId) {
          data = data.find(edu => edu.id === parseInt(entityId)) || null;
        }
        break;

      case 'tech-stack':
        data = await getTechStack(otherTenant);
        if (entityId) {
          data = data.find(item => item.id === parseInt(entityId)) || null;
        }
        break;

      case 'skills':
        data = await getSkillCategories(otherTenant);
        if (entityId) {
          data = data.find(cat => cat.id === parseInt(entityId)) || null;
        }
        break;

      case 'personal':
        data = await getPersonalInfo(otherTenant);
        break;

      case 'process-strategies':
        data = await getProcessStrategies(otherTenant);
        if (entityId) {
          data = data.find(strategy => strategy.id === parseInt(entityId)) || null;
        }
        break;

      case 'expertise-radar':
        // Expertise radar uses tenant_id instead of tenant
        if (entityId) {
          const result = await sql`
            SELECT * FROM expertise_radar
            WHERE tenant_id = ${otherTenant} AND id = ${parseInt(entityId)}
          `;
          data = result.rows[0] || null;
        } else {
          const result = await sql`
            SELECT * FROM expertise_radar
            WHERE tenant_id = ${otherTenant}
            ORDER BY display_order ASC, skill_name ASC
          `;
          data = result.rows;
        }
        break;

      default:
        return NextResponse.json(
          { error: `Unknown entity type: ${entityType}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      data,
      sourceTenant: otherTenant,
      targetTenant: currentTenant,
    });
  } catch (error) {
    console.error('Error fetching cross-tenant data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cross-tenant data' },
      { status: 500 }
    );
  }
}

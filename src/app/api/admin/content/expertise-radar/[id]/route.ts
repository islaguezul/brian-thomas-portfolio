import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getAdminTenant } from '@/lib/admin-tenant';
import { sql } from '@vercel/postgres';
import { ExpertiseRadarItem } from '@/lib/database/types';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireAuth();
    const tenant = getAdminTenant(request.headers);
    const data: Partial<ExpertiseRadarItem> = await request.json();
    
    const result = await sql`
      UPDATE expertise_radar 
      SET 
        skill_name = ${data.skillName},
        skill_level = ${data.skillLevel},
        category = ${data.category || ''},
        description = ${data.description || ''},
        color = ${data.color || '#8884d8'},
        display_order = ${data.displayOrder || 0},
        is_active = ${data.isActive !== false},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND tenant_id = ${tenant}
      RETURNING 
        id, tenant_id as "tenantId", skill_name as "skillName", 
        skill_level as "skillLevel", category, description, color,
        display_order as "displayOrder", is_active as "isActive",
        created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Expertise radar item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating expertise radar item:', error);
    return NextResponse.json(
      { error: 'Failed to update expertise radar item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireAuth();
    const tenant = getAdminTenant(request.headers);
    
    const result = await sql`
      DELETE FROM expertise_radar WHERE id = ${id} AND tenant_id = ${tenant}
    `;
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Expertise radar item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expertise radar item:', error);
    return NextResponse.json(
      { error: 'Failed to delete expertise radar item' },
      { status: 500 }
    );
  }
}
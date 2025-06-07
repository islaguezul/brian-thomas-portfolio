import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getAdminTenant } from '@/lib/admin-tenant';
import { sql } from '@vercel/postgres';
import { ExpertiseRadarItem } from '@/lib/database/types';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const tenant = getAdminTenant(request.headers);
    
    console.log('Admin expertise radar - tenant:', tenant); // Debug log
    
    const result = await sql`
      SELECT 
        id, tenant_id as "tenantId", skill_name as "skillName", 
        skill_level as "skillLevel", category, description, color,
        display_order as "displayOrder", is_active as "isActive",
        created_at as "createdAt", updated_at as "updatedAt"
      FROM expertise_radar 
      WHERE tenant_id = ${tenant}
      ORDER BY display_order ASC, skill_name ASC
    `;
    
    console.log('Admin expertise radar - result rows:', result.rows.length); // Debug log
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching expertise radar:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expertise radar' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const tenant = getAdminTenant(request.headers);
    const data: Partial<ExpertiseRadarItem> = await request.json();
    
    const result = await sql`
      INSERT INTO expertise_radar (
        tenant_id, skill_name, skill_level, category, description, color, display_order, is_active
      ) VALUES (
        ${tenant}, ${data.skillName}, ${data.skillLevel || 5}, ${data.category || ''}, 
        ${data.description || ''}, ${data.color || '#8884d8'}, ${data.displayOrder || 0}, 
        ${data.isActive !== false}
      )
      RETURNING 
        id, tenant_id as "tenantId", skill_name as "skillName", 
        skill_level as "skillLevel", category, description, color,
        display_order as "displayOrder", is_active as "isActive",
        created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating expertise radar item:', error);
    return NextResponse.json(
      { error: 'Failed to create expertise radar item' },
      { status: 500 }
    );
  }
}
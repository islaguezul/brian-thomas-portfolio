import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getAdminTenant } from '@/lib/admin-tenant';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const tenant = getAdminTenant(request.headers);

    const result = await sql`
      SELECT * FROM expertise_radar 
      WHERE tenant_id = ${tenant}
      ORDER BY display_order ASC, skill_name ASC
    `;

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
    const body = await request.json();

    const { skillName, skillLevel, category, description, color, displayOrder, isActive } = body;

    if (!skillName || skillLevel === undefined) {
      return NextResponse.json(
        { error: 'Skill name and level are required' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO expertise_radar (
        tenant_id, skill_name, skill_level, category, description, color, display_order, is_active
      ) VALUES (
        ${tenant}, ${skillName}, ${skillLevel}, ${category || null}, ${description || null}, 
        ${color || null}, ${displayOrder || 0}, ${isActive !== false}
      ) RETURNING *
    `;

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating expertise radar item:', error);
    return NextResponse.json(
      { error: 'Failed to create expertise radar item' },
      { status: 500 }
    );
  }
}
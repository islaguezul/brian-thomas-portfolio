import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getAdminTenant } from '@/lib/admin-tenant';
import { sql } from '@vercel/postgres';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const tenant = getAdminTenant(request.headers);
    const id = parseInt(params.id);

    const result = await sql`
      SELECT * FROM expertise_radar 
      WHERE id = ${id} AND tenant_id = ${tenant}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Expertise radar item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching expertise radar item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expertise radar item' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const tenant = getAdminTenant(request.headers);
    const id = parseInt(params.id);
    const body = await request.json();

    const { skillName, skillLevel, category, description, color, displayOrder, isActive } = body;

    if (!skillName || skillLevel === undefined) {
      return NextResponse.json(
        { error: 'Skill name and level are required' },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE expertise_radar 
      SET 
        skill_name = ${skillName},
        skill_level = ${skillLevel},
        category = ${category || null},
        description = ${description || null},
        color = ${color || null},
        display_order = ${displayOrder || 0},
        is_active = ${isActive !== false},
        updated_at = NOW()
      WHERE id = ${id} AND tenant_id = ${tenant}
      RETURNING *
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
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const tenant = getAdminTenant(request.headers);
    const id = parseInt(params.id);

    const result = await sql`
      DELETE FROM expertise_radar 
      WHERE id = ${id} AND tenant_id = ${tenant}
      RETURNING *
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Expertise radar item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Expertise radar item deleted successfully' });
  } catch (error) {
    console.error('Error deleting expertise radar item:', error);
    return NextResponse.json(
      { error: 'Failed to delete expertise radar item' },
      { status: 500 }
    );
  }
}
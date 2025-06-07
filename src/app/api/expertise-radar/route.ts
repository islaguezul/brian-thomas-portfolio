import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getTenantFromHeaders } from '@/lib/tenant';

export async function GET(request: Request) {
  try {
    const tenant = getTenantFromHeaders(request.headers);

    const result = await sql`
      SELECT skill_name, skill_level, category, description, color, display_order, is_active
      FROM expertise_radar 
      WHERE tenant_id = ${tenant} AND is_active = true
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
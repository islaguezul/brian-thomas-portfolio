import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    const result = await sql`
      SELECT 
        skill_name as "skillName", 
        skill_level as "skillLevel"
      FROM expertise_radar 
      WHERE tenant_id = 'internal' AND is_active = true
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
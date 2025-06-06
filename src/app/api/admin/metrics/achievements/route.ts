import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getAdminSelectedTenant } from '@/lib/admin-tenant-server';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await getAdminSelectedTenant();
    const result = await sql`
      SELECT * FROM key_achievements 
      WHERE tenant_id = ${tenant}
      ORDER BY display_order, achievement_date DESC
    `;

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await getAdminSelectedTenant();
    const data = await request.json();

    const result = await sql`
      INSERT INTO key_achievements (
        tenant_id,
        title,
        metric_value,
        metric_unit,
        context,
        achievement_date,
        category,
        display_order,
        is_featured
      ) VALUES (
        ${tenant},
        ${data.title},
        ${data.metricValue},
        ${data.metricUnit || null},
        ${data.context || null},
        ${data.achievementDate || null},
        ${data.category},
        ${data.displayOrder || 0},
        ${data.isFeatured || false}
      )
      RETURNING *
    `;

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating achievement:', error);
    return NextResponse.json(
      { error: 'Failed to create achievement' },
      { status: 500 }
    );
  }
}
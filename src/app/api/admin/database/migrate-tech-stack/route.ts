import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getAdminTenant } from '@/lib/admin-tenant';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const tenant = getAdminTenant(request.headers);

    // First check if tech stack data already exists
    const existing = await sql`SELECT COUNT(*) as count FROM tech_stack WHERE tenant = ${tenant}`;
    if (parseInt(existing.rows[0].count) > 0) {
      return NextResponse.json({
        success: false,
        message: 'Tech stack data already exists for this tenant',
        count: existing.rows[0].count
      });
    }

    // Tech stack data that matches what's currently hardcoded in Portfolio.tsx
    const techStackData = [
      { name: 'React', icon: '⚛️', level: 8.5, category: 'frontend', displayOrder: 1 },
      { name: 'Next.js', icon: '▲', level: 8.0, category: 'frontend', displayOrder: 2 },
      { name: 'TypeScript', icon: '📘', level: 7.5, category: 'frontend', displayOrder: 3 },
      { name: 'Node.js', icon: '🟢', level: 8.0, category: 'backend', displayOrder: 4 },
      { name: 'Python', icon: '🐍', level: 9.0, category: 'backend', displayOrder: 5 },
      { name: 'PostgreSQL', icon: '🐘', level: 7.5, category: 'database', displayOrder: 6 },
      { name: 'AWS', icon: '☁️', level: 7.0, category: 'cloud', displayOrder: 7 },
      { name: 'Docker', icon: '🐳', level: 6.5, category: 'devops', displayOrder: 8 },
      { name: 'Git', icon: '📚', level: 8.5, category: 'other', displayOrder: 9 },
      { name: 'REST APIs', icon: '🌐', level: 8.0, category: 'backend', displayOrder: 10 },
      { name: 'GraphQL', icon: '📊', level: 6.0, category: 'backend', displayOrder: 11 },
      { name: 'MongoDB', icon: '🍃', level: 6.5, category: 'database', displayOrder: 12 },
      { name: 'Redis', icon: '⚡', level: 6.0, category: 'database', displayOrder: 13 },
      { name: 'Tailwind CSS', icon: '🎨', level: 8.0, category: 'frontend', displayOrder: 14 },
      { name: 'Jest', icon: '🧪', level: 7.0, category: 'testing', displayOrder: 15 },
      { name: 'GitHub Actions', icon: '🏗️', level: 6.5, category: 'devops', displayOrder: 16 }
    ];

    let insertedCount = 0;

    // Insert each tech stack item
    for (const tech of techStackData) {
      await sql`
        INSERT INTO tech_stack (
          tenant, name, icon, level, category, display_order, show_in_portfolio, created_at, updated_at
        ) VALUES (
          ${tenant}, ${tech.name}, ${tech.icon}, ${tech.level}, ${tech.category}, 
          ${tech.displayOrder}, true, NOW(), NOW()
        )
      `;
      insertedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully migrated ${insertedCount} tech stack items to database`,
      tenant: tenant,
      itemsCreated: insertedCount
    });

  } catch (error) {
    console.error('Error migrating tech stack:', error);
    return NextResponse.json(
      { error: 'Failed to migrate tech stack', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
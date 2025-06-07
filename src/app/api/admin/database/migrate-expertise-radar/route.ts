import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getAdminSelectedTenant } from '@/lib/admin-tenant-server';
import { sql } from '@vercel/postgres';

export async function POST() {
  try {
    await requireAuth();
    const tenant = await getAdminSelectedTenant();

    // Check if expertise radar already has data
    const existing = await sql`
      SELECT COUNT(*) as count FROM expertise_radar WHERE tenant_id = ${tenant}
    `;

    if (existing.rows[0].count > 0) {
      return NextResponse.json({
        success: false,
        message: 'Expertise radar already has data. Clear it first if you want to re-migrate.'
      });
    }

    // Define high-value tech stack and skills data for radar chart
    const expertiseData = [
      // Technical Skills (Blue tones)
      { skillName: 'React', skillLevel: 9.5, category: 'Frontend', color: '#3B82F6', description: 'Advanced React development with hooks, context, and modern patterns' },
      { skillName: 'Next.js', skillLevel: 9.5, category: 'Frontend', color: '#1E40AF', description: 'Full-stack React applications with SSR/SSG' },
      { skillName: 'TypeScript', skillLevel: 9.0, category: 'Frontend', color: '#2563EB', description: 'Type-safe JavaScript development' },
      { skillName: 'Node.js', skillLevel: 8.8, category: 'Backend', color: '#10B981', description: 'Server-side JavaScript and API development' },
      { skillName: 'Python', skillLevel: 9.0, category: 'Backend', color: '#059669', description: 'Full-stack development and data analysis' },
      { skillName: 'PostgreSQL', skillLevel: 8.5, category: 'Database', color: '#0891B2', description: 'Advanced SQL and database design' },
      { skillName: 'AWS', skillLevel: 8.2, category: 'Cloud', color: '#0F766E', description: 'Cloud architecture and deployment' },
      
      // Process & Product Management (Purple tones)
      { skillName: 'BPMN 2.0', skillLevel: 9.6, category: 'Process', color: '#7C3AED', description: 'Business process modeling and automation' },
      { skillName: 'Product Strategy', skillLevel: 9.2, category: 'Product', color: '#8B5CF6', description: 'Product vision, roadmapping, and market analysis' },
      { skillName: 'Process Analysis', skillLevel: 9.0, category: 'Process', color: '#9333EA', description: 'Business process optimization and improvement' },
      
      // Leadership & Management (Orange/Red tones)
      { skillName: 'Team Leadership', skillLevel: 8.8, category: 'Leadership', color: '#EA580C', description: 'Cross-functional team management and development' },
      { skillName: 'Strategic Planning', skillLevel: 8.5, category: 'Leadership', color: '#DC2626', description: 'Long-term planning and goal setting' },
      { skillName: 'Stakeholder Management', skillLevel: 8.5, category: 'Leadership', color: '#B91C1C', description: 'Executive and client relationship management' },
      
      // Analytics & AI (Teal tones)
      { skillName: 'Data Analysis', skillLevel: 8.5, category: 'Analytics', color: '#0D9488', description: 'Business intelligence and data visualization' },
      { skillName: 'Machine Learning', skillLevel: 7.8, category: 'AI/ML', color: '#059669', description: 'ML model development and deployment' },
      
      // DevOps (Gray tones)
      { skillName: 'Docker', skillLevel: 8.5, category: 'DevOps', color: '#6B7280', description: 'Containerization and deployment automation' },
      { skillName: 'REST APIs', skillLevel: 9.2, category: 'Backend', color: '#047857', description: 'API design and microservices architecture' }
    ];

    // Insert expertise data for current tenant
    for (let i = 0; i < expertiseData.length; i++) {
      const item = expertiseData[i];
      await sql`
        INSERT INTO expertise_radar (
          tenant_id, skill_name, skill_level, category, description, color, display_order, is_active
        ) VALUES (
          ${tenant}, ${item.skillName}, ${item.skillLevel}, ${item.category}, 
          ${item.description}, ${item.color}, ${i}, true
        )
      `;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully migrated ${expertiseData.length} expertise items to radar chart`,
      itemsAdded: expertiseData.length
    });

  } catch (error) {
    console.error('Expertise radar migration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to migrate expertise radar data', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
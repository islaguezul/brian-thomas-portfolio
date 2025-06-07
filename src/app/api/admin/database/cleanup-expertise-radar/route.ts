import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getAdminTenant } from '@/lib/admin-tenant';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const tenant = getAdminTenant(request.headers);

    // Delete all existing expertise radar items for this tenant
    await sql`DELETE FROM expertise_radar WHERE tenant_id = ${tenant}`;

    // Create the 6 required expertise radar items based on the screenshot
    const expertiseItems = [
      {
        skillName: 'Technical Architecture Strategy',
        skillLevel: 9.5,
        category: 'Strategy',
        description: 'Designing scalable technical architectures and strategic technology roadmaps',
        color: '#8B5CF6', // Purple
        displayOrder: 1,
        isActive: true
      },
      {
        skillName: 'API & Integration Design',
        skillLevel: 9.2,
        category: 'Technical',
        description: 'Designing robust APIs and system integration patterns',
        color: '#3B82F6', // Blue
        displayOrder: 2,
        isActive: true
      },
      {
        skillName: 'Agile & DevOps Transformation',
        skillLevel: 8.8,
        category: 'Process',
        description: 'Leading agile transformations and DevOps adoption initiatives',
        color: '#10B981', // Green
        displayOrder: 3,
        isActive: true
      },
      {
        skillName: 'Data Strategy & Analytics',
        skillLevel: 8.5,
        category: 'Analytics',
        description: 'Developing data strategies and analytics frameworks for business insights',
        color: '#F59E0B', // Yellow/Orange
        displayOrder: 4,
        isActive: true
      },
      {
        skillName: 'Technical Risk Management',
        skillLevel: 8.7,
        category: 'Leadership',
        description: 'Identifying and mitigating technical risks in complex systems',
        color: '#EF4444', // Red
        displayOrder: 5,
        isActive: true
      },
      {
        skillName: 'Stakeholder Technical Translation',
        skillLevel: 9.0,
        category: 'Communication',
        description: 'Translating complex technical concepts for business stakeholders',
        color: '#8884D8', // Light Purple
        displayOrder: 6,
        isActive: true
      }
    ];

    // Insert the new expertise radar items
    for (const item of expertiseItems) {
      await sql`
        INSERT INTO expertise_radar 
        (tenant_id, skill_name, skill_level, category, description, color, display_order, is_active)
        VALUES (${tenant}, ${item.skillName}, ${item.skillLevel}, ${item.category}, 
                ${item.description}, ${item.color}, ${item.displayOrder}, ${item.isActive})
      `;
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Expertise radar cleaned up successfully. Created 6 new items matching the reference screenshot.',
      itemsCreated: expertiseItems.length
    });

  } catch (error) {
    console.error('Error cleaning up expertise radar:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup expertise radar' },
      { status: 500 }
    );
  }
}
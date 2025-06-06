import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createSkillCategory, updateSkillCategory } from '@/lib/database/db';
import { getAdminTenant } from '@/lib/admin-tenant';

export async function POST(request: Request) {
  try {
    await requireAuth();
    const tenant = getAdminTenant(request.headers);
    const data = await request.json();
    
    const category = await createSkillCategory(tenant, data);
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error creating skill category:', error);
    return NextResponse.json(
      { error: 'Failed to create skill category' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await requireAuth();
    const tenant = getAdminTenant(request.headers);
    const data = await request.json();
    
    const category = await updateSkillCategory(tenant, data.id, data);
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating skill category:', error);
    return NextResponse.json(
      { error: 'Failed to update skill category' },
      { status: 500 }
    );
  }
}
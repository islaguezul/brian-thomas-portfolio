import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getTechStack, createTechStack } from '@/lib/database/db';
import { getAdminTenant } from '@/lib/admin-tenant';

export async function GET(request: Request) {
  try {
    await requireAuth();
    const tenant = getAdminTenant(request.headers);
    const techStack = await getTechStack(tenant);
    return NextResponse.json(techStack);
  } catch (error) {
    console.error('Error fetching tech stack:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tech stack' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();
    const tenant = getAdminTenant(request.headers);
    const data = await request.json();
    const tech = await createTechStack(tenant, data);
    
    if (!tech) {
      return NextResponse.json(
        { error: 'Failed to create tech stack item' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(tech);
  } catch (error) {
    console.error('Error creating tech stack:', error);
    return NextResponse.json(
      { error: 'Failed to create tech stack item' },
      { status: 500 }
    );
  }
}
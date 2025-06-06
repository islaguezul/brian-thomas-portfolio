import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getProjects, createProject } from '@/lib/database/db';
import { notifyContentUpdate } from '@/lib/notify-updates';
import { getAdminTenant } from '@/lib/admin-tenant';

export async function GET(request: Request) {
  try {
    await requireAuth();
    const tenant = getAdminTenant(request.headers);
    const projects = await getProjects(tenant);
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();
    const tenant = getAdminTenant(request.headers);
    const data = await request.json();
    const project = await createProject(tenant, data);
    
    if (!project) {
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      );
    }
    
    await notifyContentUpdate('Projects', {
      action: 'created',
      project: data.title
    });
    
    return NextResponse.json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
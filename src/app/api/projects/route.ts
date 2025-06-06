import { NextResponse } from 'next/server';
import { getProjects } from '@/lib/database/db';
import { getTenantFromHeaders } from '@/lib/tenant';

// Public API endpoint for fetching projects (no auth required)
export async function GET(request: Request) {
  try {
    const tenant = getTenantFromHeaders(request.headers);
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
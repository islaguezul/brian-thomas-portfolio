import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getWorkExperience, createWorkExperience } from '@/lib/database/db';
import { notifyContentUpdate } from '@/lib/notify-updates';
import { getAdminTenant } from '@/lib/admin-tenant';

export async function GET(request: Request) {
  try {
    await requireAuth();
    const tenant = getAdminTenant(request.headers);
    const experience = await getWorkExperience(tenant);
    return NextResponse.json(experience);
  } catch (error) {
    console.error('Error fetching work experience:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work experience' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();
    const tenant = getAdminTenant(request.headers);
    const data = await request.json();
    const experience = await createWorkExperience(tenant, data);
    
    if (!experience) {
      return NextResponse.json(
        { error: 'Failed to create work experience' },
        { status: 500 }
      );
    }
    
    await notifyContentUpdate('Work Experience', {
      action: 'created',
      company: data.company,
      title: data.title
    });
    
    return NextResponse.json(experience);
  } catch (error) {
    console.error('Error creating work experience:', error);
    return NextResponse.json(
      { error: 'Failed to create work experience' },
      { status: 500 }
    );
  }
}
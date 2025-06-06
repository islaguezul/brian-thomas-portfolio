import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getEducation, createEducation } from '@/lib/database/db';
import { notifyContentUpdate } from '@/lib/notify-updates';
import { getAdminTenant } from '@/lib/admin-tenant';

export async function GET(request: Request) {
  try {
    await requireAuth();
    const tenant = getAdminTenant(request.headers);
    const education = await getEducation(tenant);
    return NextResponse.json(education);
  } catch (error) {
    console.error('Error fetching education:', error);
    return NextResponse.json(
      { error: 'Failed to fetch education' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();
    const tenant = getAdminTenant(request.headers);
    const data = await request.json();
    const education = await createEducation(tenant, data);
    
    if (!education) {
      return NextResponse.json(
        { error: 'Failed to create education' },
        { status: 500 }
      );
    }
    
    await notifyContentUpdate('Education', {
      action: 'created',
      institution: data.institution,
      degree: data.degree
    });
    
    return NextResponse.json(education);
  } catch (error) {
    console.error('Error creating education:', error);
    return NextResponse.json(
      { error: 'Failed to create education' },
      { status: 500 }
    );
  }
}
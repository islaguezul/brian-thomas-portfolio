import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getAdminTenant } from '@/lib/admin-tenant';
import { getCaseStudies, createCaseStudy } from '@/lib/database/db';
import { notifyContentUpdate } from '@/lib/notify-updates';

export async function GET(request: Request) {
  try {
    await requireAuth();
    const tenant = getAdminTenant(request.headers);
    const caseStudies = await getCaseStudies(tenant);
    return NextResponse.json(caseStudies);
  } catch (error) {
    console.error('Error fetching case studies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch case studies' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();
    const tenant = getAdminTenant(request.headers);
    const data = await request.json();
    const caseStudy = await createCaseStudy(tenant, data);

    if (!caseStudy) {
      return NextResponse.json(
        { error: 'Failed to create case study' },
        { status: 500 }
      );
    }

    await notifyContentUpdate('Case Studies', {
      action: 'created',
      title: data.title,
    });

    return NextResponse.json(caseStudy);
  } catch (error) {
    console.error('Error creating case study:', error);
    return NextResponse.json(
      { error: 'Failed to create case study' },
      { status: 500 }
    );
  }
}

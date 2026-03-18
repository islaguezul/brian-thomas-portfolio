import { NextResponse } from 'next/server';
import { getCaseStudies } from '@/lib/database/db';
import { getTenantFromHeaders } from '@/lib/tenant';

export async function GET(request: Request) {
  try {
    const tenant = getTenantFromHeaders(request.headers);
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

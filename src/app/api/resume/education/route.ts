import { NextResponse } from 'next/server';
import { getEducation } from '@/lib/database/db';
import { getTenantFromHeaders } from '@/lib/tenant';

export async function GET(request: Request) {
  try {
    const tenant = getTenantFromHeaders(request.headers);
    const education = await getEducation(tenant);
    console.log('Public API - Education fetched:', education.length, 'items');
    return NextResponse.json(education);
  } catch (error) {
    console.error('Error fetching education:', error);
    return NextResponse.json(
      { error: 'Failed to fetch education', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { getPersonalInfo } from '@/lib/database/db';
import { getTenantFromHeaders } from '@/lib/tenant';

export async function GET(request: Request) {
  try {
    const tenant = getTenantFromHeaders(request.headers);
    const personalInfo = await getPersonalInfo(tenant);
    return NextResponse.json(personalInfo, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error fetching personal info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personal info' },
      { status: 500 }
    );
  }
}
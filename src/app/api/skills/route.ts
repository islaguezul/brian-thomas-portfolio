import { NextResponse } from 'next/server';
import { getSkillCategories } from '@/lib/database/db';
import { getTenantFromHeaders } from '@/lib/tenant';

export async function GET(request: Request) {
  try {
    const tenant = getTenantFromHeaders(request.headers);
    const skills = await getSkillCategories(tenant);
    return NextResponse.json(skills);
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { getEducation } from '@/lib/database/db';

export async function GET() {
  try {
    const education = await getEducation();
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
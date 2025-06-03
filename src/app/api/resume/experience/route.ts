import { NextResponse } from 'next/server';
import { getWorkExperience } from '@/lib/database/db';

export async function GET() {
  try {
    const experience = await getWorkExperience();
    console.log('Public API - Work experience fetched:', experience.length, 'items');
    return NextResponse.json(experience);
  } catch (error) {
    console.error('Error fetching work experience:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work experience', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
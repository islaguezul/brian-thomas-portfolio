import { NextResponse } from 'next/server';
import { getSkillCategories } from '@/lib/database/db';

export async function GET() {
  try {
    const skills = await getSkillCategories();
    return NextResponse.json(skills);
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}
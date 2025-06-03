import { NextResponse } from 'next/server';
import { getTechStack } from '@/lib/database/db';

export async function GET() {
  try {
    const techStack = await getTechStack();
    return NextResponse.json(techStack);
  } catch (error) {
    console.error('Error fetching tech stack:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tech stack' },
      { status: 500 }
    );
  }
}
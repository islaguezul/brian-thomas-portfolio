import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSkillCategories, createSkill } from '@/lib/database/db';

export async function GET() {
  try {
    await requireAuth();
    const skillCategories = await getSkillCategories();
    return NextResponse.json(skillCategories);
  } catch (error) {
    console.error('Error fetching skill categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skill categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();
    const { categoryId, skillName } = await request.json();
    
    const skill = await createSkill(categoryId, skillName);
    return NextResponse.json(skill);
  } catch (error) {
    console.error('Error creating skill:', error);
    return NextResponse.json(
      { error: 'Failed to create skill' },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { deleteSkill, updateSkill } from '@/lib/database/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const { skillName } = await request.json();
    
    const skill = await updateSkill(id, skillName);
    return NextResponse.json(skill);
  } catch (error) {
    console.error('Error updating skill:', error);
    return NextResponse.json(
      { error: 'Failed to update skill' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    const success = await deleteSkill(id);
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to delete skill' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting skill:', error);
    return NextResponse.json(
      { error: 'Failed to delete skill' },
      { status: 500 }
    );
  }
}
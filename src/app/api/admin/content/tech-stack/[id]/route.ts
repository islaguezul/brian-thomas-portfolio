import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { updateTechStack, deleteTechStack } from '@/lib/database/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const data = await request.json();
    
    const tech = await updateTechStack(parseInt(id), data);
    
    if (!tech) {
      return NextResponse.json(
        { error: 'Failed to update tech stack item' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(tech);
  } catch (error) {
    console.error('Error updating tech stack:', error);
    return NextResponse.json(
      { error: 'Failed to update tech stack item' },
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
    const { id } = await params;
    
    const success = await deleteTechStack(parseInt(id));
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete tech stack item' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tech stack:', error);
    return NextResponse.json(
      { error: 'Failed to delete tech stack item' },
      { status: 500 }
    );
  }
}
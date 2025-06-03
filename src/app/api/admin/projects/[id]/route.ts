import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getProject, updateProject, deleteProject } from '@/lib/database/db';
import { notifyContentUpdate } from '@/lib/notify-updates';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const project = await getProject(parseInt(id));
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const data = await request.json();
    const project = await updateProject(parseInt(id), data);
    
    if (!project) {
      return NextResponse.json(
        { error: 'Failed to update project' },
        { status: 500 }
      );
    }
    
    await notifyContentUpdate('Projects', {
      action: 'updated',
      project: data.title
    });
    
    return NextResponse.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
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
    const success = await deleteProject(parseInt(id));
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete project' },
        { status: 500 }
      );
    }
    
    await notifyContentUpdate('Projects', {
      action: 'deleted'
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
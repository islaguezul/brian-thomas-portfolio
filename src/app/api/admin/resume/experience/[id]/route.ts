import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { updateWorkExperience, deleteWorkExperience } from '@/lib/database/db';
import { notifyContentUpdate } from '@/lib/notify-updates';
import { getAdminTenant } from '@/lib/admin-tenant';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const tenant = getAdminTenant(request.headers);
    const { id } = await params;
    const data = await request.json();
    const experience = await updateWorkExperience(tenant, parseInt(id), data);
    
    if (!experience) {
      return NextResponse.json(
        { error: 'Failed to update work experience' },
        { status: 500 }
      );
    }
    
    await notifyContentUpdate('Work Experience', {
      action: 'updated',
      company: data.company,
      title: data.title
    });
    
    return NextResponse.json(experience);
  } catch (error) {
    console.error('Error updating work experience:', error);
    return NextResponse.json(
      { error: 'Failed to update work experience' },
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
    const tenant = getAdminTenant(request.headers);
    const { id } = await params;
    const success = await deleteWorkExperience(tenant, parseInt(id));
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete work experience' },
        { status: 500 }
      );
    }
    
    await notifyContentUpdate('Work Experience', {
      action: 'deleted'
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting work experience:', error);
    return NextResponse.json(
      { error: 'Failed to delete work experience' },
      { status: 500 }
    );
  }
}
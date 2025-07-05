import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { updateEducation, deleteEducation } from '@/lib/database/db';
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
    const education = await updateEducation(tenant, parseInt(id), data);
    
    if (!education) {
      return NextResponse.json(
        { error: 'Failed to update education' },
        { status: 500 }
      );
    }
    
    await notifyContentUpdate('Education', {
      action: 'updated',
      institution: data.school,
      degree: data.degree
    });
    
    return NextResponse.json(education);
  } catch (error) {
    console.error('Error updating education:', error);
    return NextResponse.json(
      { error: 'Failed to update education' },
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
    const success = await deleteEducation(tenant, parseInt(id));
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete education' },
        { status: 500 }
      );
    }
    
    await notifyContentUpdate('Education', {
      action: 'deleted'
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting education:', error);
    return NextResponse.json(
      { error: 'Failed to delete education' },
      { status: 500 }
    );
  }
}
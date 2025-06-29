import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { deleteSkillCategory } from '@/lib/database/db';
import { getAdminTenant } from '@/lib/admin-tenant';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const tenant = getAdminTenant(request.headers);
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    const success = await deleteSkillCategory(tenant, id);
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to delete skill category' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting skill category:', error);
    return NextResponse.json(
      { error: 'Failed to delete skill category' },
      { status: 500 }
    );
  }
}
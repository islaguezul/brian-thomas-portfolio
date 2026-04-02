import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { reorderSkillItems } from '@/lib/database/db';
import { getAdminTenant } from '@/lib/admin-tenant';

export async function PUT(request: Request) {
  try {
    await requireAuth();
    const tenant = getAdminTenant(request.headers);
    const { type, id, direction, categoryId } = await request.json();

    const success = await reorderSkillItems(tenant, type, id, direction, categoryId);
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to reorder — item may be at boundary' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error reordering skills:', error);
    return NextResponse.json(
      { error: 'Failed to reorder' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getAdminTenant } from '@/lib/admin-tenant';
import { getCaseStudy, updateCaseStudy, deleteCaseStudy } from '@/lib/database/db';
import { notifyContentUpdate } from '@/lib/notify-updates';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const tenant = getAdminTenant(request.headers);
    const { id } = await params;
    const caseStudy = await getCaseStudy(tenant, parseInt(id));

    if (!caseStudy) {
      return NextResponse.json(
        { error: 'Case study not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(caseStudy);
  } catch (error) {
    console.error('Error fetching case study:', error);
    return NextResponse.json(
      { error: 'Failed to fetch case study' },
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
    const tenant = getAdminTenant(request.headers);
    const { id } = await params;
    const data = await request.json();
    const caseStudy = await updateCaseStudy(tenant, parseInt(id), data);

    if (!caseStudy) {
      return NextResponse.json(
        { error: 'Failed to update case study' },
        { status: 500 }
      );
    }

    await notifyContentUpdate('Case Studies', {
      action: 'updated',
      title: data.title,
    });

    return NextResponse.json(caseStudy);
  } catch (error) {
    console.error('Error updating case study:', error);
    return NextResponse.json(
      { error: 'Failed to update case study' },
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
    const success = await deleteCaseStudy(tenant, parseInt(id));

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete case study' },
        { status: 500 }
      );
    }

    await notifyContentUpdate('Case Studies', {
      action: 'deleted',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting case study:', error);
    return NextResponse.json(
      { error: 'Failed to delete case study' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAuth } from '@/lib/auth';
import { notifyContentUpdate } from '@/lib/notify-updates';
import {
  CONTENT_UPDATE_ID,
  PERSONAL_INFO_UPDATE,
  applyContentUpdate,
  getContentUpdateStatus,
} from '@/lib/database/content-updates/2026-09-director-ai-automation';

function isUnauthorized(error: unknown): boolean {
  return error instanceof Error && error.message === 'Unauthorized';
}

export async function GET() {
  try {
    await requireAuth();
    const status = await getContentUpdateStatus((text, values) => sql.query(text, values));
    return NextResponse.json({ id: CONTENT_UPDATE_ID, status });
  } catch (error) {
    if (isUnauthorized(error)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error checking content update status:', error);
    return NextResponse.json({ error: 'Failed to check content update status' }, { status: 500 });
  }
}

export async function POST() {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = await sql.connect();

  try {
    // Both tenants in one transaction: either the whole update lands or none of it does.
    await client.query('BEGIN');
    const results = await applyContentUpdate((text, values) => client.query(text, values));
    await client.query('COMMIT');

    await notifyContentUpdate('Content Update', {
      id: CONTENT_UPDATE_ID,
      title: PERSONAL_INFO_UPDATE.title,
    });

    return NextResponse.json({ success: true, id: CONTENT_UPDATE_ID, results });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error applying content update ${CONTENT_UPDATE_ID}:`, error);
    return NextResponse.json(
      {
        error: 'Failed to apply content update',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

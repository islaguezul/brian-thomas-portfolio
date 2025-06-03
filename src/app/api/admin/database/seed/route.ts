import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { seedDatabase } from '@/lib/database/seed';

export async function POST() {
  try {
    await requireAuth();

    const result = await seedDatabase();

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to seed database' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Database seed error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}
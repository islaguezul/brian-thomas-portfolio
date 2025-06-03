import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { safeMigrateHardcodedData, type MigrationMode } from '@/lib/database/migrate-hardcoded-data-safe';

export async function POST(request: Request) {
  try {
    await requireAuth();
    
    const body = await request.json();
    const mode = (body.mode || 'check') as MigrationMode;
    
    console.log(`Starting hardcoded data migration in ${mode} mode...`);
    const result = await safeMigrateHardcodedData(mode);
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { success: false, error: 'Migration failed' },
      { status: 500 }
    );
  }
}
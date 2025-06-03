import { NextResponse } from 'next/server';
import { runMigration001 } from '@/lib/database/db';

export async function POST() {
  try {
    console.log('Running database migrations...');
    
    const migration001Success = await runMigration001();
    
    if (!migration001Success) {
      throw new Error('Migration 001 failed');
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database migrations completed successfully',
      migrationsRun: ['001_increase_screenshot_file_path_size']
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Failed to run migrations', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
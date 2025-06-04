import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { runMigration002 } from '@/lib/database/db';

export async function POST() {
  try {
    await requireAuth();
    
    const success = await runMigration002();
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Migration 002 completed successfully - tech_stack level column now supports decimals'
      });
    } else {
      return NextResponse.json(
        { error: 'Migration 002 failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error running migration 002:', error);
    return NextResponse.json(
      { error: 'Failed to run migration 002' },
      { status: 500 }
    );
  }
}
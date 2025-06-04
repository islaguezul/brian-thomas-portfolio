import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { updateAllTechStackLevels } from '@/lib/database/db';

export async function POST() {
  try {
    await requireAuth();
    
    // Update all tech stack items to have 0.5 years baseline experience level
    const updated = await updateAllTechStackLevels(0.5);
    
    return NextResponse.json({ 
      success: true, 
      updated,
      message: `Updated ${updated} tech stack items to 0.5 years baseline level`
    });
  } catch (error) {
    console.error('Error updating tech levels:', error);
    return NextResponse.json(
      { error: 'Failed to update tech levels' },
      { status: 500 }
    );
  }
}
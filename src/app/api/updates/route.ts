import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const since = searchParams.get('since');
    
    if (!since) {
      return NextResponse.json({ hasUpdates: false });
    }
    
    // Check if database is configured
    if (!process.env.POSTGRES_URL) {
      // Return no updates if database is not configured
      return NextResponse.json({ hasUpdates: false });
    }
    
    // Check if any content has been updated since the given timestamp
    // Note: skills table doesn't have updated_at, so we exclude it
    const result = await sql`
      SELECT EXISTS (
        SELECT 1 FROM personal_info WHERE updated_at > ${since}
        UNION
        SELECT 1 FROM projects WHERE updated_at > ${since}
        UNION
        SELECT 1 FROM work_experience WHERE updated_at > ${since}
        UNION
        SELECT 1 FROM education WHERE updated_at > ${since}
        UNION
        SELECT 1 FROM tech_stack WHERE updated_at > ${since}
        UNION
        SELECT 1 FROM process_strategy WHERE updated_at > ${since}
      ) as has_updates
    `;
    
    return NextResponse.json({
      hasUpdates: result.rows[0]?.has_updates || false,
      updates: result.rows[0]?.has_updates ? {
        message: 'Content has been updated',
        contentType: 'Various'
      } : null
    });
  } catch (error) {
    console.error('Error checking for updates:', error);
    return NextResponse.json({ hasUpdates: false });
  }
}
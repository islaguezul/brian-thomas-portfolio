import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { sql } from '@vercel/postgres';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = [];

    // Duplicate personal_info
    try {
      await sql`
        INSERT INTO personal_info (name, title, email, phone, location, linkedin_url, github_url, bio, tagline, executive_summary, years_experience, start_year, tenant, created_at, updated_at)
        SELECT name, title, email, phone, location, linkedin_url, github_url, bio, tagline, executive_summary, years_experience, start_year, 'external', created_at, updated_at
        FROM personal_info WHERE tenant = 'internal'
        ON CONFLICT DO NOTHING
      `;
      results.push('Duplicated personal_info');
    } catch (e) {
      results.push(`personal_info error: ${e instanceof Error ? e.message : String(e)}`);
    }

    // Duplicate projects
    try {
      await sql`
        INSERT INTO projects (name, status, description, detailed_description, stage, progress, experimental, legacy, live_url, github_url, demo_url, display_order, tenant, created_at, updated_at)
        SELECT name, status, description, detailed_description, stage, progress, experimental, legacy, live_url, github_url, demo_url, display_order, 'external', created_at, updated_at
        FROM projects WHERE tenant = 'internal'
      `;
      results.push('Duplicated projects');
    } catch (e) {
      results.push(`projects error: ${e instanceof Error ? e.message : String(e)}`);
    }

    // Duplicate work_experience
    try {
      await sql`
        INSERT INTO work_experience (title, company, start_date, end_date, is_current, display_order, tenant, created_at, updated_at)
        SELECT title, company, start_date, end_date, is_current, display_order, 'external', created_at, updated_at
        FROM work_experience WHERE tenant = 'internal'
      `;
      results.push('Duplicated work_experience');
    } catch (e) {
      results.push(`work_experience error: ${e instanceof Error ? e.message : String(e)}`);
    }

    // Add more tables as needed...

    return NextResponse.json({ 
      success: true, 
      message: 'Content duplication completed',
      results 
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to duplicate content', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
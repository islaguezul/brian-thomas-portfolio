import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { sql } from '@vercel/postgres';

export async function GET(_request: NextRequest) {
  try {
    await requireAuth();
    
    // Check what's actually in the tech_stack table
    const techStackQuery = await sql`
      SELECT tenant, COUNT(*) as count, 
             array_agg(DISTINCT name ORDER BY name) as names
      FROM tech_stack 
      GROUP BY tenant
      ORDER BY tenant
    `;
    
    // Check table structure
    const tableStructure = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'tech_stack'
      ORDER BY ordinal_position
    `;
    
    // Check if there are any records at all
    const totalCount = await sql`SELECT COUNT(*) as total FROM tech_stack`;
    
    // Check recent records
    const recentRecords = await sql`
      SELECT id, name, tenant, created_at, updated_at
      FROM tech_stack 
      ORDER BY updated_at DESC 
      LIMIT 10
    `;
    
    // Check for records without tenant (old data)
    const noTenantRecords = await sql`
      SELECT COUNT(*) as count
      FROM tech_stack 
      WHERE tenant IS NULL
    `;
    
    return NextResponse.json({
      byTenant: techStackQuery.rows,
      tableStructure: tableStructure.rows,
      totalCount: totalCount.rows[0].total,
      recentRecords: recentRecords.rows,
      noTenantCount: noTenantRecords.rows[0].count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in database contents debug:', error);
    return NextResponse.json(
      { error: 'Failed to debug database contents', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
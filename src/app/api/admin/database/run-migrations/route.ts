import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAuth } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

export async function POST() {
  try {
    await requireAuth();

    const migrationsDir = path.join(process.cwd(), 'src/lib/database/migrations');
    const migrationFiles = [
      '001_increase_screenshot_file_path_size.sql',
      '002_change_tech_stack_level_to_decimal.sql', 
      '003_add_tenant_support.sql',
      '004_add_product_management_metrics.sql',
      '005_add_expertise_radar.sql'
    ];

    const results = [];
    
    for (const filename of migrationFiles) {
      try {
        console.log(`Running migration: ${filename}`);
        
        const filePath = path.join(migrationsDir, filename);
        const migrationSQL = await fs.readFile(filePath, 'utf8');
        
        // Execute the migration
        await sql.query(migrationSQL);
        
        results.push({ filename, success: true });
        console.log(`✅ Migration ${filename} completed successfully`);
      } catch (error) {
        console.error(`❌ Migration ${filename} failed:`, error);
        results.push({ 
          filename, 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        });
        // Continue with other migrations even if one fails
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failedMigrations = results.filter(r => !r.success);

    return NextResponse.json({ 
      success: failedMigrations.length === 0,
      message: `${successCount}/${migrationFiles.length} migrations completed successfully`,
      results,
      failedMigrations: failedMigrations.length > 0 ? failedMigrations : undefined
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to run migrations', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
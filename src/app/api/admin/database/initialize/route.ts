import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAuth } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

export async function POST() {
  try {
    await requireAuth();

    // Read the schema file
    const schemaPath = path.join(process.cwd(), 'src/lib/database/schema.sql');
    const schemaSQL = await fs.readFile(schemaPath, 'utf8');

    // Split by semicolons and execute each statement
    const statements = schemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      try {
        await sql.query(statement);
      } catch (error) {
        console.error('Error executing statement:', statement.substring(0, 50) + '...', error);
        // Continue with other statements even if one fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize database' },
      { status: 500 }
    );
  }
}
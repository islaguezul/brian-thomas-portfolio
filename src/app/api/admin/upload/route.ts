import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    await requireAuth();
    
    // Check if blob token is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN not found in environment');
      return NextResponse.json(
        { error: 'Blob storage not configured' },
        { status: 500 }
      );
    }
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `screenshots/${timestamp}-${sanitizedFilename}`;
    
    // Upload directly using put (server-side upload)
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    });
    
    console.log('Screenshot uploaded successfully:', blob.url);
    
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('Error handling upload:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload' },
      { status: 500 }
    );
  }
}
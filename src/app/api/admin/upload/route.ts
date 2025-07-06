import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

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
    
    const body = (await request.json()) as HandleUploadBody;
    
    // Handle the upload request from the Vercel Blob client
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Validate that the upload is for screenshots
        if (!pathname.startsWith('/screenshots/')) {
          throw new Error('Invalid upload path');
        }
        
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          maximumSizeInBytes: 50 * 1024 * 1024, // 50MB max per file
          tokenPayload: JSON.stringify({
            // Any custom data you want to associate with the upload
          }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // Log successful upload
        console.log('Screenshot uploaded successfully:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Error handling upload:', error);
    return NextResponse.json(
      { error: 'Failed to handle upload' },
      { status: 500 }
    );
  }
}
import { upload } from '@vercel/blob/client';

interface UploadOptions {
  onProgress?: (progress: number) => void;
}

export async function uploadScreenshot(
  file: File,
  options?: UploadOptions
): Promise<string> {
  try {
    // Generate a unique filename
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `screenshots/${timestamp}-${sanitizedFilename}`;

    // Upload directly to Vercel Blob
    const blob = await upload(filename, file, {
      access: 'public',
      handleUploadUrl: '/api/admin/upload',
      onUploadProgress: (progress) => {
        if (options?.onProgress) {
          const percentage = (progress.loaded / progress.total) * 100;
          options.onProgress(percentage);
        }
      },
    });

    return blob.url;
  } catch (error) {
    console.error('Error uploading to blob storage:', error);
    throw new Error('Failed to upload screenshot');
  }
}

export function isValidBlobUrl(url: string): boolean {
  // Check if URL is a Vercel Blob URL or a data URL (for backward compatibility)
  return url.startsWith('https://') || url.startsWith('data:');
}

export function getImageUrl(filePath: string): string {
  // Handle both blob URLs and legacy data URLs
  if (filePath.startsWith('https://') || filePath.startsWith('data:')) {
    return filePath;
  }
  
  // For any other format, assume it's a blob URL that needs no transformation
  return filePath;
}
interface UploadOptions {
  onProgress?: (progress: number) => void;
}

export async function uploadScreenshot(
  file: File,
  options?: UploadOptions
): Promise<string> {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);

    // Upload using fetch with manual progress tracking
    const response = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload');
    }

    const { url } = await response.json();
    return url;
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
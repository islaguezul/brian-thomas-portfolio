# Vercel Blob Storage Setup

This project now supports Vercel Blob Storage for screenshot uploads, removing all file size limitations. Until Blob Storage is configured, it will automatically fall back to data URLs.

## Current Status

**⚠️ IMPORTANT: Vercel Blob Storage is not yet configured in production.**

The code is ready, but you need to enable Blob Storage in your Vercel dashboard first. Until then, the system will automatically use data URLs as a fallback.

## What Changed

1. **No Size Limits**: Screenshots can now be any size - no more 3MB/8MB restrictions
2. **Direct Uploads**: Files upload directly from browser to Vercel's CDN
3. **Better Performance**: No base64 encoding overhead, faster page loads
4. **Progress Tracking**: Real-time upload progress indicators

## Setup Instructions

### 1. Enable Blob Storage in Vercel

1. Go to your project in Vercel Dashboard
2. Navigate to the "Storage" tab
3. Click "Create Database" and select "Blob"
4. Follow the setup wizard to create your blob store

### 2. Environment Variables

Vercel automatically adds the required environment variable:
- `BLOB_READ_WRITE_TOKEN` - Automatically injected by Vercel

**Important**: If you're still seeing "Failed to retrieve client token" errors after enabling Blob:
1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Check that `BLOB_READ_WRITE_TOKEN` is listed
4. If not, disconnect and reconnect the Blob store
5. Redeploy the project

### 3. Local Development

For local development, you'll need to:
1. Install Vercel CLI: `npm i -g vercel`
2. Link your project: `vercel link`
3. Pull environment variables: `vercel env pull .env.local`

## How It Works

1. **Upload Flow**:
   - User selects screenshots in admin panel
   - Files upload directly to Vercel Blob via `/api/admin/upload`
   - Blob URLs are stored in database (not file content)
   - Images served from Vercel's global CDN

2. **Backward Compatibility**:
   - Existing base64 data URLs still work
   - `getImageUrl()` helper handles both formats
   - No migration needed for existing data

## File Structure

- `/src/lib/blob-upload.ts` - Upload utilities and helpers
- `/src/app/api/admin/upload/route.ts` - Upload endpoint
- `/src/components/admin/ProjectForm.tsx` - Updated form with progress tracking

## Troubleshooting

### "Failed to upload" error
- Check that Blob Storage is enabled in Vercel
- Verify environment variables are loaded
- Check browser console for detailed errors

### Images not displaying
- Ensure blob URLs are being saved correctly
- Check that `getImageUrl()` is used in display components
- Verify CORS settings in Vercel Blob dashboard

## Migration from Base64

While not required (backward compatible), you can migrate existing screenshots:

1. Create a migration script to:
   - Read existing base64 data
   - Upload to Vercel Blob
   - Update database with new URLs

2. Or simply re-upload screenshots through admin panel

## Benefits

- **Unlimited file sizes** - Upload full-resolution screenshots
- **Better performance** - 33% smaller payloads, faster loads
- **Cost effective** - Pay only for storage/bandwidth used
- **Global CDN** - Fast delivery worldwide
- **Future proof** - Scalable solution for any file type
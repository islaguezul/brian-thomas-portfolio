-- Migration: Increase file_path size for project_screenshots to support base64 data URLs
-- This is a temporary solution until proper file storage is implemented

ALTER TABLE project_screenshots 
ALTER COLUMN file_path TYPE TEXT;

-- Add a comment to indicate this is temporary
COMMENT ON COLUMN project_screenshots.file_path IS 'Stores file paths or base64 data URLs (temporary until file storage service is implemented)';
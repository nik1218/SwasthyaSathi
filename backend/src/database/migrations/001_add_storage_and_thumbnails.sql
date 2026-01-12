-- Migration: Add storage tracking and thumbnail support
-- Run this if you already have an existing database

-- Add storage tracking to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS storage_used BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS storage_quota BIGINT DEFAULT 104857600; -- 100 MB

COMMENT ON COLUMN users.storage_used IS 'Total file storage used in bytes';
COMMENT ON COLUMN users.storage_quota IS 'Maximum storage quota in bytes (100 MB default)';

-- Add thumbnail and status to documents table
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending_processing';

-- Add status constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'documents_status_check'
    ) THEN
        ALTER TABLE documents
        ADD CONSTRAINT documents_status_check
        CHECK (status IN ('pending_processing', 'processed', 'failed'));
    END IF;
END $$;

-- Make title optional
ALTER TABLE documents ALTER COLUMN title DROP NOT NULL;

-- Make type have default value if not already set
ALTER TABLE documents ALTER COLUMN type SET DEFAULT 'other';

COMMENT ON COLUMN documents.thumbnail_url IS '300x400px thumbnail for list views';
COMMENT ON COLUMN documents.status IS 'Processing status: pending_processing, processed, or failed';

-- Migration: Add notes field to documents table for user annotations
-- Created: 2026-01-13

-- Add notes column to documents table
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add column comment for documentation
COMMENT ON COLUMN documents.notes IS 'User-added notes or annotations for the document';

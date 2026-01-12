-- Migration: Add OCR status tracking to documents table
-- This allows tracking OCR separately from overall AI processing
-- Created: 2026-01-13

-- Add OCR status column to documents table
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS ocr_status VARCHAR(20) DEFAULT NULL;

-- Add constraint to ensure valid OCR status values
ALTER TABLE documents
ADD CONSTRAINT documents_ocr_status_check
CHECK (ocr_status IS NULL OR ocr_status IN ('pending', 'processing', 'completed', 'failed'));

-- Create index for efficient querying of OCR status
-- Partial index only includes rows where ocr_status is not NULL
CREATE INDEX idx_documents_ocr_status ON documents(ocr_status) WHERE ocr_status IS NOT NULL;

-- Add column comment for documentation
COMMENT ON COLUMN documents.ocr_status IS 'OCR processing status: pending, processing, completed, or failed';

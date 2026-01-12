import { v4 as uuidv4 } from 'uuid';
import Anthropic from '@anthropic-ai/sdk';
import pool from '../database/pool';
import config from '../config';
import {
  Document,
  DocumentType,
  DocumentStatus,
  UploadDocumentRequest,
  UpdateDocumentRequest,
  ApiResponse,
  ErrorCode,
} from '@swasthyasathi/shared';
import logger from '../utils/logger';
import { s3Service } from './s3.service';
import { ocrService } from './ocr.service';

const anthropic = new Anthropic({
  apiKey: config.claude.apiKey,
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const STORAGE_QUOTA = 100 * 1024 * 1024; // 100 MB per user

export class DocumentService {
  async uploadDocument(
    userId: string,
    file: Express.Multer.File,
    metadata: UploadDocumentRequest
  ): Promise<ApiResponse<Document>> {
    const client = await pool.connect();

    try {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return {
          success: false,
          error: {
            code: ErrorCode.FILE_TOO_LARGE,
            message: `File size (${this.formatFileSize(file.size)}) exceeds 5 MB limit`,
          },
        };
      }

      // Validate MIME type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.mimetype)) {
        return {
          success: false,
          error: {
            code: ErrorCode.UNSUPPORTED_FILE_TYPE,
            message: 'Only JPEG, PNG, GIF, and PDF files are supported',
          },
        };
      }

      // Check storage quota
      const quotaCheck = await this.checkStorageQuota(userId, file.size);
      if (!quotaCheck.allowed) {
        return {
          success: false,
          error: {
            code: ErrorCode.STORAGE_QUOTA_EXCEEDED,
            message: quotaCheck.message || 'Storage quota exceeded',
          },
        };
      }

      await client.query('BEGIN');

      // Upload to S3 with thumbnail
      const uploadResult = await s3Service.uploadDocument(
        file.buffer,
        file.mimetype,
        userId
      );

      // Insert document record
      const documentId = uuidv4();
      const result = await client.query(
        `INSERT INTO documents (
          id, user_id, type, title, description,
          file_url, thumbnail_url, file_size, mime_type, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          documentId,
          userId,
          metadata.type || DocumentType.OTHER,
          metadata.title || 'Untitled Document',
          metadata.description || null,
          uploadResult.fileUrl,
          uploadResult.thumbnailUrl || null,
          uploadResult.fileSize,
          file.mimetype,
          DocumentStatus.PENDING_PROCESSING,
        ]
      );

      // Update user storage usage
      await client.query(
        'UPDATE users SET storage_used = storage_used + $1 WHERE id = $2',
        [uploadResult.fileSize, userId]
      );

      await client.query('COMMIT');

      const document = this.mapDbDocumentToDocument(result.rows[0]);

      // Process with OCR if requested
      if (metadata.processWithOCR) {
        this.processDocumentWithOCR(documentId, file.buffer, file.mimetype).catch(
          (error) => {
            logger.error(`OCR processing failed for document ${documentId}:`, error);
          }
        );
      }

      // Process with AI if requested
      if (metadata.processWithAI) {
        this.processDocumentWithAI(documentId, file.buffer, file.mimetype).catch(
          (error) => {
            logger.error(`AI processing failed for document ${documentId}:`, error);
          }
        );
      }

      logger.info(`Document uploaded: ${documentId} for user ${userId}`);

      return {
        success: true,
        data: document,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Document upload error:', error);
      return {
        success: false,
        error: {
          code: ErrorCode.SERVER_ERROR,
          message: 'Failed to upload document',
        },
      };
    } finally {
      client.release();
    }
  }

  async getUserDocuments(userId: string): Promise<ApiResponse<Document[]>> {
    try {
      const result = await pool.query(
        `SELECT d.*, d.ocr_status,
          da.extracted_text, da.summary, da.insights, da.processed_at
        FROM documents d
        LEFT JOIN document_ai_analysis da ON d.id = da.document_id
        WHERE d.user_id = $1
        ORDER BY d.uploaded_at DESC`,
        [userId]
      );

      const documents = result.rows.map((row) => this.mapDbDocumentToDocument(row));

      return {
        success: true,
        data: documents,
      };
    } catch (error) {
      logger.error('Error fetching user documents:', error);
      return {
        success: false,
        error: {
          code: ErrorCode.SERVER_ERROR,
          message: 'Failed to retrieve documents',
        },
      };
    }
  }

  async getDocument(documentId: string, userId: string): Promise<ApiResponse<Document>> {
    try {
      const result = await pool.query(
        `SELECT d.*,
          da.extracted_text, da.summary, da.insights, da.processed_at
        FROM documents d
        LEFT JOIN document_ai_analysis da ON d.id = da.document_id
        WHERE d.id = $1 AND d.user_id = $2`,
        [documentId, userId]
      );

      if (result.rows.length === 0) {
        return {
          success: false,
          error: {
            code: ErrorCode.NOT_FOUND,
            message: 'Document not found',
          },
        };
      }

      const document = this.mapDbDocumentToDocument(result.rows[0]);

      return {
        success: true,
        data: document,
      };
    } catch (error) {
      logger.error('Get document error:', error);
      return {
        success: false,
        error: {
          code: ErrorCode.SERVER_ERROR,
          message: 'Failed to retrieve document',
        },
      };
    }
  }

  async updateDocument(
    documentId: string,
    userId: string,
    updateData: UpdateDocumentRequest
  ): Promise<ApiResponse<Document>> {
    try {
      // Check if document exists and belongs to user
      const checkResult = await pool.query(
        'SELECT id FROM documents WHERE id = $1 AND user_id = $2',
        [documentId, userId]
      );

      if (checkResult.rows.length === 0) {
        return {
          success: false,
          error: {
            code: ErrorCode.NOT_FOUND,
            message: 'Document not found',
          },
        };
      }

      // Build dynamic UPDATE query
      const updates: string[] = [];
      const values: any[] = [];
      let paramCounter = 1;

      if (updateData.title !== undefined) {
        updates.push(`title = $${paramCounter}`);
        values.push(updateData.title);
        paramCounter++;
      }

      if (updateData.description !== undefined) {
        updates.push(`description = $${paramCounter}`);
        values.push(updateData.description);
        paramCounter++;
      }

      if (updateData.notes !== undefined) {
        updates.push(`notes = $${paramCounter}`);
        values.push(updateData.notes);
        paramCounter++;
      }

      if (updateData.type !== undefined) {
        updates.push(`type = $${paramCounter}`);
        values.push(updateData.type);
        paramCounter++;
      }

      // If no fields to update, return current document
      if (updates.length === 0) {
        return this.getDocument(documentId, userId);
      }

      // Add document ID to values
      values.push(documentId);
      values.push(userId);

      const query = `
        UPDATE documents
        SET ${updates.join(', ')}
        WHERE id = $${paramCounter} AND user_id = $${paramCounter + 1}
        RETURNING *
      `;

      const result = await pool.query(query, values);

      // Get full document with AI analysis
      const updatedDocument = await this.getDocument(documentId, userId);

      logger.info(`Document updated: ${documentId} for user ${userId}`);

      return updatedDocument;
    } catch (error) {
      logger.error('Update document error:', error);
      return {
        success: false,
        error: {
          code: ErrorCode.SERVER_ERROR,
          message: 'Failed to update document',
        },
      };
    }
  }

  async deleteDocument(documentId: string, userId: string): Promise<ApiResponse<void>> {
    const client = await pool.connect();

    try {
      // Get document details
      const result = await pool.query(
        'SELECT * FROM documents WHERE id = $1 AND user_id = $2',
        [documentId, userId]
      );

      if (result.rows.length === 0) {
        return {
          success: false,
          error: {
            code: ErrorCode.NOT_FOUND,
            message: 'Document not found',
          },
        };
      }

      const document = result.rows[0];

      await client.query('BEGIN');

      // Delete from S3
      await s3Service.deleteDocument(document.file_url);
      if (document.thumbnail_url) {
        await s3Service.deleteThumbnail(document.thumbnail_url);
      }

      // Delete from database (cascade will delete AI analysis)
      await client.query('DELETE FROM documents WHERE id = $1', [documentId]);

      // Update user storage usage
      await client.query(
        'UPDATE users SET storage_used = GREATEST(storage_used - $1, 0) WHERE id = $2',
        [document.file_size, userId]
      );

      await client.query('COMMIT');

      logger.info(`Document deleted: ${documentId} for user ${userId}`);

      return {
        success: true,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Delete document error:', error);
      return {
        success: false,
        error: {
          code: ErrorCode.SERVER_ERROR,
          message: 'Failed to delete document',
        },
      };
    } finally {
      client.release();
    }
  }

  async getStorageInfo(userId: string): Promise<ApiResponse<{
    used: number;
    quota: number;
    remaining: number;
    usedPercentage: number;
  }>> {
    try {
      const result = await pool.query(
        'SELECT storage_used, storage_quota FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return {
          success: false,
          error: {
            code: ErrorCode.NOT_FOUND,
            message: 'User not found',
          },
        };
      }

      const { storage_used, storage_quota } = result.rows[0];
      const remaining = storage_quota - storage_used;
      const usedPercentage = (storage_used / storage_quota) * 100;

      return {
        success: true,
        data: {
          used: storage_used,
          quota: storage_quota,
          remaining,
          usedPercentage,
        },
      };
    } catch (error) {
      logger.error('Get storage info error:', error);
      return {
        success: false,
        error: {
          code: ErrorCode.SERVER_ERROR,
          message: 'Failed to retrieve storage information',
        },
      };
    }
  }

  private async checkStorageQuota(
    userId: string,
    fileSize: number
  ): Promise<{ allowed: boolean; message?: string }> {
    try {
      const result = await pool.query(
        'SELECT storage_used, storage_quota FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return { allowed: false, message: 'User not found' };
      }

      const { storage_used, storage_quota } = result.rows[0];
      const newStorageUsed = storage_used + fileSize;

      if (newStorageUsed > storage_quota) {
        const remaining = storage_quota - storage_used;
        return {
          allowed: false,
          message: `Storage quota exceeded. You have ${this.formatFileSize(remaining)} remaining of your ${this.formatFileSize(storage_quota)} quota.`,
        };
      }

      return { allowed: true };
    } catch (error) {
      logger.error('Storage quota check error:', error);
      return { allowed: false, message: 'Failed to check storage quota' };
    }
  }

  private async processDocumentWithOCR(
    documentId: string,
    fileBuffer: Buffer,
    mimeType: string
  ): Promise<void> {
    try {
      logger.info(`Starting OCR processing for document ${documentId}`);

      // Update status to processing
      await pool.query(
        'UPDATE documents SET ocr_status = $1 WHERE id = $2',
        ['processing', documentId]
      );

      // Extract text using OCR service
      const ocrResult = await ocrService.extractText(fileBuffer, mimeType);

      if (!ocrResult.success) {
        logger.error(`OCR failed for document ${documentId}:`, ocrResult.error);
        await pool.query(
          'UPDATE documents SET ocr_status = $1 WHERE id = $2',
          ['failed', documentId]
        );
        return;
      }

      const { text, confidence } = ocrResult.data;
      logger.info(
        `OCR extracted ${text.length} chars with ${confidence.toFixed(2)}% confidence for document ${documentId}`
      );

      // Upsert extracted text in database
      await pool.query('BEGIN');

      const existingAnalysis = await pool.query(
        'SELECT id FROM document_ai_analysis WHERE document_id = $1',
        [documentId]
      );

      if (existingAnalysis.rows.length > 0) {
        await pool.query(
          `UPDATE document_ai_analysis
           SET extracted_text = $1, processed_at = CURRENT_TIMESTAMP
           WHERE document_id = $2`,
          [text, documentId]
        );
      } else {
        await pool.query(
          `INSERT INTO document_ai_analysis (document_id, extracted_text)
           VALUES ($1, $2)`,
          [documentId, text]
        );
      }

      await pool.query(
        'UPDATE documents SET ocr_status = $1 WHERE id = $2',
        ['completed', documentId]
      );

      await pool.query('COMMIT');

      logger.info(`OCR processing completed for document ${documentId}`);
    } catch (error) {
      logger.error(`OCR processing error for document ${documentId}:`, error);

      // Mark as failed
      await pool.query(
        'UPDATE documents SET ocr_status = $1 WHERE id = $2',
        ['failed', documentId]
      );

      throw error;
    }
  }

  private async processDocumentWithAI(
    documentId: string,
    fileBuffer: Buffer,
    mimeType: string
  ): Promise<void> {
    try {
      // Convert buffer to base64 for Claude API
      const base64Data = fileBuffer.toString('base64');

      // Determine media type for Claude
      const mediaType = this.getClaudeMediaType(mimeType);

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Data,
                },
              },
              {
                type: 'text',
                text: `This is a medical document. Please analyze it and provide:
1. Extracted text content (if readable)
2. A brief summary of the document
3. Key medical insights or important information

Please format your response as JSON with these fields: extractedText, summary, insights (array).`,
              },
            ],
          },
        ],
      });

      // Parse Claude's response
      const responseText = message.content[0].type === 'text'
        ? message.content[0].text
        : '';

      let analysis: any = {};
      try {
        // Try to parse as JSON
        analysis = JSON.parse(responseText);
      } catch {
        // If not JSON, use the raw text as summary
        analysis = {
          extractedText: '',
          summary: responseText,
          insights: [],
        };
      }

      // Store AI analysis and update document status
      await pool.query('BEGIN');

      await pool.query(
        `INSERT INTO document_ai_analysis (
          document_id, extracted_text, summary, insights
        ) VALUES ($1, $2, $3, $4)`,
        [
          documentId,
          analysis.extractedText || null,
          analysis.summary || null,
          analysis.insights || [],
        ]
      );

      await pool.query(
        'UPDATE documents SET status = $1 WHERE id = $2',
        [DocumentStatus.PROCESSED, documentId]
      );

      await pool.query('COMMIT');

      logger.info(`AI analysis completed for document ${documentId}`);
    } catch (error) {
      logger.error(`AI processing error for document ${documentId}:`, error);

      // Mark as failed
      await pool.query(
        'UPDATE documents SET status = $1 WHERE id = $2',
        [DocumentStatus.FAILED, documentId]
      );

      throw error;
    }
  }

  private getClaudeMediaType(mimeType: string): 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' {
    const typeMap: Record<string, any> = {
      'image/jpeg': 'image/jpeg',
      'image/jpg': 'image/jpeg',
      'image/png': 'image/png',
      'image/gif': 'image/gif',
      'image/webp': 'image/webp',
    };

    return typeMap[mimeType] || 'image/jpeg';
  }

  private mapDbDocumentToDocument(dbDoc: any): Document {
    const document: Document = {
      id: dbDoc.id,
      userId: dbDoc.user_id,
      type: dbDoc.type as DocumentType,
      title: dbDoc.title,
      description: dbDoc.description,
      notes: dbDoc.notes,
      fileUrl: dbDoc.file_url,
      thumbnailUrl: dbDoc.thumbnail_url,
      fileSize: parseInt(dbDoc.file_size),
      mimeType: dbDoc.mime_type,
      status: dbDoc.status as DocumentStatus,
      ocrStatus: dbDoc.ocr_status,
      uploadedAt: dbDoc.uploaded_at,
    };

    if (dbDoc.extracted_text || dbDoc.summary) {
      document.aiAnalysis = {
        extractedText: dbDoc.extracted_text,
        summary: dbDoc.summary,
        insights: dbDoc.insights || [],
        processedAt: dbDoc.processed_at,
      };
    }

    return document;
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

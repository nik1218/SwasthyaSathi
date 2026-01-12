import { Router, Response } from 'express';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import { DocumentService } from '../services/document.service';
import { ErrorCode, DocumentType, UpdateDocumentRequest } from '@swasthyasathi/shared';
import config from '../config';
import logger from '../utils/logger';

const router = Router();
const documentService = new DocumentService();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.upload.maxFileSize,
  },
  fileFilter: (req, file, cb) => {
    if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'));
    }
  },
});

// Upload document endpoint
router.post(
  '/upload',
  authenticateToken,
  upload.single('file'),
  [
    body('type').optional().isIn(Object.values(DocumentType)),
    body('title').optional().trim(),
    body('description').optional().trim(),
    body('processWithAI').optional().isBoolean(),
    body('processWithOCR').optional().isBoolean(),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Validation failed',
          details: errors.array(),
        },
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: 'No file provided',
        },
      });
    }

    try {
      const result = await documentService.uploadDocument(
        req.userId!,
        req.file,
        {
          type: req.body.type,
          title: req.body.title,
          description: req.body.description,
          processWithAI: req.body.processWithAI === 'true',
          processWithOCR: req.body.processWithOCR === 'true',
        }
      );

      if (!result.success) {
        const statusCode = result.error?.code === ErrorCode.FILE_TOO_LARGE ||
                          result.error?.code === ErrorCode.UNSUPPORTED_FILE_TYPE ||
                          result.error?.code === ErrorCode.STORAGE_QUOTA_EXCEEDED
          ? 400
          : 500;
        return res.status(statusCode).json(result);
      }

      return res.status(201).json(result);
    } catch (error: any) {
      logger.error('Document upload endpoint error:', error);

      return res.status(500).json({
        success: false,
        error: {
          code: ErrorCode.SERVER_ERROR,
          message: 'Internal server error',
        },
      });
    }
  }
);

// Get user documents endpoint
router.get(
  '/my-documents',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const result = await documentService.getUserDocuments(req.userId!);

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      logger.error('Get documents endpoint error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: ErrorCode.SERVER_ERROR,
          message: 'Internal server error',
        },
      });
    }
  }
);

// Get single document endpoint
router.get(
  '/:id',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const result = await documentService.getDocument(req.params.id, req.userId!);

      if (!result.success) {
        const statusCode = result.error?.code === ErrorCode.NOT_FOUND ? 404 : 500;
        return res.status(statusCode).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      logger.error('Get document endpoint error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: ErrorCode.SERVER_ERROR,
          message: 'Internal server error',
        },
      });
    }
  }
);

// Update document endpoint
router.put(
  '/:id',
  authenticateToken,
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().trim(),
    body('notes').optional().trim(),
    body('type').optional().isIn(Object.values(DocumentType)),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Validation failed',
          details: errors.array(),
        },
      });
    }

    try {
      const updateData: UpdateDocumentRequest = {
        title: req.body.title,
        description: req.body.description,
        notes: req.body.notes,
        type: req.body.type,
      };

      const result = await documentService.updateDocument(
        req.params.id,
        req.userId!,
        updateData
      );

      if (!result.success) {
        const statusCode = result.error?.code === ErrorCode.NOT_FOUND ? 404 : 500;
        return res.status(statusCode).json(result);
      }

      return res.status(200).json(result);
    } catch (error: any) {
      logger.error('Update document endpoint error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: ErrorCode.SERVER_ERROR,
          message: 'Internal server error',
        },
      });
    }
  }
);

// Delete document endpoint
router.delete(
  '/:id',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const result = await documentService.deleteDocument(req.params.id, req.userId!);

      if (!result.success) {
        const statusCode = result.error?.code === ErrorCode.NOT_FOUND ? 404 : 500;
        return res.status(statusCode).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      logger.error('Delete document endpoint error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: ErrorCode.SERVER_ERROR,
          message: 'Internal server error',
        },
      });
    }
  }
);

// Get storage info endpoint
router.get(
  '/storage/info',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const result = await documentService.getStorageInfo(req.userId!);

      if (!result.success) {
        const statusCode = result.error?.code === ErrorCode.NOT_FOUND ? 404 : 500;
        return res.status(statusCode).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      logger.error('Get storage info endpoint error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: ErrorCode.SERVER_ERROR,
          message: 'Internal server error',
        },
      });
    }
  }
);

export default router;

import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthService } from '../services/auth.service';
import { ErrorCode } from '@swasthyasathi/shared';
import logger from '../utils/logger';

const router = Router();
const authService = new AuthService();

// Phone number validation for Nepal: +977XXXXXXXXXX format
const phoneValidation = body('phoneNumber')
  .trim()
  .matches(/^\+977\d{10}$/)
  .withMessage('Phone number must be in format +977XXXXXXXXXX');

// Password validation: min 8 chars, at least 1 number
const passwordValidation = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters')
  .matches(/\d/)
  .withMessage('Password must contain at least one number');

// Register endpoint
router.post(
  '/register',
  [
    phoneValidation,
    passwordValidation,
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
  ],
  async (req: Request, res: Response) => {
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
      const result = await authService.register(req.body);

      if (!result.success) {
        const statusCode = result.error?.code === ErrorCode.DUPLICATE_PHONE ? 409 : 400;
        return res.status(statusCode).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      logger.error('Register endpoint error:', error);
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

// Login endpoint
router.post(
  '/login',
  [
    phoneValidation,
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req: Request, res: Response) => {
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
      const { phoneNumber, password } = req.body;
      const result = await authService.login(phoneNumber, password);

      if (!result.success) {
        return res.status(401).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      logger.error('Login endpoint error:', error);
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

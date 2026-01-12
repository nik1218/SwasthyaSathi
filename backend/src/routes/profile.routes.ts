import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import { ProfileService } from '../services/profile.service';
import { ErrorCode } from '@swasthyasathi/shared';
import logger from '../utils/logger';

const router = Router();
const profileService = new ProfileService();

// All profile routes require authentication
router.use(authenticateToken);

// GET /api/profile - Get current user's profile
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const result = await profileService.getProfile(req.userId!);

    if (!result.success) {
      const statusCode = result.error?.code === ErrorCode.NOT_FOUND ? 404 : 400;
      return res.status(statusCode).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    logger.error('Get profile endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: ErrorCode.SERVER_ERROR,
        message: 'Internal server error',
      },
    });
  }
});

// PUT /api/profile - Update current user's profile
router.put(
  '/',
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('dateOfBirth')
      .isISO8601()
      .withMessage('Date of birth must be a valid date'),
    body('gender')
      .isIn(['male', 'female', 'other'])
      .withMessage('Gender must be male, female, or other'),
    body('bloodType')
      .optional()
      .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
      .withMessage('Invalid blood type'),
    body('emergencyContactPhone')
      .optional()
      .matches(/^\+?[0-9\s\-()]+$/)
      .withMessage('Invalid phone number format'),
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
      const result = await profileService.updateProfile(req.userId!, req.body);

      if (!result.success) {
        const statusCode = result.error?.code === ErrorCode.NOT_FOUND ? 404 : 400;
        return res.status(statusCode).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      logger.error('Update profile endpoint error:', error);
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

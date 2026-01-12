import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { ErrorCode } from '@swasthyasathi/shared';
import logger from '../utils/logger';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: ErrorCode.UNAUTHORIZED,
        message: 'Access token is missing',
      },
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    logger.warn('Invalid token attempt:', error);
    return res.status(403).json({
      success: false,
      error: {
        code: ErrorCode.FORBIDDEN,
        message: 'Invalid or expired token',
      },
    });
  }
};

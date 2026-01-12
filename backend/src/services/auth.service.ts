import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import pool from '../database/pool';
import config from '../config';
import { User, AuthResponse, RegisterData, ErrorCode } from '@swasthyasathi/shared';
import logger from '../utils/logger';

const SALT_ROUNDS = 10;

export class AuthService {
  // Password validation: min 8 chars, at least 1 number
  private validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/\d/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
    return { valid: true };
  }

  // Phone number validation for Nepal: should start with +977
  private validatePhoneNumber(phoneNumber: string): { valid: boolean; message?: string } {
    // Remove spaces and dashes
    const cleanPhone = phoneNumber.replace(/[\s-]/g, '');

    // Check if it starts with +977 and has 10 digits after
    if (!cleanPhone.match(/^\+977\d{10}$/)) {
      return {
        valid: false,
        message: 'Phone number must be in format +977XXXXXXXXXX (Nepal)',
      };
    }
    return { valid: true };
  }

  async register(data: RegisterData): Promise<{ success: boolean; data?: AuthResponse; error?: any }> {
    const client = await pool.connect();

    try {
      // Validate password
      const passwordValidation = this.validatePassword(data.password);
      if (!passwordValidation.valid) {
        return {
          success: false,
          error: {
            code: ErrorCode.WEAK_PASSWORD,
            message: passwordValidation.message,
          },
        };
      }

      // Validate phone number
      const phoneValidation = this.validatePhoneNumber(data.phoneNumber);
      if (!phoneValidation.valid) {
        return {
          success: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: phoneValidation.message,
          },
        };
      }

      await client.query('BEGIN');

      // Check if phone number already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE phone_number = $1',
        [data.phoneNumber]
      );

      if (existingUser.rows.length > 0) {
        await client.query('ROLLBACK');
        return {
          success: false,
          error: {
            code: ErrorCode.DUPLICATE_PHONE,
            message: 'Phone number already registered',
          },
        };
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

      // Insert user
      const userId = uuidv4();
      const userResult = await client.query(
        `INSERT INTO users (
          id, phone_number, password_hash, full_name, country
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [
          userId,
          data.phoneNumber,
          passwordHash,
          data.fullName,
          'Nepal',
        ]
      );

      // Create empty profile
      await client.query(
        'INSERT INTO user_profiles (user_id) VALUES ($1)',
        [userId]
      );

      await client.query('COMMIT');

      const user = this.mapDbUserToUser(userResult.rows[0]);
      const token = this.generateToken(userId);

      logger.info(`New user registered: ${user.phoneNumber}`);

      return {
        success: true,
        data: { user, token },
      };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Registration error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async login(phoneNumber: string, password: string): Promise<{ success: boolean; data?: AuthResponse; error?: any }> {
    try {
      // Validate phone number format
      const phoneValidation = this.validatePhoneNumber(phoneNumber);
      if (!phoneValidation.valid) {
        return {
          success: false,
          error: {
            code: ErrorCode.INVALID_CREDENTIALS,
            message: 'Invalid phone number or password',
          },
        };
      }

      const result = await pool.query(
        'SELECT * FROM users WHERE phone_number = $1',
        [phoneNumber]
      );

      if (result.rows.length === 0) {
        return {
          success: false,
          error: {
            code: ErrorCode.INVALID_CREDENTIALS,
            message: 'Invalid phone number or password',
          },
        };
      }

      const dbUser = result.rows[0];
      const isValidPassword = await bcrypt.compare(password, dbUser.password_hash);

      if (!isValidPassword) {
        return {
          success: false,
          error: {
            code: ErrorCode.INVALID_CREDENTIALS,
            message: 'Invalid phone number or password',
          },
        };
      }

      const user = this.mapDbUserToUser(dbUser);
      const token = this.generateToken(user.id);

      logger.info(`User logged in: ${user.phoneNumber}`);

      return {
        success: true,
        data: { user, token },
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  private generateToken(userId: string): string {
    return jwt.sign({ userId }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn, // 7 days
    });
  }

  private mapDbUserToUser(dbUser: any): User {
    return {
      id: dbUser.id,
      email: dbUser.email || '',
      phoneNumber: dbUser.phone_number,
      fullName: dbUser.full_name,
      dateOfBirth: dbUser.date_of_birth,
      gender: dbUser.gender,
      bloodType: dbUser.blood_type,
      allergies: dbUser.allergies,
      chronicConditions: dbUser.chronic_conditions,
      emergencyContactName: dbUser.emergency_contact_name,
      emergencyContactPhone: dbUser.emergency_contact_phone,
      address: dbUser.address || '',
      city: dbUser.city || '',
      country: dbUser.country || 'Nepal',
      profileComplete: dbUser.profile_complete,
      createdAt: dbUser.created_at,
      updatedAt: dbUser.updated_at,
    };
  }
}

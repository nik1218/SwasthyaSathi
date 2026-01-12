import pool from '../database/pool';
import { User, UpdateProfileData, ErrorCode } from '@swasthyasathi/shared';
import logger from '../utils/logger';

export class ProfileService {
  async getProfile(userId: string): Promise<{ success: boolean; data?: User; error?: any }> {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
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

      const user = this.mapDbUserToUser(result.rows[0]);

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      logger.error('Get profile error:', error);
      throw error;
    }
  }

  async updateProfile(
    userId: string,
    data: UpdateProfileData
  ): Promise<{ success: boolean; data?: User; error?: any }> {
    try {
      // Validate required fields
      if (!data.fullName || !data.dateOfBirth || !data.gender) {
        return {
          success: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: 'Full name, date of birth, and gender are required',
          },
        };
      }

      // Check if profile is complete
      const profileComplete = !!(
        data.fullName &&
        data.dateOfBirth &&
        data.gender
      );

      const result = await pool.query(
        `UPDATE users SET
          full_name = $1,
          date_of_birth = $2,
          gender = $3,
          blood_type = $4,
          allergies = $5,
          chronic_conditions = $6,
          emergency_contact_name = $7,
          emergency_contact_phone = $8,
          profile_complete = $9,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING *`,
        [
          data.fullName,
          data.dateOfBirth,
          data.gender,
          data.bloodType || null,
          data.allergies || null,
          data.chronicConditions || null,
          data.emergencyContactName || null,
          data.emergencyContactPhone || null,
          profileComplete,
          userId,
        ]
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

      const user = this.mapDbUserToUser(result.rows[0]);

      logger.info(`Profile updated for user: ${userId}`);

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      logger.error('Update profile error:', error);
      throw error;
    }
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

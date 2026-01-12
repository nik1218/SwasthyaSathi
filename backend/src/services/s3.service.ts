import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// AWS S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1', // Mumbai region for Nepal
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'swasthyasathi-documents';
const THUMBNAIL_WIDTH = 300;
const THUMBNAIL_HEIGHT = 400;

export interface UploadResult {
  fileUrl: string;
  thumbnailUrl?: string;
  fileSize: number;
}

export class S3Service {
  /**
   * Upload file to S3 and generate thumbnail
   */
  async uploadDocument(
    buffer: Buffer,
    mimeType: string,
    userId: string
  ): Promise<UploadResult> {
    try {
      // Generate unique filename
      const fileExtension = this.getFileExtension(mimeType);
      const fileName = `${userId}/${uuidv4()}${fileExtension}`;
      const thumbnailName = `${userId}/thumbnails/${uuidv4()}_thumb${fileExtension}`;

      // Upload original file
      const uploadCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: mimeType,
        ACL: 'private', // Private files, access via presigned URLs later if needed
      });

      await s3Client.send(uploadCommand);

      const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${fileName}`;
      const fileSize = buffer.length;

      // Generate and upload thumbnail
      let thumbnailUrl: string | undefined;
      if (this.isImageType(mimeType)) {
        thumbnailUrl = await this.generateAndUploadThumbnail(buffer, thumbnailName, mimeType);
      }

      return {
        fileUrl,
        thumbnailUrl,
        fileSize,
      };
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  /**
   * Generate thumbnail and upload to S3
   */
  private async generateAndUploadThumbnail(
    originalBuffer: Buffer,
    thumbnailName: string,
    mimeType: string
  ): Promise<string> {
    try {
      // Generate thumbnail using sharp
      const thumbnailBuffer = await sharp(originalBuffer)
        .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 80 }) // Convert to JPEG for consistency
        .toBuffer();

      // Upload thumbnail
      const uploadCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: thumbnailName,
        Body: thumbnailBuffer,
        ContentType: 'image/jpeg',
        ACL: 'private',
      });

      await s3Client.send(uploadCommand);

      return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${thumbnailName}`;
    } catch (error) {
      console.error('Thumbnail generation error:', error);
      // Return undefined if thumbnail generation fails (non-critical)
      return '';
    }
  }

  /**
   * Delete file from S3
   */
  async deleteDocument(fileUrl: string): Promise<void> {
    try {
      const fileName = this.extractFileNameFromUrl(fileUrl);

      const deleteCommand = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
      });

      await s3Client.send(deleteCommand);
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new Error('Failed to delete file from S3');
    }
  }

  /**
   * Delete thumbnail from S3
   */
  async deleteThumbnail(thumbnailUrl: string): Promise<void> {
    try {
      const thumbnailName = this.extractFileNameFromUrl(thumbnailUrl);

      const deleteCommand = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: thumbnailName,
      });

      await s3Client.send(deleteCommand);
    } catch (error) {
      console.error('S3 thumbnail delete error:', error);
      // Non-critical error, continue
    }
  }

  /**
   * Get file extension from MIME type
   */
  private getFileExtension(mimeType: string): string {
    const extensions: { [key: string]: string } = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'application/pdf': '.pdf',
    };

    return extensions[mimeType] || '.bin';
  }

  /**
   * Check if MIME type is an image
   */
  private isImageType(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  /**
   * Extract filename from S3 URL
   */
  private extractFileNameFromUrl(url: string): string {
    const urlParts = url.split(`${BUCKET_NAME}.s3.`);
    if (urlParts.length < 2) {
      throw new Error('Invalid S3 URL');
    }

    const pathPart = urlParts[1].split('/').slice(1).join('/');
    return pathPart;
  }
}

export const s3Service = new S3Service();

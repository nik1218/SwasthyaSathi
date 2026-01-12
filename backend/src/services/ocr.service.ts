import { ImageAnnotatorClient } from '@google-cloud/vision';
import logger from '../utils/logger';
import config from '../config';

// Initialize Google Vision client
const visionClient = new ImageAnnotatorClient({
  apiKey: config.googleCloud.visionApiKey,
});

export interface OcrResult {
  text: string;
  confidence: number;
  language: string;
  boundingBoxes?: Array<{
    text: string;
    vertices: Array<{ x: number; y: number }>;
  }>;
}

export interface OcrError {
  code: string;
  message: string;
  retryable: boolean;
}

export class OcrService {
  /**
   * Extract text from image buffer using Google Cloud Vision API
   * Handles both printed and handwritten text
   */
  async extractText(
    buffer: Buffer,
    mimeType: string
  ): Promise<{ success: true; data: OcrResult } | { success: false; error: OcrError }> {
    try {
      const startTime = Date.now();

      // Validate supported image types
      if (!this.isSupportedImageType(mimeType)) {
        logger.warn(`Unsupported OCR MIME type: ${mimeType}`);
        return {
          success: false,
          error: {
            code: 'UNSUPPORTED_TYPE',
            message: `OCR not supported for ${mimeType}. Only images are supported.`,
            retryable: false,
          },
        };
      }

      // Call Google Vision API with timeout
      const [result] = await Promise.race([
        visionClient.textDetection({
          image: { content: buffer },
        }),
        this.createTimeout(10000), // 10 second timeout
      ]) as any;

      const processingTime = Date.now() - startTime;

      // Handle API errors
      if (result.error) {
        logger.error('Google Vision API error:', result.error);
        return {
          success: false,
          error: {
            code: 'API_ERROR',
            message: result.error.message || 'Vision API returned an error',
            retryable: this.isRetryableError(result.error),
          },
        };
      }

      // Extract text annotations
      const textAnnotations = result.textAnnotations || [];

      if (textAnnotations.length === 0) {
        logger.info('No text detected in image');
        return {
          success: true,
          data: {
            text: '',
            confidence: 0,
            language: 'en',
            boundingBoxes: [],
          },
        };
      }

      // First annotation contains full text, subsequent ones are individual words/blocks
      const fullTextAnnotation = textAnnotations[0];
      const extractedText = fullTextAnnotation.description || '';

      // Calculate average confidence from individual annotations
      const confidence = this.calculateAverageConfidence(textAnnotations.slice(1));

      // Detect language (Google Vision provides this)
      const detectedLanguage = fullTextAnnotation.locale || 'en';

      // Extract bounding boxes for structured data (optional, for future features)
      const boundingBoxes = textAnnotations.slice(1).map((annotation: any) => ({
        text: annotation.description || '',
        vertices: annotation.boundingPoly?.vertices || [],
      }));

      logger.info(
        `OCR completed in ${processingTime}ms. Extracted ${extractedText.length} characters with ${confidence.toFixed(2)}% confidence`
      );

      // Warn if low confidence
      if (confidence < 60) {
        logger.warn(
          `Low OCR confidence (${confidence.toFixed(2)}%) - image quality may be poor`
        );
      }

      return {
        success: true,
        data: {
          text: extractedText,
          confidence,
          language: detectedLanguage,
          boundingBoxes,
        },
      };
    } catch (error: any) {
      logger.error('OCR extraction error:', error);

      // Handle timeout
      if (error.message === 'OCR_TIMEOUT') {
        return {
          success: false,
          error: {
            code: 'TIMEOUT',
            message: 'OCR processing timed out after 10 seconds',
            retryable: true,
          },
        };
      }

      // Handle quota exceeded
      if (error.code === 8 || error.message?.includes('quota')) {
        return {
          success: false,
          error: {
            code: 'QUOTA_EXCEEDED',
            message: 'Google Vision API quota exceeded',
            retryable: false,
          },
        };
      }

      // Generic error
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'Failed to extract text from image',
          retryable: true,
        },
      };
    }
  }

  /**
   * Check if MIME type is supported for OCR
   */
  private isSupportedImageType(mimeType: string): boolean {
    const supportedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp',
      'image/tiff',
    ];
    return supportedTypes.includes(mimeType);
  }

  /**
   * Calculate average confidence from text annotations
   */
  private calculateAverageConfidence(annotations: any[]): number {
    if (annotations.length === 0) return 100; // Full text has no confidence score, assume 100

    const confidences = annotations
      .map((a) => a.confidence || 0)
      .filter((c) => c > 0);

    if (confidences.length === 0) return 100;

    const sum = confidences.reduce((acc, val) => acc + val, 0);
    return (sum / confidences.length) * 100; // Convert to percentage
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    const retryableCodes = [
      'UNAVAILABLE',
      'DEADLINE_EXCEEDED',
      'RESOURCE_EXHAUSTED',
    ];
    return retryableCodes.includes(error.code);
  }

  /**
   * Create timeout promise
   */
  private createTimeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OCR_TIMEOUT')), ms);
    });
  }
}

export const ocrService = new OcrService();

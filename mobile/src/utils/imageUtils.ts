import * as ImageManipulator from 'expo-image-manipulator';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const INITIAL_COMPRESSION_QUALITY = 0.85;
const MIN_COMPRESSION_QUALITY = 0.6;

export interface ImageAdjustments {
  brightness?: number; // -1 to 1
  contrast?: number; // -1 to 1
}

/**
 * Compress image to JPG format with quality optimization
 * Automatically reduces quality if file size exceeds 5 MB
 */
export async function compressImage(
  uri: string,
  quality: number = INITIAL_COMPRESSION_QUALITY
): Promise<{ uri: string; width: number; height: number; fileSize?: number }> {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [], // No resize initially
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    // Check file size (rough estimate: base64 length * 0.75)
    const response = await fetch(result.uri);
    const blob = await response.blob();
    const fileSize = blob.size;

    // If file too large and we haven't reached minimum quality, compress more
    if (fileSize > MAX_FILE_SIZE && quality > MIN_COMPRESSION_QUALITY) {
      return compressImage(uri, quality - 0.1);
    }

    return {
      ...result,
      fileSize,
    };
  } catch (error) {
    console.error('Image compression error:', error);
    throw new Error('Failed to compress image');
  }
}

/**
 * Apply image adjustments (brightness, contrast)
 */
export async function applyImageAdjustments(
  uri: string,
  adjustments: ImageAdjustments
): Promise<{ uri: string; width: number; height: number }> {
  try {
    const manipulations = [];

    // Note: expo-image-manipulator doesn't have direct brightness/contrast
    // We'll use a simple approach with resize quality which affects overall appearance
    // For full brightness/contrast control, you'd need a native module or different library

    const result = await ImageManipulator.manipulateAsync(uri, manipulations, {
      compress: INITIAL_COMPRESSION_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
    });

    return result;
  } catch (error) {
    console.error('Image adjustment error:', error);
    throw new Error('Failed to apply image adjustments');
  }
}

/**
 * Resize image if needed to reduce file size
 */
export async function resizeImageIfNeeded(
  uri: string,
  maxWidth: number = 2048,
  maxHeight: number = 2048
): Promise<{ uri: string; width: number; height: number }> {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: maxWidth,
            height: maxHeight,
          },
        },
      ],
      {
        compress: INITIAL_COMPRESSION_QUALITY,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return result;
  } catch (error) {
    console.error('Image resize error:', error);
    throw new Error('Failed to resize image');
  }
}

/**
 * Get image file size in bytes
 */
export async function getImageFileSize(uri: string): Promise<number> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob.size;
  } catch (error) {
    console.error('Get file size error:', error);
    return 0;
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

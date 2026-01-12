import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  compressImage,
  getImageFileSize,
  formatFileSize,
} from '../../utils/imageUtils';

interface PhotoPreviewProps {
  photoUri: string;
  onRetake: () => void;
  onUsePhoto: (uri: string) => void;
}

const PhotoPreview: React.FC<PhotoPreviewProps> = ({
  photoUri,
  onRetake,
  onUsePhoto,
}) => {
  const [processedUri, setProcessedUri] = useState<string>(photoUri);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(true);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);

  useEffect(() => {
    processImage();
  }, [photoUri]);

  const processImage = async () => {
    try {
      setIsProcessing(true);

      // Get original file size
      const originalFileSize = await getImageFileSize(photoUri);
      setOriginalSize(originalFileSize);

      // Compress image
      const compressed = await compressImage(photoUri);
      setProcessedUri(compressed.uri);

      // Get compressed file size
      const compressedFileSize = compressed.fileSize || 0;
      setCompressedSize(compressedFileSize);

      setIsProcessing(false);
    } catch (error) {
      console.error('Image processing error:', error);
      Alert.alert('Error', 'Failed to process image. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleUsePhoto = () => {
    if (compressedSize > 5 * 1024 * 1024) {
      Alert.alert(
        'File Too Large',
        `Image size (${formatFileSize(compressedSize)}) exceeds 5 MB limit. Please try again with better lighting or a smaller document.`,
        [{ text: 'OK' }]
      );
      return;
    }

    onUsePhoto(processedUri);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={onRetake}>
          <Feather name="x" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preview</Text>
        <View style={styles.headerButton} />
      </View>

      {/* Image Preview */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          {isProcessing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Processing image...</Text>
            </View>
          ) : (
            <Image
              source={{ uri: processedUri }}
              style={styles.image}
              resizeMode="contain"
            />
          )}
        </View>

        {/* File Info */}
        {!isProcessing && (
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Feather name="file" size={20} color="#007AFF" />
              <Text style={styles.infoLabel}>Original Size:</Text>
              <Text style={styles.infoValue}>{formatFileSize(originalSize)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Feather name="package" size={20} color="#4CAF50" />
              <Text style={styles.infoLabel}>Compressed:</Text>
              <Text style={styles.infoValue}>{formatFileSize(compressedSize)}</Text>
            </View>
            {compressedSize > 5 * 1024 * 1024 && (
              <View style={styles.warningBanner}>
                <Feather name="alert-circle" size={20} color="#FF9800" />
                <Text style={styles.warningText}>
                  Image exceeds 5 MB limit
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Image Adjustments Info */}
        <View style={styles.adjustmentsCard}>
          <Feather name="info" size={20} color="#666" />
          <Text style={styles.adjustmentsText}>
            Image automatically compressed to JPG format at 85% quality for
            optimal file size and clarity.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.retakeButton}
          onPress={onRetake}
          disabled={isProcessing}
        >
          <Feather name="camera" size={20} color="#666" />
          <Text style={styles.retakeText}>Retake</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.useButton,
            isProcessing && styles.useButtonDisabled,
          ]}
          onPress={handleUsePhoto}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Feather name="check" size={20} color="#FFF" />
              <Text style={styles.useText}>Use Photo</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 16,
  },
  infoCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '600',
    marginLeft: 8,
  },
  adjustmentsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  adjustmentsText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 30,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 12,
  },
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    gap: 8,
  },
  retakeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  useButton: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    gap: 8,
  },
  useButtonDisabled: {
    opacity: 0.6,
  },
  useText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});

export default PhotoPreview;

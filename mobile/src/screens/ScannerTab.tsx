import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import DocumentScanner from './camera/DocumentScanner';
import { DocumentType } from '@swasthyasathi/shared';
import apiService from '../services/api.service';

const ScannerTab: React.FC = () => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedDocuments, setScannedDocuments] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleOpenScanner = () => {
    setIsScannerOpen(true);
  };

  const handleCloseScanner = () => {
    setIsScannerOpen(false);
  };

  const handleDocumentScanned = async (uri: string) => {
    setIsScannerOpen(false);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Extract file name from URI
      const fileName = uri.split('/').pop() || 'document.jpg';

      // Upload document
      const document = await apiService.uploadDocument(
        {
          uri,
          type: 'image/jpeg',
          name: fileName,
        },
        {
          type: DocumentType.OTHER,
          title: `Scanned Document ${new Date().toLocaleDateString()}`,
          processWithAI: false, // Can be enabled later
        },
        (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        }
      );

      setScannedDocuments((prev) => [...prev, document.id]);
      setIsUploading(false);

      Alert.alert(
        'Upload Successful',
        'Your document has been uploaded and saved.',
        [
          {
            text: 'Scan Another',
            onPress: () => setIsScannerOpen(true),
          },
          {
            text: 'Done',
            style: 'cancel',
          },
        ]
      );
    } catch (error: any) {
      setIsUploading(false);
      console.error('Upload error:', error);

      const errorMessage = error.response?.data?.error?.message ||
                          'Failed to upload document. Please try again.';

      Alert.alert(
        'Upload Failed',
        errorMessage,
        [
          {
            text: 'Retry',
            onPress: () => handleDocumentScanned(uri),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    }
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <Feather name="camera" size={64} color="#007AFF" />
        </View>

        <Text style={styles.title}>Document Scanner</Text>
        <Text style={styles.subtitle}>Upload & Analyze Medical Documents</Text>

        <View style={styles.descriptionBox}>
          <Text style={styles.description}>
            AI-powered document scanner for medical records:
          </Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• Capture photos of documents</Text>
            <Text style={styles.featureItem}>• Upload from gallery</Text>
            <Text style={styles.featureItem}>• Automatic compression (JPG, 5MB max)</Text>
            <Text style={styles.featureItem}>• Document frame guidance</Text>
            <Text style={styles.featureItem}>• Preview before saving</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.scanButton, isUploading && styles.scanButtonDisabled]}
          onPress={handleOpenScanner}
          disabled={isUploading}
        >
          <Feather name="camera" size={24} color="#FFF" />
          <Text style={styles.scanButtonText}>Scan Document</Text>
        </TouchableOpacity>

        {isUploading && (
          <View style={styles.uploadingCard}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.uploadingText}>Uploading document...</Text>
            <Text style={styles.uploadingProgress}>{uploadProgress}%</Text>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${uploadProgress}%` }]}
              />
            </View>
          </View>
        )}

        {scannedDocuments.length > 0 && !isUploading && (
          <View style={styles.countBadge}>
            <Feather name="file-text" size={16} color="#4CAF50" />
            <Text style={styles.countText}>
              {scannedDocuments.length} document{scannedDocuments.length !== 1 ? 's' : ''} uploaded
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={isScannerOpen}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <DocumentScanner
          onDocumentScanned={handleDocumentScanned}
          onClose={handleCloseScanner}
        />
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666666',
    marginBottom: 32,
  },
  descriptionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  description: {
    fontSize: 15,
    color: '#333333',
    marginBottom: 16,
    fontWeight: '500',
  },
  featureList: {
    gap: 8,
  },
  featureItem: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
  },
  scanButton: {
    marginTop: 32,
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  scanButtonDisabled: {
    opacity: 0.5,
  },
  uploadingCard: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  uploadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
  },
  uploadingProgress: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
    marginTop: 8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  countBadge: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  countText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ScannerTab;

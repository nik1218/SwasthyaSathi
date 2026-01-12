import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Dimensions,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Document, DocumentType } from '@swasthyasathi/shared';
import apiService from '../services/api.service';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import ViewShot from 'react-native-view-shot';

const { width: screenWidth } = Dimensions.get('window');

interface DocumentDetailScreenProps {
  route: any;
  navigation: any;
}

const DocumentDetailScreen: React.FC<DocumentDetailScreenProps> = ({ route, navigation }) => {
  const { documentId } = route.params;
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedNotes, setEditedNotes] = useState('');
  const [editedType, setEditedType] = useState<DocumentType>(DocumentType.OTHER);
  const [saving, setSaving] = useState(false);
  const viewShotRef = React.useRef<ViewShot>(null);

  useEffect(() => {
    loadDocument();
  }, [documentId]);

  useEffect(() => {
    if (document) {
      navigation.setOptions({
        title: document.title || 'Document',
        headerRight: () => (
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
              <Feather name="edit-2" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
              <Feather name="share-2" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDownload} style={styles.headerButton}>
              <Feather name="download" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
              <Feather name="trash-2" size={20} color="#FF5252" />
            </TouchableOpacity>
          </View>
        ),
      });
    }
  }, [document, navigation]);

  const loadDocument = async () => {
    try {
      setError(null);
      const doc = await apiService.getDocument(documentId);
      setDocument(doc);
      setEditedTitle(doc.title || '');
      setEditedDescription(doc.description || '');
      setEditedNotes(doc.notes || '');
      setEditedType(doc.type);
    } catch (err: any) {
      console.error('Failed to load document:', err);
      setError('Failed to load document details.');
      Alert.alert('Error', 'Failed to load document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!document) return;

    try {
      setSaving(true);
      const updatedDoc = await apiService.updateDocument(documentId, {
        title: editedTitle,
        description: editedDescription,
        notes: editedNotes,
        type: editedType,
      });
      setDocument(updatedDoc);
      setEditModalVisible(false);
      Alert.alert('Success', 'Document updated successfully');
    } catch (err: any) {
      console.error('Failed to update document:', err);
      Alert.alert('Error', 'Failed to update document. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteDocument(documentId);
              Alert.alert('Success', 'Document deleted successfully');
              navigation.goBack();
            } catch (err: any) {
              console.error('Failed to delete document:', err);
              Alert.alert('Error', 'Failed to delete document. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    if (!document) return;

    try {
      // Download the image first
      const fileUri = FileSystem.documentDirectory + `document_${documentId}.jpg`;
      const downloadResult = await FileSystem.downloadAsync(document.fileUrl, fileUri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: document.mimeType,
          dialogTitle: 'Share Document',
        });
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (err: any) {
      console.error('Failed to share document:', err);
      Alert.alert('Error', 'Failed to share document. Please try again.');
    }
  };

  const handleDownload = async () => {
    if (!document) return;

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to save images to your library');
        return;
      }

      const fileUri = FileSystem.documentDirectory + `document_${documentId}.jpg`;
      const downloadResult = await FileSystem.downloadAsync(document.fileUrl, fileUri);

      const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
      await MediaLibrary.createAlbumAsync('SwasthyaSathi', asset, false);

      Alert.alert('Success', 'Document saved to your photo library');
    } catch (err: any) {
      console.error('Failed to download document:', err);
      Alert.alert('Error', 'Failed to save document. Please try again.');
    }
  };

  const formatDate = (date: Date): string => {
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + ' ' + sizes[i];
  };

  const parseAIInsights = (insights?: string[]) => {
    if (!insights || insights.length === 0) return null;

    const parsed = {
      medicines: [] as { name: string; dosage?: string }[],
      testResults: [] as { test: string; value: string }[],
      diagnosis: '',
      doctor: '',
      hospital: '',
    };

    insights.forEach((insight) => {
      const lower = insight.toLowerCase();
      if (lower.includes('medicine') || lower.includes('medication') || lower.includes('drug')) {
        const match = insight.match(/([A-Za-z\s]+)(\d+\s*mg|\d+\s*ml)?/);
        if (match) {
          parsed.medicines.push({ name: match[1].trim(), dosage: match[2]?.trim() });
        }
      } else if (lower.includes('test') || lower.includes('result')) {
        const parts = insight.split(':');
        if (parts.length === 2) {
          parsed.testResults.push({ test: parts[0].trim(), value: parts[1].trim() });
        }
      } else if (lower.includes('diagnosis')) {
        parsed.diagnosis = insight;
      } else if (lower.includes('doctor') || lower.includes('dr.')) {
        parsed.doctor = insight;
      } else if (lower.includes('hospital') || lower.includes('clinic')) {
        parsed.hospital = insight;
      }
    });

    return parsed;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading document...</Text>
      </View>
    );
  }

  if (error || !document) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={64} color="#FF5252" />
        <Text style={styles.errorTitle}>Failed to load document</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadDocument}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const parsedInsights = parseAIInsights(document.aiAnalysis?.insights);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Document Image */}
      <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }}>
        <View style={styles.imageContainer}>
          {imageLoading && (
            <View style={styles.imageLoadingOverlay}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          )}
          <Image
            source={{ uri: document.fileUrl }}
            style={styles.documentImage}
            resizeMode="contain"
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              Alert.alert('Error', 'Failed to load image');
            }}
          />
        </View>
      </ViewShot>

      {/* Document Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.documentTitle}>{document.title || 'Untitled Document'}</Text>

        {document.description && (
          <Text style={styles.documentDescription}>{document.description}</Text>
        )}

        {document.notes && (
          <View style={styles.notesSection}>
            <View style={styles.notesSectionHeader}>
              <Feather name="file-text" size={16} color="#007AFF" />
              <Text style={styles.notesSectionTitle}>Your Notes</Text>
            </View>
            <Text style={styles.notesText}>{document.notes}</Text>
          </View>
        )}

        <View style={styles.divider} />

        {/* Metadata Grid */}
        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Feather name="calendar" size={16} color="#666" />
            <View style={styles.metaTextContainer}>
              <Text style={styles.metaLabel}>Upload Date</Text>
              <Text style={styles.metaValue}>{formatDate(document.uploadedAt)}</Text>
            </View>
          </View>

          <View style={styles.metaItem}>
            <Feather name="file" size={16} color="#666" />
            <View style={styles.metaTextContainer}>
              <Text style={styles.metaLabel}>File Size</Text>
              <Text style={styles.metaValue}>{formatFileSize(document.fileSize)}</Text>
            </View>
          </View>

          <View style={styles.metaItem}>
            <Feather name="type" size={16} color="#666" />
            <View style={styles.metaTextContainer}>
              <Text style={styles.metaLabel}>Type</Text>
              <Text style={styles.metaValue}>{document.type.replace(/_/g, ' ').toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.metaItem}>
            <Feather name="image" size={16} color="#666" />
            <View style={styles.metaTextContainer}>
              <Text style={styles.metaLabel}>Format</Text>
              <Text style={styles.metaValue}>{document.mimeType.split('/')[1].toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Processing Status */}
        {document.status === 'pending_processing' && (
          <View style={styles.statusBanner}>
            <Feather name="clock" size={16} color="#FF9800" />
            <Text style={styles.statusBannerText}>Document is being processed...</Text>
          </View>
        )}

        {document.ocrStatus === 'completed' && (
          <View style={[styles.statusBanner, styles.successBanner]}>
            <Feather name="check-circle" size={16} color="#4CAF50" />
            <Text style={[styles.statusBannerText, styles.successBannerText]}>
              Text extracted successfully
            </Text>
          </View>
        )}
      </View>

      {/* AI Analysis Card */}
      {document.aiAnalysis && (
        <View style={styles.aiCard}>
          <View style={styles.aiCardHeader}>
            <Feather name="zap" size={20} color="#007AFF" />
            <Text style={styles.aiCardTitle}>AI Analysis</Text>
          </View>

          {document.aiAnalysis.summary && (
            <View style={styles.aiSection}>
              <Text style={styles.aiSectionTitle}>Summary</Text>
              <Text style={styles.aiText}>{document.aiAnalysis.summary}</Text>
            </View>
          )}

          {document.aiAnalysis.extractedText && (
            <View style={styles.aiSection}>
              <Text style={styles.aiSectionTitle}>Extracted Text</Text>
              <ScrollView style={styles.extractedTextScroll} nestedScrollEnabled>
                <Text style={styles.aiText}>{document.aiAnalysis.extractedText}</Text>
              </ScrollView>
            </View>
          )}

          {parsedInsights && (
            <>
              {parsedInsights.doctor && (
                <View style={styles.aiSection}>
                  <Text style={styles.aiSectionTitle}>Doctor</Text>
                  <Text style={styles.aiText}>{parsedInsights.doctor}</Text>
                </View>
              )}

              {parsedInsights.hospital && (
                <View style={styles.aiSection}>
                  <Text style={styles.aiSectionTitle}>Hospital/Clinic</Text>
                  <Text style={styles.aiText}>{parsedInsights.hospital}</Text>
                </View>
              )}

              {parsedInsights.diagnosis && (
                <View style={styles.aiSection}>
                  <Text style={styles.aiSectionTitle}>Diagnosis</Text>
                  <Text style={styles.aiText}>{parsedInsights.diagnosis}</Text>
                </View>
              )}

              {parsedInsights.medicines.length > 0 && (
                <View style={styles.aiSection}>
                  <Text style={styles.aiSectionTitle}>Medicines</Text>
                  {parsedInsights.medicines.map((med, index) => (
                    <View key={index} style={styles.medicineItem}>
                      <Feather name="pill" size={14} color="#4CAF50" />
                      <Text style={styles.medicineText}>
                        {med.name} {med.dosage && `- ${med.dosage}`}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {parsedInsights.testResults.length > 0 && (
                <View style={styles.aiSection}>
                  <Text style={styles.aiSectionTitle}>Test Results</Text>
                  {parsedInsights.testResults.map((test, index) => (
                    <View key={index} style={styles.testResultItem}>
                      <Text style={styles.testName}>{test.test}:</Text>
                      <Text style={styles.testValue}>{test.value}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {document.aiAnalysis.insights && document.aiAnalysis.insights.length > 0 && (
            <View style={styles.aiSection}>
              <Text style={styles.aiSectionTitle}>Key Insights</Text>
              {document.aiAnalysis.insights.map((insight, index) => (
                <View key={index} style={styles.insightItem}>
                  <Feather name="check-circle" size={14} color="#007AFF" />
                  <Text style={styles.insightText}>{insight}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Document</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.input}
                value={editedTitle}
                onChangeText={setEditedTitle}
                placeholder="Document title"
              />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editedDescription}
                onChangeText={setEditedDescription}
                placeholder="Description"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.inputLabel}>Your Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editedNotes}
                onChangeText={setEditedNotes}
                placeholder="Add your personal notes here..."
                multiline
                numberOfLines={4}
              />

              <Text style={styles.inputLabel}>Document Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
                {Object.values(DocumentType).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeChip,
                      editedType === type && styles.typeChipSelected,
                    ]}
                    onPress={() => setEditedType(type)}
                  >
                    <Text
                      style={[
                        styles.typeChipText,
                        editedType === type && styles.typeChipTextSelected,
                      ]}
                    >
                      {type.replace(/_/g, ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveEdit}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentContainer: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  headerButton: {
    marginLeft: 16,
  },
  imageContainer: {
    width: '100%',
    height: screenWidth * 1.2,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  imageLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  documentImage: {
    width: '100%',
    height: '100%',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  documentTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  documentDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  notesSection: {
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  notesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notesSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 6,
  },
  notesText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 16,
  },
  metaGrid: {
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  metaLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  successBanner: {
    backgroundColor: '#E8F5E9',
  },
  statusBannerText: {
    fontSize: 13,
    color: '#FF9800',
    marginLeft: 8,
    fontWeight: '500',
  },
  successBannerText: {
    color: '#4CAF50',
  },
  aiCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  aiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  aiSection: {
    marginBottom: 16,
  },
  aiSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  aiText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  extractedTextScroll: {
    maxHeight: 150,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
  },
  medicineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#F0FFF4',
    padding: 10,
    borderRadius: 6,
  },
  medicineText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  testResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 6,
  },
  testName: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  testValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  modalForm: {
    padding: 16,
    maxHeight: 400,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeSelector: {
    marginTop: 8,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  typeChipSelected: {
    backgroundColor: '#007AFF',
  },
  typeChipText: {
    fontSize: 13,
    color: '#666',
    textTransform: 'capitalize',
  },
  typeChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default DocumentDetailScreen;

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Switch,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { launchImageLibrary } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import { RootStackParamList } from '../App';
import { DocumentType } from '@swasthyasathi/shared';
import apiService from '../services/api.service';

type DocumentUploadScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DocumentUpload'
>;

interface Props {
  navigation: DocumentUploadScreenNavigationProp;
}

const DocumentUploadScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>(
    DocumentType.LAB_REPORT
  );
  const [processWithAI, setProcessWithAI] = useState(true);
  const [loading, setLoading] = useState(false);

  const documentTypes = [
    { value: DocumentType.LAB_REPORT, label: 'Lab Report' },
    { value: DocumentType.PRESCRIPTION, label: 'Prescription' },
    { value: DocumentType.MEDICAL_CERTIFICATE, label: 'Medical Certificate' },
    { value: DocumentType.XRAY, label: 'X-Ray' },
    { value: DocumentType.CT_SCAN, label: 'CT Scan' },
    { value: DocumentType.MRI, label: 'MRI' },
    { value: DocumentType.OTHER, label: 'Other' },
  ];

  const handlePickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (!result.didCancel && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || 'image.jpg',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
      });

      setSelectedFile({
        uri: result.uri,
        type: result.type || 'application/pdf',
        name: result.name,
      });
    } catch (error: any) {
      if (!DocumentPicker.isCancel(error)) {
        Alert.alert('Error', 'Failed to pick document');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    setLoading(true);
    try {
      await apiService.uploadDocument(selectedFile, {
        type: documentType,
        title: title.trim(),
        description: description.trim() || undefined,
        processWithAI,
      });

      Alert.alert('Success', 'Document uploaded successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Upload Failed',
        error.response?.data?.error?.message || 'Please try again'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Select Document</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.pickButton}
            onPress={handlePickImage}
          >
            <Text style={styles.pickButtonText}>Pick Image</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.pickButton}
            onPress={handlePickDocument}
          >
            <Text style={styles.pickButtonText}>Pick Document</Text>
          </TouchableOpacity>
        </View>

        {selectedFile && (
          <View style={styles.selectedFile}>
            <Text style={styles.selectedFileText}>
              Selected: {selectedFile.name}
            </Text>
          </View>
        )}

        <Text style={styles.label}>Document Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.typeContainer}>
            {documentTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeButton,
                  documentType === type.value && styles.typeButtonActive,
                ]}
                onPress={() => setDocumentType(type.value)}
              >
                <Text
                  style={[
                    styles.typeText,
                    documentType === type.value && styles.typeTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Blood Test Report - Jan 2026"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Description (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Additional notes about this document"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <View style={styles.switchContainer}>
          <View>
            <Text style={styles.switchLabel}>Process with AI</Text>
            <Text style={styles.switchSubtext}>
              Extract text and get insights using Claude AI
            </Text>
          </View>
          <Switch
            value={processWithAI}
            onValueChange={setProcessWithAI}
            trackColor={{ false: '#ddd', true: '#007AFF' }}
          />
        </View>

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleUpload}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.uploadButtonText}>Upload Document</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  pickButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  pickButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedFile: {
    backgroundColor: '#e8f4fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  selectedFileText: {
    color: '#007AFF',
    fontSize: 14,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    marginTop: 15,
  },
  typeContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  typeButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    marginRight: 10,
  },
  typeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeText: {
    fontSize: 14,
    color: '#666',
  },
  typeTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 15,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  switchSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    maxWidth: 250,
  },
  uploadButton: {
    height: 50,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DocumentUploadScreen;

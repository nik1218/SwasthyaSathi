import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Document, DocumentType } from '@swasthyasathi/shared';

interface DocumentCardProps {
  document: Document;
  onPress: () => void;
}

const getDocumentIcon = (type: DocumentType): keyof typeof Feather.glyphMap => {
  const iconMap: Record<DocumentType, keyof typeof Feather.glyphMap> = {
    [DocumentType.PRESCRIPTION]: 'file-text',
    [DocumentType.LAB_REPORT]: 'activity',
    [DocumentType.MEDICAL_CERTIFICATE]: 'award',
    [DocumentType.XRAY]: 'radio',
    [DocumentType.CT_SCAN]: 'layers',
    [DocumentType.MRI]: 'disc',
    [DocumentType.OTHER]: 'file',
  };
  return iconMap[type] || 'file';
};

const getDocumentTypeLabel = (type: DocumentType): string => {
  const labelMap: Record<DocumentType, string> = {
    [DocumentType.PRESCRIPTION]: 'Prescription',
    [DocumentType.LAB_REPORT]: 'Lab Report',
    [DocumentType.MEDICAL_CERTIFICATE]: 'Medical Certificate',
    [DocumentType.XRAY]: 'X-Ray',
    [DocumentType.CT_SCAN]: 'CT Scan',
    [DocumentType.MRI]: 'MRI',
    [DocumentType.OTHER]: 'Other',
  };
  return labelMap[type] || 'Document';
};

const getDocumentIconColor = (type: DocumentType): string => {
  const colorMap: Record<DocumentType, string> = {
    [DocumentType.PRESCRIPTION]: '#4CAF50',
    [DocumentType.LAB_REPORT]: '#2196F3',
    [DocumentType.MEDICAL_CERTIFICATE]: '#FF9800',
    [DocumentType.XRAY]: '#9C27B0',
    [DocumentType.CT_SCAN]: '#E91E63',
    [DocumentType.MRI]: '#00BCD4',
    [DocumentType.OTHER]: '#757575',
  };
  return colorMap[type] || '#757575';
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

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onPress }) => {
  const iconName = getDocumentIcon(document.type);
  const iconColor = getDocumentIconColor(document.type);
  const typeLabel = getDocumentTypeLabel(document.type);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardContent}>
        {/* Left: Icon and Thumbnail */}
        <View style={styles.leftSection}>
          {document.thumbnailUrl ? (
            <View style={styles.thumbnailContainer}>
              <Image
                source={{ uri: document.thumbnailUrl }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
              <Feather name={iconName} size={24} color={iconColor} />
            </View>
          )}
        </View>

        {/* Middle: Document Info */}
        <View style={styles.middleSection}>
          <Text style={styles.title} numberOfLines={1}>
            {document.title || 'Untitled Document'}
          </Text>

          <View style={styles.metaRow}>
            <View style={[styles.typeBadge, { backgroundColor: iconColor + '20' }]}>
              <Text style={[styles.typeText, { color: iconColor }]}>
                {typeLabel}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Feather name="calendar" size={12} color="#999" />
            <Text style={styles.infoText}>{formatDate(document.uploadedAt)}</Text>
            <Text style={styles.separator}>•</Text>
            <Feather name="file" size={12} color="#999" />
            <Text style={styles.infoText}>{formatFileSize(document.fileSize)}</Text>
          </View>

          {document.description && (
            <Text style={styles.description} numberOfLines={1}>
              {document.description}
            </Text>
          )}
        </View>

        {/* Right: Chevron */}
        <View style={styles.rightSection}>
          <Feather name="chevron-right" size={20} color="#CCC" />
        </View>
      </View>

      {/* Status Indicators */}
      {document.status === 'pending_processing' && (
        <View style={styles.statusBar}>
          <View style={styles.processingIndicator}>
            <Feather name="clock" size={12} color="#FF9800" />
            <Text style={styles.processingText}>Processing...</Text>
          </View>
        </View>
      )}

      {document.ocrStatus === 'completed' && document.aiAnalysis?.extractedText && (
        <View style={styles.statusBar}>
          <View style={styles.ocrIndicator}>
            <Feather name="type" size={12} color="#4CAF50" />
            <Text style={styles.ocrText}>Text Extracted</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  leftSection: {
    marginRight: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  infoText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  separator: {
    fontSize: 12,
    color: '#DDD',
    marginHorizontal: 6,
  },
  description: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  rightSection: {
    marginLeft: 8,
  },
  statusBar: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  processingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  processingText: {
    fontSize: 11,
    color: '#FF9800',
    marginLeft: 4,
    fontWeight: '500',
  },
  ocrIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ocrText: {
    fontSize: 11,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default DocumentCard;

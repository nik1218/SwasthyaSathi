import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';

const RecordsTab: React.FC = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.iconContainer}>
        <Feather name="folder" size={64} color="#007AFF" />
      </View>

      <Text style={styles.title}>Medical Records</Text>
      <Text style={styles.subtitle}>All your health documents</Text>

      <View style={styles.descriptionBox}>
        <Text style={styles.description}>
          Your medical records hub. Access:
        </Text>
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>• Lab reports and test results</Text>
          <Text style={styles.featureItem}>• Prescriptions and medications</Text>
          <Text style={styles.featureItem}>• X-rays, CT scans, MRI scans</Text>
          <Text style={styles.featureItem}>• Medical certificates</Text>
          <Text style={styles.featureItem}>• Vaccination records</Text>
        </View>
      </View>

      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>Coming Soon</Text>
      </View>
    </ScrollView>
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
  statusBadge: {
    marginTop: 32,
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default RecordsTab;

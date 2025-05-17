import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { logger } from '../../utils/logger';
import { validateFileSize, validateFileType } from '../../utils/validation';
import { KYCForm } from '../../components/kyc/KYCForm';
import { DocumentUpload } from '../../components/kyc/DocumentUpload';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

export const KYCOnboardingScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [documents, setDocuments] = useState({
    idCard: null,
    selfie: null,
    proofOfAddress: null,
  });
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    nationality: '',
    address: '',
    city: '',
    postalCode: '',
  });

  const { user } = useAuth();
  const { translate, isRTL } = useLanguage();

  const handleDocumentPick = async (type: 'idCard' | 'selfie' | 'proofOfAddress') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ALLOWED_FILE_TYPES,
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        const file = result.assets[0];
        
        if (!validateFileSize(file.size, MAX_FILE_SIZE)) {
          throw new Error(translate('kyc.errors.file_too_large'));
        }

        if (!validateFileType(file, ALLOWED_FILE_TYPES)) {
          throw new Error(translate('kyc.errors.invalid_file_type'));
        }

        setDocuments(prev => ({
          ...prev,
          [type]: file,
        }));
      }
    } catch (error) {
      logger.error('Document pick failed', { error, type });
      setError(translate('kyc.errors.document_pick_failed'));
    }
  };

  const handleSelfieCapture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        throw new Error(translate('kyc.errors.camera_permission_denied'));
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        const file = {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'selfie.jpg',
          size: result.assets[0].fileSize,
        };

        setDocuments(prev => ({
          ...prev,
          selfie: file,
        }));
      }
    } catch (error) {
      logger.error('Selfie capture failed', { error });
      setError(translate('kyc.errors.selfie_capture_failed'));
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Validate required documents
      if (!documents.idCard || !documents.selfie || !documents.proofOfAddress) {
        throw new Error(translate('kyc.errors.missing_documents'));
      }

      // Create FormData for multipart/form-data upload
      const formData = new FormData();
      
      // Append documents
      Object.entries(documents).forEach(([key, file]) => {
        formData.append(key, {
          uri: file.uri,
          type: file.type,
          name: file.name,
        });
      });

      // Append user data
      Object.entries(formData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Submit KYC data
      await api.post('/user/kyc/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Show success message and navigate
      Alert.alert(
        translate('kyc.success.title'),
        translate('kyc.success.message'),
        [
          {
            text: translate('common.ok'),
            onPress: () => navigation.replace('Main'),
          },
        ]
      );
    } catch (error) {
      logger.error('KYC submission failed', { error });
      setError(error.response?.data?.message || translate('kyc.errors.submission_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{translate('kyc.title')}</Text>
        <Text style={styles.subtitle}>{translate('kyc.subtitle')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{translate('kyc.personal_info')}</Text>
        <KYCForm
          formData={formData}
          onChange={setFormData}
          isRTL={isRTL}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{translate('kyc.documents')}</Text>
        
        <DocumentUpload
          title={translate('kyc.id_card')}
          description={translate('kyc.id_card_description')}
          document={documents.idCard}
          onPress={() => handleDocumentPick('idCard')}
          isRTL={isRTL}
        />

        <DocumentUpload
          title={translate('kyc.selfie')}
          description={translate('kyc.selfie_description')}
          document={documents.selfie}
          onPress={handleSelfieCapture}
          isRTL={isRTL}
        />

        <DocumentUpload
          title={translate('kyc.proof_of_address')}
          description={translate('kyc.proof_of_address_description')}
          document={documents.proofOfAddress}
          onPress={() => handleDocumentPick('proofOfAddress')}
          isRTL={isRTL}
        />
      </View>

      {error ? <ErrorMessage message={error} /> : null}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <LoadingSpinner color={colors.white} />
        ) : (
          <Text style={styles.submitButtonText}>
            {translate('kyc.submit')}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body1,
    color: colors.text.secondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  submitButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  submitButtonText: {
    ...typography.button,
    color: colors.white,
  },
}); 
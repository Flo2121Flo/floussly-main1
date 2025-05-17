import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  AccessibilityInfo
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Text,
  Button,
  ActivityIndicator,
  IconButton,
  Snackbar
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../hooks/useAuth';
import { theme } from '../../theme';
import { uploadKYCDocument } from '../../services/api';

export const KYCDocumentUploadScreen: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<{
    idCard?: string;
    proofOfAddress?: string;
    selfie?: string;
  }>({});

  const pickImage = async (type: 'idCard' | 'proofOfAddress' | 'selfie') => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setError(t('errors.cameraPermissionDenied'));
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setDocuments(prev => ({
          ...prev,
          [type]: result.assets[0].uri
        }));

        AccessibilityInfo.announceForAccessibility(
          t('kyc.documentUploaded', { type: t(`kyc.${type}`) })
        );
      }
    } catch (err) {
      setError(t('errors.failedToUploadDocument'));
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate required documents
      if (!documents.idCard || !documents.proofOfAddress || !documents.selfie) {
        setError(t('errors.missingDocuments'));
        return;
      }

      // Upload documents
      await uploadKYCDocument({
        userId: user?.id,
        idCard: documents.idCard,
        proofOfAddress: documents.proofOfAddress,
        selfie: documents.selfie
      });

      AccessibilityInfo.announceForAccessibility(t('kyc.submissionSuccess'));
    } catch (err) {
      setError(t('errors.failedToSubmitKYC'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      accessibilityRole="scrollview"
    >
      <Text
        variant="headlineMedium"
        style={styles.title}
        accessibilityRole="header"
      >
        {t('kyc.title')}
      </Text>

      <Text
        variant="bodyLarge"
        style={styles.subtitle}
        accessibilityRole="text"
      >
        {t('kyc.subtitle')}
      </Text>

      <Card style={styles.card}>
        <Card.Content>
          <Text
            variant="titleMedium"
            accessibilityRole="header"
          >
            {t('kyc.idCard')}
          </Text>
          <View style={styles.documentContainer}>
            {documents.idCard ? (
              <View style={styles.previewContainer}>
                <Image
                  source={{ uri: documents.idCard }}
                  style={styles.preview}
                  accessibilityLabel={t('kyc.idCardPreview')}
                />
                <IconButton
                  icon="close"
                  onPress={() => setDocuments(prev => ({ ...prev, idCard: undefined }))}
                  accessibilityLabel={t('kyc.removeDocument')}
                />
              </View>
            ) : (
              <Button
                mode="outlined"
                onPress={() => pickImage('idCard')}
                icon="camera"
                accessibilityLabel={t('kyc.uploadIdCard')}
              >
                {t('kyc.uploadIdCard')}
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text
            variant="titleMedium"
            accessibilityRole="header"
          >
            {t('kyc.proofOfAddress')}
          </Text>
          <View style={styles.documentContainer}>
            {documents.proofOfAddress ? (
              <View style={styles.previewContainer}>
                <Image
                  source={{ uri: documents.proofOfAddress }}
                  style={styles.preview}
                  accessibilityLabel={t('kyc.proofOfAddressPreview')}
                />
                <IconButton
                  icon="close"
                  onPress={() => setDocuments(prev => ({ ...prev, proofOfAddress: undefined }))}
                  accessibilityLabel={t('kyc.removeDocument')}
                />
              </View>
            ) : (
              <Button
                mode="outlined"
                onPress={() => pickImage('proofOfAddress')}
                icon="camera"
                accessibilityLabel={t('kyc.uploadProofOfAddress')}
              >
                {t('kyc.uploadProofOfAddress')}
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text
            variant="titleMedium"
            accessibilityRole="header"
          >
            {t('kyc.selfie')}
          </Text>
          <View style={styles.documentContainer}>
            {documents.selfie ? (
              <View style={styles.previewContainer}>
                <Image
                  source={{ uri: documents.selfie }}
                  style={styles.preview}
                  accessibilityLabel={t('kyc.selfiePreview')}
                />
                <IconButton
                  icon="close"
                  onPress={() => setDocuments(prev => ({ ...prev, selfie: undefined }))}
                  accessibilityLabel={t('kyc.removeDocument')}
                />
              </View>
            ) : (
              <Button
                mode="outlined"
                onPress={() => pickImage('selfie')}
                icon="camera"
                accessibilityLabel={t('kyc.uploadSelfie')}
              >
                {t('kyc.uploadSelfie')}
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading || !documents.idCard || !documents.proofOfAddress || !documents.selfie}
        style={styles.submitButton}
        accessibilityLabel={t('kyc.submit')}
      >
        {t('kyc.submit')}
      </Button>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError(null)}
        action={{
          label: t('common.dismiss'),
          onPress: () => setError(null)
        }}
      >
        {error}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  content: {
    padding: 16
  },
  title: {
    marginBottom: 8
  },
  subtitle: {
    marginBottom: 24,
    opacity: 0.7
  },
  card: {
    marginBottom: 16
  },
  documentContainer: {
    marginTop: 8
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  preview: {
    width: 100,
    height: 100,
    borderRadius: 8
  },
  submitButton: {
    marginTop: 24
  }
}); 
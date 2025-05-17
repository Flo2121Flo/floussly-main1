import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { ErrorMessage } from '../common/ErrorMessage';

interface DocumentUploadProps {
  title: string;
  description: string;
  document: {
    uri: string;
    type: string;
    name: string;
  } | null;
  onDocumentSelect: (document: any) => void;
  onDocumentRemove: () => void;
  error?: string;
  isRTL: boolean;
  isSelfie?: boolean;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  title,
  description,
  document,
  onDocumentSelect,
  onDocumentRemove,
  error,
  isRTL,
  isSelfie = false,
}) => {
  const pickDocument = async () => {
    try {
      if (isSelfie) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          throw new Error('Camera permission is required to take a selfie');
        }

        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
          const asset = result.assets[0];
          onDocumentSelect({
            uri: asset.uri,
            type: 'image/jpeg',
            name: 'selfie.jpg',
          });
        }
      } else {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
          const asset = result.assets[0];
          const uri = asset.uri;
          const type = 'image/jpeg';
          const name = uri.split('/').pop() || 'document.jpg';

          onDocumentSelect({
            uri,
            type,
            name,
          });
        }
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, isRTL && styles.textRTL]}>{title}</Text>
      <Text style={[styles.description, isRTL && styles.textRTL]}>
        {description}
      </Text>

      {document ? (
        <View style={styles.documentPreview}>
          <Image
            source={{ uri: document.uri }}
            style={styles.previewImage}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.removeButton}
            onPress={onDocumentRemove}
          >
            <Ionicons name="close-circle" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={pickDocument}
        >
          <Ionicons
            name={isSelfie ? 'camera' : 'document'}
            size={24}
            color={colors.primary}
          />
          <Text style={styles.uploadText}>
            {isSelfie ? 'Take Selfie' : 'Upload Document'}
          </Text>
        </TouchableOpacity>
      )}

      {error && <ErrorMessage message={error} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h6,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  uploadButton: {
    height: 120,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    ...typography.body2,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  documentPreview: {
    position: 'relative',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.xs,
  },
  textRTL: {
    textAlign: 'right',
  },
}); 
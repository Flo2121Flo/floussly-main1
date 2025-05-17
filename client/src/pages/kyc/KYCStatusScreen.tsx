import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';

interface KYCStatus {
  status: 'pending' | 'approved' | 'rejected';
  documents: {
    idCard: {
      status: 'pending' | 'approved' | 'rejected';
      message?: string;
    };
    selfie: {
      status: 'pending' | 'approved' | 'rejected';
      message?: string;
    };
    proofOfAddress: {
      status: 'pending' | 'approved' | 'rejected';
      message?: string;
    };
  };
  personalInfo: {
    status: 'pending' | 'approved' | 'rejected';
    message?: string;
  };
}

export const KYCStatusScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [kycStatus, setKycStatus] = React.useState<KYCStatus | null>(null);

  React.useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/kyc/status');
      const data = await response.json();
      setKycStatus(data);
    } catch (error) {
      setError('Failed to fetch KYC status');
      console.error('Error fetching KYC status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'approved':
        return (
          <Ionicons name="checkmark-circle" size={24} color={colors.success} />
        );
      case 'rejected':
        return (
          <Ionicons name="close-circle" size={24} color={colors.error} />
        );
      default:
        return (
          <Ionicons name="time" size={24} color={colors.warning} />
        );
    }
  };

  const getStatusColor = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'approved':
        return colors.success;
      case 'rejected':
        return colors.error;
      default:
        return colors.warning;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!kycStatus) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>KYC Verification Status</Text>
        <View style={styles.statusBadge}>
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(kycStatus.status) },
            ]}
          >
            {kycStatus.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.statusItem}>
          {getStatusIcon(kycStatus.personalInfo.status)}
          <View style={styles.statusDetails}>
            <Text style={styles.statusLabel}>Personal Information</Text>
            {kycStatus.personalInfo.message && (
              <Text style={styles.statusMessage}>
                {kycStatus.personalInfo.message}
              </Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Documents</Text>
        <View style={styles.statusItem}>
          {getStatusIcon(kycStatus.documents.idCard.status)}
          <View style={styles.statusDetails}>
            <Text style={styles.statusLabel}>ID Card</Text>
            {kycStatus.documents.idCard.message && (
              <Text style={styles.statusMessage}>
                {kycStatus.documents.idCard.message}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.statusItem}>
          {getStatusIcon(kycStatus.documents.selfie.status)}
          <View style={styles.statusDetails}>
            <Text style={styles.statusLabel}>Selfie</Text>
            {kycStatus.documents.selfie.message && (
              <Text style={styles.statusMessage}>
                {kycStatus.documents.selfie.message}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.statusItem}>
          {getStatusIcon(kycStatus.documents.proofOfAddress.status)}
          <View style={styles.statusDetails}>
            <Text style={styles.statusLabel}>Proof of Address</Text>
            {kycStatus.documents.proofOfAddress.message && (
              <Text style={styles.statusMessage}>
                {kycStatus.documents.proofOfAddress.message}
              </Text>
            )}
          </View>
        </View>
      </View>

      {kycStatus.status === 'rejected' && (
        <TouchableOpacity
          style={styles.updateButton}
          onPress={() => navigation.navigate('KYCOnboarding')}
        >
          <Text style={styles.updateButtonText}>Update Information</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h5,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xs,
    backgroundColor: colors.surface,
  },
  statusText: {
    ...typography.button,
    textTransform: 'uppercase',
  },
  section: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.h6,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  statusLabel: {
    ...typography.body1,
    color: colors.text.primary,
  },
  statusMessage: {
    ...typography.body2,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  updateButton: {
    margin: spacing.lg,
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: spacing.sm,
    alignItems: 'center',
  },
  updateButtonText: {
    ...typography.button,
    color: colors.surface,
  },
}); 
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { logger } from '../../utils/logger';
import { validatePassword, validatePhone } from '../../utils/validation';

export const RegisterScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const navigation = useNavigation();
  const { register, setupBiometric } = useAuth();
  const { translate, isRTL } = useLanguage();

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = translate('auth.register.errors.name_required');
    }

    if (!formData.phone.trim()) {
      errors.phone = translate('auth.register.errors.phone_required');
    } else if (!validatePhone(formData.phone)) {
      errors.phone = translate('auth.register.errors.invalid_phone');
    }

    if (!formData.email.trim()) {
      errors.email = translate('auth.register.errors.email_required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = translate('auth.register.errors.invalid_email');
    }

    if (!formData.password) {
      errors.password = translate('auth.register.errors.password_required');
    } else if (!validatePassword(formData.password)) {
      errors.password = translate('auth.register.errors.weak_password');
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = translate('auth.register.errors.password_mismatch');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      setLoading(true);
      setError(null);

      await register(formData);

      // Prompt for biometric setup
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      if (compatible && !enrolled) {
        Alert.alert(
          translate('auth.biometric.setup.title'),
          translate('auth.biometric.setup.message'),
          [
            {
              text: translate('common.later'),
              style: 'cancel',
              onPress: () => navigation.replace('Main'),
            },
            {
              text: translate('common.setup'),
              onPress: async () => {
                try {
                  const result = await LocalAuthentication.authenticateAsync({
                    promptMessage: translate('auth.biometric.setup.prompt'),
                  });
                  if (result.success) {
                    // Enable biometric login for the user
                    await register({ ...formData, enableBiometric: true });
                  }
                  navigation.replace('Main');
                } catch (error) {
                  console.error('Error setting up biometric:', error);
                  navigation.replace('Main');
                }
              },
            },
          ]
        );
      } else {
        navigation.replace('Main');
      }
    } catch (error) {
      setError(error.message || translate('auth.register.errors.registration_failed'));
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>{translate('auth.register.title')}</Text>
          <Text style={styles.subtitle}>{translate('auth.register.subtitle')}</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={[styles.input, isRTL && styles.inputRTL]}
            placeholder={translate('auth.register.name_placeholder')}
            value={formData.fullName}
            onChangeText={(value) => updateFormData('fullName', value)}
            autoCapitalize="words"
            autoComplete="name"
          />
          {validationErrors.fullName && (
            <ErrorMessage message={validationErrors.fullName} />
          )}

          <TextInput
            style={[styles.input, isRTL && styles.inputRTL]}
            placeholder={translate('auth.register.phone_placeholder')}
            value={formData.phone}
            onChangeText={(value) => updateFormData('phone', value)}
            keyboardType="phone-pad"
            autoComplete="tel"
          />
          {validationErrors.phone && (
            <ErrorMessage message={validationErrors.phone} />
          )}

          <TextInput
            style={[styles.input, isRTL && styles.inputRTL]}
            placeholder={translate('auth.register.email_placeholder')}
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          {validationErrors.email && (
            <ErrorMessage message={validationErrors.email} />
          )}

          <TextInput
            style={[styles.input, isRTL && styles.inputRTL]}
            placeholder={translate('auth.register.password_placeholder')}
            value={formData.password}
            onChangeText={(value) => updateFormData('password', value)}
            secureTextEntry
            autoComplete="password-new"
          />
          {validationErrors.password && (
            <ErrorMessage message={validationErrors.password} />
          )}

          <TextInput
            style={[styles.input, isRTL && styles.inputRTL]}
            placeholder={translate('auth.register.confirm_password_placeholder')}
            value={formData.confirmPassword}
            onChangeText={(value) => updateFormData('confirmPassword', value)}
            secureTextEntry
            autoComplete="password-new"
          />
          {validationErrors.confirmPassword && (
            <ErrorMessage message={validationErrors.confirmPassword} />
          )}

          {error && <ErrorMessage message={error} />}

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <LoadingSpinner color={colors.white} />
            ) : (
              <Text style={styles.registerButtonText}>
                {translate('auth.register.button')}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {translate('auth.register.have_account')}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>
              {translate('auth.register.login')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    marginTop: spacing.xl,
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
  form: {
    marginBottom: spacing.xl,
  },
  input: {
    height: 56,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    ...typography.body1,
    color: colors.text.primary,
  },
  inputRTL: {
    textAlign: 'right',
  },
  registerButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  registerButtonText: {
    ...typography.button,
    color: colors.white,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingVertical: spacing.lg,
  },
  footerText: {
    ...typography.body2,
    color: colors.text.secondary,
    marginRight: spacing.xs,
  },
  footerLink: {
    ...typography.body2,
    color: colors.primary,
  },
}); 
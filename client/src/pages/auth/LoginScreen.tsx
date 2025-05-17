import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { BiometricButton } from '../../components/auth/BiometricButton';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMFA, setShowMFA] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  const navigation = useNavigation();
  const { login, biometricLogin } = useAuth();
  const { translate, isRTL } = useLanguage();

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(compatible && enrolled);
    } catch (error) {
      console.error('Error checking biometric availability:', error);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!email || !password) {
        throw new Error(translate('auth.errors.required_fields'));
      }

      const response = await login(email, password);

      if (response.requiresMFA) {
        setShowMFA(true);
      } else {
        navigation.replace('Main');
      }
    } catch (error) {
      setError(error.message || translate('auth.errors.login_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: translate('auth.biometric.prompt'),
        fallbackLabel: translate('auth.biometric.fallback'),
      });

      if (result.success) {
        await biometricLogin();
        navigation.replace('Main');
      }
    } catch (error) {
      setError(error.message || translate('auth.errors.biometric_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleMFAVerification = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!totpCode) {
        throw new Error(translate('auth.errors.required_mfa'));
      }

      await login(email, password, totpCode);
      navigation.replace('Main');
    } catch (error) {
      setError(error.message || translate('auth.errors.mfa_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{translate('auth.login.title')}</Text>
        <Text style={styles.subtitle}>{translate('auth.login.subtitle')}</Text>

        {!showMFA ? (
          <>
            <TextInput
              style={[styles.input, isRTL && styles.inputRTL]}
              placeholder={translate('auth.login.email_placeholder')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <TextInput
              style={[styles.input, isRTL && styles.inputRTL]}
              placeholder={translate('auth.login.password_placeholder')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />

            {biometricAvailable && (
              <BiometricButton
                onPress={handleBiometricLogin}
                disabled={loading}
              />
            )}

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>
                {translate('auth.login.forgot_password')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <LoadingSpinner color={colors.white} />
              ) : (
                <Text style={styles.loginButtonText}>
                  {translate('auth.login.button')}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.registerButtonText}>
                {translate('auth.login.register_prompt')}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              style={[styles.input, isRTL && styles.inputRTL]}
              placeholder={translate('auth.mfa.placeholder')}
              value={totpCode}
              onChangeText={setTotpCode}
              keyboardType="number-pad"
              maxLength={6}
            />

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleMFAVerification}
              disabled={loading}
            >
              {loading ? (
                <LoadingSpinner color={colors.white} />
              ) : (
                <Text style={styles.loginButtonText}>
                  {translate('auth.mfa.verify')}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowMFA(false)}
            >
              <Text style={styles.backButtonText}>
                {translate('common.back')}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {error && <ErrorMessage message={error} />}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body1,
    color: colors.text.secondary,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    ...typography.body2,
    color: colors.primary,
  },
  loginButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  loginButtonText: {
    ...typography.button,
    color: colors.white,
  },
  registerButton: {
    height: 56,
    backgroundColor: colors.surface,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  registerButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  backButton: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    ...typography.body2,
    color: colors.text.secondary,
  },
}); 
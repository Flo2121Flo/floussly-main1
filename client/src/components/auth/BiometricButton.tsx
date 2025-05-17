import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface BiometricButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const BiometricButton: React.FC<BiometricButtonProps> = ({
  onPress,
  disabled = false,
}) => {
  const { translate, isRTL } = useLanguage();

  const getBiometricIcon = () => {
    if (Platform.OS === 'ios') {
      return 'face-recognition';
    }
    return 'finger-print';
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Ionicons
        name={getBiometricIcon()}
        size={24}
        color={disabled ? colors.text.disabled : colors.primary}
      />
      <Text
        style={[
          styles.text,
          disabled && styles.textDisabled,
          isRTL && styles.textRTL,
        ]}
      >
        {translate('auth.biometric.button')}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    backgroundColor: colors.surface,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonDisabled: {
    borderColor: colors.text.disabled,
  },
  text: {
    ...typography.button,
    color: colors.primary,
    marginLeft: spacing.sm,
  },
  textDisabled: {
    color: colors.text.disabled,
  },
  textRTL: {
    marginLeft: 0,
    marginRight: spacing.sm,
  },
}); 
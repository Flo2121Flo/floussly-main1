import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { ErrorMessage } from '../common/ErrorMessage';

interface KYCFormProps {
  formData: {
    fullName: string;
    dateOfBirth: string;
    nationality: string;
    address: string;
    city: string;
    postalCode: string;
  };
  onChange: (data: any) => void;
  isRTL: boolean;
}

export const KYCForm: React.FC<KYCFormProps> = ({
  formData,
  onChange,
  isRTL,
}) => {
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      onChange({
        ...formData,
        dateOfBirth: selectedDate.toISOString().split('T')[0],
      });
    }
  };

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'fullName':
        if (!value.trim()) {
          newErrors.fullName = 'Full name is required';
        } else if (value.trim().length < 3) {
          newErrors.fullName = 'Full name must be at least 3 characters';
        } else {
          delete newErrors.fullName;
        }
        break;

      case 'dateOfBirth':
        if (!value) {
          newErrors.dateOfBirth = 'Date of birth is required';
        } else {
          const age = calculateAge(new Date(value));
          if (age < 18) {
            newErrors.dateOfBirth = 'You must be at least 18 years old';
          } else {
            delete newErrors.dateOfBirth;
          }
        }
        break;

      case 'nationality':
        if (!value.trim()) {
          newErrors.nationality = 'Nationality is required';
        } else {
          delete newErrors.nationality;
        }
        break;

      case 'address':
        if (!value.trim()) {
          newErrors.address = 'Address is required';
        } else {
          delete newErrors.address;
        }
        break;

      case 'city':
        if (!value.trim()) {
          newErrors.city = 'City is required';
        } else {
          delete newErrors.city;
        }
        break;

      case 'postalCode':
        if (!value.trim()) {
          newErrors.postalCode = 'Postal code is required';
        } else if (!/^\d{5}$/.test(value.trim())) {
          newErrors.postalCode = 'Invalid postal code format';
        } else {
          delete newErrors.postalCode;
        }
        break;
    }

    setErrors(newErrors);
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, isRTL && styles.inputRTL]}
        placeholder="Full Name"
        value={formData.fullName}
        onChangeText={(value) => {
          onChange({ ...formData, fullName: value });
          validateField('fullName', value);
        }}
        autoCapitalize="words"
        autoComplete="name"
      />
      {errors.fullName && <ErrorMessage message={errors.fullName} />}

      <TextInput
        style={[styles.input, isRTL && styles.inputRTL]}
        placeholder="Date of Birth"
        value={formData.dateOfBirth}
        onFocus={() => setShowDatePicker(true)}
        editable={false}
      />
      {errors.dateOfBirth && <ErrorMessage message={errors.dateOfBirth} />}

      {showDatePicker && (
        <DateTimePicker
          value={formData.dateOfBirth ? new Date(formData.dateOfBirth) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      <TextInput
        style={[styles.input, isRTL && styles.inputRTL]}
        placeholder="Nationality"
        value={formData.nationality}
        onChangeText={(value) => {
          onChange({ ...formData, nationality: value });
          validateField('nationality', value);
        }}
        autoCapitalize="words"
      />
      {errors.nationality && <ErrorMessage message={errors.nationality} />}

      <TextInput
        style={[styles.input, isRTL && styles.inputRTL]}
        placeholder="Address"
        value={formData.address}
        onChangeText={(value) => {
          onChange({ ...formData, address: value });
          validateField('address', value);
        }}
        autoCapitalize="words"
        multiline
      />
      {errors.address && <ErrorMessage message={errors.address} />}

      <TextInput
        style={[styles.input, isRTL && styles.inputRTL]}
        placeholder="City"
        value={formData.city}
        onChangeText={(value) => {
          onChange({ ...formData, city: value });
          validateField('city', value);
        }}
        autoCapitalize="words"
      />
      {errors.city && <ErrorMessage message={errors.city} />}

      <TextInput
        style={[styles.input, isRTL && styles.inputRTL]}
        placeholder="Postal Code"
        value={formData.postalCode}
        onChangeText={(value) => {
          onChange({ ...formData, postalCode: value });
          validateField('postalCode', value);
        }}
        keyboardType="number-pad"
        maxLength={5}
      />
      {errors.postalCode && <ErrorMessage message={errors.postalCode} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
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
}); 
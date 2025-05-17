/**
 * Validates a password against security requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const validatePassword = (password: string): boolean => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
};

/**
 * Validates a Moroccan phone number
 * Format: +212 6XX-XXXXXX or 06XX-XXXXXX
 */
export const validatePhone = (phone: string): boolean => {
  const moroccanPhoneRegex = /^(?:(?:\+|00)212|0)[6-7]\d{8}$/;
  return moroccanPhoneRegex.test(phone.replace(/\s+/g, ''));
};

/**
 * Validates an email address
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a Moroccan ID card (CIN)
 * Format: One letter followed by 5-6 numbers
 */
export const validateCIN = (cin: string): boolean => {
  const cinRegex = /^[A-Z]\d{5,6}$/;
  return cinRegex.test(cin.toUpperCase());
};

/**
 * Validates an amount (positive number with up to 2 decimal places)
 */
export const validateAmount = (amount: string): boolean => {
  const amountRegex = /^\d+(\.\d{0,2})?$/;
  return amountRegex.test(amount) && parseFloat(amount) > 0;
};

/**
 * Validates a date string in YYYY-MM-DD format
 */
export const validateDate = (date: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;

  const [year, month, day] = date.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  
  return (
    dateObj.getFullYear() === year &&
    dateObj.getMonth() === month - 1 &&
    dateObj.getDate() === day
  );
};

/**
 * Validates file size against a maximum size
 * @param size File size in bytes
 * @param maxSize Maximum allowed size in bytes
 */
export const validateFileSize = (size: number, maxSize: number): boolean => {
  return size <= maxSize;
};

/**
 * Validates file type against allowed types
 * @param file File object with type property
 * @param allowedTypes Array of allowed MIME types
 */
export const validateFileType = (
  file: { type: string },
  allowedTypes: string[]
): boolean => {
  return allowedTypes.includes(file.type);
};

/**
 * Validates a 6-digit OTP code
 */
export const validateOTP = (otp: string): boolean => {
  return /^\d{6}$/.test(otp);
};

/**
 * Validates a Moroccan IBAN
 * Format: MA + 2 check digits + 5 bank code + 11 account number
 */
export const validateIBAN = (iban: string): boolean => {
  const moroccanIBANRegex = /^MA\d{2}\d{5}\d{11}$/;
  return moroccanIBANRegex.test(iban.replace(/\s+/g, ''));
}; 
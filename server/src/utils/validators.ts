import { isValidPhoneNumber } from 'react-phone-number-input';
import { logger } from './logger';

// Phone number validation for Moroccan numbers
export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return false;
  
  // Moroccan phone number format: +212XXXXXXXXX or 0XXXXXXXXX
  const moroccanPhoneRegex = /^(?:(?:\+|00)212|0)[5-7]\d{8}$/;
  return moroccanPhoneRegex.test(phone);
};

// Email validation
export const validateEmail = (email: string): boolean => {
  if (!email) return false;
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// Amount validation (positive number with max 2 decimal places)
export const validateAmount = (amount: number): boolean => {
  if (typeof amount !== 'number' || isNaN(amount)) return false;
  if (amount <= 0) return false;
  
  // Check if amount has more than 2 decimal places
  const decimalPlaces = amount.toString().split('.')[1]?.length || 0;
  return decimalPlaces <= 2;
};

// Password strength validation
export const validatePassword = (password: string): boolean => {
  if (!password || password.length < 8) return false;
  
  // Must contain at least one uppercase letter, one lowercase letter,
  // one number, and one special character
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};

// Moroccan ID card number validation
export const validateMoroccanID = (id: string): boolean => {
  if (!id) return false;
  
  // Moroccan ID format: 1 letter + 6 digits
  const moroccanIDRegex = /^[A-Z]\d{6}$/;
  return moroccanIDRegex.test(id);
};

// Transaction reference validation
export const validateTransactionRef = (ref: string): boolean => {
  if (!ref) return false;
  
  // Transaction reference format: TRX-YYYYMMDD-XXXXX
  const refRegex = /^TRX-\d{8}-[A-Z0-9]{5}$/;
  return refRegex.test(ref);
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Remove HTML tags and special characters
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[&<>"']/g, '')
    .trim();
};

// Validate date range
export const validateDateRange = (startDate: Date, endDate: Date): boolean => {
  if (!startDate || !endDate) return false;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Check if dates are valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
  
  // Check if start date is before end date
  if (start > end) return false;
  
  // Check if range is not more than 1 year
  const oneYear = 365 * 24 * 60 * 60 * 1000;
  return (end.getTime() - start.getTime()) <= oneYear;
};

// Validate coordinates
export const validateCoordinates = (lat: number, lng: number): boolean => {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  
  // Check if coordinates are within Morocco's boundaries
  return lat >= 27.6621 && lat <= 35.9225 && lng >= -13.1684 && lng <= -0.9984;
};

// Validate language code
export const validateLanguage = (lang: string): boolean => {
  if (!lang) return false;
  
  const supportedLanguages = ['ar', 'fr', 'en', 'ber'];
  return supportedLanguages.includes(lang.toLowerCase());
};

// Validate currency code
export const validateCurrency = (currency: string): boolean => {
  if (!currency) return false;
  
  const supportedCurrencies = ['MAD', 'USD', 'EUR'];
  return supportedCurrencies.includes(currency.toUpperCase());
};

// Validate device token
export const validateDeviceToken = (token: string): boolean => {
  if (!token) return false;
  
  // Firebase FCM token format
  const fcmTokenRegex = /^[A-Za-z0-9-_]{140,}$/;
  return fcmTokenRegex.test(token);
};

// Validate file type
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  if (!file || !allowedTypes) return false;
  
  return allowedTypes.includes(file.type);
};

// Validate file size (in bytes)
export const validateFileSize = (file: File, maxSize: number): boolean => {
  if (!file || !maxSize) return false;
  
  return file.size <= maxSize;
};

// Validate KYC document
export const validateKYCDocument = (document: any): boolean => {
  if (!document) return false;
  
  // Check required fields
  const requiredFields = ['type', 'number', 'issueDate', 'expiryDate'];
  const hasAllFields = requiredFields.every(field => document[field]);
  
  if (!hasAllFields) return false;
  
  // Validate dates
  const issueDate = new Date(document.issueDate);
  const expiryDate = new Date(document.expiryDate);
  
  if (isNaN(issueDate.getTime()) || isNaN(expiryDate.getTime())) return false;
  if (issueDate > expiryDate) return false;
  
  // Validate document type
  const validTypes = ['ID_CARD', 'PASSPORT', 'DRIVERS_LICENSE'];
  return validTypes.includes(document.type);
};

export default {
  validatePhoneNumber,
  validateEmail,
  validateAmount,
  validatePassword,
  validateMoroccanID,
  validateTransactionRef,
  sanitizeInput,
  validateDateRange,
  validateCoordinates,
  validateLanguage,
  validateCurrency,
  validateDeviceToken,
  validateFileType,
  validateFileSize,
  validateKYCDocument
}; 
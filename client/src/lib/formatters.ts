// Format currency (defaults to MAD - Moroccan Dirham)
export function formatCurrency(amount: number, currencyCode = 'MAD', locale = 'fr-MA') {
  // Handle undefined or null values
  if (amount === undefined || amount === null) {
    return 'N/A';
  }

  // Format the currency based on the locale
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date (defaults to Moroccan format)
export function formatDate(date: Date | string, locale = 'fr-MA') {
  // Handle undefined or null values
  if (!date) {
    return 'N/A';
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Format the date based on the locale
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
}

// Format percentage
export function formatPercentage(value: number, digits = 1) {
  // Handle undefined or null values
  if (value === undefined || value === null) {
    return 'N/A';
  }

  return `${value.toFixed(digits)}%`;
}

// Format phone number for Morocco
export function formatPhoneNumber(phoneNumber: string) {
  // Handle undefined or null values
  if (!phoneNumber) {
    return 'N/A';
  }

  // Clean the phone number by removing non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if it's a Moroccan number
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  } else if (cleaned.length === 12 && cleaned.startsWith('212')) {
    // International format +212
    return '+' + cleaned.replace(/(\d{3})(\d{2})(\d{2})(\d{2})(\d{3})/, '$1 $2 $3 $4 $5');
  }
  
  // Return as is if it doesn't match expected formats
  return phoneNumber;
}

// Short format for numbers (1K, 2.5M, etc.)
export function formatCompactNumber(num: number, locale = 'fr-MA') {
  // Handle undefined or null values
  if (num === undefined || num === null) {
    return 'N/A';
  }

  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num);
}
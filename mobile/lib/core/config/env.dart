import 'package:flutter/foundation.dart';

class Env {
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://api.floussly.com',
  );

  static const String apiVersion = String.fromEnvironment(
    'API_VERSION',
    defaultValue: 'v1',
  );

  static const int apiTimeout = int.fromEnvironment(
    'API_TIMEOUT',
    defaultValue: 30000,
  );

  static const int maxRetries = int.fromEnvironment(
    'MAX_RETRIES',
    defaultValue: 3,
  );

  static const int retryDelay = int.fromEnvironment(
    'RETRY_DELAY',
    defaultValue: 1000,
  );

  static const String appName = 'Floussly';
  static const String appVersion = '1.0.0';
  static const String appBuildNumber = '1';

  static bool get isDevelopment => kDebugMode;
  static bool get isProduction => kReleaseMode;
  static bool get isStaging => const bool.fromEnvironment('STAGING', defaultValue: false);

  static String get apiUrl => '$apiBaseUrl/$apiVersion';

  static const Map<String, String> headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  static const Map<String, dynamic> defaultErrorResponse = {
    'status': 'error',
    'message': 'An unexpected error occurred',
    'code': 'UNKNOWN_ERROR',
  };

  static const int splashDuration = 2; // seconds
  static const int otpLength = 6;
  static const int otpTimeout = 300; // seconds
  static const int sessionTimeout = 3600; // seconds
  static const int maxLoginAttempts = 5;
  static const int lockoutDuration = 900; // seconds

  static const double defaultPadding = 16.0;
  static const double defaultRadius = 8.0;
  static const double defaultIconSize = 24.0;
  static const double defaultButtonHeight = 48.0;
  static const double defaultInputHeight = 56.0;

  static const String defaultDateFormat = 'yyyy-MM-dd';
  static const String defaultTimeFormat = 'HH:mm:ss';
  static const String defaultDateTimeFormat = 'yyyy-MM-dd HH:mm:ss';
  static const String defaultCurrency = 'MAD';
  static const String defaultLocale = 'en_US';

  static const List<String> supportedLocales = ['en_US', 'fr_FR', 'ar_MA'];
  static const List<String> supportedCurrencies = ['MAD', 'USD', 'EUR'];

  static const Map<String, String> currencySymbols = {
    'MAD': 'د.م.',
    'USD': '\$',
    'EUR': '€',
  };

  static const Map<String, String> currencyNames = {
    'MAD': 'Moroccan Dirham',
    'USD': 'US Dollar',
    'EUR': 'Euro',
  };

  static const Map<String, double> currencyDecimals = {
    'MAD': 2,
    'USD': 2,
    'EUR': 2,
  };

  static const Map<String, String> countryCodes = {
    'MA': 'Morocco',
    'US': 'United States',
    'FR': 'France',
  };

  static const Map<String, String> countryFlags = {
    'MA': '🇲🇦',
    'US': '🇺🇸',
    'FR': '🇫🇷',
  };

  static const Map<String, String> countryCurrencies = {
    'MA': 'MAD',
    'US': 'USD',
    'FR': 'EUR',
  };

  static const Map<String, String> countryLanguages = {
    'MA': 'ar_MA',
    'US': 'en_US',
    'FR': 'fr_FR',
  };

  static const Map<String, String> languageNames = {
    'en_US': 'English',
    'fr_FR': 'Français',
    'ar_MA': 'العربية',
  };

  static const Map<String, String> languageFlags = {
    'en_US': '🇺🇸',
    'fr_FR': '🇫🇷',
    'ar_MA': '🇲🇦',
  };

  static const Map<String, String> languageCodes = {
    'en_US': 'en',
    'fr_FR': 'fr',
    'ar_MA': 'ar',
  };

  static const Map<String, String> languageDirections = {
    'en_US': 'ltr',
    'fr_FR': 'ltr',
    'ar_MA': 'rtl',
  };
} 
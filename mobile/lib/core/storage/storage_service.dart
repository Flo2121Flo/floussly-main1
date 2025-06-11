import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:logger/logger.dart';

class StorageService {
  final FlutterSecureStorage _secureStorage;
  final SharedPreferences _prefs;
  final Logger _logger;

  StorageService({
    FlutterSecureStorage? secureStorage,
    SharedPreferences? prefs,
    Logger? logger,
  })  : _secureStorage = secureStorage ?? const FlutterSecureStorage(),
        _prefs = prefs ?? throw ArgumentError('SharedPreferences is required'),
        _logger = logger ?? Logger();

  // Secure Storage Methods
  Future<void> writeSecure(String key, String value) async {
    try {
      await _secureStorage.write(key: key, value: value);
    } catch (e) {
      _logger.e('Error writing to secure storage: $e');
      rethrow;
    }
  }

  Future<String?> readSecure(String key) async {
    try {
      return await _secureStorage.read(key: key);
    } catch (e) {
      _logger.e('Error reading from secure storage: $e');
      return null;
    }
  }

  Future<void> deleteSecure(String key) async {
    try {
      await _secureStorage.delete(key: key);
    } catch (e) {
      _logger.e('Error deleting from secure storage: $e');
      rethrow;
    }
  }

  Future<void> deleteAllSecure() async {
    try {
      await _secureStorage.deleteAll();
    } catch (e) {
      _logger.e('Error deleting all from secure storage: $e');
      rethrow;
    }
  }

  // Shared Preferences Methods
  Future<void> write(String key, dynamic value) async {
    try {
      if (value is String) {
        await _prefs.setString(key, value);
      } else if (value is bool) {
        await _prefs.setBool(key, value);
      } else if (value is int) {
        await _prefs.setInt(key, value);
      } else if (value is double) {
        await _prefs.setDouble(key, value);
      } else if (value is List<String>) {
        await _prefs.setStringList(key, value);
      } else if (value is Map) {
        await _prefs.setString(key, json.encode(value));
      }
    } catch (e) {
      _logger.e('Error writing to preferences: $e');
      rethrow;
    }
  }

  T? read<T>(String key) {
    try {
      if (T == String) {
        return _prefs.getString(key) as T?;
      } else if (T == bool) {
        return _prefs.getBool(key) as T?;
      } else if (T == int) {
        return _prefs.getInt(key) as T?;
      } else if (T == double) {
        return _prefs.getDouble(key) as T?;
      } else if (T == List<String>) {
        return _prefs.getStringList(key) as T?;
      } else if (T == Map) {
        final String? value = _prefs.getString(key);
        if (value != null) {
          return json.decode(value) as T;
        }
      }
      return null;
    } catch (e) {
      _logger.e('Error reading from preferences: $e');
      return null;
    }
  }

  Future<void> delete(String key) async {
    try {
      await _prefs.remove(key);
    } catch (e) {
      _logger.e('Error deleting from preferences: $e');
      rethrow;
    }
  }

  Future<void> deleteAll() async {
    try {
      await _prefs.clear();
    } catch (e) {
      _logger.e('Error clearing preferences: $e');
      rethrow;
    }
  }

  bool hasKey(String key) {
    try {
      return _prefs.containsKey(key);
    } catch (e) {
      _logger.e('Error checking key in preferences: $e');
      return false;
    }
  }

  Set<String> getKeys() {
    try {
      return _prefs.getKeys();
    } catch (e) {
      _logger.e('Error getting keys from preferences: $e');
      return {};
    }
  }

  // Auth-specific methods
  Future<void> saveAuthTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    try {
      await writeSecure('auth_token', accessToken);
      await writeSecure('refresh_token', refreshToken);
    } catch (e) {
      _logger.e('Error saving auth tokens: $e');
      rethrow;
    }
  }

  Future<Map<String, String?>> getAuthTokens() async {
    try {
      final accessToken = await readSecure('auth_token');
      final refreshToken = await readSecure('refresh_token');
      return {
        'access_token': accessToken,
        'refresh_token': refreshToken,
      };
    } catch (e) {
      _logger.e('Error getting auth tokens: $e');
      return {
        'access_token': null,
        'refresh_token': null,
      };
    }
  }

  Future<void> clearAuthTokens() async {
    try {
      await deleteSecure('auth_token');
      await deleteSecure('refresh_token');
    } catch (e) {
      _logger.e('Error clearing auth tokens: $e');
      rethrow;
    }
  }

  // User preferences methods
  Future<void> saveUserPreferences({
    required String language,
    required String currency,
    required bool darkMode,
    required bool notificationsEnabled,
  }) async {
    try {
      await write('language', language);
      await write('currency', currency);
      await write('dark_mode', darkMode);
      await write('notifications_enabled', notificationsEnabled);
    } catch (e) {
      _logger.e('Error saving user preferences: $e');
      rethrow;
    }
  }

  Map<String, dynamic> getUserPreferences() {
    try {
      return {
        'language': read<String>('language') ?? 'en_US',
        'currency': read<String>('currency') ?? 'MAD',
        'dark_mode': read<bool>('dark_mode') ?? false,
        'notifications_enabled': read<bool>('notifications_enabled') ?? true,
      };
    } catch (e) {
      _logger.e('Error getting user preferences: $e');
      return {
        'language': 'en_US',
        'currency': 'MAD',
        'dark_mode': false,
        'notifications_enabled': true,
      };
    }
  }
} 
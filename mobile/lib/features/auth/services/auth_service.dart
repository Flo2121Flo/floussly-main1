import 'package:dio/dio.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../../core/network/api_client.dart';
import '../models/auth_models.dart';

part 'auth_service.g.dart';

class AuthService {
  final ApiClient _apiClient;

  AuthService(this._apiClient);

  Future<AuthResponse> login(LoginRequest request) async {
    try {
      final response = await _apiClient.post(
        '/auth/login',
        data: request.toJson(),
      );
      return AuthResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<AuthResponse> register(RegisterRequest request) async {
    try {
      final response = await _apiClient.post(
        '/auth/register',
        data: request.toJson(),
      );
      return AuthResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<OTPResponse> requestOTP(OTPRequest request) async {
    try {
      final response = await _apiClient.post(
        '/auth/otp/request',
        data: request.toJson(),
      );
      return OTPResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<OTPResponse> verifyOTP(OTPVerifyRequest request) async {
    try {
      final response = await _apiClient.post(
        '/auth/otp/verify',
        data: request.toJson(),
      );
      return OTPResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<PasswordResetResponse> resetPassword(PasswordResetRequest request) async {
    try {
      final response = await _apiClient.post(
        '/auth/password/reset',
        data: request.toJson(),
      );
      return PasswordResetResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<void> logout() async {
    try {
      await _apiClient.post('/auth/logout');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<AuthResponse> refreshToken(String refreshToken) async {
    try {
      final response = await _apiClient.post(
        '/auth/refresh',
        data: {'refresh_token': refreshToken},
      );
      return AuthResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<User> getCurrentUser() async {
    try {
      final response = await _apiClient.get('/auth/me');
      return User.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<void> updateProfile({
    String? firstName,
    String? lastName,
    String? phoneNumber,
    String? avatar,
  }) async {
    try {
      final data = {
        if (firstName != null) 'firstName': firstName,
        if (lastName != null) 'lastName': lastName,
        if (phoneNumber != null) 'phoneNumber': phoneNumber,
        if (avatar != null) 'avatar': avatar,
      };

      await _apiClient.put(
        '/auth/profile',
        data: data,
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      await _apiClient.put(
        '/auth/password',
        data: {
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        },
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<void> deleteAccount() async {
    try {
      await _apiClient.delete('/auth/account');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Exception _handleError(DioException e) {
    if (e.response?.statusCode == 401) {
      return UnauthorizedException('Invalid credentials');
    } else if (e.response?.statusCode == 400) {
      return BadRequestException(e.response?.data['message'] ?? 'Invalid request');
    } else if (e.response?.statusCode == 404) {
      return NotFoundException('Resource not found');
    } else if (e.response?.statusCode == 409) {
      return ConflictException('Resource already exists');
    } else if (e.response?.statusCode == 422) {
      return ValidationException(e.response?.data['message'] ?? 'Validation failed');
    } else if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout) {
      return TimeoutException('Request timed out');
    } else if (e.type == DioExceptionType.unknown) {
      return NetworkException('Network error occurred');
    } else {
      return UnknownException('An unknown error occurred');
    }
  }
}

@riverpod
AuthService authService(AuthServiceRef ref) {
  final apiClient = ref.watch(apiClientProvider);
  return AuthService(apiClient);
}

@riverpod
ApiClient apiClient(ApiClientRef ref) {
  return ApiClient();
}

// Custom Exceptions
class UnauthorizedException implements Exception {
  final String message;
  UnauthorizedException(this.message);
}

class BadRequestException implements Exception {
  final String message;
  BadRequestException(this.message);
}

class NotFoundException implements Exception {
  final String message;
  NotFoundException(this.message);
}

class ConflictException implements Exception {
  final String message;
  ConflictException(this.message);
}

class ValidationException implements Exception {
  final String message;
  ValidationException(this.message);
}

class TimeoutException implements Exception {
  final String message;
  TimeoutException(this.message);
}

class NetworkException implements Exception {
  final String message;
  NetworkException(this.message);
}

class UnknownException implements Exception {
  final String message;
  UnknownException(this.message);
} 
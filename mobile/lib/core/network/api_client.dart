import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:logger/logger.dart';
import '../config/env.dart';

class ApiClient {
  late final Dio _dio;
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();
  final Logger _logger = Logger();

  ApiClient() {
    _dio = Dio(
      BaseOptions(
        baseUrl: Env.apiUrl,
        connectTimeout: Duration(milliseconds: Env.apiTimeout),
        receiveTimeout: Duration(milliseconds: Env.apiTimeout),
        headers: Env.headers,
      ),
    );

    _setupInterceptors();
  }

  void _setupInterceptors() {
    _dio.interceptors.addAll([
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          try {
            final token = await _secureStorage.read(key: 'auth_token');
            if (token != null) {
              options.headers['Authorization'] = 'Bearer $token';
            }
            return handler.next(options);
          } catch (e) {
            _logger.e('Error in request interceptor: $e');
            return handler.next(options);
          }
        },
        onResponse: (response, handler) {
          _logger.i('Response: ${response.statusCode} - ${response.requestOptions.path}');
          return handler.next(response);
        },
        onError: (DioException e, handler) async {
          _logger.e('Error: ${e.message} - ${e.requestOptions.path}');

          if (e.response?.statusCode == 401) {
            // Handle token refresh or logout
            await _handleUnauthorized();
          }

          return handler.next(e);
        },
      ),
      LogInterceptor(
        requestBody: true,
        responseBody: true,
        logPrint: (object) => _logger.d(object),
      ),
    ]);
  }

  Future<void> _handleUnauthorized() async {
    try {
      final refreshToken = await _secureStorage.read(key: 'refresh_token');
      if (refreshToken != null) {
        final response = await _dio.post(
          '/auth/refresh',
          data: {'refresh_token': refreshToken},
        );

        if (response.statusCode == 200) {
          final newToken = response.data['token'];
          await _secureStorage.write(key: 'auth_token', value: newToken);
          return;
        }
      }
    } catch (e) {
      _logger.e('Error refreshing token: $e');
    }

    // If refresh fails, clear tokens and trigger logout
    await _secureStorage.deleteAll();
    // TODO: Implement logout logic
  }

  Future<Response> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.get(
        path,
        queryParameters: queryParameters,
        options: options,
      );
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  Future<Response> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.post(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  Future<Response> put(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.put(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  Future<Response> delete(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.delete(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  void _handleError(DioException e) {
    if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout) {
      _logger.e('Connection timeout');
      // TODO: Implement retry logic
    } else if (e.type == DioExceptionType.badResponse) {
      _logger.e('Bad response: ${e.response?.statusCode}');
      // TODO: Handle specific error codes
    } else if (e.type == DioExceptionType.unknown) {
      _logger.e('Unknown error: ${e.message}');
      // TODO: Handle network errors
    }
  }
} 
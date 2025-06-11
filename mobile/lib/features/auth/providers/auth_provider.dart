import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../models/auth_models.dart';
import '../services/auth_service.dart';
import '../../../core/storage/storage_service.dart';

part 'auth_provider.g.dart';

@riverpod
class Auth extends _$Auth {
  @override
  FutureOr<User?> build() async {
    try {
      final authService = ref.watch(authServiceProvider);
      final storageService = ref.watch(storageServiceProvider);

      // Check if we have tokens
      final tokens = await storageService.getAuthTokens();
      if (tokens['access_token'] == null || tokens['refresh_token'] == null) {
        return null;
      }

      // Get current user
      return await authService.getCurrentUser();
    } catch (e) {
      return null;
    }
  }

  Future<void> login(String email, String password) async {
    state = const AsyncLoading();

    try {
      final authService = ref.watch(authServiceProvider);
      final storageService = ref.watch(storageServiceProvider);

      final response = await authService.login(
        LoginRequest(email: email, password: password),
      );

      // Save tokens
      await storageService.saveAuthTokens(
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      );

      // Update state with user
      state = AsyncData(response.user);
    } catch (e) {
      state = AsyncError(e, StackTrace.current);
    }
  }

  Future<void> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    required String phoneNumber,
  }) async {
    state = const AsyncLoading();

    try {
      final authService = ref.watch(authServiceProvider);
      final storageService = ref.watch(storageServiceProvider);

      final response = await authService.register(
        RegisterRequest(
          email: email,
          password: password,
          firstName: firstName,
          lastName: lastName,
          phoneNumber: phoneNumber,
        ),
      );

      // Save tokens
      await storageService.saveAuthTokens(
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      );

      // Update state with user
      state = AsyncData(response.user);
    } catch (e) {
      state = AsyncError(e, StackTrace.current);
    }
  }

  Future<void> logout() async {
    try {
      final authService = ref.watch(authServiceProvider);
      final storageService = ref.watch(storageServiceProvider);

      await authService.logout();
      await storageService.clearAuthTokens();

      state = const AsyncData(null);
    } catch (e) {
      state = AsyncError(e, StackTrace.current);
    }
  }

  Future<void> requestOTP(String email, String type) async {
    try {
      final authService = ref.watch(authServiceProvider);

      await authService.requestOTP(
        OTPRequest(email: email, type: type),
      );
    } catch (e) {
      state = AsyncError(e, StackTrace.current);
    }
  }

  Future<void> verifyOTP(String email, String otp, String type) async {
    try {
      final authService = ref.watch(authServiceProvider);

      await authService.verifyOTP(
        OTPVerifyRequest(email: email, otp: otp, type: type),
      );
    } catch (e) {
      state = AsyncError(e, StackTrace.current);
    }
  }

  Future<void> resetPassword({
    required String email,
    required String otp,
    required String newPassword,
  }) async {
    try {
      final authService = ref.watch(authServiceProvider);

      await authService.resetPassword(
        PasswordResetRequest(
          email: email,
          otp: otp,
          newPassword: newPassword,
        ),
      );
    } catch (e) {
      state = AsyncError(e, StackTrace.current);
    }
  }

  Future<void> updateProfile({
    String? firstName,
    String? lastName,
    String? phoneNumber,
    String? avatar,
  }) async {
    try {
      final authService = ref.watch(authServiceProvider);

      await authService.updateProfile(
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
        avatar: avatar,
      );

      // Refresh user data
      final user = await authService.getCurrentUser();
      state = AsyncData(user);
    } catch (e) {
      state = AsyncError(e, StackTrace.current);
    }
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      final authService = ref.watch(authServiceProvider);

      await authService.changePassword(
        currentPassword: currentPassword,
        newPassword: newPassword,
      );
    } catch (e) {
      state = AsyncError(e, StackTrace.current);
    }
  }

  Future<void> deleteAccount() async {
    try {
      final authService = ref.watch(authServiceProvider);
      final storageService = ref.watch(storageServiceProvider);

      await authService.deleteAccount();
      await storageService.clearAuthTokens();

      state = const AsyncData(null);
    } catch (e) {
      state = AsyncError(e, StackTrace.current);
    }
  }
}

@riverpod
StorageService storageService(StorageServiceRef ref) {
  throw UnimplementedError('StorageService must be provided');
} 
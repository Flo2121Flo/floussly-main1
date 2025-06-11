import 'package:json_annotation/json_annotation.dart';

part 'auth_models.g.dart';

@JsonSerializable()
class LoginRequest {
  final String email;
  final String password;

  LoginRequest({
    required this.email,
    required this.password,
  });

  factory LoginRequest.fromJson(Map<String, dynamic> json) =>
      _$LoginRequestFromJson(json);

  Map<String, dynamic> toJson() => _$LoginRequestToJson(this);
}

@JsonSerializable()
class RegisterRequest {
  final String email;
  final String password;
  final String firstName;
  final String lastName;
  final String phoneNumber;

  RegisterRequest({
    required this.email,
    required this.password,
    required this.firstName,
    required this.lastName,
    required this.phoneNumber,
  });

  factory RegisterRequest.fromJson(Map<String, dynamic> json) =>
      _$RegisterRequestFromJson(json);

  Map<String, dynamic> toJson() => _$RegisterRequestToJson(this);
}

@JsonSerializable()
class AuthResponse {
  final String accessToken;
  final String refreshToken;
  final User user;

  AuthResponse({
    required this.accessToken,
    required this.refreshToken,
    required this.user,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) =>
      _$AuthResponseFromJson(json);

  Map<String, dynamic> toJson() => _$AuthResponseToJson(this);
}

@JsonSerializable()
class User {
  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final String phoneNumber;
  final String? avatar;
  final bool isEmailVerified;
  final bool isPhoneVerified;
  final String? kycStatus;
  final DateTime createdAt;
  final DateTime updatedAt;

  User({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.phoneNumber,
    this.avatar,
    required this.isEmailVerified,
    required this.isPhoneVerified,
    this.kycStatus,
    required this.createdAt,
    required this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);

  Map<String, dynamic> toJson() => _$UserToJson(this);

  String get fullName => '$firstName $lastName';
}

@JsonSerializable()
class OTPRequest {
  final String email;
  final String type;

  OTPRequest({
    required this.email,
    required this.type,
  });

  factory OTPRequest.fromJson(Map<String, dynamic> json) =>
      _$OTPRequestFromJson(json);

  Map<String, dynamic> toJson() => _$OTPRequestToJson(this);
}

@JsonSerializable()
class OTPVerifyRequest {
  final String email;
  final String otp;
  final String type;

  OTPVerifyRequest({
    required this.email,
    required this.otp,
    required this.type,
  });

  factory OTPVerifyRequest.fromJson(Map<String, dynamic> json) =>
      _$OTPVerifyRequestFromJson(json);

  Map<String, dynamic> toJson() => _$OTPVerifyRequestToJson(this);
}

@JsonSerializable()
class OTPResponse {
  final String message;
  final int expiresIn;

  OTPResponse({
    required this.message,
    required this.expiresIn,
  });

  factory OTPResponse.fromJson(Map<String, dynamic> json) =>
      _$OTPResponseFromJson(json);

  Map<String, dynamic> toJson() => _$OTPResponseToJson(this);
}

@JsonSerializable()
class PasswordResetRequest {
  final String email;
  final String otp;
  final String newPassword;

  PasswordResetRequest({
    required this.email,
    required this.otp,
    required this.newPassword,
  });

  factory PasswordResetRequest.fromJson(Map<String, dynamic> json) =>
      _$PasswordResetRequestFromJson(json);

  Map<String, dynamic> toJson() => _$PasswordResetRequestToJson(this);
}

@JsonSerializable()
class PasswordResetResponse {
  final String message;

  PasswordResetResponse({
    required this.message,
  });

  factory PasswordResetResponse.fromJson(Map<String, dynamic> json) =>
      _$PasswordResetResponseFromJson(json);

  Map<String, dynamic> toJson() => _$PasswordResetResponseToJson(this);
} 
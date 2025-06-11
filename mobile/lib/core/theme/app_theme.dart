import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const _primaryColor = Color(0xFF1E88E5);
  static const _secondaryColor = Color(0xFF26A69A);
  static const _errorColor = Color(0xFFE53935);
  static const _successColor = Color(0xFF43A047);
  static const _warningColor = Color(0xFFFFA000);
  static const _infoColor = Color(0xFF039BE5);

  // Light Theme Colors
  static const _lightBackgroundColor = Color(0xFFF5F5F5);
  static const _lightSurfaceColor = Colors.white;
  static const _lightTextColor = Color(0xFF212121);
  static const _lightSecondaryTextColor = Color(0xFF757575);

  // Dark Theme Colors
  static const _darkBackgroundColor = Color(0xFF121212);
  static const _darkSurfaceColor = Color(0xFF1E1E1E);
  static const _darkTextColor = Colors.white;
  static const _darkSecondaryTextColor = Color(0xFFB0B0B0);

  // Moroccan-inspired accent colors
  static const _moroccanBlue = Color(0xFF1E3D59);
  static const _moroccanOrange = Color(0xFFFF6E40);
  static const _moroccanGold = Color(0xFFFFC13B);
  static const _moroccanTeal = Color(0xFF17B978);

  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    colorScheme: ColorScheme.light(
      primary: _primaryColor,
      secondary: _secondaryColor,
      error: _errorColor,
      background: _lightBackgroundColor,
      surface: _lightSurfaceColor,
      onPrimary: Colors.white,
      onSecondary: Colors.white,
      onError: Colors.white,
      onBackground: _lightTextColor,
      onSurface: _lightTextColor,
    ),
    textTheme: GoogleFonts.interTextTheme(
      ThemeData.light().textTheme.copyWith(
            displayLarge: const TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: _lightTextColor,
            ),
            displayMedium: const TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: _lightTextColor,
            ),
            displaySmall: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: _lightTextColor,
            ),
            headlineMedium: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: _lightTextColor,
            ),
            bodyLarge: const TextStyle(
              fontSize: 16,
              color: _lightTextColor,
            ),
            bodyMedium: const TextStyle(
              fontSize: 14,
              color: _lightTextColor,
            ),
            labelLarge: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: _lightTextColor,
            ),
          ),
    ),
    appBarTheme: const AppBarTheme(
      systemOverlayStyle: SystemUiOverlayStyle.dark,
      backgroundColor: _lightSurfaceColor,
      elevation: 0,
      centerTitle: true,
      iconTheme: IconThemeData(color: _lightTextColor),
      titleTextStyle: TextStyle(
        color: _lightTextColor,
        fontSize: 20,
        fontWeight: FontWeight.w600,
      ),
    ),
    cardTheme: CardTheme(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      color: _lightSurfaceColor,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        elevation: 0,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: _lightSurfaceColor,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide.none,
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: _primaryColor, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: _errorColor, width: 2),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
    ),
  );

  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    colorScheme: ColorScheme.dark(
      primary: _primaryColor,
      secondary: _secondaryColor,
      error: _errorColor,
      background: _darkBackgroundColor,
      surface: _darkSurfaceColor,
      onPrimary: Colors.white,
      onSecondary: Colors.white,
      onError: Colors.white,
      onBackground: _darkTextColor,
      onSurface: _darkTextColor,
    ),
    textTheme: GoogleFonts.interTextTheme(
      ThemeData.dark().textTheme.copyWith(
            displayLarge: const TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: _darkTextColor,
            ),
            displayMedium: const TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: _darkTextColor,
            ),
            displaySmall: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: _darkTextColor,
            ),
            headlineMedium: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: _darkTextColor,
            ),
            bodyLarge: const TextStyle(
              fontSize: 16,
              color: _darkTextColor,
            ),
            bodyMedium: const TextStyle(
              fontSize: 14,
              color: _darkTextColor,
            ),
            labelLarge: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: _darkTextColor,
            ),
          ),
    ),
    appBarTheme: const AppBarTheme(
      systemOverlayStyle: SystemUiOverlayStyle.light,
      backgroundColor: _darkSurfaceColor,
      elevation: 0,
      centerTitle: true,
      iconTheme: IconThemeData(color: _darkTextColor),
      titleTextStyle: TextStyle(
        color: _darkTextColor,
        fontSize: 20,
        fontWeight: FontWeight.w600,
      ),
    ),
    cardTheme: CardTheme(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      color: _darkSurfaceColor,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        elevation: 0,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: _darkSurfaceColor,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide.none,
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: _primaryColor, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: _errorColor, width: 2),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
    ),
  );

  // Animation durations
  static const Duration shortAnimation = Duration(milliseconds: 200);
  static const Duration mediumAnimation = Duration(milliseconds: 300);
  static const Duration longAnimation = Duration(milliseconds: 500);

  // Spacing
  static const double spacing4 = 4.0;
  static const double spacing8 = 8.0;
  static const double spacing12 = 12.0;
  static const double spacing16 = 16.0;
  static const double spacing20 = 20.0;
  static const double spacing24 = 24.0;
  static const double spacing32 = 32.0;
  static const double spacing40 = 40.0;
  static const double spacing48 = 48.0;
  static const double spacing56 = 56.0;
  static const double spacing64 = 64.0;

  // Border radius
  static const double radius4 = 4.0;
  static const double radius8 = 8.0;
  static const double radius12 = 12.0;
  static const double radius16 = 16.0;
  static const double radius20 = 20.0;
  static const double radius24 = 24.0;
  static const double radius32 = 32.0;
  static const double radius40 = 40.0;
  static const double radius48 = 48.0;
  static const double radius56 = 56.0;
  static const double radius64 = 64.0;

  // Shadows
  static List<BoxShadow> get shadowSmall => [
        BoxShadow(
          color: Colors.black.withOpacity(0.05),
          blurRadius: 4,
          offset: const Offset(0, 2),
        ),
      ];

  static List<BoxShadow> get shadowMedium => [
        BoxShadow(
          color: Colors.black.withOpacity(0.1),
          blurRadius: 8,
          offset: const Offset(0, 4),
        ),
      ];

  static List<BoxShadow> get shadowLarge => [
        BoxShadow(
          color: Colors.black.withOpacity(0.15),
          blurRadius: 16,
          offset: const Offset(0, 8),
        ),
      ];
} 
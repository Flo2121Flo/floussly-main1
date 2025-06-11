import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class AppLoading extends StatelessWidget {
  final double size;
  final Color? color;
  final double strokeWidth;
  final String? message;

  const AppLoading({
    Key? key,
    this.size = 24.0,
    this.color,
    this.strokeWidth = 2.0,
    this.message,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    Widget loading = SizedBox(
      width: size,
      height: size,
      child: CircularProgressIndicator(
        strokeWidth: strokeWidth,
        valueColor: AlwaysStoppedAnimation<Color>(
          color ?? theme.colorScheme.primary,
        ),
      ),
    );

    if (message != null) {
      loading = Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          loading,
          const SizedBox(height: AppTheme.spacing16),
          Text(
            message!,
            style: theme.textTheme.bodyLarge?.copyWith(
              color: theme.colorScheme.onSurface,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      );
    }

    return Center(child: loading);
  }
}

class AppLoadingOverlay extends StatelessWidget {
  final bool isLoading;
  final Widget child;
  final String? message;
  final Color? backgroundColor;
  final double opacity;

  const AppLoadingOverlay({
    Key? key,
    required this.isLoading,
    required this.child,
    this.message,
    this.backgroundColor,
    this.opacity = 0.5,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Stack(
      children: [
        child,
        if (isLoading)
          Positioned.fill(
            child: Container(
              color: (backgroundColor ?? theme.colorScheme.background)
                  .withOpacity(opacity),
              child: AppLoading(
                size: 32.0,
                message: message,
              ),
            ),
          ),
      ],
    );
  }
}

class AppLoadingButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final AppButtonVariant variant;
  final AppButtonSize size;
  final bool isFullWidth;
  final IconData? icon;
  final Color? backgroundColor;
  final Color? textColor;

  const AppLoadingButton({
    Key? key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
    this.variant = AppButtonVariant.primary,
    this.size = AppButtonSize.medium,
    this.isFullWidth = false,
    this.icon,
    this.backgroundColor,
    this.textColor,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AppButton(
      text: text,
      onPressed: isLoading ? null : onPressed,
      variant: variant,
      size: size,
      isLoading: isLoading,
      isFullWidth: isFullWidth,
      icon: icon,
      backgroundColor: backgroundColor,
      textColor: textColor,
    );
  }
}

class AppLoadingPage extends StatelessWidget {
  final String? message;
  final Color? backgroundColor;

  const AppLoadingPage({
    Key? key,
    this.message,
    this.backgroundColor,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: backgroundColor ?? theme.colorScheme.background,
      body: AppLoading(
        size: 48.0,
        message: message,
      ),
    );
  }
}

class AppLoadingDialog extends StatelessWidget {
  final String? message;
  final Color? backgroundColor;
  final double opacity;

  const AppLoadingDialog({
    Key? key,
    this.message,
    this.backgroundColor,
    this.opacity = 0.5,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Dialog(
      backgroundColor: Colors.transparent,
      elevation: 0,
      child: Container(
        padding: const EdgeInsets.all(AppTheme.spacing24),
        decoration: BoxDecoration(
          color: (backgroundColor ?? theme.colorScheme.surface)
              .withOpacity(opacity),
          borderRadius: BorderRadius.circular(AppTheme.radius16),
        ),
        child: AppLoading(
          size: 48.0,
          message: message,
        ),
      ),
    );
  }
} 
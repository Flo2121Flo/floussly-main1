import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';

enum AppErrorVariant {
  standard,
  filled,
  outlined,
}

enum AppErrorSize {
  small,
  medium,
  large,
}

class AppError extends StatelessWidget {
  final String? title;
  final String? message;
  final Widget? icon;
  final List<Widget>? actions;
  final AppErrorVariant variant;
  final AppErrorSize size;
  final Color? backgroundColor;
  final Color? borderColor;
  final Color? titleColor;
  final Color? messageColor;
  final double? elevation;
  final EdgeInsetsGeometry? margin;
  final EdgeInsetsGeometry? padding;
  final double? borderRadius;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;
  final VoidCallback? onRetry;
  final VoidCallback? onDismiss;

  const AppError({
    Key? key,
    this.title,
    this.message,
    this.icon,
    this.actions,
    this.variant = AppErrorVariant.standard,
    this.size = AppErrorSize.medium,
    this.backgroundColor,
    this.borderColor,
    this.titleColor,
    this.messageColor,
    this.elevation,
    this.margin,
    this.padding,
    this.borderRadius,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
    this.onRetry,
    this.onDismiss,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate error colors
    final errorColors = _getErrorColors(theme);

    // Calculate error margin
    final errorMargin = margin ??
        EdgeInsets.all(
          size == AppErrorSize.small
              ? AppTheme.spacing2
              : size == AppErrorSize.medium
                  ? AppTheme.spacing4
                  : AppTheme.spacing6,
        );

    // Calculate error padding
    final errorPadding = padding ??
        EdgeInsets.all(
          size == AppErrorSize.small
              ? AppTheme.spacing4
              : size == AppErrorSize.medium
                  ? AppTheme.spacing6
                  : AppTheme.spacing8,
        );

    // Calculate error elevation
    final errorElevation = elevation ??
        (variant == AppErrorVariant.standard
            ? (size == AppErrorSize.small
                ? 2.0
                : size == AppErrorSize.medium
                    ? 4.0
                    : 8.0)
            : 0.0);

    // Calculate error border radius
    final errorBorderRadius = borderRadius ??
        (size == AppErrorSize.small
            ? AppTheme.radius4
            : size == AppErrorSize.medium
                ? AppTheme.radius6
                : AppTheme.radius8);

    // Calculate error spacing
    final errorSpacing = size == AppErrorSize.small
        ? AppTheme.spacing2
        : size == AppErrorSize.medium
            ? AppTheme.spacing3
            : AppTheme.spacing4;

    // Calculate error icon size
    final errorIconSize = size == AppErrorSize.small
        ? 24.0
        : size == AppErrorSize.medium
            ? 32.0
            : 40.0;

    // Calculate error title style
    final errorTitleStyle = TextStyle(
      color: titleColor ?? errorColors.titleColor,
      fontSize: size == AppErrorSize.small
          ? 16.0
          : size == AppErrorSize.medium
              ? 18.0
              : 20.0,
      fontWeight: FontWeight.w600,
    );

    // Calculate error message style
    final errorMessageStyle = TextStyle(
      color: messageColor ?? errorColors.messageColor,
      fontSize: size == AppErrorSize.small
          ? 14.0
          : size == AppErrorSize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w500,
    );

    Widget error = Container(
      decoration: BoxDecoration(
        color: backgroundColor ?? errorColors.backgroundColor,
        borderRadius: BorderRadius.circular(errorBorderRadius),
        border: variant == AppErrorVariant.outlined
            ? Border.all(
                color: borderColor ?? errorColors.borderColor,
                width: 1.0,
              )
            : null,
        boxShadow: variant == AppErrorVariant.standard
            ? [
                BoxShadow(
                  color: theme.shadowColor.withOpacity(0.1),
                  blurRadius: errorElevation * 2,
                  offset: Offset(0, errorElevation),
                ),
              ]
            : null,
      ),
      margin: errorMargin,
      padding: errorPadding,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          if (icon != null) ...[
            IconTheme(
              data: IconThemeData(
                color: errorColors.titleColor,
                size: errorIconSize,
              ),
              child: icon!,
            ),
            SizedBox(height: errorSpacing),
          ],
          if (title != null) ...[
            Text(
              title!,
              style: errorTitleStyle,
              textAlign: TextAlign.center,
            ),
            SizedBox(height: errorSpacing / 2),
          ],
          if (message != null) ...[
            Text(
              message!,
              style: errorMessageStyle,
              textAlign: TextAlign.center,
            ),
            SizedBox(height: errorSpacing),
          ],
          if (actions != null || onRetry != null || onDismiss != null) ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (onRetry != null)
                  TextButton(
                    onPressed: onRetry,
                    child: Text('Retry'),
                  ),
                if (onRetry != null && (onDismiss != null || actions != null))
                  SizedBox(width: errorSpacing),
                if (onDismiss != null)
                  TextButton(
                    onPressed: onDismiss,
                    child: Text('Dismiss'),
                  ),
                if (onDismiss != null && actions != null)
                  SizedBox(width: errorSpacing),
                if (actions != null) ...actions!,
              ],
            ),
          ],
        ],
      ),
    );

    if (animate) {
      error = AppAnimations.fadeIn(
        error,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return error;
  }

  _ErrorColors _getErrorColors(ThemeData theme) {
    switch (variant) {
      case AppErrorVariant.standard:
        return _ErrorColors(
          backgroundColor: theme.colorScheme.errorContainer,
          borderColor: theme.colorScheme.error,
          titleColor: theme.colorScheme.onErrorContainer,
          messageColor: theme.colorScheme.onErrorContainer.withOpacity(0.8),
        );
      case AppErrorVariant.filled:
        return _ErrorColors(
          backgroundColor: theme.colorScheme.error,
          borderColor: theme.colorScheme.error,
          titleColor: theme.colorScheme.onError,
          messageColor: theme.colorScheme.onError.withOpacity(0.8),
        );
      case AppErrorVariant.outlined:
        return _ErrorColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.error,
          titleColor: theme.colorScheme.error,
          messageColor: theme.colorScheme.error.withOpacity(0.8),
        );
    }
  }
}

class _ErrorColors {
  final Color backgroundColor;
  final Color borderColor;
  final Color titleColor;
  final Color messageColor;

  const _ErrorColors({
    required this.backgroundColor,
    required this.borderColor,
    required this.titleColor,
    required this.messageColor,
  });
}

class AppErrorPage extends StatelessWidget {
  final String message;
  final VoidCallback? onRetry;
  final IconData? icon;
  final Color? color;
  final Color? backgroundColor;

  const AppErrorPage({
    Key? key,
    required this.message,
    this.onRetry,
    this.icon,
    this.color,
    this.backgroundColor,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: backgroundColor ?? theme.colorScheme.background,
      body: AppError(
        message: message,
        onRetry: onRetry,
        icon: icon,
        color: color,
        isFullPage: true,
      ),
    );
  }
}

class AppErrorDialog extends StatelessWidget {
  final String message;
  final VoidCallback? onRetry;
  final IconData? icon;
  final Color? color;
  final Color? backgroundColor;
  final double opacity;

  const AppErrorDialog({
    Key? key,
    required this.message,
    this.onRetry,
    this.icon,
    this.color,
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
        child: AppError(
          message: message,
          onRetry: onRetry,
          icon: icon,
          color: color,
        ),
      ),
    );
  }
}

class AppErrorSnackBar extends StatelessWidget {
  final String message;
  final VoidCallback? onRetry;
  final Duration duration;
  final Color? backgroundColor;
  final Color? textColor;

  const AppErrorSnackBar({
    Key? key,
    required this.message,
    this.onRetry,
    this.duration = const Duration(seconds: 4),
    this.backgroundColor,
    this.textColor,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return SnackBar(
      content: Row(
        children: [
          Icon(
            Icons.error_outline,
            color: textColor ?? theme.colorScheme.error,
          ),
          const SizedBox(width: AppTheme.spacing16),
          Expanded(
            child: Text(
              message,
              style: theme.textTheme.bodyLarge?.copyWith(
                color: textColor ?? theme.colorScheme.error,
              ),
            ),
          ),
        ],
      ),
      backgroundColor: backgroundColor ?? theme.colorScheme.errorContainer,
      duration: duration,
      action: onRetry != null
          ? SnackBarAction(
              label: 'Retry',
              onPressed: onRetry!,
              textColor: textColor ?? theme.colorScheme.error,
            )
          : null,
    );
  }
}

class AppErrorOverlay extends StatelessWidget {
  final String message;
  final VoidCallback? onRetry;
  final IconData? icon;
  final Color? color;
  final Color? backgroundColor;
  final double opacity;

  const AppErrorOverlay({
    Key? key,
    required this.message,
    this.onRetry,
    this.icon,
    this.color,
    this.backgroundColor,
    this.opacity = 0.5,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      color: (backgroundColor ?? theme.colorScheme.background)
          .withOpacity(opacity),
      child: AppError(
        message: message,
        onRetry: onRetry,
        icon: icon,
        color: color,
        isFullPage: true,
      ),
    );
  }
} 
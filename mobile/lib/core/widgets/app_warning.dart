import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';

enum AppWarningVariant {
  standard,
  filled,
  outlined,
}

enum AppWarningSize {
  small,
  medium,
  large,
}

class AppWarning extends StatelessWidget {
  final String? title;
  final String? message;
  final Widget? icon;
  final List<Widget>? actions;
  final AppWarningVariant variant;
  final AppWarningSize size;
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
  final VoidCallback? onAction;
  final VoidCallback? onDismiss;

  const AppWarning({
    Key? key,
    this.title,
    this.message,
    this.icon,
    this.actions,
    this.variant = AppWarningVariant.standard,
    this.size = AppWarningSize.medium,
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
    this.onAction,
    this.onDismiss,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate warning colors
    final warningColors = _getWarningColors(theme);

    // Calculate warning margin
    final warningMargin = margin ??
        EdgeInsets.all(
          size == AppWarningSize.small
              ? AppTheme.spacing2
              : size == AppWarningSize.medium
                  ? AppTheme.spacing4
                  : AppTheme.spacing6,
        );

    // Calculate warning padding
    final warningPadding = padding ??
        EdgeInsets.all(
          size == AppWarningSize.small
              ? AppTheme.spacing4
              : size == AppWarningSize.medium
                  ? AppTheme.spacing6
                  : AppTheme.spacing8,
        );

    // Calculate warning elevation
    final warningElevation = elevation ??
        (variant == AppWarningVariant.standard
            ? (size == AppWarningSize.small
                ? 2.0
                : size == AppWarningSize.medium
                    ? 4.0
                    : 8.0)
            : 0.0);

    // Calculate warning border radius
    final warningBorderRadius = borderRadius ??
        (size == AppWarningSize.small
            ? AppTheme.radius4
            : size == AppWarningSize.medium
                ? AppTheme.radius6
                : AppTheme.radius8);

    // Calculate warning spacing
    final warningSpacing = size == AppWarningSize.small
        ? AppTheme.spacing2
        : size == AppWarningSize.medium
            ? AppTheme.spacing3
            : AppTheme.spacing4;

    // Calculate warning icon size
    final warningIconSize = size == AppWarningSize.small
        ? 24.0
        : size == AppWarningSize.medium
            ? 32.0
            : 40.0;

    // Calculate warning title style
    final warningTitleStyle = TextStyle(
      color: titleColor ?? warningColors.titleColor,
      fontSize: size == AppWarningSize.small
          ? 16.0
          : size == AppWarningSize.medium
              ? 18.0
              : 20.0,
      fontWeight: FontWeight.w600,
    );

    // Calculate warning message style
    final warningMessageStyle = TextStyle(
      color: messageColor ?? warningColors.messageColor,
      fontSize: size == AppWarningSize.small
          ? 14.0
          : size == AppWarningSize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w500,
    );

    Widget warning = Container(
      decoration: BoxDecoration(
        color: backgroundColor ?? warningColors.backgroundColor,
        borderRadius: BorderRadius.circular(warningBorderRadius),
        border: variant == AppWarningVariant.outlined
            ? Border.all(
                color: borderColor ?? warningColors.borderColor,
                width: 1.0,
              )
            : null,
        boxShadow: variant == AppWarningVariant.standard
            ? [
                BoxShadow(
                  color: theme.shadowColor.withOpacity(0.1),
                  blurRadius: warningElevation * 2,
                  offset: Offset(0, warningElevation),
                ),
              ]
            : null,
      ),
      margin: warningMargin,
      padding: warningPadding,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          if (icon != null) ...[
            IconTheme(
              data: IconThemeData(
                color: warningColors.titleColor,
                size: warningIconSize,
              ),
              child: icon!,
            ),
            SizedBox(height: warningSpacing),
          ],
          if (title != null) ...[
            Text(
              title!,
              style: warningTitleStyle,
              textAlign: TextAlign.center,
            ),
            SizedBox(height: warningSpacing / 2),
          ],
          if (message != null) ...[
            Text(
              message!,
              style: warningMessageStyle,
              textAlign: TextAlign.center,
            ),
            SizedBox(height: warningSpacing),
          ],
          if (actions != null || onAction != null || onDismiss != null) ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (onAction != null)
                  TextButton(
                    onPressed: onAction,
                    child: Text('Action'),
                  ),
                if (onAction != null && (onDismiss != null || actions != null))
                  SizedBox(width: warningSpacing),
                if (onDismiss != null)
                  TextButton(
                    onPressed: onDismiss,
                    child: Text('Dismiss'),
                  ),
                if (onDismiss != null && actions != null)
                  SizedBox(width: warningSpacing),
                if (actions != null) ...actions!,
              ],
            ),
          ],
        ],
      ),
    );

    if (animate) {
      warning = AppAnimations.fadeIn(
        warning,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return warning;
  }

  _WarningColors _getWarningColors(ThemeData theme) {
    switch (variant) {
      case AppWarningVariant.standard:
        return _WarningColors(
          backgroundColor: theme.colorScheme.tertiaryContainer,
          borderColor: theme.colorScheme.tertiary,
          titleColor: theme.colorScheme.onTertiaryContainer,
          messageColor: theme.colorScheme.onTertiaryContainer.withOpacity(0.8),
        );
      case AppWarningVariant.filled:
        return _WarningColors(
          backgroundColor: theme.colorScheme.tertiary,
          borderColor: theme.colorScheme.tertiary,
          titleColor: theme.colorScheme.onTertiary,
          messageColor: theme.colorScheme.onTertiary.withOpacity(0.8),
        );
      case AppWarningVariant.outlined:
        return _WarningColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.tertiary,
          titleColor: theme.colorScheme.tertiary,
          messageColor: theme.colorScheme.tertiary.withOpacity(0.8),
        );
    }
  }
}

class _WarningColors {
  final Color backgroundColor;
  final Color borderColor;
  final Color titleColor;
  final Color messageColor;

  const _WarningColors({
    required this.backgroundColor,
    required this.borderColor,
    required this.titleColor,
    required this.messageColor,
  });
} 
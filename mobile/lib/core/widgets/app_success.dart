import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';

enum AppSuccessVariant {
  standard,
  filled,
  outlined,
}

enum AppSuccessSize {
  small,
  medium,
  large,
}

class AppSuccess extends StatelessWidget {
  final String? title;
  final String? message;
  final Widget? icon;
  final List<Widget>? actions;
  final AppSuccessVariant variant;
  final AppSuccessSize size;
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

  const AppSuccess({
    Key? key,
    this.title,
    this.message,
    this.icon,
    this.actions,
    this.variant = AppSuccessVariant.standard,
    this.size = AppSuccessSize.medium,
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

    // Calculate success colors
    final successColors = _getSuccessColors(theme);

    // Calculate success margin
    final successMargin = margin ??
        EdgeInsets.all(
          size == AppSuccessSize.small
              ? AppTheme.spacing2
              : size == AppSuccessSize.medium
                  ? AppTheme.spacing4
                  : AppTheme.spacing6,
        );

    // Calculate success padding
    final successPadding = padding ??
        EdgeInsets.all(
          size == AppSuccessSize.small
              ? AppTheme.spacing4
              : size == AppSuccessSize.medium
                  ? AppTheme.spacing6
                  : AppTheme.spacing8,
        );

    // Calculate success elevation
    final successElevation = elevation ??
        (variant == AppSuccessVariant.standard
            ? (size == AppSuccessSize.small
                ? 2.0
                : size == AppSuccessSize.medium
                    ? 4.0
                    : 8.0)
            : 0.0);

    // Calculate success border radius
    final successBorderRadius = borderRadius ??
        (size == AppSuccessSize.small
            ? AppTheme.radius4
            : size == AppSuccessSize.medium
                ? AppTheme.radius6
                : AppTheme.radius8);

    // Calculate success spacing
    final successSpacing = size == AppSuccessSize.small
        ? AppTheme.spacing2
        : size == AppSuccessSize.medium
            ? AppTheme.spacing3
            : AppTheme.spacing4;

    // Calculate success icon size
    final successIconSize = size == AppSuccessSize.small
        ? 24.0
        : size == AppSuccessSize.medium
            ? 32.0
            : 40.0;

    // Calculate success title style
    final successTitleStyle = TextStyle(
      color: titleColor ?? successColors.titleColor,
      fontSize: size == AppSuccessSize.small
          ? 16.0
          : size == AppSuccessSize.medium
              ? 18.0
              : 20.0,
      fontWeight: FontWeight.w600,
    );

    // Calculate success message style
    final successMessageStyle = TextStyle(
      color: messageColor ?? successColors.messageColor,
      fontSize: size == AppSuccessSize.small
          ? 14.0
          : size == AppSuccessSize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w500,
    );

    Widget success = Container(
      decoration: BoxDecoration(
        color: backgroundColor ?? successColors.backgroundColor,
        borderRadius: BorderRadius.circular(successBorderRadius),
        border: variant == AppSuccessVariant.outlined
            ? Border.all(
                color: borderColor ?? successColors.borderColor,
                width: 1.0,
              )
            : null,
        boxShadow: variant == AppSuccessVariant.standard
            ? [
                BoxShadow(
                  color: theme.shadowColor.withOpacity(0.1),
                  blurRadius: successElevation * 2,
                  offset: Offset(0, successElevation),
                ),
              ]
            : null,
      ),
      margin: successMargin,
      padding: successPadding,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          if (icon != null) ...[
            IconTheme(
              data: IconThemeData(
                color: successColors.titleColor,
                size: successIconSize,
              ),
              child: icon!,
            ),
            SizedBox(height: successSpacing),
          ],
          if (title != null) ...[
            Text(
              title!,
              style: successTitleStyle,
              textAlign: TextAlign.center,
            ),
            SizedBox(height: successSpacing / 2),
          ],
          if (message != null) ...[
            Text(
              message!,
              style: successMessageStyle,
              textAlign: TextAlign.center,
            ),
            SizedBox(height: successSpacing),
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
                  SizedBox(width: successSpacing),
                if (onDismiss != null)
                  TextButton(
                    onPressed: onDismiss,
                    child: Text('Dismiss'),
                  ),
                if (onDismiss != null && actions != null)
                  SizedBox(width: successSpacing),
                if (actions != null) ...actions!,
              ],
            ),
          ],
        ],
      ),
    );

    if (animate) {
      success = AppAnimations.fadeIn(
        success,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return success;
  }

  _SuccessColors _getSuccessColors(ThemeData theme) {
    switch (variant) {
      case AppSuccessVariant.standard:
        return _SuccessColors(
          backgroundColor: theme.colorScheme.primaryContainer,
          borderColor: theme.colorScheme.primary,
          titleColor: theme.colorScheme.onPrimaryContainer,
          messageColor: theme.colorScheme.onPrimaryContainer.withOpacity(0.8),
        );
      case AppSuccessVariant.filled:
        return _SuccessColors(
          backgroundColor: theme.colorScheme.primary,
          borderColor: theme.colorScheme.primary,
          titleColor: theme.colorScheme.onPrimary,
          messageColor: theme.colorScheme.onPrimary.withOpacity(0.8),
        );
      case AppSuccessVariant.outlined:
        return _SuccessColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.primary,
          titleColor: theme.colorScheme.primary,
          messageColor: theme.colorScheme.primary.withOpacity(0.8),
        );
    }
  }
}

class _SuccessColors {
  final Color backgroundColor;
  final Color borderColor;
  final Color titleColor;
  final Color messageColor;

  const _SuccessColors({
    required this.backgroundColor,
    required this.borderColor,
    required this.titleColor,
    required this.messageColor,
  });
} 
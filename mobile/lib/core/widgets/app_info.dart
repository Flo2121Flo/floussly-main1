import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';

enum AppInfoVariant {
  standard,
  filled,
  outlined,
}

enum AppInfoSize {
  small,
  medium,
  large,
}

class AppInfo extends StatelessWidget {
  final String? title;
  final String? message;
  final Widget? icon;
  final List<Widget>? actions;
  final AppInfoVariant variant;
  final AppInfoSize size;
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

  const AppInfo({
    Key? key,
    this.title,
    this.message,
    this.icon,
    this.actions,
    this.variant = AppInfoVariant.standard,
    this.size = AppInfoSize.medium,
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

    // Calculate info colors
    final infoColors = _getInfoColors(theme);

    // Calculate info margin
    final infoMargin = margin ??
        EdgeInsets.all(
          size == AppInfoSize.small
              ? AppTheme.spacing2
              : size == AppInfoSize.medium
                  ? AppTheme.spacing4
                  : AppTheme.spacing6,
        );

    // Calculate info padding
    final infoPadding = padding ??
        EdgeInsets.all(
          size == AppInfoSize.small
              ? AppTheme.spacing4
              : size == AppInfoSize.medium
                  ? AppTheme.spacing6
                  : AppTheme.spacing8,
        );

    // Calculate info elevation
    final infoElevation = elevation ??
        (variant == AppInfoVariant.standard
            ? (size == AppInfoSize.small
                ? 2.0
                : size == AppInfoSize.medium
                    ? 4.0
                    : 8.0)
            : 0.0);

    // Calculate info border radius
    final infoBorderRadius = borderRadius ??
        (size == AppInfoSize.small
            ? AppTheme.radius4
            : size == AppInfoSize.medium
                ? AppTheme.radius6
                : AppTheme.radius8);

    // Calculate info spacing
    final infoSpacing = size == AppInfoSize.small
        ? AppTheme.spacing2
        : size == AppInfoSize.medium
            ? AppTheme.spacing3
            : AppTheme.spacing4;

    // Calculate info icon size
    final infoIconSize = size == AppInfoSize.small
        ? 24.0
        : size == AppInfoSize.medium
            ? 32.0
            : 40.0;

    // Calculate info title style
    final infoTitleStyle = TextStyle(
      color: titleColor ?? infoColors.titleColor,
      fontSize: size == AppInfoSize.small
          ? 16.0
          : size == AppInfoSize.medium
              ? 18.0
              : 20.0,
      fontWeight: FontWeight.w600,
    );

    // Calculate info message style
    final infoMessageStyle = TextStyle(
      color: messageColor ?? infoColors.messageColor,
      fontSize: size == AppInfoSize.small
          ? 14.0
          : size == AppInfoSize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w500,
    );

    Widget info = Container(
      decoration: BoxDecoration(
        color: backgroundColor ?? infoColors.backgroundColor,
        borderRadius: BorderRadius.circular(infoBorderRadius),
        border: variant == AppInfoVariant.outlined
            ? Border.all(
                color: borderColor ?? infoColors.borderColor,
                width: 1.0,
              )
            : null,
        boxShadow: variant == AppInfoVariant.standard
            ? [
                BoxShadow(
                  color: theme.shadowColor.withOpacity(0.1),
                  blurRadius: infoElevation * 2,
                  offset: Offset(0, infoElevation),
                ),
              ]
            : null,
      ),
      margin: infoMargin,
      padding: infoPadding,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          if (icon != null) ...[
            IconTheme(
              data: IconThemeData(
                color: infoColors.titleColor,
                size: infoIconSize,
              ),
              child: icon!,
            ),
            SizedBox(height: infoSpacing),
          ],
          if (title != null) ...[
            Text(
              title!,
              style: infoTitleStyle,
              textAlign: TextAlign.center,
            ),
            SizedBox(height: infoSpacing / 2),
          ],
          if (message != null) ...[
            Text(
              message!,
              style: infoMessageStyle,
              textAlign: TextAlign.center,
            ),
            SizedBox(height: infoSpacing),
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
                  SizedBox(width: infoSpacing),
                if (onDismiss != null)
                  TextButton(
                    onPressed: onDismiss,
                    child: Text('Dismiss'),
                  ),
                if (onDismiss != null && actions != null)
                  SizedBox(width: infoSpacing),
                if (actions != null) ...actions!,
              ],
            ),
          ],
        ],
      ),
    );

    if (animate) {
      info = AppAnimations.fadeIn(
        info,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return info;
  }

  _InfoColors _getInfoColors(ThemeData theme) {
    switch (variant) {
      case AppInfoVariant.standard:
        return _InfoColors(
          backgroundColor: theme.colorScheme.secondaryContainer,
          borderColor: theme.colorScheme.secondary,
          titleColor: theme.colorScheme.onSecondaryContainer,
          messageColor: theme.colorScheme.onSecondaryContainer.withOpacity(0.8),
        );
      case AppInfoVariant.filled:
        return _InfoColors(
          backgroundColor: theme.colorScheme.secondary,
          borderColor: theme.colorScheme.secondary,
          titleColor: theme.colorScheme.onSecondary,
          messageColor: theme.colorScheme.onSecondary.withOpacity(0.8),
        );
      case AppInfoVariant.outlined:
        return _InfoColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.secondary,
          titleColor: theme.colorScheme.secondary,
          messageColor: theme.colorScheme.secondary.withOpacity(0.8),
        );
    }
  }
}

class _InfoColors {
  final Color backgroundColor;
  final Color borderColor;
  final Color titleColor;
  final Color messageColor;

  const _InfoColors({
    required this.backgroundColor,
    required this.borderColor,
    required this.titleColor,
    required this.messageColor,
  });
} 
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';

enum AppEmptyVariant {
  standard,
  filled,
  outlined,
}

enum AppEmptySize {
  small,
  medium,
  large,
}

class AppEmpty extends StatelessWidget {
  final String? title;
  final String? message;
  final Widget? icon;
  final List<Widget>? actions;
  final AppEmptyVariant variant;
  final AppEmptySize size;
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

  const AppEmpty({
    Key? key,
    this.title,
    this.message,
    this.icon,
    this.actions,
    this.variant = AppEmptyVariant.standard,
    this.size = AppEmptySize.medium,
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

    // Calculate empty colors
    final emptyColors = _getEmptyColors(theme);

    // Calculate empty margin
    final emptyMargin = margin ??
        EdgeInsets.all(
          size == AppEmptySize.small
              ? AppTheme.spacing2
              : size == AppEmptySize.medium
                  ? AppTheme.spacing4
                  : AppTheme.spacing6,
        );

    // Calculate empty padding
    final emptyPadding = padding ??
        EdgeInsets.all(
          size == AppEmptySize.small
              ? AppTheme.spacing4
              : size == AppEmptySize.medium
                  ? AppTheme.spacing6
                  : AppTheme.spacing8,
        );

    // Calculate empty elevation
    final emptyElevation = elevation ??
        (variant == AppEmptyVariant.standard
            ? (size == AppEmptySize.small
                ? 2.0
                : size == AppEmptySize.medium
                    ? 4.0
                    : 8.0)
            : 0.0);

    // Calculate empty border radius
    final emptyBorderRadius = borderRadius ??
        (size == AppEmptySize.small
            ? AppTheme.radius4
            : size == AppEmptySize.medium
                ? AppTheme.radius6
                : AppTheme.radius8);

    // Calculate empty spacing
    final emptySpacing = size == AppEmptySize.small
        ? AppTheme.spacing2
        : size == AppEmptySize.medium
            ? AppTheme.spacing3
            : AppTheme.spacing4;

    // Calculate empty icon size
    final emptyIconSize = size == AppEmptySize.small
        ? 48.0
        : size == AppEmptySize.medium
            ? 64.0
            : 80.0;

    // Calculate empty title style
    final emptyTitleStyle = TextStyle(
      color: titleColor ?? emptyColors.titleColor,
      fontSize: size == AppEmptySize.small
          ? 16.0
          : size == AppEmptySize.medium
              ? 18.0
              : 20.0,
      fontWeight: FontWeight.w600,
    );

    // Calculate empty message style
    final emptyMessageStyle = TextStyle(
      color: messageColor ?? emptyColors.messageColor,
      fontSize: size == AppEmptySize.small
          ? 14.0
          : size == AppEmptySize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w500,
    );

    Widget empty = Container(
      decoration: BoxDecoration(
        color: backgroundColor ?? emptyColors.backgroundColor,
        borderRadius: BorderRadius.circular(emptyBorderRadius),
        border: variant == AppEmptyVariant.outlined
            ? Border.all(
                color: borderColor ?? emptyColors.borderColor,
                width: 1.0,
              )
            : null,
        boxShadow: variant == AppEmptyVariant.standard
            ? [
                BoxShadow(
                  color: theme.shadowColor.withOpacity(0.1),
                  blurRadius: emptyElevation * 2,
                  offset: Offset(0, emptyElevation),
                ),
              ]
            : null,
      ),
      margin: emptyMargin,
      padding: emptyPadding,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          if (icon != null) ...[
            IconTheme(
              data: IconThemeData(
                color: emptyColors.titleColor,
                size: emptyIconSize,
              ),
              child: icon!,
            ),
            SizedBox(height: emptySpacing),
          ],
          if (title != null) ...[
            Text(
              title!,
              style: emptyTitleStyle,
              textAlign: TextAlign.center,
            ),
            SizedBox(height: emptySpacing / 2),
          ],
          if (message != null) ...[
            Text(
              message!,
              style: emptyMessageStyle,
              textAlign: TextAlign.center,
            ),
            SizedBox(height: emptySpacing),
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
                  SizedBox(width: emptySpacing),
                if (onDismiss != null)
                  TextButton(
                    onPressed: onDismiss,
                    child: Text('Dismiss'),
                  ),
                if (onDismiss != null && actions != null)
                  SizedBox(width: emptySpacing),
                if (actions != null) ...actions!,
              ],
            ),
          ],
        ],
      ),
    );

    if (animate) {
      empty = AppAnimations.fadeIn(
        empty,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return empty;
  }

  _EmptyColors _getEmptyColors(ThemeData theme) {
    switch (variant) {
      case AppEmptyVariant.standard:
        return _EmptyColors(
          backgroundColor: theme.colorScheme.surfaceVariant,
          borderColor: theme.colorScheme.outline,
          titleColor: theme.colorScheme.onSurfaceVariant,
          messageColor: theme.colorScheme.onSurfaceVariant.withOpacity(0.8),
        );
      case AppEmptyVariant.filled:
        return _EmptyColors(
          backgroundColor: theme.colorScheme.surfaceVariant.withOpacity(0.5),
          borderColor: theme.colorScheme.outline,
          titleColor: theme.colorScheme.onSurfaceVariant,
          messageColor: theme.colorScheme.onSurfaceVariant.withOpacity(0.8),
        );
      case AppEmptyVariant.outlined:
        return _EmptyColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
          titleColor: theme.colorScheme.onSurface,
          messageColor: theme.colorScheme.onSurface.withOpacity(0.8),
        );
    }
  }
}

class _EmptyColors {
  final Color backgroundColor;
  final Color borderColor;
  final Color titleColor;
  final Color messageColor;

  const _EmptyColors({
    required this.backgroundColor,
    required this.borderColor,
    required this.titleColor,
    required this.messageColor,
  });
}

class AppEmptyPage extends StatelessWidget {
  final String message;
  final String? description;
  final VoidCallback? onAction;
  final String? actionLabel;
  final IconData? icon;
  final Color? color;
  final Color? backgroundColor;

  const AppEmptyPage({
    Key? key,
    required this.message,
    this.description,
    this.onAction,
    this.actionLabel,
    this.icon,
    this.color,
    this.backgroundColor,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: backgroundColor ?? theme.colorScheme.background,
      body: AppEmpty(
        message: message,
        description: description,
        onAction: onAction,
        actionLabel: actionLabel,
        icon: icon,
        color: color,
        isFullPage: true,
      ),
    );
  }
}

class AppEmptyDialog extends StatelessWidget {
  final String message;
  final String? description;
  final VoidCallback? onAction;
  final String? actionLabel;
  final IconData? icon;
  final Color? color;
  final Color? backgroundColor;
  final double opacity;

  const AppEmptyDialog({
    Key? key,
    required this.message,
    this.description,
    this.onAction,
    this.actionLabel,
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
        child: AppEmpty(
          message: message,
          description: description,
          onAction: onAction,
          actionLabel: actionLabel,
          icon: icon,
          color: color,
        ),
      ),
    );
  }
}

class AppEmptyOverlay extends StatelessWidget {
  final String message;
  final String? description;
  final VoidCallback? onAction;
  final String? actionLabel;
  final IconData? icon;
  final Color? color;
  final Color? backgroundColor;
  final double opacity;

  const AppEmptyOverlay({
    Key? key,
    required this.message,
    this.description,
    this.onAction,
    this.actionLabel,
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
      child: AppEmpty(
        message: message,
        description: description,
        onAction: onAction,
        actionLabel: actionLabel,
        icon: icon,
        color: color,
        isFullPage: true,
      ),
    );
  }
} 
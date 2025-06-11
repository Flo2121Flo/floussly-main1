import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';

enum AppIconVariant {
  standard,
  filled,
  outlined,
}

enum AppIconSize {
  small,
  medium,
  large,
}

class AppIcon extends StatelessWidget {
  final IconData icon;
  final AppIconVariant variant;
  final AppIconSize size;
  final Color? color;
  final double? elevation;
  final EdgeInsetsGeometry? margin;
  final EdgeInsetsGeometry? padding;
  final double? borderRadius;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;
  final VoidCallback? onTap;
  final bool disabled;

  const AppIcon({
    Key? key,
    required this.icon,
    this.variant = AppIconVariant.standard,
    this.size = AppIconSize.medium,
    this.color,
    this.elevation,
    this.margin,
    this.padding,
    this.borderRadius,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
    this.onTap,
    this.disabled = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate icon colors
    final iconColors = _getIconColors(theme);

    // Calculate icon margin
    final iconMargin = margin ??
        EdgeInsets.all(
          size == AppIconSize.small
              ? AppTheme.spacing1
              : size == AppIconSize.medium
                  ? AppTheme.spacing2
                  : AppTheme.spacing3,
        );

    // Calculate icon padding
    final iconPadding = padding ??
        EdgeInsets.all(
          size == AppIconSize.small
              ? AppTheme.spacing2
              : size == AppIconSize.medium
                  ? AppTheme.spacing3
                  : AppTheme.spacing4,
        );

    // Calculate icon elevation
    final iconElevation = elevation ??
        (variant == AppIconVariant.standard
            ? (size == AppIconSize.small
                ? 1.0
                : size == AppIconSize.medium
                    ? 2.0
                    : 4.0)
            : 0.0);

    // Calculate icon border radius
    final iconBorderRadius = borderRadius ??
        (size == AppIconSize.small
            ? AppTheme.radius2
            : size == AppIconSize.medium
                ? AppTheme.radius3
                : AppTheme.radius4);

    // Calculate icon size
    final iconSize = size == AppIconSize.small
        ? 16.0
        : size == AppIconSize.medium
            ? 24.0
            : 32.0;

    Widget iconWidget = Container(
      decoration: BoxDecoration(
        color: variant == AppIconVariant.filled
            ? (color ?? iconColors.color).withOpacity(0.1)
            : null,
        borderRadius: BorderRadius.circular(iconBorderRadius),
        border: variant == AppIconVariant.outlined
            ? Border.all(
                color: color ?? iconColors.color,
                width: 1.0,
              )
            : null,
        boxShadow: variant == AppIconVariant.standard
            ? [
                BoxShadow(
                  color: theme.shadowColor.withOpacity(0.1),
                  blurRadius: iconElevation * 2,
                  offset: Offset(0, iconElevation),
                ),
              ]
            : null,
      ),
      margin: iconMargin,
      padding: iconPadding,
      child: Icon(
        icon,
        color: color ?? iconColors.color,
        size: iconSize,
      ),
    );

    if (onTap != null && !disabled) {
      iconWidget = InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(iconBorderRadius),
        child: iconWidget,
      );
    }

    if (animate) {
      iconWidget = AppAnimations.fadeIn(
        iconWidget,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return iconWidget;
  }

  _IconColors _getIconColors(ThemeData theme) {
    switch (variant) {
      case AppIconVariant.standard:
        return _IconColors(
          color: theme.colorScheme.onSurface,
        );
      case AppIconVariant.filled:
        return _IconColors(
          color: theme.colorScheme.primary,
        );
      case AppIconVariant.outlined:
        return _IconColors(
          color: theme.colorScheme.primary,
        );
    }
  }
}

class _IconColors {
  final Color color;

  const _IconColors({
    required this.color,
  });
} 
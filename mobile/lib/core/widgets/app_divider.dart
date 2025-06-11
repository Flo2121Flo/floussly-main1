import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';

enum AppDividerVariant {
  standard,
  filled,
  outlined,
}

enum AppDividerSize {
  small,
  medium,
  large,
}

class AppDivider extends StatelessWidget {
  final Widget? child;
  final AppDividerVariant variant;
  final AppDividerSize size;
  final Color? color;
  final double? thickness;
  final double? elevation;
  final EdgeInsetsGeometry? margin;
  final EdgeInsetsGeometry? padding;
  final double? borderRadius;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;
  final bool vertical;

  const AppDivider({
    Key? key,
    this.child,
    this.variant = AppDividerVariant.standard,
    this.size = AppDividerSize.medium,
    this.color,
    this.thickness,
    this.elevation,
    this.margin,
    this.padding,
    this.borderRadius,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
    this.vertical = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate divider colors
    final dividerColors = _getDividerColors(theme);

    // Calculate divider margin
    final dividerMargin = margin ??
        EdgeInsets.all(
          size == AppDividerSize.small
              ? AppTheme.spacing1
              : size == AppDividerSize.medium
                  ? AppTheme.spacing2
                  : AppTheme.spacing3,
        );

    // Calculate divider padding
    final dividerPadding = padding ??
        EdgeInsets.all(
          size == AppDividerSize.small
              ? AppTheme.spacing2
              : size == AppDividerSize.medium
                  ? AppTheme.spacing3
                  : AppTheme.spacing4,
        );

    // Calculate divider elevation
    final dividerElevation = elevation ??
        (variant == AppDividerVariant.standard
            ? (size == AppDividerSize.small
                ? 1.0
                : size == AppDividerSize.medium
                    ? 2.0
                    : 4.0)
            : 0.0);

    // Calculate divider border radius
    final dividerBorderRadius = borderRadius ??
        (size == AppDividerSize.small
            ? AppTheme.radius2
            : size == AppDividerSize.medium
                ? AppTheme.radius3
                : AppTheme.radius4);

    // Calculate divider thickness
    final dividerThickness = thickness ??
        (size == AppDividerSize.small
            ? 1.0
            : size == AppDividerSize.medium
                ? 2.0
                : 4.0);

    // Calculate divider spacing
    final dividerSpacing = size == AppDividerSize.small
        ? AppTheme.spacing1
        : size == AppDividerSize.medium
            ? AppTheme.spacing2
            : AppTheme.spacing3;

    Widget divider = Container(
      decoration: BoxDecoration(
        color: color ?? dividerColors.color,
        borderRadius: BorderRadius.circular(dividerBorderRadius),
        boxShadow: variant == AppDividerVariant.standard
            ? [
                BoxShadow(
                  color: theme.shadowColor.withOpacity(0.1),
                  blurRadius: dividerElevation * 2,
                  offset: Offset(0, dividerElevation),
                ),
              ]
            : null,
      ),
      margin: dividerMargin,
      padding: dividerPadding,
      child: child ??
          Container(
            width: vertical ? dividerThickness : null,
            height: vertical ? null : dividerThickness,
            color: color ?? dividerColors.color,
          ),
    );

    if (animate) {
      divider = AppAnimations.fadeIn(
        divider,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return divider;
  }

  _DividerColors _getDividerColors(ThemeData theme) {
    switch (variant) {
      case AppDividerVariant.standard:
        return _DividerColors(
          color: theme.colorScheme.outline,
        );
      case AppDividerVariant.filled:
        return _DividerColors(
          color: theme.colorScheme.surfaceVariant,
        );
      case AppDividerVariant.outlined:
        return _DividerColors(
          color: theme.colorScheme.outline,
        );
    }
  }
}

class _DividerColors {
  final Color color;

  const _DividerColors({
    required this.color,
  });
} 
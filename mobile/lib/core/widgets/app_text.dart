import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';

enum AppTextVariant {
  standard,
  filled,
  outlined,
}

enum AppTextSize {
  small,
  medium,
  large,
}

class AppText extends StatelessWidget {
  final String text;
  final AppTextVariant variant;
  final AppTextSize size;
  final Color? color;
  final Color? backgroundColor;
  final Color? borderColor;
  final double? elevation;
  final EdgeInsetsGeometry? margin;
  final EdgeInsetsGeometry? padding;
  final double? borderRadius;
  final TextAlign? textAlign;
  final TextOverflow? overflow;
  final int? maxLines;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;
  final VoidCallback? onTap;
  final bool disabled;

  const AppText({
    Key? key,
    required this.text,
    this.variant = AppTextVariant.standard,
    this.size = AppTextSize.medium,
    this.color,
    this.backgroundColor,
    this.borderColor,
    this.elevation,
    this.margin,
    this.padding,
    this.borderRadius,
    this.textAlign,
    this.overflow,
    this.maxLines,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
    this.onTap,
    this.disabled = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate text colors
    final textColors = _getTextColors(theme);

    // Calculate text margin
    final textMargin = margin ??
        EdgeInsets.all(
          size == AppTextSize.small
              ? AppTheme.spacing1
              : size == AppTextSize.medium
                  ? AppTheme.spacing2
                  : AppTheme.spacing3,
        );

    // Calculate text padding
    final textPadding = padding ??
        EdgeInsets.all(
          size == AppTextSize.small
              ? AppTheme.spacing2
              : size == AppTextSize.medium
                  ? AppTheme.spacing3
                  : AppTheme.spacing4,
        );

    // Calculate text elevation
    final textElevation = elevation ??
        (variant == AppTextVariant.standard
            ? (size == AppTextSize.small
                ? 1.0
                : size == AppTextSize.medium
                    ? 2.0
                    : 4.0)
            : 0.0);

    // Calculate text border radius
    final textBorderRadius = borderRadius ??
        (size == AppTextSize.small
            ? AppTheme.radius2
            : size == AppTextSize.medium
                ? AppTheme.radius3
                : AppTheme.radius4);

    // Calculate text style
    final textStyle = TextStyle(
      color: color ?? textColors.color,
      fontSize: size == AppTextSize.small
          ? 12.0
          : size == AppTextSize.medium
              ? 14.0
              : 16.0,
      fontWeight: FontWeight.w400,
    );

    Widget textWidget = Container(
      decoration: BoxDecoration(
        color: backgroundColor ?? textColors.backgroundColor,
        borderRadius: BorderRadius.circular(textBorderRadius),
        border: variant == AppTextVariant.outlined
            ? Border.all(
                color: borderColor ?? textColors.borderColor,
                width: 1.0,
              )
            : null,
        boxShadow: variant == AppTextVariant.standard
            ? [
                BoxShadow(
                  color: theme.shadowColor.withOpacity(0.1),
                  blurRadius: textElevation * 2,
                  offset: Offset(0, textElevation),
                ),
              ]
            : null,
      ),
      margin: textMargin,
      padding: textPadding,
      child: Text(
        text,
        style: textStyle,
        textAlign: textAlign,
        overflow: overflow,
        maxLines: maxLines,
      ),
    );

    if (onTap != null && !disabled) {
      textWidget = InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(textBorderRadius),
        child: textWidget,
      );
    }

    if (animate) {
      textWidget = AppAnimations.fadeIn(
        textWidget,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return textWidget;
  }

  _TextColors _getTextColors(ThemeData theme) {
    switch (variant) {
      case AppTextVariant.standard:
        return _TextColors(
          color: theme.colorScheme.onSurface,
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
        );
      case AppTextVariant.filled:
        return _TextColors(
          color: theme.colorScheme.onSurfaceVariant,
          backgroundColor: theme.colorScheme.surfaceVariant,
          borderColor: theme.colorScheme.outline,
        );
      case AppTextVariant.outlined:
        return _TextColors(
          color: theme.colorScheme.onSurface,
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
        );
    }
  }
}

class _TextColors {
  final Color color;
  final Color backgroundColor;
  final Color borderColor;

  const _TextColors({
    required this.color,
    required this.backgroundColor,
    required this.borderColor,
  });
} 
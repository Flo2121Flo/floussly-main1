import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';

enum AppProgressVariant {
  standard,
  filled,
  outlined,
}

enum AppProgressSize {
  small,
  medium,
  large,
}

enum AppProgressType {
  linear,
  circular,
}

class AppProgress extends StatelessWidget {
  final double? value;
  final AppProgressVariant variant;
  final AppProgressSize size;
  final AppProgressType type;
  final Color? backgroundColor;
  final Color? borderColor;
  final Color? activeColor;
  final double? elevation;
  final EdgeInsetsGeometry? margin;
  final EdgeInsetsGeometry? padding;
  final double? borderRadius;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;
  final bool showBackground;
  final bool showBorder;
  final bool showShadow;
  final bool showAnimation;
  final bool showLabel;
  final String? label;
  final TextStyle? labelStyle;
  final bool showHelper;
  final String? helper;
  final TextStyle? helperStyle;
  final bool showError;
  final String? error;
  final TextStyle? errorStyle;
  final bool showIcon;
  final IconData? icon;
  final Color? iconColor;
  final double? iconSize;
  final bool showButton;
  final Widget? button;
  final bool showButtonIcon;
  final IconData? buttonIcon;
  final Color? buttonIconColor;
  final double? buttonIconSize;
  final VoidCallback? onButtonPressed;
  final bool showButtonText;
  final String? buttonText;
  final TextStyle? buttonTextStyle;
  final bool showButtonBackground;
  final Color? buttonBackgroundColor;
  final bool showButtonBorder;
  final Color? buttonBorderColor;
  final double? buttonBorderRadius;
  final bool showButtonShadow;
  final double? buttonElevation;
  final bool showButtonAnimation;
  final Duration? buttonAnimationDuration;
  final Curve? buttonAnimationCurve;

  const AppProgress({
    Key? key,
    this.value,
    this.variant = AppProgressVariant.standard,
    this.size = AppProgressSize.medium,
    this.type = AppProgressType.linear,
    this.backgroundColor,
    this.borderColor,
    this.activeColor,
    this.elevation,
    this.margin,
    this.padding,
    this.borderRadius,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
    this.showBackground = true,
    this.showBorder = true,
    this.showShadow = true,
    this.showAnimation = true,
    this.showLabel = false,
    this.label,
    this.labelStyle,
    this.showHelper = false,
    this.helper,
    this.helperStyle,
    this.showError = false,
    this.error,
    this.errorStyle,
    this.showIcon = false,
    this.icon,
    this.iconColor,
    this.iconSize,
    this.showButton = false,
    this.button,
    this.showButtonIcon = false,
    this.buttonIcon,
    this.buttonIconColor,
    this.buttonIconSize,
    this.onButtonPressed,
    this.showButtonText = false,
    this.buttonText,
    this.buttonTextStyle,
    this.showButtonBackground = false,
    this.buttonBackgroundColor,
    this.showButtonBorder = false,
    this.buttonBorderColor,
    this.buttonBorderRadius,
    this.showButtonShadow = false,
    this.buttonElevation,
    this.showButtonAnimation = false,
    this.buttonAnimationDuration,
    this.buttonAnimationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate progress colors
    final progressColors = _getProgressColors(theme);

    // Calculate progress margin
    final progressMargin = margin ??
        EdgeInsets.all(
          size == AppProgressSize.small
              ? AppTheme.spacing1
              : size == AppProgressSize.medium
                  ? AppTheme.spacing2
                  : AppTheme.spacing3,
        );

    // Calculate progress padding
    final progressPadding = padding ??
        EdgeInsets.all(
          size == AppProgressSize.small
              ? AppTheme.spacing1
              : size == AppProgressSize.medium
                  ? AppTheme.spacing2
                  : AppTheme.spacing3,
        );

    // Calculate progress elevation
    final progressElevation = elevation ??
        (variant == AppProgressVariant.standard
            ? (size == AppProgressSize.small
                ? 1.0
                : size == AppProgressSize.medium
                    ? 2.0
                    : 4.0)
            : 0.0);

    // Calculate progress border radius
    final progressBorderRadius = borderRadius ??
        (size == AppProgressSize.small
            ? AppTheme.radius2
            : size == AppProgressSize.medium
                ? AppTheme.radius3
                : AppTheme.radius4);

    // Calculate progress spacing
    final progressSpacing = size == AppProgressSize.small
        ? AppTheme.spacing1
        : size == AppProgressSize.medium
            ? AppTheme.spacing2
            : AppTheme.spacing3;

    // Calculate progress icon size
    final progressIconSize = size == AppProgressSize.small
        ? 16.0
        : size == AppProgressSize.medium
            ? 18.0
            : 20.0;

    // Calculate progress label style
    final progressLabelStyle = TextStyle(
      color: theme.colorScheme.onSurface,
      fontSize: size == AppProgressSize.small
          ? 14.0
          : size == AppProgressSize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w400,
    );

    // Calculate progress helper style
    final progressHelperStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppProgressSize.small
          ? 12.0
          : size == AppProgressSize.medium
              ? 14.0
              : 16.0,
      fontWeight: FontWeight.w400,
    );

    // Calculate progress error style
    final progressErrorStyle = TextStyle(
      color: theme.colorScheme.error,
      fontSize: size == AppProgressSize.small
          ? 12.0
          : size == AppProgressSize.medium
              ? 14.0
              : 16.0,
      fontWeight: FontWeight.w400,
    );

    Widget progress = Container(
      decoration: BoxDecoration(
        color: showBackground
            ? backgroundColor ?? progressColors.backgroundColor
            : Colors.transparent,
        borderRadius: BorderRadius.circular(progressBorderRadius),
        border: showBorder && variant == AppProgressVariant.outlined
            ? Border.all(
                color: borderColor ?? progressColors.borderColor,
                width: 1.0,
              )
            : null,
        boxShadow: showShadow && variant == AppProgressVariant.standard
            ? [
                BoxShadow(
                  color: theme.shadowColor.withOpacity(0.1),
                  blurRadius: progressElevation * 2,
                  offset: Offset(0, progressElevation),
                ),
              ]
            : null,
      ),
      margin: progressMargin,
      padding: progressPadding,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (type == AppProgressType.linear)
                Expanded(
                  child: LinearProgressIndicator(
                    value: value,
                    backgroundColor: backgroundColor ?? theme.colorScheme.surfaceVariant,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      activeColor ?? theme.colorScheme.primary,
                    ),
                  ),
                )
              else
                CircularProgressIndicator(
                  value: value,
                  backgroundColor: backgroundColor ?? theme.colorScheme.surfaceVariant,
                  valueColor: AlwaysStoppedAnimation<Color>(
                    activeColor ?? theme.colorScheme.primary,
                  ),
                ),
              if (showIcon && icon != null) ...[
                SizedBox(width: progressSpacing),
                Icon(
                  icon,
                  color: iconColor ?? theme.colorScheme.onSurface,
                  size: iconSize ?? progressIconSize,
                ),
              ],
              if (showButton && button != null) ...[
                SizedBox(width: progressSpacing),
                button!,
              ],
              if (showButtonIcon && buttonIcon != null) ...[
                SizedBox(width: progressSpacing),
                IconButton(
                  icon: Icon(
                    buttonIcon,
                    color: buttonIconColor ?? theme.colorScheme.onSurface,
                    size: buttonIconSize ?? progressIconSize,
                  ),
                  onPressed: onButtonPressed,
                ),
              ],
              if (showButtonText && buttonText != null) ...[
                SizedBox(width: progressSpacing),
                DefaultTextStyle(
                  style: buttonTextStyle ?? progressLabelStyle,
                  child: Text(buttonText!),
                ),
              ],
            ],
          ),
          if (showLabel && label != null) ...[
            SizedBox(height: progressSpacing / 2),
            DefaultTextStyle(
              style: labelStyle ?? progressLabelStyle,
              child: Text(label!),
            ),
          ],
        ],
      ),
    );

    if (animate && showAnimation) {
      progress = AppAnimations.fadeIn(
        progress,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        progress,
        if (showHelper && helper != null) ...[
          SizedBox(height: progressSpacing / 2),
          DefaultTextStyle(
            style: helperStyle ?? progressHelperStyle,
            child: Text(helper!),
          ),
        ],
        if (showError && error != null) ...[
          SizedBox(height: progressSpacing / 2),
          DefaultTextStyle(
            style: errorStyle ?? progressErrorStyle,
            child: Text(error!),
          ),
        ],
      ],
    );
  }

  _ProgressColors _getProgressColors(ThemeData theme) {
    switch (variant) {
      case AppProgressVariant.standard:
        return _ProgressColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
        );
      case AppProgressVariant.filled:
        return _ProgressColors(
          backgroundColor: theme.colorScheme.surfaceVariant,
          borderColor: theme.colorScheme.outline,
        );
      case AppProgressVariant.outlined:
        return _ProgressColors(
          backgroundColor: Colors.transparent,
          borderColor: theme.colorScheme.outline,
        );
    }
  }
}

class _ProgressColors {
  final Color backgroundColor;
  final Color borderColor;

  const _ProgressColors({
    required this.backgroundColor,
    required this.borderColor,
  });
}

class AppProgressWithLabel extends StatelessWidget {
  final double? value;
  final String label;
  final AppProgressVariant variant;
  final AppProgressSize size;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final Color? labelColor;
  final double? strokeWidth;
  final double? minHeight;
  final BorderRadius? borderRadius;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppProgressWithLabel({
    Key? key,
    this.value,
    required this.label,
    this.variant = AppProgressVariant.linear,
    this.size = AppProgressSize.medium,
    this.backgroundColor,
    this.foregroundColor,
    this.labelColor,
    this.strokeWidth,
    this.minHeight,
    this.borderRadius,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate label style
    final labelStyle = theme.textTheme.bodySmall?.copyWith(
      color: labelColor ?? theme.colorScheme.onSurface,
      fontSize: size == AppProgressSize.small
          ? 12.0
          : size == AppProgressSize.medium
              ? 14.0
              : 16.0,
    );

    // Calculate spacing
    final spacing = size == AppProgressSize.small
        ? AppTheme.spacing4
        : size == AppProgressSize.medium
            ? AppTheme.spacing8
            : AppTheme.spacing12;

    Widget progressWithLabel = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        AppProgress(
          value: value,
          variant: variant,
          size: size,
          backgroundColor: backgroundColor,
          foregroundColor: foregroundColor,
          strokeWidth: strokeWidth,
          minHeight: minHeight,
          borderRadius: borderRadius,
          animate: animate,
          animationDuration: animationDuration,
          animationCurve: animationCurve,
        ),
        SizedBox(height: spacing),
        Text(
          label,
          style: labelStyle,
        ),
      ],
    );

    if (animate) {
      progressWithLabel = AppAnimations.fadeIn(
        progressWithLabel,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return progressWithLabel;
  }
}

class AppProgressWithValue extends StatelessWidget {
  final double? value;
  final String? valueLabel;
  final AppProgressVariant variant;
  final AppProgressSize size;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final Color? valueColor;
  final double? strokeWidth;
  final double? minHeight;
  final BorderRadius? borderRadius;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppProgressWithValue({
    Key? key,
    this.value,
    this.valueLabel,
    this.variant = AppProgressVariant.linear,
    this.size = AppProgressSize.medium,
    this.backgroundColor,
    this.foregroundColor,
    this.valueColor,
    this.strokeWidth,
    this.minHeight,
    this.borderRadius,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate value style
    final valueStyle = theme.textTheme.bodySmall?.copyWith(
      color: valueColor ?? theme.colorScheme.onSurface,
      fontSize: size == AppProgressSize.small
          ? 12.0
          : size == AppProgressSize.medium
              ? 14.0
              : 16.0,
      fontWeight: FontWeight.w500,
    );

    // Calculate spacing
    final spacing = size == AppProgressSize.small
        ? AppTheme.spacing4
        : size == AppProgressSize.medium
            ? AppTheme.spacing8
            : AppTheme.spacing12;

    // Calculate value text
    final valueText = valueLabel ??
        (value != null ? '${(value! * 100).round()}%' : null);

    Widget progressWithValue = Row(
      children: [
        Expanded(
          child: AppProgress(
            value: value,
            variant: variant,
            size: size,
            backgroundColor: backgroundColor,
            foregroundColor: foregroundColor,
            strokeWidth: strokeWidth,
            minHeight: minHeight,
            borderRadius: borderRadius,
            animate: animate,
            animationDuration: animationDuration,
            animationCurve: animationCurve,
          ),
        ),
        if (valueText != null) ...[
          SizedBox(width: spacing),
          Text(
            valueText,
            style: valueStyle,
          ),
        ],
      ],
    );

    if (animate) {
      progressWithValue = AppAnimations.fadeIn(
        progressWithValue,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return progressWithValue;
  }
} 
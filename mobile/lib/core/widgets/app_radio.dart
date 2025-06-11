import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';

enum AppRadioVariant {
  standard,
  filled,
  outlined,
}

enum AppRadioSize {
  small,
  medium,
  large,
}

class AppRadio<T> extends StatelessWidget {
  final T value;
  final T? groupValue;
  final ValueChanged<T?>? onChanged;
  final AppRadioVariant variant;
  final AppRadioSize size;
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

  const AppRadio({
    Key? key,
    required this.value,
    required this.groupValue,
    this.onChanged,
    this.variant = AppRadioVariant.standard,
    this.size = AppRadioSize.medium,
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

    // Calculate radio colors
    final radioColors = _getRadioColors(theme);

    // Calculate radio margin
    final radioMargin = margin ??
        EdgeInsets.all(
          size == AppRadioSize.small
              ? AppTheme.spacing1
              : size == AppRadioSize.medium
                  ? AppTheme.spacing2
                  : AppTheme.spacing3,
        );

    // Calculate radio padding
    final radioPadding = padding ??
        EdgeInsets.all(
          size == AppRadioSize.small
              ? AppTheme.spacing1
              : size == AppRadioSize.medium
                  ? AppTheme.spacing2
                  : AppTheme.spacing3,
        );

    // Calculate radio elevation
    final radioElevation = elevation ??
        (variant == AppRadioVariant.standard
            ? (size == AppRadioSize.small
                ? 1.0
                : size == AppRadioSize.medium
                    ? 2.0
                    : 4.0)
            : 0.0);

    // Calculate radio border radius
    final radioBorderRadius = borderRadius ??
        (size == AppRadioSize.small
            ? AppTheme.radius2
            : size == AppRadioSize.medium
                ? AppTheme.radius3
                : AppTheme.radius4);

    // Calculate radio spacing
    final radioSpacing = size == AppRadioSize.small
        ? AppTheme.spacing1
        : size == AppRadioSize.medium
            ? AppTheme.spacing2
            : AppTheme.spacing3;

    // Calculate radio icon size
    final radioIconSize = size == AppRadioSize.small
        ? 16.0
        : size == AppRadioSize.medium
            ? 18.0
            : 20.0;

    // Calculate radio label style
    final radioLabelStyle = TextStyle(
      color: theme.colorScheme.onSurface,
      fontSize: size == AppRadioSize.small
          ? 14.0
          : size == AppRadioSize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w400,
    );

    // Calculate radio helper style
    final radioHelperStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppRadioSize.small
          ? 12.0
          : size == AppRadioSize.medium
              ? 14.0
              : 16.0,
      fontWeight: FontWeight.w400,
    );

    // Calculate radio error style
    final radioErrorStyle = TextStyle(
      color: theme.colorScheme.error,
      fontSize: size == AppRadioSize.small
          ? 12.0
          : size == AppRadioSize.medium
              ? 14.0
              : 16.0,
      fontWeight: FontWeight.w400,
    );

    Widget radio = Container(
      decoration: BoxDecoration(
        color: showBackground
            ? backgroundColor ?? radioColors.backgroundColor
            : Colors.transparent,
        borderRadius: BorderRadius.circular(radioBorderRadius),
        border: showBorder && variant == AppRadioVariant.outlined
            ? Border.all(
                color: borderColor ?? radioColors.borderColor,
                width: 1.0,
              )
            : null,
        boxShadow: showShadow && variant == AppRadioVariant.standard
            ? [
                BoxShadow(
                  color: theme.shadowColor.withOpacity(0.1),
                  blurRadius: radioElevation * 2,
                  offset: Offset(0, radioElevation),
                ),
              ]
            : null,
      ),
      margin: radioMargin,
      padding: radioPadding,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Radio<T>(
            value: value,
            groupValue: groupValue,
            onChanged: onChanged,
            activeColor: activeColor ?? theme.colorScheme.primary,
          ),
          if (showLabel && label != null) ...[
            SizedBox(width: radioSpacing),
            DefaultTextStyle(
              style: labelStyle ?? radioLabelStyle,
              child: Text(label!),
            ),
          ],
          if (showIcon && icon != null) ...[
            SizedBox(width: radioSpacing),
            Icon(
              icon,
              color: iconColor ?? theme.colorScheme.onSurface,
              size: iconSize ?? radioIconSize,
            ),
          ],
          if (showButton && button != null) ...[
            SizedBox(width: radioSpacing),
            button!,
          ],
          if (showButtonIcon && buttonIcon != null) ...[
            SizedBox(width: radioSpacing),
            IconButton(
              icon: Icon(
                buttonIcon,
                color: buttonIconColor ?? theme.colorScheme.onSurface,
                size: buttonIconSize ?? radioIconSize,
              ),
              onPressed: onButtonPressed,
            ),
          ],
          if (showButtonText && buttonText != null) ...[
            SizedBox(width: radioSpacing),
            DefaultTextStyle(
              style: buttonTextStyle ?? radioLabelStyle,
              child: Text(buttonText!),
            ),
          ],
        ],
      ),
    );

    if (animate && showAnimation) {
      radio = AppAnimations.fadeIn(
        radio,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        radio,
        if (showHelper && helper != null) ...[
          SizedBox(height: radioSpacing / 2),
          DefaultTextStyle(
            style: helperStyle ?? radioHelperStyle,
            child: Text(helper!),
          ),
        ],
        if (showError && error != null) ...[
          SizedBox(height: radioSpacing / 2),
          DefaultTextStyle(
            style: errorStyle ?? radioErrorStyle,
            child: Text(error!),
          ),
        ],
      ],
    );
  }

  _RadioColors _getRadioColors(ThemeData theme) {
    switch (variant) {
      case AppRadioVariant.standard:
        return _RadioColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
        );
      case AppRadioVariant.filled:
        return _RadioColors(
          backgroundColor: theme.colorScheme.surfaceVariant,
          borderColor: theme.colorScheme.outline,
        );
      case AppRadioVariant.outlined:
        return _RadioColors(
          backgroundColor: Colors.transparent,
          borderColor: theme.colorScheme.outline,
        );
    }
  }
}

class _RadioColors {
  final Color backgroundColor;
  final Color borderColor;

  const _RadioColors({
    required this.backgroundColor,
    required this.borderColor,
  });
} 
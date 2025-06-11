import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';

enum AppButtonVariant {
  standard,
  filled,
  outlined,
}

enum AppButtonSize {
  small,
  medium,
  large,
}

class AppButton extends StatelessWidget {
  final VoidCallback? onPressed;
  final AppButtonVariant variant;
  final AppButtonSize size;
  final Color? backgroundColor;
  final Color? borderColor;
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
  final bool showIcon;
  final IconData? icon;
  final Color? iconColor;
  final double? iconSize;
  final bool showText;
  final String? text;
  final TextStyle? textStyle;
  final bool showLoading;
  final bool isLoading;
  final Color? loadingColor;
  final double? loadingSize;
  final bool showDisabled;
  final bool isDisabled;
  final Color? disabledColor;
  final double? disabledOpacity;
  final bool showError;
  final bool hasError;
  final Color? errorColor;
  final String? errorText;
  final TextStyle? errorTextStyle;
  final bool showSuccess;
  final bool isSuccess;
  final Color? successColor;
  final String? successText;
  final TextStyle? successTextStyle;
  final bool showWarning;
  final bool isWarning;
  final Color? warningColor;
  final String? warningText;
  final TextStyle? warningTextStyle;
  final bool showInfo;
  final bool isInfo;
  final Color? infoColor;
  final String? infoText;
  final TextStyle? infoTextStyle;

  const AppButton({
    Key? key,
    this.onPressed,
    this.variant = AppButtonVariant.standard,
    this.size = AppButtonSize.medium,
    this.backgroundColor,
    this.borderColor,
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
    this.showIcon = false,
    this.icon,
    this.iconColor,
    this.iconSize,
    this.showText = true,
    this.text,
    this.textStyle,
    this.showLoading = false,
    this.isLoading = false,
    this.loadingColor,
    this.loadingSize,
    this.showDisabled = false,
    this.isDisabled = false,
    this.disabledColor,
    this.disabledOpacity,
    this.showError = false,
    this.hasError = false,
    this.errorColor,
    this.errorText,
    this.errorTextStyle,
    this.showSuccess = false,
    this.isSuccess = false,
    this.successColor,
    this.successText,
    this.successTextStyle,
    this.showWarning = false,
    this.isWarning = false,
    this.warningColor,
    this.warningText,
    this.warningTextStyle,
    this.showInfo = false,
    this.isInfo = false,
    this.infoColor,
    this.infoText,
    this.infoTextStyle,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate button colors
    final buttonColors = _getButtonColors(theme);

    // Calculate button margin
    final buttonMargin = margin ??
        EdgeInsets.all(
          size == AppButtonSize.small
              ? AppTheme.spacing1
              : size == AppButtonSize.medium
                  ? AppTheme.spacing2
                  : AppTheme.spacing3,
        );

    // Calculate button padding
    final buttonPadding = padding ??
        EdgeInsets.symmetric(
          horizontal: size == AppButtonSize.small
              ? AppTheme.spacing2
              : size == AppButtonSize.medium
                  ? AppTheme.spacing3
                  : AppTheme.spacing4,
          vertical: size == AppButtonSize.small
              ? AppTheme.spacing1
              : size == AppButtonSize.medium
                  ? AppTheme.spacing2
                  : AppTheme.spacing3,
        );

    // Calculate button elevation
    final buttonElevation = elevation ??
        (variant == AppButtonVariant.standard
            ? (size == AppButtonSize.small
                ? 1.0
                : size == AppButtonSize.medium
                    ? 2.0
                    : 4.0)
            : 0.0);

    // Calculate button border radius
    final buttonBorderRadius = borderRadius ??
        (size == AppButtonSize.small
            ? AppTheme.radius2
            : size == AppButtonSize.medium
                ? AppTheme.radius3
                : AppTheme.radius4);

    // Calculate button spacing
    final buttonSpacing = size == AppButtonSize.small
        ? AppTheme.spacing1
        : size == AppButtonSize.medium
            ? AppTheme.spacing2
            : AppTheme.spacing3;

    // Calculate button icon size
    final buttonIconSize = size == AppButtonSize.small
        ? 16.0
        : size == AppButtonSize.medium
            ? 18.0
            : 20.0;

    // Calculate button text style
    final buttonTextStyle = TextStyle(
      color: theme.colorScheme.onSurface,
      fontSize: size == AppButtonSize.small
          ? 14.0
          : size == AppButtonSize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w500,
    );

    // Calculate button loading size
    final buttonLoadingSize = size == AppButtonSize.small
        ? 16.0
        : size == AppButtonSize.medium
            ? 18.0
            : 20.0;

    Widget button = Container(
      decoration: BoxDecoration(
        color: showBackground
            ? backgroundColor ?? buttonColors.backgroundColor
            : Colors.transparent,
        borderRadius: BorderRadius.circular(buttonBorderRadius),
        border: showBorder && variant == AppButtonVariant.outlined
            ? Border.all(
                color: borderColor ?? buttonColors.borderColor,
                width: 1.0,
              )
            : null,
        boxShadow: showShadow && variant == AppButtonVariant.standard
            ? [
                BoxShadow(
                  color: theme.shadowColor.withOpacity(0.1),
                  blurRadius: buttonElevation * 2,
                  offset: Offset(0, buttonElevation),
                ),
              ]
            : null,
      ),
      margin: buttonMargin,
      padding: buttonPadding,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (showIcon && icon != null) ...[
            Icon(
              icon,
              color: iconColor ?? theme.colorScheme.onSurface,
              size: iconSize ?? buttonIconSize,
            ),
            SizedBox(width: buttonSpacing),
          ],
          if (showText && text != null)
            DefaultTextStyle(
              style: textStyle ?? buttonTextStyle,
              child: Text(text!),
            ),
          if (showLoading && isLoading) ...[
            SizedBox(width: buttonSpacing),
            SizedBox(
              width: loadingSize ?? buttonLoadingSize,
              height: loadingSize ?? buttonLoadingSize,
              child: CircularProgressIndicator(
                strokeWidth: 2.0,
                valueColor: AlwaysStoppedAnimation<Color>(
                  loadingColor ?? theme.colorScheme.onSurface,
                ),
              ),
            ),
          ],
        ],
      ),
    );

    if (animate && showAnimation) {
      button = AppAnimations.fadeIn(
        button,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return GestureDetector(
      onTap: onPressed,
      child: button,
    );
  }

  _ButtonColors _getButtonColors(ThemeData theme) {
    switch (variant) {
      case AppButtonVariant.standard:
        return _ButtonColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
        );
      case AppButtonVariant.filled:
        return _ButtonColors(
          backgroundColor: theme.colorScheme.surfaceVariant,
          borderColor: theme.colorScheme.outline,
        );
      case AppButtonVariant.outlined:
        return _ButtonColors(
          backgroundColor: Colors.transparent,
          borderColor: theme.colorScheme.outline,
        );
    }
  }
}

class _ButtonColors {
  final Color backgroundColor;
  final Color borderColor;

  const _ButtonColors({
    required this.backgroundColor,
    required this.borderColor,
  });
}

class AppIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onPressed;
  final VoidCallback? onLongPress;
  final bool enabled;
  final bool loading;
  final AppButtonSize size;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final Color? borderColor;
  final double? elevation;
  final EdgeInsets? padding;
  final BorderRadius? borderRadius;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppIconButton({
    Key? key,
    required this.icon,
    this.onPressed,
    this.onLongPress,
    this.enabled = true,
    this.loading = false,
    this.size = AppButtonSize.medium,
    this.backgroundColor,
    this.foregroundColor,
    this.borderColor,
    this.elevation,
    this.padding,
    this.borderRadius,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AppButton(
      icon: icon,
      onPressed: onPressed,
      onLongPress: onLongPress,
      enabled: enabled,
      loading: loading,
      variant: AppButtonVariant.icon,
      size: size,
      backgroundColor: backgroundColor,
      foregroundColor: foregroundColor,
      borderColor: borderColor,
      elevation: elevation,
      padding: padding,
      borderRadius: borderRadius,
      animate: animate,
      animationDuration: animationDuration,
      animationCurve: animationCurve,
    );
  }
}

class AppTextButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final VoidCallback? onLongPress;
  final bool enabled;
  final bool loading;
  final bool fullWidth;
  final AppButtonSize size;
  final Color? foregroundColor;
  final EdgeInsets? padding;
  final Widget? prefix;
  final Widget? suffix;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppTextButton({
    Key? key,
    required this.text,
    this.onPressed,
    this.onLongPress,
    this.enabled = true,
    this.loading = false,
    this.fullWidth = false,
    this.size = AppButtonSize.medium,
    this.foregroundColor,
    this.padding,
    this.prefix,
    this.suffix,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AppButton(
      text: text,
      onPressed: onPressed,
      onLongPress: onLongPress,
      enabled: enabled,
      loading: loading,
      fullWidth: fullWidth,
      variant: AppButtonVariant.text,
      size: size,
      foregroundColor: foregroundColor,
      padding: padding,
      prefix: prefix,
      suffix: suffix,
      animate: animate,
      animationDuration: animationDuration,
      animationCurve: animationCurve,
    );
  }
}

class AppOutlinedButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final VoidCallback? onLongPress;
  final bool enabled;
  final bool loading;
  final bool fullWidth;
  final AppButtonSize size;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final Color? borderColor;
  final double? elevation;
  final EdgeInsets? padding;
  final BorderRadius? borderRadius;
  final Widget? prefix;
  final Widget? suffix;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppOutlinedButton({
    Key? key,
    required this.text,
    this.onPressed,
    this.onLongPress,
    this.enabled = true,
    this.loading = false,
    this.fullWidth = false,
    this.size = AppButtonSize.medium,
    this.backgroundColor,
    this.foregroundColor,
    this.borderColor,
    this.elevation,
    this.padding,
    this.borderRadius,
    this.prefix,
    this.suffix,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AppButton(
      text: text,
      onPressed: onPressed,
      onLongPress: onLongPress,
      enabled: enabled,
      loading: loading,
      fullWidth: fullWidth,
      variant: AppButtonVariant.outlined,
      size: size,
      backgroundColor: backgroundColor,
      foregroundColor: foregroundColor,
      borderColor: borderColor,
      elevation: elevation,
      padding: padding,
      borderRadius: borderRadius,
      prefix: prefix,
      suffix: suffix,
      animate: animate,
      animationDuration: animationDuration,
      animationCurve: animationCurve,
    );
  }
} 
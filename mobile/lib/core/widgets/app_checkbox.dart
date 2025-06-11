import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';

enum AppCheckboxVariant {
  standard,
  filled,
  outlined,
}

enum AppCheckboxSize {
  small,
  medium,
  large,
}

class AppCheckbox extends StatelessWidget {
  final bool value;
  final ValueChanged<bool>? onChanged;
  final AppCheckboxVariant variant;
  final AppCheckboxSize size;
  final Color? backgroundColor;
  final Color? borderColor;
  final Color? checkColor;
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

  const AppCheckbox({
    Key? key,
    required this.value,
    this.onChanged,
    this.variant = AppCheckboxVariant.standard,
    this.size = AppCheckboxSize.medium,
    this.backgroundColor,
    this.borderColor,
    this.checkColor,
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

    // Calculate checkbox colors
    final checkboxColors = _getCheckboxColors(theme);

    // Calculate checkbox margin
    final checkboxMargin = margin ??
        EdgeInsets.all(
          size == AppCheckboxSize.small
              ? AppTheme.spacing1
              : size == AppCheckboxSize.medium
                  ? AppTheme.spacing2
                  : AppTheme.spacing3,
        );

    // Calculate checkbox padding
    final checkboxPadding = padding ??
        EdgeInsets.all(
          size == AppCheckboxSize.small
              ? AppTheme.spacing1
              : size == AppCheckboxSize.medium
                  ? AppTheme.spacing2
                  : AppTheme.spacing3,
        );

    // Calculate checkbox elevation
    final checkboxElevation = elevation ??
        (variant == AppCheckboxVariant.standard
            ? (size == AppCheckboxSize.small
                ? 1.0
                : size == AppCheckboxSize.medium
                    ? 2.0
                    : 4.0)
            : 0.0);

    // Calculate checkbox border radius
    final checkboxBorderRadius = borderRadius ??
        (size == AppCheckboxSize.small
            ? AppTheme.radius2
            : size == AppCheckboxSize.medium
                ? AppTheme.radius3
                : AppTheme.radius4);

    // Calculate checkbox spacing
    final checkboxSpacing = size == AppCheckboxSize.small
        ? AppTheme.spacing1
        : size == AppCheckboxSize.medium
            ? AppTheme.spacing2
            : AppTheme.spacing3;

    // Calculate checkbox icon size
    final checkboxIconSize = size == AppCheckboxSize.small
        ? 16.0
        : size == AppCheckboxSize.medium
            ? 18.0
            : 20.0;

    // Calculate checkbox label style
    final checkboxLabelStyle = TextStyle(
      color: theme.colorScheme.onSurface,
      fontSize: size == AppCheckboxSize.small
          ? 14.0
          : size == AppCheckboxSize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w400,
    );

    // Calculate checkbox helper style
    final checkboxHelperStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppCheckboxSize.small
          ? 12.0
          : size == AppCheckboxSize.medium
              ? 14.0
              : 16.0,
      fontWeight: FontWeight.w400,
    );

    // Calculate checkbox error style
    final checkboxErrorStyle = TextStyle(
      color: theme.colorScheme.error,
      fontSize: size == AppCheckboxSize.small
          ? 12.0
          : size == AppCheckboxSize.medium
              ? 14.0
              : 16.0,
      fontWeight: FontWeight.w400,
    );

    Widget checkbox = Container(
      decoration: BoxDecoration(
        color: showBackground
            ? backgroundColor ?? checkboxColors.backgroundColor
            : Colors.transparent,
        borderRadius: BorderRadius.circular(checkboxBorderRadius),
        border: showBorder && variant == AppCheckboxVariant.outlined
            ? Border.all(
                color: borderColor ?? checkboxColors.borderColor,
                width: 1.0,
              )
            : null,
        boxShadow: showShadow && variant == AppCheckboxVariant.standard
            ? [
                BoxShadow(
                  color: theme.shadowColor.withOpacity(0.1),
                  blurRadius: checkboxElevation * 2,
                  offset: Offset(0, checkboxElevation),
                ),
              ]
            : null,
      ),
      margin: checkboxMargin,
      padding: checkboxPadding,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Checkbox(
            value: value,
            onChanged: onChanged,
            activeColor: checkColor ?? theme.colorScheme.primary,
            checkColor: theme.colorScheme.onPrimary,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(checkboxBorderRadius),
            ),
          ),
          if (showLabel && label != null) ...[
            SizedBox(width: checkboxSpacing),
            DefaultTextStyle(
              style: labelStyle ?? checkboxLabelStyle,
              child: Text(label!),
            ),
          ],
          if (showIcon && icon != null) ...[
            SizedBox(width: checkboxSpacing),
            Icon(
              icon,
              color: iconColor ?? theme.colorScheme.onSurface,
              size: iconSize ?? checkboxIconSize,
            ),
          ],
          if (showButton && button != null) ...[
            SizedBox(width: checkboxSpacing),
            button!,
          ],
          if (showButtonIcon && buttonIcon != null) ...[
            SizedBox(width: checkboxSpacing),
            IconButton(
              icon: Icon(
                buttonIcon,
                color: buttonIconColor ?? theme.colorScheme.onSurface,
                size: buttonIconSize ?? checkboxIconSize,
              ),
              onPressed: onButtonPressed,
            ),
          ],
          if (showButtonText && buttonText != null) ...[
            SizedBox(width: checkboxSpacing),
            DefaultTextStyle(
              style: buttonTextStyle ?? checkboxLabelStyle,
              child: Text(buttonText!),
            ),
          ],
        ],
      ),
    );

    if (animate && showAnimation) {
      checkbox = AppAnimations.fadeIn(
        checkbox,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        checkbox,
        if (showHelper && helper != null) ...[
          SizedBox(height: checkboxSpacing / 2),
          DefaultTextStyle(
            style: helperStyle ?? checkboxHelperStyle,
            child: Text(helper!),
          ),
        ],
        if (showError && error != null) ...[
          SizedBox(height: checkboxSpacing / 2),
          DefaultTextStyle(
            style: errorStyle ?? checkboxErrorStyle,
            child: Text(error!),
          ),
        ],
      ],
    );
  }

  _CheckboxColors _getCheckboxColors(ThemeData theme) {
    switch (variant) {
      case AppCheckboxVariant.standard:
        return _CheckboxColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
        );
      case AppCheckboxVariant.filled:
        return _CheckboxColors(
          backgroundColor: theme.colorScheme.surfaceVariant,
          borderColor: theme.colorScheme.outline,
        );
      case AppCheckboxVariant.outlined:
        return _CheckboxColors(
          backgroundColor: Colors.transparent,
          borderColor: theme.colorScheme.outline,
        );
    }
  }
}

class _CheckboxColors {
  final Color backgroundColor;
  final Color borderColor;

  const _CheckboxColors({
    required this.backgroundColor,
    required this.borderColor,
  });
}

class AppCheckboxHeader extends StatelessWidget {
  final Widget? leading;
  final Widget? title;
  final Widget? subtitle;
  final List<Widget>? actions;
  final AppCheckboxSize size;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppCheckboxHeader({
    Key? key,
    this.leading,
    this.title,
    this.subtitle,
    this.actions,
    this.size = AppCheckboxSize.medium,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate header spacing
    final headerSpacing = size == AppCheckboxSize.small
        ? AppTheme.spacing2
        : size == AppCheckboxSize.medium
            ? AppTheme.spacing3
            : AppTheme.spacing4;

    // Calculate title style
    final titleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppCheckboxSize.small
          ? 14.0
          : size == AppCheckboxSize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w600,
    );

    // Calculate subtitle style
    final subtitleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant.withOpacity(0.6),
      fontSize: size == AppCheckboxSize.small
          ? 12.0
          : size == AppCheckboxSize.medium
              ? 14.0
              : 16.0,
      fontWeight: FontWeight.w500,
    );

    Widget header = Row(
      children: [
        if (leading != null) ...[
          leading!,
          SizedBox(width: headerSpacing),
        ],
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              if (title != null)
                DefaultTextStyle(
                  style: titleStyle,
                  child: title!,
                ),
              if (subtitle != null) ...[
                SizedBox(height: headerSpacing / 2),
                DefaultTextStyle(
                  style: subtitleStyle,
                  child: subtitle!,
                ),
              ],
            ],
          ),
        ),
        if (actions != null) ...[
          SizedBox(width: headerSpacing),
          ...actions!,
        ],
      ],
    );

    if (animate) {
      header = AppAnimations.fadeIn(
        header,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return header;
  }
}

class AppCheckboxFooter extends StatelessWidget {
  final List<Widget>? actions;
  final AppCheckboxSize size;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppCheckboxFooter({
    Key? key,
    this.actions,
    this.size = AppCheckboxSize.medium,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate footer spacing
    final footerSpacing = size == AppCheckboxSize.small
        ? AppTheme.spacing2
        : size == AppCheckboxSize.medium
            ? AppTheme.spacing3
            : AppTheme.spacing4;

    Widget footer = Row(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        if (actions != null)
          ...actions!.map((action) => Padding(
                padding: EdgeInsets.only(
                  left: footerSpacing,
                ),
                child: action,
              )),
      ],
    );

    if (animate) {
      footer = AppAnimations.fadeIn(
        footer,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return footer;
  }
} 
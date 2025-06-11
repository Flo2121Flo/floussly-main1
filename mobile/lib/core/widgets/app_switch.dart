import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';

enum AppSwitchVariant {
  standard,
  filled,
  outlined,
}

enum AppSwitchSize {
  small,
  medium,
  large,
}

class AppSwitch extends StatelessWidget {
  final bool value;
  final ValueChanged<bool>? onChanged;
  final AppSwitchVariant variant;
  final AppSwitchSize size;
  final Color? backgroundColor;
  final Color? borderColor;
  final Color? activeColor;
  final Color? inactiveColor;
  final Color? thumbColor;
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

  const AppSwitch({
    Key? key,
    required this.value,
    this.onChanged,
    this.variant = AppSwitchVariant.standard,
    this.size = AppSwitchSize.medium,
    this.backgroundColor,
    this.borderColor,
    this.activeColor,
    this.inactiveColor,
    this.thumbColor,
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

    // Calculate switch colors
    final switchColors = _getSwitchColors(theme);

    // Calculate switch margin
    final switchMargin = margin ??
        EdgeInsets.all(
          size == AppSwitchSize.small
              ? AppTheme.spacing1
              : size == AppSwitchSize.medium
                  ? AppTheme.spacing2
                  : AppTheme.spacing3,
        );

    // Calculate switch padding
    final switchPadding = padding ??
        EdgeInsets.all(
          size == AppSwitchSize.small
              ? AppTheme.spacing1
              : size == AppSwitchSize.medium
                  ? AppTheme.spacing2
                  : AppTheme.spacing3,
        );

    // Calculate switch elevation
    final switchElevation = elevation ??
        (variant == AppSwitchVariant.standard
            ? (size == AppSwitchSize.small
                ? 1.0
                : size == AppSwitchSize.medium
                    ? 2.0
                    : 4.0)
            : 0.0);

    // Calculate switch border radius
    final switchBorderRadius = borderRadius ??
        (size == AppSwitchSize.small
            ? AppTheme.radius2
            : size == AppSwitchSize.medium
                ? AppTheme.radius3
                : AppTheme.radius4);

    // Calculate switch spacing
    final switchSpacing = size == AppSwitchSize.small
        ? AppTheme.spacing1
        : size == AppSwitchSize.medium
            ? AppTheme.spacing2
            : AppTheme.spacing3;

    // Calculate switch icon size
    final switchIconSize = size == AppSwitchSize.small
        ? 16.0
        : size == AppSwitchSize.medium
            ? 18.0
            : 20.0;

    // Calculate switch label style
    final switchLabelStyle = TextStyle(
      color: theme.colorScheme.onSurface,
      fontSize: size == AppSwitchSize.small
          ? 14.0
          : size == AppSwitchSize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w400,
    );

    // Calculate switch helper style
    final switchHelperStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppSwitchSize.small
          ? 12.0
          : size == AppSwitchSize.medium
              ? 14.0
              : 16.0,
      fontWeight: FontWeight.w400,
    );

    // Calculate switch error style
    final switchErrorStyle = TextStyle(
      color: theme.colorScheme.error,
      fontSize: size == AppSwitchSize.small
          ? 12.0
          : size == AppSwitchSize.medium
              ? 14.0
              : 16.0,
      fontWeight: FontWeight.w400,
    );

    Widget switchWidget = Container(
      decoration: BoxDecoration(
        color: showBackground
            ? backgroundColor ?? switchColors.backgroundColor
            : Colors.transparent,
        borderRadius: BorderRadius.circular(switchBorderRadius),
        border: showBorder && variant == AppSwitchVariant.outlined
            ? Border.all(
                color: borderColor ?? switchColors.borderColor,
                width: 1.0,
              )
            : null,
        boxShadow: showShadow && variant == AppSwitchVariant.standard
            ? [
                BoxShadow(
                  color: theme.shadowColor.withOpacity(0.1),
                  blurRadius: switchElevation * 2,
                  offset: Offset(0, switchElevation),
                ),
              ]
            : null,
      ),
      margin: switchMargin,
      padding: switchPadding,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Switch(
            value: value,
            onChanged: onChanged,
            activeColor: activeColor ?? theme.colorScheme.primary,
            inactiveTrackColor: inactiveColor ?? theme.colorScheme.surfaceVariant,
            thumbColor: MaterialStateProperty.resolveWith<Color>(
              (Set<MaterialState> states) {
                if (states.contains(MaterialState.selected)) {
                  return thumbColor ?? theme.colorScheme.onPrimary;
                }
                return thumbColor ?? theme.colorScheme.onSurfaceVariant;
              },
            ),
          ),
          if (showLabel && label != null) ...[
            SizedBox(width: switchSpacing),
            DefaultTextStyle(
              style: labelStyle ?? switchLabelStyle,
              child: Text(label!),
            ),
          ],
          if (showIcon && icon != null) ...[
            SizedBox(width: switchSpacing),
            Icon(
              icon,
              color: iconColor ?? theme.colorScheme.onSurface,
              size: iconSize ?? switchIconSize,
            ),
          ],
          if (showButton && button != null) ...[
            SizedBox(width: switchSpacing),
            button!,
          ],
          if (showButtonIcon && buttonIcon != null) ...[
            SizedBox(width: switchSpacing),
            IconButton(
              icon: Icon(
                buttonIcon,
                color: buttonIconColor ?? theme.colorScheme.onSurface,
                size: buttonIconSize ?? switchIconSize,
              ),
              onPressed: onButtonPressed,
            ),
          ],
          if (showButtonText && buttonText != null) ...[
            SizedBox(width: switchSpacing),
            DefaultTextStyle(
              style: buttonTextStyle ?? switchLabelStyle,
              child: Text(buttonText!),
            ),
          ],
        ],
      ),
    );

    if (animate && showAnimation) {
      switchWidget = AppAnimations.fadeIn(
        switchWidget,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        switchWidget,
        if (showHelper && helper != null) ...[
          SizedBox(height: switchSpacing / 2),
          DefaultTextStyle(
            style: helperStyle ?? switchHelperStyle,
            child: Text(helper!),
          ),
        ],
        if (showError && error != null) ...[
          SizedBox(height: switchSpacing / 2),
          DefaultTextStyle(
            style: errorStyle ?? switchErrorStyle,
            child: Text(error!),
          ),
        ],
      ],
    );
  }

  _SwitchColors _getSwitchColors(ThemeData theme) {
    switch (variant) {
      case AppSwitchVariant.standard:
        return _SwitchColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
        );
      case AppSwitchVariant.filled:
        return _SwitchColors(
          backgroundColor: theme.colorScheme.surfaceVariant,
          borderColor: theme.colorScheme.outline,
        );
      case AppSwitchVariant.outlined:
        return _SwitchColors(
          backgroundColor: Colors.transparent,
          borderColor: theme.colorScheme.outline,
        );
    }
  }
}

class _SwitchColors {
  final Color backgroundColor;
  final Color borderColor;

  const _SwitchColors({
    required this.backgroundColor,
    required this.borderColor,
  });
}

class AppSwitchHeader extends StatelessWidget {
  final Widget? leading;
  final Widget? title;
  final Widget? subtitle;
  final List<Widget>? actions;
  final AppSwitchSize size;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppSwitchHeader({
    Key? key,
    this.leading,
    this.title,
    this.subtitle,
    this.actions,
    this.size = AppSwitchSize.medium,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate header spacing
    final headerSpacing = size == AppSwitchSize.small
        ? AppTheme.spacing2
        : size == AppSwitchSize.medium
            ? AppTheme.spacing3
            : AppTheme.spacing4;

    // Calculate title style
    final titleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppSwitchSize.small
          ? 14.0
          : size == AppSwitchSize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w600,
    );

    // Calculate subtitle style
    final subtitleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant.withOpacity(0.6),
      fontSize: size == AppSwitchSize.small
          ? 12.0
          : size == AppSwitchSize.medium
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

class AppSwitchFooter extends StatelessWidget {
  final List<Widget>? actions;
  final AppSwitchSize size;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppSwitchFooter({
    Key? key,
    this.actions,
    this.size = AppSwitchSize.medium,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate footer spacing
    final footerSpacing = size == AppSwitchSize.small
        ? AppTheme.spacing2
        : size == AppSwitchSize.medium
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
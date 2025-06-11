import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';

enum AppSliderVariant {
  standard,
  filled,
  outlined,
}

enum AppSliderSize {
  small,
  medium,
  large,
}

class AppSlider extends StatelessWidget {
  final double value;
  final ValueChanged<double>? onChanged;
  final ValueChanged<double>? onChangeEnd;
  final double min;
  final double max;
  final int? divisions;
  final String? label;
  final AppSliderVariant variant;
  final AppSliderSize size;
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

  const AppSlider({
    Key? key,
    required this.value,
    this.onChanged,
    this.onChangeEnd,
    this.min = 0.0,
    this.max = 1.0,
    this.divisions,
    this.label,
    this.variant = AppSliderVariant.standard,
    this.size = AppSliderSize.medium,
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

    // Calculate slider colors
    final sliderColors = _getSliderColors(theme);

    // Calculate slider margin
    final sliderMargin = margin ??
        EdgeInsets.all(
          size == AppSliderSize.small
              ? AppTheme.spacing1
              : size == AppSliderSize.medium
                  ? AppTheme.spacing2
                  : AppTheme.spacing3,
        );

    // Calculate slider padding
    final sliderPadding = padding ??
        EdgeInsets.all(
          size == AppSliderSize.small
              ? AppTheme.spacing1
              : size == AppSliderSize.medium
                  ? AppTheme.spacing2
                  : AppTheme.spacing3,
        );

    // Calculate slider elevation
    final sliderElevation = elevation ??
        (variant == AppSliderVariant.standard
            ? (size == AppSliderSize.small
                ? 1.0
                : size == AppSliderSize.medium
                    ? 2.0
                    : 4.0)
            : 0.0);

    // Calculate slider border radius
    final sliderBorderRadius = borderRadius ??
        (size == AppSliderSize.small
            ? AppTheme.radius2
            : size == AppSliderSize.medium
                ? AppTheme.radius3
                : AppTheme.radius4);

    // Calculate slider spacing
    final sliderSpacing = size == AppSliderSize.small
        ? AppTheme.spacing1
        : size == AppSliderSize.medium
            ? AppTheme.spacing2
            : AppTheme.spacing3;

    // Calculate slider icon size
    final sliderIconSize = size == AppSliderSize.small
        ? 16.0
        : size == AppSliderSize.medium
            ? 18.0
            : 20.0;

    // Calculate slider label style
    final sliderLabelStyle = TextStyle(
      color: theme.colorScheme.onSurface,
      fontSize: size == AppSliderSize.small
          ? 14.0
          : size == AppSliderSize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w400,
    );

    // Calculate slider helper style
    final sliderHelperStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppSliderSize.small
          ? 12.0
          : size == AppSliderSize.medium
              ? 14.0
              : 16.0,
      fontWeight: FontWeight.w400,
    );

    // Calculate slider error style
    final sliderErrorStyle = TextStyle(
      color: theme.colorScheme.error,
      fontSize: size == AppSliderSize.small
          ? 12.0
          : size == AppSliderSize.medium
              ? 14.0
              : 16.0,
      fontWeight: FontWeight.w400,
    );

    Widget slider = Container(
      decoration: BoxDecoration(
        color: showBackground
            ? backgroundColor ?? sliderColors.backgroundColor
            : Colors.transparent,
        borderRadius: BorderRadius.circular(sliderBorderRadius),
        border: showBorder && variant == AppSliderVariant.outlined
            ? Border.all(
                color: borderColor ?? sliderColors.borderColor,
                width: 1.0,
              )
            : null,
        boxShadow: showShadow && variant == AppSliderVariant.standard
            ? [
                BoxShadow(
                  color: theme.shadowColor.withOpacity(0.1),
                  blurRadius: sliderElevation * 2,
                  offset: Offset(0, sliderElevation),
                ),
              ]
            : null,
      ),
      margin: sliderMargin,
      padding: sliderPadding,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Expanded(
                child: SliderTheme(
                  data: SliderThemeData(
                    activeTrackColor: activeColor ?? theme.colorScheme.primary,
                    inactiveTrackColor:
                        inactiveColor ?? theme.colorScheme.surfaceVariant,
                    thumbColor: thumbColor ?? theme.colorScheme.primary,
                    overlayColor: (activeColor ?? theme.colorScheme.primary)
                        .withOpacity(0.12),
                    valueIndicatorColor:
                        activeColor ?? theme.colorScheme.primary,
                    valueIndicatorTextStyle: TextStyle(
                      color: theme.colorScheme.onPrimary,
                      fontSize: size == AppSliderSize.small
                          ? 12.0
                          : size == AppSliderSize.medium
                              ? 14.0
                              : 16.0,
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                  child: Slider(
                    value: value,
                    onChanged: onChanged,
                    onChangeEnd: onChangeEnd,
                    min: min,
                    max: max,
                    divisions: divisions,
                    label: label,
                  ),
                ),
              ),
              if (showIcon && icon != null) ...[
                SizedBox(width: sliderSpacing),
                Icon(
                  icon,
                  color: iconColor ?? theme.colorScheme.onSurface,
                  size: iconSize ?? sliderIconSize,
                ),
              ],
              if (showButton && button != null) ...[
                SizedBox(width: sliderSpacing),
                button!,
              ],
              if (showButtonIcon && buttonIcon != null) ...[
                SizedBox(width: sliderSpacing),
                IconButton(
                  icon: Icon(
                    buttonIcon,
                    color: buttonIconColor ?? theme.colorScheme.onSurface,
                    size: buttonIconSize ?? sliderIconSize,
                  ),
                  onPressed: onButtonPressed,
                ),
              ],
              if (showButtonText && buttonText != null) ...[
                SizedBox(width: sliderSpacing),
                DefaultTextStyle(
                  style: buttonTextStyle ?? sliderLabelStyle,
                  child: Text(buttonText!),
                ),
              ],
            ],
          ),
          if (showLabel && label != null) ...[
            SizedBox(height: sliderSpacing / 2),
            DefaultTextStyle(
              style: labelStyle ?? sliderLabelStyle,
              child: Text(label!),
            ),
          ],
        ],
      ),
    );

    if (animate && showAnimation) {
      slider = AppAnimations.fadeIn(
        slider,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        slider,
        if (showHelper && helper != null) ...[
          SizedBox(height: sliderSpacing / 2),
          DefaultTextStyle(
            style: helperStyle ?? sliderHelperStyle,
            child: Text(helper!),
          ),
        ],
        if (showError && error != null) ...[
          SizedBox(height: sliderSpacing / 2),
          DefaultTextStyle(
            style: errorStyle ?? sliderErrorStyle,
            child: Text(error!),
          ),
        ],
      ],
    );
  }

  _SliderColors _getSliderColors(ThemeData theme) {
    switch (variant) {
      case AppSliderVariant.standard:
        return _SliderColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
        );
      case AppSliderVariant.filled:
        return _SliderColors(
          backgroundColor: theme.colorScheme.surfaceVariant,
          borderColor: theme.colorScheme.outline,
        );
      case AppSliderVariant.outlined:
        return _SliderColors(
          backgroundColor: Colors.transparent,
          borderColor: theme.colorScheme.outline,
        );
    }
  }
}

class _SliderColors {
  final Color backgroundColor;
  final Color borderColor;

  const _SliderColors({
    required this.backgroundColor,
    required this.borderColor,
  });
}

class AppSliderHeader extends StatelessWidget {
  final Widget? leading;
  final Widget? title;
  final Widget? subtitle;
  final List<Widget>? actions;
  final AppSliderSize size;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppSliderHeader({
    Key? key,
    this.leading,
    this.title,
    this.subtitle,
    this.actions,
    this.size = AppSliderSize.medium,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate header spacing
    final headerSpacing = size == AppSliderSize.small
        ? AppTheme.spacing2
        : size == AppSliderSize.medium
            ? AppTheme.spacing3
            : AppTheme.spacing4;

    // Calculate title style
    final titleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppSliderSize.small
          ? 14.0
          : size == AppSliderSize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w600,
    );

    // Calculate subtitle style
    final subtitleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant.withOpacity(0.6),
      fontSize: size == AppSliderSize.small
          ? 12.0
          : size == AppSliderSize.medium
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

class AppSliderFooter extends StatelessWidget {
  final List<Widget>? actions;
  final AppSliderSize size;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppSliderFooter({
    Key? key,
    this.actions,
    this.size = AppSliderSize.medium,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate footer spacing
    final footerSpacing = size == AppSliderSize.small
        ? AppTheme.spacing2
        : size == AppSliderSize.medium
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
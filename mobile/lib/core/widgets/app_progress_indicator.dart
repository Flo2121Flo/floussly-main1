import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';

enum AppProgressIndicatorVariant {
  standard,
  filled,
  outlined,
}

enum AppProgressIndicatorSize {
  small,
  medium,
  large,
}

class AppProgressIndicator extends StatelessWidget {
  final double? value;
  final AppProgressIndicatorVariant variant;
  final AppProgressIndicatorSize size;
  final Color? backgroundColor;
  final Color? borderColor;
  final Color? valueColor;
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
  final bool showHeader;
  final Widget? header;
  final bool showFooter;
  final Widget? footer;
  final bool showTitle;
  final String? title;
  final TextStyle? titleStyle;
  final bool showSubtitle;
  final String? subtitle;
  final TextStyle? subtitleStyle;
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

  const AppProgressIndicator({
    Key? key,
    this.value,
    this.variant = AppProgressIndicatorVariant.standard,
    this.size = AppProgressIndicatorSize.medium,
    this.backgroundColor,
    this.borderColor,
    this.valueColor,
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
    this.showHeader = false,
    this.header,
    this.showFooter = false,
    this.footer,
    this.showTitle = false,
    this.title,
    this.titleStyle,
    this.showSubtitle = false,
    this.subtitle,
    this.subtitleStyle,
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

    // Calculate progress indicator colors
    final progressIndicatorColors = _getProgressIndicatorColors(theme);

    // Calculate progress indicator margin
    final progressIndicatorMargin = margin ??
        EdgeInsets.all(
          size == AppProgressIndicatorSize.small
              ? AppTheme.spacing1
              : size == AppProgressIndicatorSize.medium
                  ? AppTheme.spacing2
                  : AppTheme.spacing3,
        );

    // Calculate progress indicator padding
    final progressIndicatorPadding = padding ??
        EdgeInsets.all(
          size == AppProgressIndicatorSize.small
              ? AppTheme.spacing2
              : size == AppProgressIndicatorSize.medium
                  ? AppTheme.spacing3
                  : AppTheme.spacing4,
        );

    // Calculate progress indicator elevation
    final progressIndicatorElevation = elevation ??
        (variant == AppProgressIndicatorVariant.standard
            ? (size == AppProgressIndicatorSize.small
                ? 1.0
                : size == AppProgressIndicatorSize.medium
                    ? 2.0
                    : 4.0)
            : 0.0);

    // Calculate progress indicator border radius
    final progressIndicatorBorderRadius = borderRadius ??
        (size == AppProgressIndicatorSize.small
            ? AppTheme.radius2
            : size == AppProgressIndicatorSize.medium
                ? AppTheme.radius3
                : AppTheme.radius4);

    // Calculate progress indicator spacing
    final progressIndicatorSpacing = size == AppProgressIndicatorSize.small
        ? AppTheme.spacing1
        : size == AppProgressIndicatorSize.medium
            ? AppTheme.spacing2
            : AppTheme.spacing3;

    // Calculate progress indicator icon size
    final progressIndicatorIconSize = size == AppProgressIndicatorSize.small
        ? 16.0
        : size == AppProgressIndicatorSize.medium
            ? 18.0
            : 20.0;

    // Calculate progress indicator title style
    final progressIndicatorTitleStyle = TextStyle(
      color: theme.colorScheme.onSurface,
      fontSize: size == AppProgressIndicatorSize.small
          ? 16.0
          : size == AppProgressIndicatorSize.medium
              ? 18.0
              : 20.0,
      fontWeight: FontWeight.w500,
    );

    // Calculate progress indicator subtitle style
    final progressIndicatorSubtitleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppProgressIndicatorSize.small
          ? 14.0
          : size == AppProgressIndicatorSize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w400,
    );

    Widget progressIndicator = Container(
      decoration: BoxDecoration(
        color: showBackground
            ? backgroundColor ?? progressIndicatorColors.backgroundColor
            : Colors.transparent,
        borderRadius: BorderRadius.circular(progressIndicatorBorderRadius),
        border: showBorder && variant == AppProgressIndicatorVariant.outlined
            ? Border.all(
                color: borderColor ?? progressIndicatorColors.borderColor,
                width: 1.0,
              )
            : null,
        boxShadow: showShadow && variant == AppProgressIndicatorVariant.standard
            ? [
                BoxShadow(
                  color: theme.shadowColor.withOpacity(0.1),
                  blurRadius: progressIndicatorElevation * 2,
                  offset: Offset(0, progressIndicatorElevation),
                ),
              ]
            : null,
      ),
      margin: progressIndicatorMargin,
      padding: progressIndicatorPadding,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (showHeader && header != null) ...[
            header!,
            SizedBox(height: progressIndicatorSpacing),
          ],
          if (showTitle && title != null) ...[
            DefaultTextStyle(
              style: titleStyle ?? progressIndicatorTitleStyle,
              child: Text(title!),
            ),
            if (showSubtitle && subtitle != null) ...[
              SizedBox(height: progressIndicatorSpacing / 2),
              DefaultTextStyle(
                style: subtitleStyle ?? progressIndicatorSubtitleStyle,
                child: Text(subtitle!),
              ),
            ],
            SizedBox(height: progressIndicatorSpacing),
          ],
          if (showIcon && icon != null) ...[
            Icon(
              icon,
              color: iconColor ?? theme.colorScheme.onSurface,
              size: iconSize ?? progressIndicatorIconSize,
            ),
            SizedBox(height: progressIndicatorSpacing),
          ],
          LinearProgressIndicator(
            value: value,
            backgroundColor: backgroundColor ?? progressIndicatorColors.backgroundColor,
            valueColor: AlwaysStoppedAnimation<Color>(
              valueColor ?? theme.colorScheme.primary,
            ),
            minHeight: size == AppProgressIndicatorSize.small
                ? 4.0
                : size == AppProgressIndicatorSize.medium
                    ? 6.0
                    : 8.0,
          ),
          if (showButton && button != null) ...[
            SizedBox(height: progressIndicatorSpacing),
            button!,
          ],
          if (showButtonIcon && buttonIcon != null) ...[
            SizedBox(height: progressIndicatorSpacing),
            IconButton(
              icon: Icon(
                buttonIcon,
                color: buttonIconColor ?? theme.colorScheme.onSurface,
                size: buttonIconSize ?? progressIndicatorIconSize,
              ),
              onPressed: onButtonPressed,
            ),
          ],
          if (showButtonText && buttonText != null) ...[
            SizedBox(height: progressIndicatorSpacing),
            DefaultTextStyle(
              style: buttonTextStyle ?? progressIndicatorTitleStyle,
              child: Text(buttonText!),
            ),
          ],
          if (showFooter && footer != null) ...[
            SizedBox(height: progressIndicatorSpacing),
            footer!,
          ],
        ],
      ),
    );

    if (animate && showAnimation) {
      progressIndicator = AppAnimations.fadeIn(
        progressIndicator,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return progressIndicator;
  }

  _ProgressIndicatorColors _getProgressIndicatorColors(ThemeData theme) {
    switch (variant) {
      case AppProgressIndicatorVariant.standard:
        return _ProgressIndicatorColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
        );
      case AppProgressIndicatorVariant.filled:
        return _ProgressIndicatorColors(
          backgroundColor: theme.colorScheme.surfaceVariant,
          borderColor: theme.colorScheme.outline,
        );
      case AppProgressIndicatorVariant.outlined:
        return _ProgressIndicatorColors(
          backgroundColor: Colors.transparent,
          borderColor: theme.colorScheme.outline,
        );
    }
  }
}

class _ProgressIndicatorColors {
  final Color backgroundColor;
  final Color borderColor;

  const _ProgressIndicatorColors({
    required this.backgroundColor,
    required this.borderColor,
  });
} 
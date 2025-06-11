import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';

enum AppSnackBarVariant {
  standard,
  filled,
  outlined,
}

enum AppSnackBarSize {
  small,
  medium,
  large,
}

class AppSnackBar extends StatelessWidget {
  final Widget? child;
  final AppSnackBarVariant variant;
  final AppSnackBarSize size;
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

  const AppSnackBar({
    Key? key,
    this.child,
    this.variant = AppSnackBarVariant.standard,
    this.size = AppSnackBarSize.medium,
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

    // Calculate snackbar colors
    final snackbarColors = _getSnackbarColors(theme);

    // Calculate snackbar margin
    final snackbarMargin = margin ??
        EdgeInsets.all(
          size == AppSnackBarSize.small
              ? AppTheme.spacing1
              : size == AppSnackBarSize.medium
                  ? AppTheme.spacing2
                  : AppTheme.spacing3,
        );

    // Calculate snackbar padding
    final snackbarPadding = padding ??
        EdgeInsets.all(
          size == AppSnackBarSize.small
              ? AppTheme.spacing2
              : size == AppSnackBarSize.medium
                  ? AppTheme.spacing3
                  : AppTheme.spacing4,
        );

    // Calculate snackbar elevation
    final snackbarElevation = elevation ??
        (variant == AppSnackBarVariant.standard
            ? (size == AppSnackBarSize.small
                ? 1.0
                : size == AppSnackBarSize.medium
                    ? 2.0
                    : 4.0)
            : 0.0);

    // Calculate snackbar border radius
    final snackbarBorderRadius = borderRadius ??
        (size == AppSnackBarSize.small
            ? AppTheme.radius2
            : size == AppSnackBarSize.medium
                ? AppTheme.radius3
                : AppTheme.radius4);

    // Calculate snackbar spacing
    final snackbarSpacing = size == AppSnackBarSize.small
        ? AppTheme.spacing1
        : size == AppSnackBarSize.medium
            ? AppTheme.spacing2
            : AppTheme.spacing3;

    // Calculate snackbar icon size
    final snackbarIconSize = size == AppSnackBarSize.small
        ? 16.0
        : size == AppSnackBarSize.medium
            ? 18.0
            : 20.0;

    // Calculate snackbar title style
    final snackbarTitleStyle = TextStyle(
      color: theme.colorScheme.onSurface,
      fontSize: size == AppSnackBarSize.small
          ? 16.0
          : size == AppSnackBarSize.medium
              ? 18.0
              : 20.0,
      fontWeight: FontWeight.w500,
    );

    // Calculate snackbar subtitle style
    final snackbarSubtitleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppSnackBarSize.small
          ? 14.0
          : size == AppSnackBarSize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w400,
    );

    Widget snackbar = Container(
      decoration: BoxDecoration(
        color: showBackground
            ? backgroundColor ?? snackbarColors.backgroundColor
            : Colors.transparent,
        borderRadius: BorderRadius.circular(snackbarBorderRadius),
        border: showBorder && variant == AppSnackBarVariant.outlined
            ? Border.all(
                color: borderColor ?? snackbarColors.borderColor,
                width: 1.0,
              )
            : null,
        boxShadow: showShadow && variant == AppSnackBarVariant.standard
            ? [
                BoxShadow(
                  color: theme.shadowColor.withOpacity(0.1),
                  blurRadius: snackbarElevation * 2,
                  offset: Offset(0, snackbarElevation),
                ),
              ]
            : null,
      ),
      margin: snackbarMargin,
      padding: snackbarPadding,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showIcon && icon != null) ...[
            Icon(
              icon,
              color: iconColor ?? theme.colorScheme.onSurface,
              size: iconSize ?? snackbarIconSize,
            ),
            SizedBox(width: snackbarSpacing),
          ],
          Expanded(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (showHeader && header != null) ...[
                  header!,
                  SizedBox(height: snackbarSpacing),
                ],
                if (showTitle && title != null) ...[
                  DefaultTextStyle(
                    style: titleStyle ?? snackbarTitleStyle,
                    child: Text(title!),
                  ),
                  if (showSubtitle && subtitle != null) ...[
                    SizedBox(height: snackbarSpacing / 2),
                    DefaultTextStyle(
                      style: subtitleStyle ?? snackbarSubtitleStyle,
                      child: Text(subtitle!),
                    ),
                  ],
                  SizedBox(height: snackbarSpacing),
                ],
                if (child != null) ...[
                  child!,
                  SizedBox(height: snackbarSpacing),
                ],
                if (showFooter && footer != null) footer!,
              ],
            ),
          ),
          if (showButton && button != null) ...[
            SizedBox(width: snackbarSpacing),
            button!,
          ],
          if (showButtonIcon && buttonIcon != null) ...[
            SizedBox(width: snackbarSpacing),
            IconButton(
              icon: Icon(
                buttonIcon,
                color: buttonIconColor ?? theme.colorScheme.onSurface,
                size: buttonIconSize ?? snackbarIconSize,
              ),
              onPressed: onButtonPressed,
            ),
          ],
          if (showButtonText && buttonText != null) ...[
            SizedBox(width: snackbarSpacing),
            DefaultTextStyle(
              style: buttonTextStyle ?? snackbarTitleStyle,
              child: Text(buttonText!),
            ),
          ],
        ],
      ),
    );

    if (animate && showAnimation) {
      snackbar = AppAnimations.fadeIn(
        snackbar,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return snackbar;
  }

  _SnackbarColors _getSnackbarColors(ThemeData theme) {
    switch (variant) {
      case AppSnackBarVariant.standard:
        return _SnackbarColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
        );
      case AppSnackBarVariant.filled:
        return _SnackbarColors(
          backgroundColor: theme.colorScheme.surfaceVariant,
          borderColor: theme.colorScheme.outline,
        );
      case AppSnackBarVariant.outlined:
        return _SnackbarColors(
          backgroundColor: Colors.transparent,
          borderColor: theme.colorScheme.outline,
        );
    }
  }
}

class _SnackbarColors {
  final Color backgroundColor;
  final Color borderColor;

  const _SnackbarColors({
    required this.backgroundColor,
    required this.borderColor,
  });
}

class AppSnackbarHeader extends StatelessWidget {
  final Widget? leading;
  final Widget? title;
  final Widget? subtitle;
  final List<Widget>? actions;
  final AppSnackbarSize size;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppSnackbarHeader({
    Key? key,
    this.leading,
    this.title,
    this.subtitle,
    this.actions,
    this.size = AppSnackbarSize.medium,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate header spacing
    final headerSpacing = size == AppSnackbarSize.small
        ? AppTheme.spacing2
        : size == AppSnackbarSize.medium
            ? AppTheme.spacing3
            : AppTheme.spacing4;

    // Calculate title style
    final titleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppSnackbarSize.small
          ? 14.0
          : size == AppSnackbarSize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w600,
    );

    // Calculate subtitle style
    final subtitleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant.withOpacity(0.6),
      fontSize: size == AppSnackbarSize.small
          ? 12.0
          : size == AppSnackbarSize.medium
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

class AppSnackbarFooter extends StatelessWidget {
  final List<Widget>? actions;
  final AppSnackbarSize size;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppSnackbarFooter({
    Key? key,
    this.actions,
    this.size = AppSnackbarSize.medium,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate footer spacing
    final footerSpacing = size == AppSnackbarSize.small
        ? AppTheme.spacing2
        : size == AppSnackbarSize.medium
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
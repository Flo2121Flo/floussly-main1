import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';

enum AppBottomSheetVariant {
  standard,
  filled,
  outlined,
}

enum AppBottomSheetSize {
  small,
  medium,
  large,
}

class AppBottomSheet extends StatelessWidget {
  final Widget? child;
  final AppBottomSheetVariant variant;
  final AppBottomSheetSize size;
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

  const AppBottomSheet({
    Key? key,
    this.child,
    this.variant = AppBottomSheetVariant.standard,
    this.size = AppBottomSheetSize.medium,
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

    // Calculate bottom sheet colors
    final bottomSheetColors = _getBottomSheetColors(theme);

    // Calculate bottom sheet margin
    final bottomSheetMargin = margin ??
        EdgeInsets.all(
          size == AppBottomSheetSize.small
              ? AppTheme.spacing1
              : size == AppBottomSheetSize.medium
                  ? AppTheme.spacing2
                  : AppTheme.spacing3,
        );

    // Calculate bottom sheet padding
    final bottomSheetPadding = padding ??
        EdgeInsets.all(
          size == AppBottomSheetSize.small
              ? AppTheme.spacing2
              : size == AppBottomSheetSize.medium
                  ? AppTheme.spacing3
                  : AppTheme.spacing4,
        );

    // Calculate bottom sheet elevation
    final bottomSheetElevation = elevation ??
        (variant == AppBottomSheetVariant.standard
            ? (size == AppBottomSheetSize.small
                ? 1.0
                : size == AppBottomSheetSize.medium
                    ? 2.0
                    : 4.0)
            : 0.0);

    // Calculate bottom sheet border radius
    final bottomSheetBorderRadius = borderRadius ??
        (size == AppBottomSheetSize.small
            ? AppTheme.radius2
            : size == AppBottomSheetSize.medium
                ? AppTheme.radius3
                : AppTheme.radius4);

    // Calculate bottom sheet spacing
    final bottomSheetSpacing = size == AppBottomSheetSize.small
        ? AppTheme.spacing1
        : size == AppBottomSheetSize.medium
            ? AppTheme.spacing2
            : AppTheme.spacing3;

    // Calculate bottom sheet icon size
    final bottomSheetIconSize = size == AppBottomSheetSize.small
        ? 16.0
        : size == AppBottomSheetSize.medium
            ? 18.0
            : 20.0;

    // Calculate bottom sheet title style
    final bottomSheetTitleStyle = TextStyle(
      color: theme.colorScheme.onSurface,
      fontSize: size == AppBottomSheetSize.small
          ? 16.0
          : size == AppBottomSheetSize.medium
              ? 18.0
              : 20.0,
      fontWeight: FontWeight.w500,
    );

    // Calculate bottom sheet subtitle style
    final bottomSheetSubtitleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppBottomSheetSize.small
          ? 14.0
          : size == AppBottomSheetSize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w400,
    );

    Widget bottomSheet = Container(
      decoration: BoxDecoration(
        color: showBackground
            ? backgroundColor ?? bottomSheetColors.backgroundColor
            : Colors.transparent,
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(bottomSheetBorderRadius),
        ),
        border: showBorder && variant == AppBottomSheetVariant.outlined
            ? Border.all(
                color: borderColor ?? bottomSheetColors.borderColor,
                width: 1.0,
              )
            : null,
        boxShadow: showShadow && variant == AppBottomSheetVariant.standard
            ? [
                BoxShadow(
                  color: theme.shadowColor.withOpacity(0.1),
                  blurRadius: bottomSheetElevation * 2,
                  offset: Offset(0, -bottomSheetElevation),
                ),
              ]
            : null,
      ),
      margin: bottomSheetMargin,
      padding: bottomSheetPadding,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (showHeader && header != null) ...[
            header!,
            SizedBox(height: bottomSheetSpacing),
          ],
          if (showTitle && title != null) ...[
            DefaultTextStyle(
              style: titleStyle ?? bottomSheetTitleStyle,
              child: Text(title!),
            ),
            if (showSubtitle && subtitle != null) ...[
              SizedBox(height: bottomSheetSpacing / 2),
              DefaultTextStyle(
                style: subtitleStyle ?? bottomSheetSubtitleStyle,
                child: Text(subtitle!),
              ),
            ],
            SizedBox(height: bottomSheetSpacing),
          ],
          if (showIcon && icon != null) ...[
            Icon(
              icon,
              color: iconColor ?? theme.colorScheme.onSurface,
              size: iconSize ?? bottomSheetIconSize,
            ),
            SizedBox(height: bottomSheetSpacing),
          ],
          if (child != null) ...[
            child!,
            SizedBox(height: bottomSheetSpacing),
          ],
          if (showButton && button != null) ...[
            button!,
            SizedBox(height: bottomSheetSpacing),
          ],
          if (showButtonIcon && buttonIcon != null) ...[
            IconButton(
              icon: Icon(
                buttonIcon,
                color: buttonIconColor ?? theme.colorScheme.onSurface,
                size: buttonIconSize ?? bottomSheetIconSize,
              ),
              onPressed: onButtonPressed,
            ),
            SizedBox(height: bottomSheetSpacing),
          ],
          if (showButtonText && buttonText != null) ...[
            DefaultTextStyle(
              style: buttonTextStyle ?? bottomSheetTitleStyle,
              child: Text(buttonText!),
            ),
            SizedBox(height: bottomSheetSpacing),
          ],
          if (showFooter && footer != null) footer!,
        ],
      ),
    );

    if (animate && showAnimation) {
      bottomSheet = AppAnimations.fadeIn(
        bottomSheet,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return bottomSheet;
  }

  _BottomSheetColors _getBottomSheetColors(ThemeData theme) {
    switch (variant) {
      case AppBottomSheetVariant.standard:
        return _BottomSheetColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
        );
      case AppBottomSheetVariant.filled:
        return _BottomSheetColors(
          backgroundColor: theme.colorScheme.surfaceVariant,
          borderColor: theme.colorScheme.outline,
        );
      case AppBottomSheetVariant.outlined:
        return _BottomSheetColors(
          backgroundColor: Colors.transparent,
          borderColor: theme.colorScheme.outline,
        );
    }
  }
}

class _BottomSheetColors {
  final Color backgroundColor;
  final Color borderColor;

  const _BottomSheetColors({
    required this.backgroundColor,
    required this.borderColor,
  });
}

class AppBottomSheetHeader extends StatelessWidget {
  final Widget? leading;
  final Widget? title;
  final Widget? subtitle;
  final List<Widget>? actions;
  final AppBottomSheetSize size;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppBottomSheetHeader({
    Key? key,
    this.leading,
    this.title,
    this.subtitle,
    this.actions,
    this.size = AppBottomSheetSize.medium,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate header spacing
    final headerSpacing = size == AppBottomSheetSize.small
        ? AppTheme.spacing2
        : size == AppBottomSheetSize.medium
            ? AppTheme.spacing3
            : AppTheme.spacing4;

    // Calculate title style
    final titleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppBottomSheetSize.small
          ? 14.0
          : size == AppBottomSheetSize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w600,
    );

    // Calculate subtitle style
    final subtitleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant.withOpacity(0.6),
      fontSize: size == AppBottomSheetSize.small
          ? 12.0
          : size == AppBottomSheetSize.medium
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

class AppBottomSheetFooter extends StatelessWidget {
  final List<Widget>? actions;
  final AppBottomSheetSize size;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppBottomSheetFooter({
    Key? key,
    this.actions,
    this.size = AppBottomSheetSize.medium,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate footer spacing
    final footerSpacing = size == AppBottomSheetSize.small
        ? AppTheme.spacing2
        : size == AppBottomSheetSize.medium
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

class AppBottomSheetAction extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final AppBottomSheetSize size;
  final Color? color;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppBottomSheetAction({
    Key? key,
    required this.text,
    this.onPressed,
    this.size = AppBottomSheetSize.medium,
    this.color,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate action color
    final actionColor = color ?? theme.colorScheme.primary;

    Widget action = TextButton(
      onPressed: onPressed,
      style: TextButton.styleFrom(
        padding: EdgeInsets.symmetric(
          horizontal: size == AppBottomSheetSize.small
              ? AppTheme.spacing8
              : size == AppBottomSheetSize.medium
                  ? AppTheme.spacing12
                  : AppTheme.spacing16,
          vertical: size == AppBottomSheetSize.small
              ? AppTheme.spacing4
              : size == AppBottomSheetSize.medium
                  ? AppTheme.spacing6
                  : AppTheme.spacing8,
        ),
        minimumSize: Size.zero,
        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
      ),
      child: Text(
        text,
        style: TextStyle(
          color: actionColor,
          fontSize: size == AppBottomSheetSize.small
              ? 12.0
              : size == AppBottomSheetSize.medium
                  ? 14.0
                  : 16.0,
          fontWeight: FontWeight.w600,
        ),
      ),
    );

    if (animate) {
      action = AppAnimations.fadeIn(
        action,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return action;
  }
}

class AppBottomSheetIcon extends StatelessWidget {
  final IconData icon;
  final AppBottomSheetVariant variant;
  final AppBottomSheetSize size;
  final Color? color;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppBottomSheetIcon({
    Key? key,
    required this.icon,
    this.variant = AppBottomSheetVariant.standard,
    this.size = AppBottomSheetSize.medium,
    this.color,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate icon size
    final iconSize = size == AppBottomSheetSize.small
        ? 20.0
        : size == AppBottomSheetSize.medium
            ? 24.0
            : 28.0;

    // Calculate icon color
    final iconColor = color ?? theme.colorScheme.primary;

    Widget bottomSheetIcon = Icon(
      icon,
      size: iconSize,
      color: iconColor,
    );

    if (animate) {
      bottomSheetIcon = AppAnimations.fadeIn(
        bottomSheetIcon,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return bottomSheetIcon;
  }
} 
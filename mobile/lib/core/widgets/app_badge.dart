import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';

enum AppBadgeVariant {
  standard,
  filled,
  outlined,
}

enum AppBadgeSize {
  small,
  medium,
  large,
}

class AppBadge extends StatelessWidget {
  final Widget? child;
  final AppBadgeVariant variant;
  final AppBadgeSize size;
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

  const AppBadge({
    Key? key,
    this.child,
    this.variant = AppBadgeVariant.standard,
    this.size = AppBadgeSize.medium,
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

    // Calculate badge colors
    final badgeColors = _getBadgeColors(theme);

    // Calculate badge margin
    final badgeMargin = margin ??
        EdgeInsets.all(
          size == AppBadgeSize.small
              ? AppTheme.spacing1
              : size == AppBadgeSize.medium
                  ? AppTheme.spacing2
                  : AppTheme.spacing3,
        );

    // Calculate badge padding
    final badgePadding = padding ??
        EdgeInsets.all(
          size == AppBadgeSize.small
              ? AppTheme.spacing2
              : size == AppBadgeSize.medium
                  ? AppTheme.spacing3
                  : AppTheme.spacing4,
        );

    // Calculate badge elevation
    final badgeElevation = elevation ??
        (variant == AppBadgeVariant.standard
            ? (size == AppBadgeSize.small
                ? 1.0
                : size == AppBadgeSize.medium
                    ? 2.0
                    : 4.0)
            : 0.0);

    // Calculate badge border radius
    final badgeBorderRadius = borderRadius ??
        (size == AppBadgeSize.small
            ? AppTheme.radius2
            : size == AppBadgeSize.medium
                ? AppTheme.radius3
                : AppTheme.radius4);

    // Calculate badge spacing
    final badgeSpacing = size == AppBadgeSize.small
        ? AppTheme.spacing1
        : size == AppBadgeSize.medium
            ? AppTheme.spacing2
            : AppTheme.spacing3;

    // Calculate badge icon size
    final badgeIconSize = size == AppBadgeSize.small
        ? 16.0
        : size == AppBadgeSize.medium
            ? 18.0
            : 20.0;

    // Calculate badge title style
    final badgeTitleStyle = TextStyle(
      color: theme.colorScheme.onSurface,
      fontSize: size == AppBadgeSize.small
          ? 16.0
          : size == AppBadgeSize.medium
              ? 18.0
              : 20.0,
      fontWeight: FontWeight.w500,
    );

    // Calculate badge subtitle style
    final badgeSubtitleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppBadgeSize.small
          ? 14.0
          : size == AppBadgeSize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w400,
    );

    Widget badge = Container(
      decoration: BoxDecoration(
        color: showBackground
            ? backgroundColor ?? badgeColors.backgroundColor
            : Colors.transparent,
        borderRadius: BorderRadius.circular(badgeBorderRadius),
        border: showBorder && variant == AppBadgeVariant.outlined
            ? Border.all(
                color: borderColor ?? badgeColors.borderColor,
                width: 1.0,
              )
            : null,
        boxShadow: showShadow && variant == AppBadgeVariant.standard
            ? [
                BoxShadow(
                  color: theme.shadowColor.withOpacity(0.1),
                  blurRadius: badgeElevation * 2,
                  offset: Offset(0, badgeElevation),
                ),
              ]
            : null,
      ),
      margin: badgeMargin,
      padding: badgePadding,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (showHeader && header != null) ...[
            header!,
            SizedBox(height: badgeSpacing),
          ],
          if (showTitle && title != null) ...[
            DefaultTextStyle(
              style: titleStyle ?? badgeTitleStyle,
              child: Text(title!),
            ),
            if (showSubtitle && subtitle != null) ...[
              SizedBox(height: badgeSpacing / 2),
              DefaultTextStyle(
                style: subtitleStyle ?? badgeSubtitleStyle,
                child: Text(subtitle!),
              ),
            ],
            SizedBox(height: badgeSpacing),
          ],
          if (showIcon && icon != null) ...[
            Icon(
              icon,
              color: iconColor ?? theme.colorScheme.onSurface,
              size: iconSize ?? badgeIconSize,
            ),
            SizedBox(height: badgeSpacing),
          ],
          if (child != null) ...[
            child!,
            SizedBox(height: badgeSpacing),
          ],
          if (showButton && button != null) ...[
            button!,
            SizedBox(height: badgeSpacing),
          ],
          if (showButtonIcon && buttonIcon != null) ...[
            IconButton(
              icon: Icon(
                buttonIcon,
                color: buttonIconColor ?? theme.colorScheme.onSurface,
                size: buttonIconSize ?? badgeIconSize,
              ),
              onPressed: onButtonPressed,
            ),
            SizedBox(height: badgeSpacing),
          ],
          if (showButtonText && buttonText != null) ...[
            DefaultTextStyle(
              style: buttonTextStyle ?? badgeTitleStyle,
              child: Text(buttonText!),
            ),
            SizedBox(height: badgeSpacing),
          ],
          if (showFooter && footer != null) footer!,
        ],
      ),
    );

    if (animate && showAnimation) {
      badge = AppAnimations.fadeIn(
        badge,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return badge;
  }

  _BadgeColors _getBadgeColors(ThemeData theme) {
    switch (variant) {
      case AppBadgeVariant.standard:
        return _BadgeColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
        );
      case AppBadgeVariant.filled:
        return _BadgeColors(
          backgroundColor: theme.colorScheme.surfaceVariant,
          borderColor: theme.colorScheme.outline,
        );
      case AppBadgeVariant.outlined:
        return _BadgeColors(
          backgroundColor: Colors.transparent,
          borderColor: theme.colorScheme.outline,
        );
    }
  }
}

class _BadgeColors {
  final Color backgroundColor;
  final Color borderColor;

  const _BadgeColors({
    required this.backgroundColor,
    required this.borderColor,
  });
}

class AppBadgeHeader extends StatelessWidget {
  final Widget? leading;
  final Widget? title;
  final Widget? subtitle;
  final List<Widget>? actions;
  final AppBadgeSize size;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppBadgeHeader({
    Key? key,
    this.leading,
    this.title,
    this.subtitle,
    this.actions,
    this.size = AppBadgeSize.medium,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate header spacing
    final headerSpacing = size == AppBadgeSize.small
        ? AppTheme.spacing2
        : size == AppBadgeSize.medium
            ? AppTheme.spacing3
            : AppTheme.spacing4;

    // Calculate title style
    final titleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppBadgeSize.small
          ? 12.0
          : size == AppBadgeSize.medium
              ? 14.0
              : 16.0,
      fontWeight: FontWeight.w600,
    );

    // Calculate subtitle style
    final subtitleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant.withOpacity(0.6),
      fontSize: size == AppBadgeSize.small
          ? 10.0
          : size == AppBadgeSize.medium
              ? 12.0
              : 14.0,
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

class AppBadgeFooter extends StatelessWidget {
  final List<Widget>? actions;
  final AppBadgeSize size;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppBadgeFooter({
    Key? key,
    this.actions,
    this.size = AppBadgeSize.medium,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate footer spacing
    final footerSpacing = size == AppBadgeSize.small
        ? AppTheme.spacing2
        : size == AppBadgeSize.medium
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
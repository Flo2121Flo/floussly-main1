import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';

enum AppAvatarVariant {
  standard,
  filled,
  outlined,
}

enum AppAvatarSize {
  small,
  medium,
  large,
}

class AppAvatar extends StatelessWidget {
  final Widget? child;
  final AppAvatarVariant variant;
  final AppAvatarSize size;
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

  const AppAvatar({
    Key? key,
    this.child,
    this.variant = AppAvatarVariant.standard,
    this.size = AppAvatarSize.medium,
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

    // Calculate avatar colors
    final avatarColors = _getAvatarColors(theme);

    // Calculate avatar margin
    final avatarMargin = margin ??
        EdgeInsets.all(
          size == AppAvatarSize.small
              ? AppTheme.spacing1
              : size == AppAvatarSize.medium
                  ? AppTheme.spacing2
                  : AppTheme.spacing3,
        );

    // Calculate avatar padding
    final avatarPadding = padding ??
        EdgeInsets.all(
          size == AppAvatarSize.small
              ? AppTheme.spacing2
              : size == AppAvatarSize.medium
                  ? AppTheme.spacing3
                  : AppTheme.spacing4,
        );

    // Calculate avatar elevation
    final avatarElevation = elevation ??
        (variant == AppAvatarVariant.standard
            ? (size == AppAvatarSize.small
                ? 1.0
                : size == AppAvatarSize.medium
                    ? 2.0
                    : 4.0)
            : 0.0);

    // Calculate avatar border radius
    final avatarBorderRadius = borderRadius ??
        (size == AppAvatarSize.small
            ? AppTheme.radius2
            : size == AppAvatarSize.medium
                ? AppTheme.radius3
                : AppTheme.radius4);

    // Calculate avatar spacing
    final avatarSpacing = size == AppAvatarSize.small
        ? AppTheme.spacing1
        : size == AppAvatarSize.medium
            ? AppTheme.spacing2
            : AppTheme.spacing3;

    // Calculate avatar icon size
    final avatarIconSize = size == AppAvatarSize.small
        ? 16.0
        : size == AppAvatarSize.medium
            ? 18.0
            : 20.0;

    // Calculate avatar title style
    final avatarTitleStyle = TextStyle(
      color: theme.colorScheme.onSurface,
      fontSize: size == AppAvatarSize.small
          ? 16.0
          : size == AppAvatarSize.medium
              ? 18.0
              : 20.0,
      fontWeight: FontWeight.w500,
    );

    // Calculate avatar subtitle style
    final avatarSubtitleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppAvatarSize.small
          ? 14.0
          : size == AppAvatarSize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w400,
    );

    Widget avatar = Container(
      decoration: BoxDecoration(
        color: showBackground
            ? backgroundColor ?? avatarColors.backgroundColor
            : Colors.transparent,
        borderRadius: BorderRadius.circular(avatarBorderRadius),
        border: showBorder && variant == AppAvatarVariant.outlined
            ? Border.all(
                color: borderColor ?? avatarColors.borderColor,
                width: 1.0,
              )
            : null,
        boxShadow: showShadow && variant == AppAvatarVariant.standard
            ? [
                BoxShadow(
                  color: theme.shadowColor.withOpacity(0.1),
                  blurRadius: avatarElevation * 2,
                  offset: Offset(0, avatarElevation),
                ),
              ]
            : null,
      ),
      margin: avatarMargin,
      padding: avatarPadding,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (showHeader && header != null) ...[
            header!,
            SizedBox(height: avatarSpacing),
          ],
          if (showTitle && title != null) ...[
            DefaultTextStyle(
              style: titleStyle ?? avatarTitleStyle,
              child: Text(title!),
            ),
            if (showSubtitle && subtitle != null) ...[
              SizedBox(height: avatarSpacing / 2),
              DefaultTextStyle(
                style: subtitleStyle ?? avatarSubtitleStyle,
                child: Text(subtitle!),
              ),
            ],
            SizedBox(height: avatarSpacing),
          ],
          if (showIcon && icon != null) ...[
            Icon(
              icon,
              color: iconColor ?? theme.colorScheme.onSurface,
              size: iconSize ?? avatarIconSize,
            ),
            SizedBox(height: avatarSpacing),
          ],
          if (child != null) ...[
            child!,
            SizedBox(height: avatarSpacing),
          ],
          if (showButton && button != null) ...[
            button!,
            SizedBox(height: avatarSpacing),
          ],
          if (showButtonIcon && buttonIcon != null) ...[
            IconButton(
              icon: Icon(
                buttonIcon,
                color: buttonIconColor ?? theme.colorScheme.onSurface,
                size: buttonIconSize ?? avatarIconSize,
              ),
              onPressed: onButtonPressed,
            ),
            SizedBox(height: avatarSpacing),
          ],
          if (showButtonText && buttonText != null) ...[
            DefaultTextStyle(
              style: buttonTextStyle ?? avatarTitleStyle,
              child: Text(buttonText!),
            ),
            SizedBox(height: avatarSpacing),
          ],
          if (showFooter && footer != null) footer!,
        ],
      ),
    );

    if (animate && showAnimation) {
      avatar = AppAnimations.fadeIn(
        avatar,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return avatar;
  }

  _AvatarColors _getAvatarColors(ThemeData theme) {
    switch (variant) {
      case AppAvatarVariant.standard:
        return _AvatarColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
        );
      case AppAvatarVariant.filled:
        return _AvatarColors(
          backgroundColor: theme.colorScheme.surfaceVariant,
          borderColor: theme.colorScheme.outline,
        );
      case AppAvatarVariant.outlined:
        return _AvatarColors(
          backgroundColor: Colors.transparent,
          borderColor: theme.colorScheme.outline,
        );
    }
  }
}

class _AvatarColors {
  final Color backgroundColor;
  final Color borderColor;

  const _AvatarColors({
    required this.backgroundColor,
    required this.borderColor,
  });
}

class AppAvatarGroup extends StatelessWidget {
  final List<AppAvatar> avatars;
  final double spacing;
  final double overlap;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppAvatarGroup({
    Key? key,
    required this.avatars,
    this.spacing = AppTheme.spacing8,
    this.overlap = 0.3,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        for (var i = 0; i < avatars.length; i++)
          Positioned(
            left: i * (avatars[i].size ?? AppTheme.spacing40) * (1 - overlap),
            child: avatars[i],
          ),
      ],
    );
  }
}

class AppAvatarBadge extends StatelessWidget {
  final Widget child;
  final Widget badge;
  final Alignment alignment;
  final EdgeInsets? padding;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppAvatarBadge({
    Key? key,
    required this.child,
    required this.badge,
    this.alignment = const Alignment(1.2, 1.2),
    this.padding,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Widget badgeWidget = Positioned.fill(
      child: Align(
        alignment: alignment,
        child: Padding(
          padding: padding ?? EdgeInsets.zero,
          child: badge,
        ),
      ),
    );

    if (animate) {
      badgeWidget = AppAnimations.fadeIn(
        badgeWidget,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return Stack(
      children: [
        child,
        badgeWidget,
      ],
    );
  }
} 
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';

enum AppListVariant {
  standard,
  filled,
  outlined,
}

enum AppListSize {
  small,
  medium,
  large,
}

class AppList extends StatelessWidget {
  final List<Widget> children;
  final AppListVariant variant;
  final AppListSize size;
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

  const AppList({
    Key? key,
    required this.children,
    this.variant = AppListVariant.standard,
    this.size = AppListSize.medium,
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

    // Calculate list colors
    final listColors = _getListColors(theme);

    // Calculate list margin
    final listMargin = margin ??
        EdgeInsets.all(
          size == AppListSize.small
              ? AppTheme.spacing1
              : size == AppListSize.medium
                  ? AppTheme.spacing2
                  : AppTheme.spacing3,
        );

    // Calculate list padding
    final listPadding = padding ??
        EdgeInsets.all(
          size == AppListSize.small
              ? AppTheme.spacing2
              : size == AppListSize.medium
                  ? AppTheme.spacing3
                  : AppTheme.spacing4,
        );

    // Calculate list elevation
    final listElevation = elevation ??
        (variant == AppListVariant.standard
            ? (size == AppListSize.small
                ? 1.0
                : size == AppListSize.medium
                    ? 2.0
                    : 4.0)
            : 0.0);

    // Calculate list border radius
    final listBorderRadius = borderRadius ??
        (size == AppListSize.small
            ? AppTheme.radius2
            : size == AppListSize.medium
                ? AppTheme.radius3
                : AppTheme.radius4);

    // Calculate list spacing
    final listSpacing = size == AppListSize.small
        ? AppTheme.spacing1
        : size == AppListSize.medium
            ? AppTheme.spacing2
            : AppTheme.spacing3;

    // Calculate list icon size
    final listIconSize = size == AppListSize.small
        ? 16.0
        : size == AppListSize.medium
            ? 18.0
            : 20.0;

    // Calculate list title style
    final listTitleStyle = TextStyle(
      color: theme.colorScheme.onSurface,
      fontSize: size == AppListSize.small
          ? 16.0
          : size == AppListSize.medium
              ? 18.0
              : 20.0,
      fontWeight: FontWeight.w500,
    );

    // Calculate list subtitle style
    final listSubtitleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppListSize.small
          ? 14.0
          : size == AppListSize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w400,
    );

    Widget list = Container(
      decoration: BoxDecoration(
        color: showBackground
            ? backgroundColor ?? listColors.backgroundColor
            : Colors.transparent,
        borderRadius: BorderRadius.circular(listBorderRadius),
        border: showBorder && variant == AppListVariant.outlined
            ? Border.all(
                color: borderColor ?? listColors.borderColor,
                width: 1.0,
              )
            : null,
        boxShadow: showShadow && variant == AppListVariant.standard
            ? [
                BoxShadow(
                  color: theme.shadowColor.withOpacity(0.1),
                  blurRadius: listElevation * 2,
                  offset: Offset(0, listElevation),
                ),
              ]
            : null,
      ),
      margin: listMargin,
      padding: listPadding,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (showHeader && header != null) ...[
            header!,
            SizedBox(height: listSpacing),
          ],
          if (showTitle && title != null) ...[
            DefaultTextStyle(
              style: titleStyle ?? listTitleStyle,
              child: Text(title!),
            ),
            if (showSubtitle && subtitle != null) ...[
              SizedBox(height: listSpacing / 2),
              DefaultTextStyle(
                style: subtitleStyle ?? listSubtitleStyle,
                child: Text(subtitle!),
              ),
            ],
            SizedBox(height: listSpacing),
          ],
          if (showIcon && icon != null) ...[
            Icon(
              icon,
              color: iconColor ?? theme.colorScheme.onSurface,
              size: iconSize ?? listIconSize,
            ),
            SizedBox(height: listSpacing),
          ],
          ...children.map((child) => Padding(
                padding: EdgeInsets.only(bottom: listSpacing),
                child: child,
              )),
          if (showButton && button != null) ...[
            button!,
            SizedBox(height: listSpacing),
          ],
          if (showButtonIcon && buttonIcon != null) ...[
            IconButton(
              icon: Icon(
                buttonIcon,
                color: buttonIconColor ?? theme.colorScheme.onSurface,
                size: buttonIconSize ?? listIconSize,
              ),
              onPressed: onButtonPressed,
            ),
            SizedBox(height: listSpacing),
          ],
          if (showButtonText && buttonText != null) ...[
            DefaultTextStyle(
              style: buttonTextStyle ?? listTitleStyle,
              child: Text(buttonText!),
            ),
            SizedBox(height: listSpacing),
          ],
          if (showFooter && footer != null) footer!,
        ],
      ),
    );

    if (animate && showAnimation) {
      list = AppAnimations.fadeIn(
        list,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return list;
  }

  _ListColors _getListColors(ThemeData theme) {
    switch (variant) {
      case AppListVariant.standard:
        return _ListColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
        );
      case AppListVariant.filled:
        return _ListColors(
          backgroundColor: theme.colorScheme.surfaceVariant,
          borderColor: theme.colorScheme.outline,
        );
      case AppListVariant.outlined:
        return _ListColors(
          backgroundColor: Colors.transparent,
          borderColor: theme.colorScheme.outline,
        );
    }
  }
}

class _ListColors {
  final Color backgroundColor;
  final Color borderColor;

  const _ListColors({
    required this.backgroundColor,
    required this.borderColor,
  });
}

class AppListHeader extends StatelessWidget {
  final Widget? leading;
  final Widget? title;
  final Widget? subtitle;
  final List<Widget>? actions;
  final AppListSize size;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppListHeader({
    Key? key,
    this.leading,
    this.title,
    this.subtitle,
    this.actions,
    this.size = AppListSize.medium,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate header spacing
    final headerSpacing = size == AppListSize.small
        ? AppTheme.spacing2
        : size == AppListSize.medium
            ? AppTheme.spacing3
            : AppTheme.spacing4;

    // Calculate title style
    final titleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppListSize.small
          ? 14.0
          : size == AppListSize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w600,
    );

    // Calculate subtitle style
    final subtitleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant.withOpacity(0.6),
      fontSize: size == AppListSize.small
          ? 12.0
          : size == AppListSize.medium
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

class AppListFooter extends StatelessWidget {
  final List<Widget>? actions;
  final AppListSize size;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppListFooter({
    Key? key,
    this.actions,
    this.size = AppListSize.medium,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate footer spacing
    final footerSpacing = size == AppListSize.small
        ? AppTheme.spacing2
        : size == AppListSize.medium
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
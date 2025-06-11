import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';

enum AppListTileVariant {
  standard,
  filled,
  outlined,
}

enum AppListTileSize {
  small,
  medium,
  large,
}

class AppListTile extends StatelessWidget {
  final Widget? leading;
  final Widget? title;
  final Widget? subtitle;
  final Widget? trailing;
  final bool selected;
  final bool enabled;
  final VoidCallback? onTap;
  final VoidCallback? onLongPress;
  final MouseCursor? mouseCursor;
  final Color? selectedColor;
  final Color? iconColor;
  final Color? textColor;
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
  final bool showLeading;
  final Widget? leadingWidget;
  final bool showLeadingIcon;
  final IconData? leadingIcon;
  final Color? leadingIconColor;
  final double? leadingIconSize;
  final bool showTitle;
  final String? titleText;
  final TextStyle? titleStyle;
  final bool showSubtitle;
  final String? subtitleText;
  final TextStyle? subtitleStyle;
  final bool showTrailing;
  final Widget? trailingWidget;
  final bool showTrailingIcon;
  final IconData? trailingIcon;
  final Color? trailingIconColor;
  final double? trailingIconSize;
  final VoidCallback? onTrailingPressed;
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

  const AppListTile({
    Key? key,
    this.leading,
    this.title,
    this.subtitle,
    this.trailing,
    this.selected = false,
    this.enabled = true,
    this.onTap,
    this.onLongPress,
    this.mouseCursor,
    this.selectedColor,
    this.iconColor,
    this.textColor,
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
    this.showLeading = false,
    this.leadingWidget,
    this.showLeadingIcon = false,
    this.leadingIcon,
    this.leadingIconColor,
    this.leadingIconSize,
    this.showTitle = false,
    this.titleText,
    this.titleStyle,
    this.showSubtitle = false,
    this.subtitleText,
    this.subtitleStyle,
    this.showTrailing = false,
    this.trailingWidget,
    this.showTrailingIcon = false,
    this.trailingIcon,
    this.trailingIconColor,
    this.trailingIconSize,
    this.onTrailingPressed,
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

    // Calculate list tile colors
    final listTileColors = _getListTileColors(theme);

    // Calculate list tile margin
    final listTileMargin = margin ??
        EdgeInsets.all(
          size == AppListTileSize.small
              ? AppTheme.spacing1
              : size == AppListTileSize.medium
                  ? AppTheme.spacing2
                  : AppTheme.spacing3,
        );

    // Calculate list tile padding
    final listTilePadding = padding ??
        EdgeInsets.symmetric(
          horizontal: size == AppListTileSize.small
              ? AppTheme.spacing2
              : size == AppListTileSize.medium
                  ? AppTheme.spacing3
                  : AppTheme.spacing4,
          vertical: size == AppListTileSize.small
              ? AppTheme.spacing1
              : size == AppListTileSize.medium
                  ? AppTheme.spacing2
                  : AppTheme.spacing3,
        );

    // Calculate list tile elevation
    final listTileElevation = elevation ??
        (variant == AppListTileVariant.standard
            ? (size == AppListTileSize.small
                ? 1.0
                : size == AppListTileSize.medium
                    ? 2.0
                    : 4.0)
            : 0.0);

    // Calculate list tile border radius
    final listTileBorderRadius = borderRadius ??
        (size == AppListTileSize.small
            ? AppTheme.radius2
            : size == AppListTileSize.medium
                ? AppTheme.radius3
                : AppTheme.radius4);

    // Calculate list tile spacing
    final listTileSpacing = size == AppListTileSize.small
        ? AppTheme.spacing1
        : size == AppListTileSize.medium
            ? AppTheme.spacing2
            : AppTheme.spacing3;

    // Calculate list tile icon size
    final listTileIconSize = size == AppListTileSize.small
        ? 16.0
        : size == AppListTileSize.medium
            ? 18.0
            : 20.0;

    // Calculate list tile title style
    final listTileTitleStyle = TextStyle(
      color: textColor ?? theme.colorScheme.onSurface,
      fontSize: size == AppListTileSize.small
          ? 14.0
          : size == AppListTileSize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w500,
    );

    // Calculate list tile subtitle style
    final listTileSubtitleStyle = TextStyle(
      color: textColor?.withOpacity(0.6) ?? theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppListTileSize.small
          ? 12.0
          : size == AppListTileSize.medium
              ? 14.0
              : 16.0,
      fontWeight: FontWeight.w400,
    );

    Widget listTile = Container(
      decoration: BoxDecoration(
        color: showBackground
            ? backgroundColor ?? listTileColors.backgroundColor
            : Colors.transparent,
        borderRadius: BorderRadius.circular(listTileBorderRadius),
        border: showBorder && variant == AppListTileVariant.outlined
            ? Border.all(
                color: borderColor ?? listTileColors.borderColor,
                width: 1.0,
              )
            : null,
        boxShadow: showShadow && variant == AppListTileVariant.standard
            ? [
                BoxShadow(
                  color: theme.shadowColor.withOpacity(0.1),
                  blurRadius: listTileElevation * 2,
                  offset: Offset(0, listTileElevation),
                ),
              ]
            : null,
      ),
      margin: listTileMargin,
      padding: listTilePadding,
      child: Row(
        children: [
          if (showLeading && leadingWidget != null) ...[
            leadingWidget!,
            SizedBox(width: listTileSpacing),
          ],
          if (showLeadingIcon && leadingIcon != null) ...[
            Icon(
              leadingIcon,
              color: leadingIconColor ?? iconColor ?? theme.colorScheme.onSurface,
              size: leadingIconSize ?? listTileIconSize,
            ),
            SizedBox(width: listTileSpacing),
          ],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (showTitle && titleText != null)
                  DefaultTextStyle(
                    style: titleStyle ?? listTileTitleStyle,
                    child: Text(titleText!),
                  ),
                if (showSubtitle && subtitleText != null) ...[
                  SizedBox(height: listTileSpacing / 2),
                  DefaultTextStyle(
                    style: subtitleStyle ?? listTileSubtitleStyle,
                    child: Text(subtitleText!),
                  ),
                ],
                if (showButton && button != null) ...[
                  SizedBox(height: listTileSpacing),
                  button!,
                ],
                if (showButtonIcon && buttonIcon != null) ...[
                  SizedBox(height: listTileSpacing),
                  IconButton(
                    icon: Icon(
                      buttonIcon,
                      color: buttonIconColor ?? theme.colorScheme.onSurface,
                      size: buttonIconSize ?? listTileIconSize,
                    ),
                    onPressed: onButtonPressed,
                  ),
                ],
                if (showButtonText && buttonText != null) ...[
                  SizedBox(height: listTileSpacing),
                  DefaultTextStyle(
                    style: buttonTextStyle ?? listTileTitleStyle,
                    child: Text(buttonText!),
                  ),
                ],
              ],
            ),
          ),
          if (showTrailing && trailingWidget != null) ...[
            SizedBox(width: listTileSpacing),
            trailingWidget!,
          ],
          if (showTrailingIcon && trailingIcon != null) ...[
            SizedBox(width: listTileSpacing),
            IconButton(
              icon: Icon(
                trailingIcon,
                color: trailingIconColor ?? iconColor ?? theme.colorScheme.onSurface,
                size: trailingIconSize ?? listTileIconSize,
              ),
              onPressed: onTrailingPressed,
            ),
          ],
        ],
      ),
    );

    if (animate && showAnimation) {
      listTile = AppAnimations.fadeIn(
        listTile,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return GestureDetector(
      onTap: enabled ? onTap : null,
      onLongPress: enabled ? onLongPress : null,
      mouseCursor: mouseCursor ?? (enabled ? SystemMouseCursors.click : SystemMouseCursors.basic),
      child: listTile,
    );
  }

  _ListTileColors _getListTileColors(ThemeData theme) {
    switch (variant) {
      case AppListTileVariant.standard:
        return _ListTileColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
        );
      case AppListTileVariant.filled:
        return _ListTileColors(
          backgroundColor: theme.colorScheme.surfaceVariant,
          borderColor: theme.colorScheme.outline,
        );
      case AppListTileVariant.outlined:
        return _ListTileColors(
          backgroundColor: Colors.transparent,
          borderColor: theme.colorScheme.outline,
        );
    }
  }
}

class _ListTileColors {
  final Color backgroundColor;
  final Color borderColor;

  const _ListTileColors({
    required this.backgroundColor,
    required this.borderColor,
  });
} 
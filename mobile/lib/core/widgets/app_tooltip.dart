import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';

enum AppTooltipVariant {
  standard,
  filled,
  outlined,
}

enum AppTooltipSize {
  small,
  medium,
  large,
}

class AppTooltip extends StatelessWidget {
  final Widget? child;
  final AppTooltipVariant variant;
  final AppTooltipSize size;
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

  const AppTooltip({
    Key? key,
    this.child,
    this.variant = AppTooltipVariant.standard,
    this.size = AppTooltipSize.medium,
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

    // Calculate tooltip colors
    final tooltipColors = _getTooltipColors(theme);

    // Calculate tooltip margin
    final tooltipMargin = margin ??
        EdgeInsets.all(
          size == AppTooltipSize.small
              ? AppTheme.spacing1
              : size == AppTooltipSize.medium
                  ? AppTheme.spacing2
                  : AppTheme.spacing3,
        );

    // Calculate tooltip padding
    final tooltipPadding = padding ??
        EdgeInsets.all(
          size == AppTooltipSize.small
              ? AppTheme.spacing2
              : size == AppTooltipSize.medium
                  ? AppTheme.spacing3
                  : AppTheme.spacing4,
        );

    // Calculate tooltip elevation
    final tooltipElevation = elevation ??
        (variant == AppTooltipVariant.standard
            ? (size == AppTooltipSize.small
                ? 1.0
                : size == AppTooltipSize.medium
                    ? 2.0
                    : 4.0)
            : 0.0);

    // Calculate tooltip border radius
    final tooltipBorderRadius = borderRadius ??
        (size == AppTooltipSize.small
            ? AppTheme.radius2
            : size == AppTooltipSize.medium
                ? AppTheme.radius3
                : AppTheme.radius4);

    // Calculate tooltip spacing
    final tooltipSpacing = size == AppTooltipSize.small
        ? AppTheme.spacing1
        : size == AppTooltipSize.medium
            ? AppTheme.spacing2
            : AppTheme.spacing3;

    // Calculate tooltip icon size
    final tooltipIconSize = size == AppTooltipSize.small
        ? 16.0
        : size == AppTooltipSize.medium
            ? 18.0
            : 20.0;

    // Calculate tooltip title style
    final tooltipTitleStyle = TextStyle(
      color: theme.colorScheme.onSurface,
      fontSize: size == AppTooltipSize.small
          ? 16.0
          : size == AppTooltipSize.medium
              ? 18.0
              : 20.0,
      fontWeight: FontWeight.w500,
    );

    // Calculate tooltip subtitle style
    final tooltipSubtitleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppTooltipSize.small
          ? 14.0
          : size == AppTooltipSize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w400,
    );

    Widget tooltip = Container(
      decoration: BoxDecoration(
        color: showBackground
            ? backgroundColor ?? tooltipColors.backgroundColor
            : Colors.transparent,
        borderRadius: BorderRadius.circular(tooltipBorderRadius),
        border: showBorder && variant == AppTooltipVariant.outlined
            ? Border.all(
                color: borderColor ?? tooltipColors.borderColor,
                width: 1.0,
              )
            : null,
        boxShadow: showShadow && variant == AppTooltipVariant.standard
            ? [
                BoxShadow(
                  color: theme.shadowColor.withOpacity(0.1),
                  blurRadius: tooltipElevation * 2,
                  offset: Offset(0, tooltipElevation),
                ),
              ]
            : null,
      ),
      margin: tooltipMargin,
      padding: tooltipPadding,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (showHeader && header != null) ...[
            header!,
            SizedBox(height: tooltipSpacing),
          ],
          if (showTitle && title != null) ...[
            DefaultTextStyle(
              style: titleStyle ?? tooltipTitleStyle,
              child: Text(title!),
            ),
            if (showSubtitle && subtitle != null) ...[
              SizedBox(height: tooltipSpacing / 2),
              DefaultTextStyle(
                style: subtitleStyle ?? tooltipSubtitleStyle,
                child: Text(subtitle!),
              ),
            ],
            SizedBox(height: tooltipSpacing),
          ],
          if (showIcon && icon != null) ...[
            Icon(
              icon,
              color: iconColor ?? theme.colorScheme.onSurface,
              size: iconSize ?? tooltipIconSize,
            ),
            SizedBox(height: tooltipSpacing),
          ],
          if (child != null) ...[
            child!,
            SizedBox(height: tooltipSpacing),
          ],
          if (showButton && button != null) ...[
            button!,
            SizedBox(height: tooltipSpacing),
          ],
          if (showButtonIcon && buttonIcon != null) ...[
            IconButton(
              icon: Icon(
                buttonIcon,
                color: buttonIconColor ?? theme.colorScheme.onSurface,
                size: buttonIconSize ?? tooltipIconSize,
              ),
              onPressed: onButtonPressed,
            ),
            SizedBox(height: tooltipSpacing),
          ],
          if (showButtonText && buttonText != null) ...[
            DefaultTextStyle(
              style: buttonTextStyle ?? tooltipTitleStyle,
              child: Text(buttonText!),
            ),
            SizedBox(height: tooltipSpacing),
          ],
          if (showFooter && footer != null) footer!,
        ],
      ),
    );

    if (animate && showAnimation) {
      tooltip = AppAnimations.fadeIn(
        tooltip,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return Tooltip(
      message: '',
      child: tooltip,
    );
  }

  _TooltipColors _getTooltipColors(ThemeData theme) {
    switch (variant) {
      case AppTooltipVariant.standard:
        return _TooltipColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
        );
      case AppTooltipVariant.filled:
        return _TooltipColors(
          backgroundColor: theme.colorScheme.surfaceVariant,
          borderColor: theme.colorScheme.outline,
        );
      case AppTooltipVariant.outlined:
        return _TooltipColors(
          backgroundColor: Colors.transparent,
          borderColor: theme.colorScheme.outline,
        );
    }
  }
}

class _TooltipColors {
  final Color backgroundColor;
  final Color borderColor;

  const _TooltipColors({
    required this.backgroundColor,
    required this.borderColor,
  });
}

class AppTooltipHeader extends StatelessWidget {
  final Widget? leading;
  final Widget? title;
  final Widget? subtitle;
  final List<Widget>? actions;
  final AppTooltipSize size;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppTooltipHeader({
    Key? key,
    this.leading,
    this.title,
    this.subtitle,
    this.actions,
    this.size = AppTooltipSize.medium,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate header spacing
    final headerSpacing = size == AppTooltipSize.small
        ? AppTheme.spacing2
        : size == AppTooltipSize.medium
            ? AppTheme.spacing3
            : AppTheme.spacing4;

    // Calculate title style
    final titleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppTooltipSize.small
          ? 12.0
          : size == AppTooltipSize.medium
              ? 14.0
              : 16.0,
      fontWeight: FontWeight.w600,
    );

    // Calculate subtitle style
    final subtitleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant.withOpacity(0.6),
      fontSize: size == AppTooltipSize.small
          ? 10.0
          : size == AppTooltipSize.medium
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

class AppTooltipFooter extends StatelessWidget {
  final List<Widget>? actions;
  final AppTooltipSize size;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppTooltipFooter({
    Key? key,
    this.actions,
    this.size = AppTooltipSize.medium,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate footer spacing
    final footerSpacing = size == AppTooltipSize.small
        ? AppTheme.spacing2
        : size == AppTooltipSize.medium
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

class AppTooltipIcon extends StatelessWidget {
  final IconData icon;
  final String message;
  final AppTooltipVariant variant;
  final AppTooltipSize size;
  final Color? color;
  final double? iconSize;
  final EdgeInsetsGeometry? padding;
  final double? maxWidth;
  final bool preferBelow;
  final bool showDuration;
  final Duration? duration;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppTooltipIcon({
    Key? key,
    required this.icon,
    required this.message,
    this.variant = AppTooltipVariant.light,
    this.size = AppTooltipSize.medium,
    this.color,
    this.iconSize,
    this.padding,
    this.maxWidth,
    this.preferBelow = true,
    this.showDuration = true,
    this.duration,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate icon size
    final tooltipIconSize = iconSize ??
        (size == AppTooltipSize.small
            ? 16.0
            : size == AppTooltipSize.medium
                ? 20.0
                : 24.0);

    // Calculate icon color
    final tooltipIconColor = color ?? theme.colorScheme.primary;

    return AppTooltip(
      message: message,
      variant: variant,
      size: size,
      padding: padding,
      maxWidth: maxWidth,
      preferBelow: preferBelow,
      showDuration: showDuration,
      duration: duration,
      animate: animate,
      animationDuration: animationDuration,
      animationCurve: animationCurve,
      child: Icon(
        icon,
        size: tooltipIconSize,
        color: tooltipIconColor,
      ),
    );
  }
}

class AppTooltipText extends StatelessWidget {
  final String text;
  final String message;
  final AppTooltipVariant variant;
  final AppTooltipSize size;
  final TextStyle? textStyle;
  final EdgeInsetsGeometry? padding;
  final double? maxWidth;
  final bool preferBelow;
  final bool showDuration;
  final Duration? duration;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppTooltipText({
    Key? key,
    required this.text,
    required this.message,
    this.variant = AppTooltipVariant.light,
    this.size = AppTooltipSize.medium,
    this.textStyle,
    this.padding,
    this.maxWidth,
    this.preferBelow = true,
    this.showDuration = true,
    this.duration,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate text style
    final tooltipTextStyle = textStyle ??
        TextStyle(
          color: theme.colorScheme.primary,
          fontSize: size == AppTooltipSize.small
              ? 12.0
              : size == AppTooltipSize.medium
                  ? 14.0
                  : 16.0,
          fontWeight: FontWeight.w500,
        );

    return AppTooltip(
      message: message,
      variant: variant,
      size: size,
      padding: padding,
      maxWidth: maxWidth,
      preferBelow: preferBelow,
      showDuration: showDuration,
      duration: duration,
      animate: animate,
      animationDuration: animationDuration,
      animationCurve: animationCurve,
      child: Text(
        text,
        style: tooltipTextStyle,
      ),
    );
  }
} 
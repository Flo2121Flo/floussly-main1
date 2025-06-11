import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';

enum AppModalVariant {
  standard,
  filled,
  outlined,
}

enum AppModalSize {
  small,
  medium,
  large,
}

class AppModal extends StatelessWidget {
  final Widget? title;
  final Widget? content;
  final List<Widget>? actions;
  final AppModalVariant variant;
  final AppModalSize size;
  final Color? backgroundColor;
  final Color? borderColor;
  final Color? titleColor;
  final Color? contentColor;
  final Color? actionColor;
  final double? elevation;
  final EdgeInsetsGeometry? margin;
  final EdgeInsetsGeometry? padding;
  final double? borderRadius;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;
  final bool showCloseIcon;
  final VoidCallback? onClose;
  final bool isDismissible;
  final bool showBackdrop;
  final Color? backdropColor;
  final bool disabled;

  const AppModal({
    Key? key,
    this.title,
    this.content,
    this.actions,
    this.variant = AppModalVariant.standard,
    this.size = AppModalSize.medium,
    this.backgroundColor,
    this.borderColor,
    this.titleColor,
    this.contentColor,
    this.actionColor,
    this.elevation,
    this.margin,
    this.padding,
    this.borderRadius,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
    this.showCloseIcon = true,
    this.onClose,
    this.isDismissible = true,
    this.showBackdrop = true,
    this.backdropColor,
    this.disabled = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate modal colors
    final modalColors = _getModalColors(theme);

    // Calculate modal margin
    final modalMargin = margin ??
        EdgeInsets.all(
          size == AppModalSize.small
              ? AppTheme.spacing1
              : size == AppModalSize.medium
                  ? AppTheme.spacing2
                  : AppTheme.spacing3,
        );

    // Calculate modal padding
    final modalPadding = padding ??
        EdgeInsets.all(
          size == AppModalSize.small
              ? AppTheme.spacing2
              : size == AppModalSize.medium
                  ? AppTheme.spacing3
                  : AppTheme.spacing4,
        );

    // Calculate modal elevation
    final modalElevation = elevation ??
        (variant == AppModalVariant.standard
            ? (size == AppModalSize.small
                ? 1.0
                : size == AppModalSize.medium
                    ? 2.0
                    : 4.0)
            : 0.0);

    // Calculate modal border radius
    final modalBorderRadius = borderRadius ??
        (size == AppModalSize.small
            ? AppTheme.radius2
            : size == AppModalSize.medium
                ? AppTheme.radius3
                : AppTheme.radius4);

    // Calculate modal spacing
    final modalSpacing = size == AppModalSize.small
        ? AppTheme.spacing1
        : size == AppModalSize.medium
            ? AppTheme.spacing2
            : AppTheme.spacing3;

    // Calculate modal icon size
    final modalIconSize = size == AppModalSize.small
        ? 16.0
        : size == AppModalSize.medium
            ? 18.0
            : 20.0;

    // Calculate modal title style
    final modalTitleStyle = TextStyle(
      color: titleColor ?? modalColors.titleColor,
      fontSize: size == AppModalSize.small
          ? 14.0
          : size == AppModalSize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w600,
    );

    // Calculate modal content style
    final modalContentStyle = TextStyle(
      color: contentColor ?? modalColors.contentColor,
      fontSize: size == AppModalSize.small
          ? 12.0
          : size == AppModalSize.medium
              ? 14.0
              : 16.0,
      fontWeight: FontWeight.w400,
    );

    // Calculate modal action style
    final modalActionStyle = TextStyle(
      color: actionColor ?? modalColors.actionColor,
      fontSize: size == AppModalSize.small
          ? 12.0
          : size == AppModalSize.medium
              ? 14.0
              : 16.0,
      fontWeight: FontWeight.w600,
    );

    Widget modal = Container(
      decoration: BoxDecoration(
        color: backgroundColor ?? modalColors.backgroundColor,
        borderRadius: BorderRadius.circular(modalBorderRadius),
        border: variant == AppModalVariant.outlined
            ? Border.all(
                color: borderColor ?? modalColors.borderColor,
                width: 1.0,
              )
            : null,
        boxShadow: variant == AppModalVariant.standard
            ? [
                BoxShadow(
                  color: theme.shadowColor.withOpacity(0.1),
                  blurRadius: modalElevation * 2,
                  offset: Offset(0, modalElevation),
                ),
              ]
            : null,
      ),
      margin: modalMargin,
      padding: modalPadding,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (title != null || showCloseIcon)
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                if (title != null)
                  Expanded(
                    child: DefaultTextStyle(
                      style: modalTitleStyle,
                      child: title!,
                    ),
                  ),
                if (showCloseIcon)
                  IconButton(
                    icon: Icon(
                      Icons.close,
                      size: modalIconSize,
                      color: modalColors.iconColor,
                    ),
                    onPressed: disabled ? null : onClose,
                    padding: EdgeInsets.zero,
                    constraints: BoxConstraints(
                      minWidth: modalIconSize,
                      minHeight: modalIconSize,
                    ),
                    splashRadius: modalIconSize,
                  ),
              ],
            ),
          if (title != null && content != null)
            SizedBox(height: modalSpacing),
          if (content != null)
            DefaultTextStyle(
              style: modalContentStyle,
              child: content!,
            ),
          if (actions != null) ...[
            SizedBox(height: modalSpacing),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: actions!.map((action) {
                if (action is TextButton) {
                  return DefaultTextStyle(
                    style: modalActionStyle,
                    child: action,
                  );
                }
                return action;
              }).toList(),
            ),
          ],
        ],
      ),
    );

    if (animate) {
      modal = AppAnimations.fadeIn(
        modal,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    if (showBackdrop) {
      modal = Stack(
        children: [
          Positioned.fill(
            child: GestureDetector(
              onTap: isDismissible ? onClose : null,
              child: Container(
                color: backdropColor ??
                    theme.colorScheme.scrim.withOpacity(0.5),
              ),
            ),
          ),
          Center(child: modal),
        ],
      );
    }

    return modal;
  }

  _ModalColors _getModalColors(ThemeData theme) {
    switch (variant) {
      case AppModalVariant.standard:
        return _ModalColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
          titleColor: theme.colorScheme.onSurface,
          contentColor: theme.colorScheme.onSurfaceVariant,
          actionColor: theme.colorScheme.primary,
          iconColor: theme.colorScheme.onSurfaceVariant,
        );
      case AppModalVariant.filled:
        return _ModalColors(
          backgroundColor: theme.colorScheme.surfaceVariant,
          borderColor: theme.colorScheme.outline,
          titleColor: theme.colorScheme.onSurfaceVariant,
          contentColor: theme.colorScheme.onSurfaceVariant,
          actionColor: theme.colorScheme.primary,
          iconColor: theme.colorScheme.onSurfaceVariant,
        );
      case AppModalVariant.outlined:
        return _ModalColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
          titleColor: theme.colorScheme.onSurface,
          contentColor: theme.colorScheme.onSurfaceVariant,
          actionColor: theme.colorScheme.primary,
          iconColor: theme.colorScheme.onSurfaceVariant,
        );
    }
  }
}

class _ModalColors {
  final Color backgroundColor;
  final Color borderColor;
  final Color titleColor;
  final Color contentColor;
  final Color actionColor;
  final Color iconColor;

  const _ModalColors({
    required this.backgroundColor,
    required this.borderColor,
    required this.titleColor,
    required this.contentColor,
    required this.actionColor,
    required this.iconColor,
  });
}

class AppModalAction extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final AppModalSize size;
  final Color? color;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppModalAction({
    Key? key,
    required this.text,
    this.onPressed,
    this.size = AppModalSize.medium,
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
          horizontal: size == AppModalSize.small
              ? AppTheme.spacing8
              : size == AppModalSize.medium
                  ? AppTheme.spacing12
                  : AppTheme.spacing16,
          vertical: size == AppModalSize.small
              ? AppTheme.spacing4
              : size == AppModalSize.medium
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
          fontSize: size == AppModalSize.small
              ? 12.0
              : size == AppModalSize.medium
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

class AppModalIcon extends StatelessWidget {
  final IconData icon;
  final AppModalVariant variant;
  final AppModalSize size;
  final Color? color;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppModalIcon({
    Key? key,
    required this.icon,
    this.variant = AppModalVariant.standard,
    this.size = AppModalSize.medium,
    this.color,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate icon size
    final iconSize = size == AppModalSize.small
        ? 20.0
        : size == AppModalSize.medium
            ? 24.0
            : 28.0;

    // Calculate icon color
    final iconColor = color ?? theme.colorScheme.primary;

    Widget modalIcon = Icon(
      icon,
      size: iconSize,
      color: iconColor,
    );

    if (animate) {
      modalIcon = AppAnimations.fadeIn(
        modalIcon,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return modalIcon;
  }
} 
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';
import 'app_button.dart';

enum AppDialogVariant {
  standard,
  filled,
  outlined,
}

enum AppDialogSize {
  small,
  medium,
  large,
}

class AppDialog extends StatelessWidget {
  final Widget? child;
  final AppDialogVariant variant;
  final AppDialogSize size;
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

  const AppDialog({
    Key? key,
    this.child,
    this.variant = AppDialogVariant.standard,
    this.size = AppDialogSize.medium,
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

    // Calculate dialog colors
    final dialogColors = _getDialogColors(theme);

    // Calculate dialog margin
    final dialogMargin = margin ??
        EdgeInsets.all(
          size == AppDialogSize.small
              ? AppTheme.spacing1
              : size == AppDialogSize.medium
                  ? AppTheme.spacing2
                  : AppTheme.spacing3,
        );

    // Calculate dialog padding
    final dialogPadding = padding ??
        EdgeInsets.all(
          size == AppDialogSize.small
              ? AppTheme.spacing2
              : size == AppDialogSize.medium
                  ? AppTheme.spacing3
                  : AppTheme.spacing4,
        );

    // Calculate dialog elevation
    final dialogElevation = elevation ??
        (variant == AppDialogVariant.standard
            ? (size == AppDialogSize.small
                ? 1.0
                : size == AppDialogSize.medium
                    ? 2.0
                    : 4.0)
            : 0.0);

    // Calculate dialog border radius
    final dialogBorderRadius = borderRadius ??
        (size == AppDialogSize.small
            ? AppTheme.radius2
            : size == AppDialogSize.medium
                ? AppTheme.radius3
                : AppTheme.radius4);

    // Calculate dialog spacing
    final dialogSpacing = size == AppDialogSize.small
        ? AppTheme.spacing1
        : size == AppDialogSize.medium
            ? AppTheme.spacing2
            : AppTheme.spacing3;

    // Calculate dialog icon size
    final dialogIconSize = size == AppDialogSize.small
        ? 16.0
        : size == AppDialogSize.medium
            ? 18.0
            : 20.0;

    // Calculate dialog title style
    final dialogTitleStyle = TextStyle(
      color: theme.colorScheme.onSurface,
      fontSize: size == AppDialogSize.small
          ? 16.0
          : size == AppDialogSize.medium
              ? 18.0
              : 20.0,
      fontWeight: FontWeight.w500,
    );

    // Calculate dialog subtitle style
    final dialogSubtitleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppDialogSize.small
          ? 14.0
          : size == AppDialogSize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w400,
    );

    Widget dialog = Container(
      decoration: BoxDecoration(
        color: showBackground
            ? backgroundColor ?? dialogColors.backgroundColor
            : Colors.transparent,
        borderRadius: BorderRadius.circular(dialogBorderRadius),
        border: showBorder && variant == AppDialogVariant.outlined
            ? Border.all(
                color: borderColor ?? dialogColors.borderColor,
                width: 1.0,
              )
            : null,
        boxShadow: showShadow && variant == AppDialogVariant.standard
            ? [
                BoxShadow(
                  color: theme.shadowColor.withOpacity(0.1),
                  blurRadius: dialogElevation * 2,
                  offset: Offset(0, dialogElevation),
                ),
              ]
            : null,
      ),
      margin: dialogMargin,
      padding: dialogPadding,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (showHeader && header != null) ...[
            header!,
            SizedBox(height: dialogSpacing),
          ],
          if (showTitle && title != null) ...[
            DefaultTextStyle(
              style: titleStyle ?? dialogTitleStyle,
              child: Text(title!),
            ),
            if (showSubtitle && subtitle != null) ...[
              SizedBox(height: dialogSpacing / 2),
              DefaultTextStyle(
                style: subtitleStyle ?? dialogSubtitleStyle,
                child: Text(subtitle!),
              ),
            ],
            SizedBox(height: dialogSpacing),
          ],
          if (showIcon && icon != null) ...[
            Icon(
              icon,
              color: iconColor ?? theme.colorScheme.onSurface,
              size: iconSize ?? dialogIconSize,
            ),
            SizedBox(height: dialogSpacing),
          ],
          if (child != null) ...[
            child!,
            SizedBox(height: dialogSpacing),
          ],
          if (showButton && button != null) ...[
            button!,
            SizedBox(height: dialogSpacing),
          ],
          if (showButtonIcon && buttonIcon != null) ...[
            IconButton(
              icon: Icon(
                buttonIcon,
                color: buttonIconColor ?? theme.colorScheme.onSurface,
                size: buttonIconSize ?? dialogIconSize,
              ),
              onPressed: onButtonPressed,
            ),
            SizedBox(height: dialogSpacing),
          ],
          if (showButtonText && buttonText != null) ...[
            DefaultTextStyle(
              style: buttonTextStyle ?? dialogTitleStyle,
              child: Text(buttonText!),
            ),
            SizedBox(height: dialogSpacing),
          ],
          if (showFooter && footer != null) footer!,
        ],
      ),
    );

    if (animate && showAnimation) {
      dialog = AppAnimations.fadeIn(
        dialog,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return Dialog(
      backgroundColor: Colors.transparent,
      elevation: 0.0,
      child: dialog,
    );
  }

  _DialogColors _getDialogColors(ThemeData theme) {
    switch (variant) {
      case AppDialogVariant.standard:
        return _DialogColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
        );
      case AppDialogVariant.filled:
        return _DialogColors(
          backgroundColor: theme.colorScheme.surfaceVariant,
          borderColor: theme.colorScheme.outline,
        );
      case AppDialogVariant.outlined:
        return _DialogColors(
          backgroundColor: Colors.transparent,
          borderColor: theme.colorScheme.outline,
        );
    }
  }
}

class _DialogColors {
  final Color backgroundColor;
  final Color borderColor;

  const _DialogColors({
    required this.backgroundColor,
    required this.borderColor,
  });
}

class AppDialogHeader extends StatelessWidget {
  final Widget? leading;
  final Widget? title;
  final Widget? subtitle;
  final List<Widget>? actions;
  final AppDialogSize size;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppDialogHeader({
    Key? key,
    this.leading,
    this.title,
    this.subtitle,
    this.actions,
    this.size = AppDialogSize.medium,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate header spacing
    final headerSpacing = size == AppDialogSize.small
        ? AppTheme.spacing2
        : size == AppDialogSize.medium
            ? AppTheme.spacing3
            : AppTheme.spacing4;

    // Calculate title style
    final titleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppDialogSize.small
          ? 14.0
          : size == AppDialogSize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w600,
    );

    // Calculate subtitle style
    final subtitleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant.withOpacity(0.6),
      fontSize: size == AppDialogSize.small
          ? 12.0
          : size == AppDialogSize.medium
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

class AppDialogFooter extends StatelessWidget {
  final List<Widget>? actions;
  final AppDialogSize size;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppDialogFooter({
    Key? key,
    this.actions,
    this.size = AppDialogSize.medium,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate footer spacing
    final footerSpacing = size == AppDialogSize.small
        ? AppTheme.spacing2
        : size == AppDialogSize.medium
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

class AppConfirmDialog extends StatelessWidget {
  final String title;
  final String? message;
  final String confirmLabel;
  final String cancelLabel;
  final VoidCallback? onConfirm;
  final VoidCallback? onCancel;
  final bool barrierDismissible;
  final Color? backgroundColor;
  final double opacity;
  final EdgeInsets? contentPadding;
  final EdgeInsets? actionsPadding;
  final double? maxWidth;
  final double? maxHeight;
  final bool showCloseButton;

  const AppConfirmDialog({
    Key? key,
    required this.title,
    this.message,
    this.confirmLabel = 'Confirm',
    this.cancelLabel = 'Cancel',
    this.onConfirm,
    this.onCancel,
    this.barrierDismissible = true,
    this.backgroundColor,
    this.opacity = 0.5,
    this.contentPadding,
    this.actionsPadding,
    this.maxWidth,
    this.maxHeight,
    this.showCloseButton = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AppDialog(
      title: title,
      message: message,
      barrierDismissible: barrierDismissible,
      backgroundColor: backgroundColor,
      opacity: opacity,
      contentPadding: contentPadding,
      actionsPadding: actionsPadding,
      maxWidth: maxWidth,
      maxHeight: maxHeight,
      showCloseButton: showCloseButton,
      actions: [
        AppButton(
          text: cancelLabel,
          variant: AppButtonVariant.text,
          onPressed: () {
            Navigator.of(context).pop();
            onCancel?.call();
          },
        ),
        AppButton(
          text: confirmLabel,
          onPressed: () {
            Navigator.of(context).pop();
            onConfirm?.call();
          },
        ),
      ],
    );
  }
}

class AppAlertDialog extends StatelessWidget {
  final String title;
  final String? message;
  final String actionLabel;
  final VoidCallback? onAction;
  final bool barrierDismissible;
  final Color? backgroundColor;
  final double opacity;
  final EdgeInsets? contentPadding;
  final EdgeInsets? actionsPadding;
  final double? maxWidth;
  final double? maxHeight;
  final bool showCloseButton;

  const AppAlertDialog({
    Key? key,
    required this.title,
    this.message,
    this.actionLabel = 'OK',
    this.onAction,
    this.barrierDismissible = true,
    this.backgroundColor,
    this.opacity = 0.5,
    this.contentPadding,
    this.actionsPadding,
    this.maxWidth,
    this.maxHeight,
    this.showCloseButton = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AppDialog(
      title: title,
      message: message,
      barrierDismissible: barrierDismissible,
      backgroundColor: backgroundColor,
      opacity: opacity,
      contentPadding: contentPadding,
      actionsPadding: actionsPadding,
      maxWidth: maxWidth,
      maxHeight: maxHeight,
      showCloseButton: showCloseButton,
      actions: [
        AppButton(
          text: actionLabel,
          onPressed: () {
            Navigator.of(context).pop();
            onAction?.call();
          },
        ),
      ],
    );
  }
}

class AppBottomSheet extends StatelessWidget {
  final String title;
  final String? message;
  final List<Widget>? actions;
  final Widget? content;
  final bool isDismissible;
  final Color? backgroundColor;
  final double opacity;
  final EdgeInsets? contentPadding;
  final EdgeInsets? actionsPadding;
  final double? maxHeight;
  final bool showCloseButton;
  final bool isScrollable;

  const AppBottomSheet({
    Key? key,
    required this.title,
    this.message,
    this.actions,
    this.content,
    this.isDismissible = true,
    this.backgroundColor,
    this.opacity = 0.5,
    this.contentPadding,
    this.actionsPadding,
    this.maxHeight,
    this.showCloseButton = true,
    this.isScrollable = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    Widget sheet = Container(
      constraints: BoxConstraints(
        maxHeight: maxHeight ?? MediaQuery.of(context).size.height * 0.9,
      ),
      decoration: BoxDecoration(
        color: (backgroundColor ?? theme.colorScheme.surface)
            .withOpacity(opacity),
        borderRadius: const BorderRadius.vertical(
          top: Radius.circular(AppTheme.radius16),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.all(AppTheme.spacing16),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    title,
                    style: theme.textTheme.titleLarge?.copyWith(
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                ),
                if (showCloseButton)
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.of(context).pop(),
                    color: theme.colorScheme.onSurface.withOpacity(0.5),
                  ),
              ],
            ),
          ),
          if (message != null || content != null)
            Padding(
              padding: contentPadding ??
                  const EdgeInsets.symmetric(
                    horizontal: AppTheme.spacing16,
                    vertical: AppTheme.spacing8,
                  ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (message != null)
                    Text(
                      message!,
                      style: theme.textTheme.bodyLarge?.copyWith(
                        color: theme.colorScheme.onSurface.withOpacity(0.7),
                      ),
                    ),
                  if (content != null) ...[
                    if (message != null)
                      const SizedBox(height: AppTheme.spacing16),
                    content!,
                  ],
                ],
              ),
            ),
          if (actions != null && actions!.isNotEmpty)
            Padding(
              padding: actionsPadding ??
                  const EdgeInsets.all(AppTheme.spacing16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: actions!
                    .map((action) => Padding(
                          padding: const EdgeInsets.only(
                            left: AppTheme.spacing8,
                          ),
                          child: action,
                        ))
                    .toList(),
              ),
            ),
        ],
      ),
    );

    if (isScrollable) {
      sheet = SingleChildScrollView(child: sheet);
    }

    return AppAnimations.slideUp(sheet);
  }
} 
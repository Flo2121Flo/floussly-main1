import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';

enum AppCardVariant {
  standard,
  filled,
  outlined,
}

enum AppCardSize {
  small,
  medium,
  large,
}

class AppCard extends StatelessWidget {
  final Widget? child;
  final AppCardVariant variant;
  final AppCardSize size;
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

  const AppCard({
    Key? key,
    this.child,
    this.variant = AppCardVariant.standard,
    this.size = AppCardSize.medium,
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

    // Calculate card colors
    final cardColors = _getCardColors(theme);

    // Calculate card margin
    final cardMargin = margin ??
        EdgeInsets.all(
          size == AppCardSize.small
              ? AppTheme.spacing1
              : size == AppCardSize.medium
                  ? AppTheme.spacing2
                  : AppTheme.spacing3,
        );

    // Calculate card padding
    final cardPadding = padding ??
        EdgeInsets.all(
          size == AppCardSize.small
              ? AppTheme.spacing2
              : size == AppCardSize.medium
                  ? AppTheme.spacing3
                  : AppTheme.spacing4,
        );

    // Calculate card elevation
    final cardElevation = elevation ??
        (variant == AppCardVariant.standard
            ? (size == AppCardSize.small
                ? 1.0
                : size == AppCardSize.medium
                    ? 2.0
                    : 4.0)
            : 0.0);

    // Calculate card border radius
    final cardBorderRadius = borderRadius ??
        (size == AppCardSize.small
            ? AppTheme.radius2
            : size == AppCardSize.medium
                ? AppTheme.radius3
                : AppTheme.radius4);

    // Calculate card spacing
    final cardSpacing = size == AppCardSize.small
        ? AppTheme.spacing1
        : size == AppCardSize.medium
            ? AppTheme.spacing2
            : AppTheme.spacing3;

    // Calculate card icon size
    final cardIconSize = size == AppCardSize.small
        ? 16.0
        : size == AppCardSize.medium
            ? 18.0
            : 20.0;

    // Calculate card title style
    final cardTitleStyle = TextStyle(
      color: theme.colorScheme.onSurface,
      fontSize: size == AppCardSize.small
          ? 16.0
          : size == AppCardSize.medium
              ? 18.0
              : 20.0,
      fontWeight: FontWeight.w500,
    );

    // Calculate card subtitle style
    final cardSubtitleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppCardSize.small
          ? 14.0
          : size == AppCardSize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w400,
    );

    Widget card = Container(
      decoration: BoxDecoration(
        color: showBackground
            ? backgroundColor ?? cardColors.backgroundColor
            : Colors.transparent,
        borderRadius: BorderRadius.circular(cardBorderRadius),
        border: showBorder && variant == AppCardVariant.outlined
            ? Border.all(
                color: borderColor ?? cardColors.borderColor,
                width: 1.0,
              )
            : null,
        boxShadow: showShadow && variant == AppCardVariant.standard
            ? [
                BoxShadow(
                  color: theme.shadowColor.withOpacity(0.1),
                  blurRadius: cardElevation * 2,
                  offset: Offset(0, cardElevation),
                ),
              ]
            : null,
      ),
      margin: cardMargin,
      padding: cardPadding,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (showHeader && header != null) ...[
            header!,
            SizedBox(height: cardSpacing),
          ],
          if (showTitle && title != null) ...[
            DefaultTextStyle(
              style: titleStyle ?? cardTitleStyle,
              child: Text(title!),
            ),
            if (showSubtitle && subtitle != null) ...[
              SizedBox(height: cardSpacing / 2),
              DefaultTextStyle(
                style: subtitleStyle ?? cardSubtitleStyle,
                child: Text(subtitle!),
              ),
            ],
            SizedBox(height: cardSpacing),
          ],
          if (showIcon && icon != null) ...[
            Icon(
              icon,
              color: iconColor ?? theme.colorScheme.onSurface,
              size: iconSize ?? cardIconSize,
            ),
            SizedBox(height: cardSpacing),
          ],
          if (child != null) ...[
            child!,
            SizedBox(height: cardSpacing),
          ],
          if (showButton && button != null) ...[
            button!,
            SizedBox(height: cardSpacing),
          ],
          if (showButtonIcon && buttonIcon != null) ...[
            IconButton(
              icon: Icon(
                buttonIcon,
                color: buttonIconColor ?? theme.colorScheme.onSurface,
                size: buttonIconSize ?? cardIconSize,
              ),
              onPressed: onButtonPressed,
            ),
            SizedBox(height: cardSpacing),
          ],
          if (showButtonText && buttonText != null) ...[
            DefaultTextStyle(
              style: buttonTextStyle ?? cardTitleStyle,
              child: Text(buttonText!),
            ),
            SizedBox(height: cardSpacing),
          ],
          if (showFooter && footer != null) footer!,
        ],
      ),
    );

    if (animate && showAnimation) {
      card = AppAnimations.fadeIn(
        card,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return card;
  }

  _CardColors _getCardColors(ThemeData theme) {
    switch (variant) {
      case AppCardVariant.standard:
        return _CardColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
        );
      case AppCardVariant.filled:
        return _CardColors(
          backgroundColor: theme.colorScheme.surfaceVariant,
          borderColor: theme.colorScheme.outline,
        );
      case AppCardVariant.outlined:
        return _CardColors(
          backgroundColor: Colors.transparent,
          borderColor: theme.colorScheme.outline,
        );
    }
  }
}

class _CardColors {
  final Color backgroundColor;
  final Color borderColor;

  const _CardColors({
    required this.backgroundColor,
    required this.borderColor,
  });
}

class AppCardHeader extends StatelessWidget {
  final Widget? leading;
  final Widget? title;
  final Widget? subtitle;
  final List<Widget>? actions;
  final AppCardSize size;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppCardHeader({
    Key? key,
    this.leading,
    this.title,
    this.subtitle,
    this.actions,
    this.size = AppCardSize.medium,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate header spacing
    final headerSpacing = size == AppCardSize.small
        ? AppTheme.spacing2
        : size == AppCardSize.medium
            ? AppTheme.spacing3
            : AppTheme.spacing4;

    // Calculate title style
    final titleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppCardSize.small
          ? 16.0
          : size == AppCardSize.medium
              ? 18.0
              : 20.0,
      fontWeight: FontWeight.w600,
    );

    // Calculate subtitle style
    final subtitleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant.withOpacity(0.6),
      fontSize: size == AppCardSize.small
          ? 14.0
          : size == AppCardSize.medium
              ? 16.0
              : 18.0,
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

class AppCardFooter extends StatelessWidget {
  final List<Widget>? actions;
  final AppCardSize size;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppCardFooter({
    Key? key,
    this.actions,
    this.size = AppCardSize.medium,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate footer spacing
    final footerSpacing = size == AppCardSize.small
        ? AppTheme.spacing2
        : size == AppCardSize.medium
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

class AppCardList extends StatelessWidget {
  final List<Widget> children;
  final EdgeInsets? margin;
  final EdgeInsets? padding;
  final double? spacing;
  final bool shrinkWrap;
  final ScrollPhysics? physics;
  final bool primary;
  final bool addAutomaticKeepAlives;
  final bool addRepaintBoundaries;
  final bool addSemanticIndexes;
  final double? cacheExtent;
  final int? semanticChildCount;
  final DragStartBehavior dragStartBehavior;
  final ScrollViewKeyboardDismissBehavior keyboardDismissBehavior;
  final String? restorationId;
  final Clip clipBehavior;
  final bool animateItems;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppCardList({
    Key? key,
    required this.children,
    this.margin,
    this.padding,
    this.spacing,
    this.shrinkWrap = false,
    this.physics,
    this.primary = false,
    this.addAutomaticKeepAlives = true,
    this.addRepaintBoundaries = true,
    this.addSemanticIndexes = true,
    this.cacheExtent,
    this.semanticChildCount,
    this.dragStartBehavior = DragStartBehavior.start,
    this.keyboardDismissBehavior = ScrollViewKeyboardDismissBehavior.manual,
    this.restorationId,
    this.clipBehavior = Clip.hardEdge,
    this.animateItems = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: padding ?? const EdgeInsets.all(AppTheme.spacing16),
      shrinkWrap: shrinkWrap,
      physics: physics,
      primary: primary,
      addAutomaticKeepAlives: addAutomaticKeepAlives,
      addRepaintBoundaries: addRepaintBoundaries,
      addSemanticIndexes: addSemanticIndexes,
      cacheExtent: cacheExtent,
      semanticChildCount: semanticChildCount,
      dragStartBehavior: dragStartBehavior,
      keyboardDismissBehavior: keyboardDismissBehavior,
      restorationId: restorationId,
      clipBehavior: clipBehavior,
      itemCount: children.length,
      separatorBuilder: (context, index) {
        return SizedBox(
          height: spacing ?? AppTheme.spacing16,
        );
      },
      itemBuilder: (context, index) {
        Widget child = children[index];
        if (animateItems) {
          child = AppAnimations.fadeIn(
            child,
            duration: animationDuration,
            curve: animationCurve,
          );
        }
        return child;
      },
    );
  }
}

class AppCardGrid extends StatelessWidget {
  final List<Widget> children;
  final EdgeInsets? margin;
  final EdgeInsets? padding;
  final double? spacing;
  final int crossAxisCount;
  final double? childAspectRatio;
  final double? mainAxisSpacing;
  final double? crossAxisSpacing;
  final bool shrinkWrap;
  final ScrollPhysics? physics;
  final bool primary;
  final bool addAutomaticKeepAlives;
  final bool addRepaintBoundaries;
  final bool addSemanticIndexes;
  final double? cacheExtent;
  final int? semanticChildCount;
  final DragStartBehavior dragStartBehavior;
  final ScrollViewKeyboardDismissBehavior keyboardDismissBehavior;
  final String? restorationId;
  final Clip clipBehavior;
  final bool animateItems;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppCardGrid({
    Key? key,
    required this.children,
    this.margin,
    this.padding,
    this.spacing,
    this.crossAxisCount = 2,
    this.childAspectRatio,
    this.mainAxisSpacing,
    this.crossAxisSpacing,
    this.shrinkWrap = false,
    this.physics,
    this.primary = false,
    this.addAutomaticKeepAlives = true,
    this.addRepaintBoundaries = true,
    this.addSemanticIndexes = true,
    this.cacheExtent,
    this.semanticChildCount,
    this.dragStartBehavior = DragStartBehavior.start,
    this.keyboardDismissBehavior = ScrollViewKeyboardDismissBehavior.manual,
    this.restorationId,
    this.clipBehavior = Clip.hardEdge,
    this.animateItems = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: padding ?? const EdgeInsets.all(AppTheme.spacing16),
      shrinkWrap: shrinkWrap,
      physics: physics,
      primary: primary,
      addAutomaticKeepAlives: addAutomaticKeepAlives,
      addRepaintBoundaries: addRepaintBoundaries,
      addSemanticIndexes: addSemanticIndexes,
      cacheExtent: cacheExtent,
      semanticChildCount: semanticChildCount,
      dragStartBehavior: dragStartBehavior,
      keyboardDismissBehavior: keyboardDismissBehavior,
      restorationId: restorationId,
      clipBehavior: clipBehavior,
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossAxisCount,
        childAspectRatio: childAspectRatio ?? 1.0,
        mainAxisSpacing: mainAxisSpacing ?? (spacing ?? AppTheme.spacing16),
        crossAxisSpacing: crossAxisSpacing ?? (spacing ?? AppTheme.spacing16),
      ),
      itemCount: children.length,
      itemBuilder: (context, index) {
        Widget child = children[index];
        if (animateItems) {
          child = AppAnimations.fadeIn(
            child,
            duration: animationDuration,
            curve: animationCurve,
          );
        }
        return child;
      },
    );
  }
} 
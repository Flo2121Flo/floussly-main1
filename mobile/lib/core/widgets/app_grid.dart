import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';

enum AppGridVariant {
  standard,
  filled,
  outlined,
}

enum AppGridSize {
  small,
  medium,
  large,
}

class AppGrid extends StatelessWidget {
  final List<Widget> children;
  final AppGridVariant variant;
  final AppGridSize size;
  final Color? backgroundColor;
  final Color? borderColor;
  final double? elevation;
  final EdgeInsetsGeometry? margin;
  final EdgeInsetsGeometry? padding;
  final double? borderRadius;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;
  final bool shrinkWrap;
  final ScrollPhysics? physics;
  final ScrollController? controller;
  final bool primary;
  final bool addAutomaticKeepAlives;
  final bool addRepaintBoundaries;
  final bool addSemanticIndexes;
  final double? itemExtent;
  final int? semanticChildCount;
  final DragStartBehavior dragStartBehavior;
  final Clip clipBehavior;
  final bool reverse;
  final int crossAxisCount;
  final double mainAxisSpacing;
  final double crossAxisSpacing;
  final double childAspectRatio;
  final double mainAxisExtent;
  final bool addRepaintBoundariesToChildren;
  final bool addAutomaticKeepAlivesToChildren;

  const AppGrid({
    Key? key,
    required this.children,
    this.variant = AppGridVariant.standard,
    this.size = AppGridSize.medium,
    this.backgroundColor,
    this.borderColor,
    this.elevation,
    this.margin,
    this.padding,
    this.borderRadius,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
    this.shrinkWrap = false,
    this.physics,
    this.controller,
    this.primary = false,
    this.addAutomaticKeepAlives = true,
    this.addRepaintBoundaries = true,
    this.addSemanticIndexes = true,
    this.itemExtent,
    this.semanticChildCount,
    this.dragStartBehavior = DragStartBehavior.start,
    this.clipBehavior = Clip.hardEdge,
    this.reverse = false,
    this.crossAxisCount = 2,
    this.mainAxisSpacing = 0.0,
    this.crossAxisSpacing = 0.0,
    this.childAspectRatio = 1.0,
    this.mainAxisExtent = 0.0,
    this.addRepaintBoundariesToChildren = true,
    this.addAutomaticKeepAlivesToChildren = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate grid colors
    final gridColors = _getGridColors(theme);

    // Calculate grid margin
    final gridMargin = margin ??
        EdgeInsets.all(
          size == AppGridSize.small
              ? AppTheme.spacing1
              : size == AppGridSize.medium
                  ? AppTheme.spacing2
                  : AppTheme.spacing3,
        );

    // Calculate grid padding
    final gridPadding = padding ??
        EdgeInsets.all(
          size == AppGridSize.small
              ? AppTheme.spacing2
              : size == AppGridSize.medium
                  ? AppTheme.spacing3
                  : AppTheme.spacing4,
        );

    // Calculate grid elevation
    final gridElevation = elevation ??
        (variant == AppGridVariant.standard
            ? (size == AppGridSize.small
                ? 1.0
                : size == AppGridSize.medium
                    ? 2.0
                    : 4.0)
            : 0.0);

    // Calculate grid border radius
    final gridBorderRadius = borderRadius ??
        (size == AppGridSize.small
            ? AppTheme.radius2
            : size == AppGridSize.medium
                ? AppTheme.radius3
                : AppTheme.radius4);

    // Calculate grid spacing
    final gridSpacing = size == AppGridSize.small
        ? AppTheme.spacing1
        : size == AppGridSize.medium
            ? AppTheme.spacing2
            : AppTheme.spacing3;

    Widget grid = Container(
      decoration: BoxDecoration(
        color: backgroundColor ?? gridColors.backgroundColor,
        borderRadius: BorderRadius.circular(gridBorderRadius),
        border: variant == AppGridVariant.outlined
            ? Border.all(
                color: borderColor ?? gridColors.borderColor,
                width: 1.0,
              )
            : null,
        boxShadow: variant == AppGridVariant.standard
            ? [
                BoxShadow(
                  color: theme.shadowColor.withOpacity(0.1),
                  blurRadius: gridElevation * 2,
                  offset: Offset(0, gridElevation),
                ),
              ]
            : null,
      ),
      margin: gridMargin,
      padding: gridPadding,
      child: GridView.builder(
        shrinkWrap: shrinkWrap,
        physics: physics,
        controller: controller,
        primary: primary,
        addAutomaticKeepAlives: addAutomaticKeepAlives,
        addRepaintBoundaries: addRepaintBoundaries,
        addSemanticIndexes: addSemanticIndexes,
        itemExtent: itemExtent,
        semanticChildCount: semanticChildCount,
        dragStartBehavior: dragStartBehavior,
        clipBehavior: clipBehavior,
        reverse: reverse,
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: crossAxisCount,
          mainAxisSpacing: mainAxisSpacing,
          crossAxisSpacing: crossAxisSpacing,
          childAspectRatio: childAspectRatio,
          mainAxisExtent: mainAxisExtent,
        ),
        itemCount: children.length,
        itemBuilder: (context, index) => children[index],
      ),
    );

    if (animate) {
      grid = AppAnimations.fadeIn(
        grid,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return grid;
  }

  _GridColors _getGridColors(ThemeData theme) {
    switch (variant) {
      case AppGridVariant.standard:
        return _GridColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
        );
      case AppGridVariant.filled:
        return _GridColors(
          backgroundColor: theme.colorScheme.surfaceVariant,
          borderColor: theme.colorScheme.outline,
        );
      case AppGridVariant.outlined:
        return _GridColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
        );
    }
  }
}

class _GridColors {
  final Color backgroundColor;
  final Color borderColor;

  const _GridColors({
    required this.backgroundColor,
    required this.borderColor,
  });
}

class AppGridItem {
  final Widget? icon;
  final Widget? title;
  final Widget? subtitle;
  final VoidCallback? onTap;

  const AppGridItem({
    this.icon,
    this.title,
    this.subtitle,
    this.onTap,
  });
}

class AppGridHeader extends StatelessWidget {
  final Widget? leading;
  final Widget? title;
  final Widget? subtitle;
  final List<Widget>? actions;
  final AppGridSize size;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppGridHeader({
    Key? key,
    this.leading,
    this.title,
    this.subtitle,
    this.actions,
    this.size = AppGridSize.medium,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate header spacing
    final headerSpacing = size == AppGridSize.small
        ? AppTheme.spacing2
        : size == AppGridSize.medium
            ? AppTheme.spacing3
            : AppTheme.spacing4;

    // Calculate title style
    final titleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppGridSize.small
          ? 14.0
          : size == AppGridSize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w600,
    );

    // Calculate subtitle style
    final subtitleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant.withOpacity(0.6),
      fontSize: size == AppGridSize.small
          ? 12.0
          : size == AppGridSize.medium
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

class AppGridFooter extends StatelessWidget {
  final List<Widget>? actions;
  final AppGridSize size;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppGridFooter({
    Key? key,
    this.actions,
    this.size = AppGridSize.medium,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate footer spacing
    final footerSpacing = size == AppGridSize.small
        ? AppTheme.spacing2
        : size == AppGridSize.medium
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
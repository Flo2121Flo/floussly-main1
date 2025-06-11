import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';

enum AppSelectVariant {
  standard,
  filled,
  outlined,
}

enum AppSelectSize {
  small,
  medium,
  large,
}

class AppSelect<T> extends StatelessWidget {
  final T? value;
  final List<AppSelectItem<T>> items;
  final String? label;
  final String? hint;
  final String? helper;
  final String? error;
  final Widget? prefix;
  final Widget? suffix;
  final bool enabled;
  final ValueChanged<T?>? onChanged;
  final VoidCallback? onTap;
  final AppSelectVariant variant;
  final AppSelectSize size;
  final Color? backgroundColor;
  final Color? borderColor;
  final Color? focusedBorderColor;
  final Color? errorBorderColor;
  final double? elevation;
  final EdgeInsetsGeometry? margin;
  final EdgeInsetsGeometry? padding;
  final double? borderRadius;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppSelect({
    Key? key,
    this.value,
    required this.items,
    this.label,
    this.hint,
    this.helper,
    this.error,
    this.prefix,
    this.suffix,
    this.enabled = true,
    this.onChanged,
    this.onTap,
    this.variant = AppSelectVariant.standard,
    this.size = AppSelectSize.medium,
    this.backgroundColor,
    this.borderColor,
    this.focusedBorderColor,
    this.errorBorderColor,
    this.elevation,
    this.margin,
    this.padding,
    this.borderRadius,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate select colors
    final selectColors = _getSelectColors(theme);

    // Calculate select margin
    final selectMargin = margin ??
        EdgeInsets.all(
          size == AppSelectSize.small
              ? AppTheme.spacing4
              : size == AppSelectSize.medium
                  ? AppTheme.spacing6
                  : AppTheme.spacing8,
        );

    // Calculate select padding
    final selectPadding = padding ??
        EdgeInsets.symmetric(
          horizontal: size == AppSelectSize.small
              ? AppTheme.spacing4
              : size == AppSelectSize.medium
                  ? AppTheme.spacing6
                  : AppTheme.spacing8,
          vertical: size == AppSelectSize.small
              ? AppTheme.spacing2
              : size == AppSelectSize.medium
                  ? AppTheme.spacing3
                  : AppTheme.spacing4,
        );

    // Calculate select elevation
    final selectElevation = elevation ??
        (variant == AppSelectVariant.standard
            ? (size == AppSelectSize.small
                ? 2.0
                : size == AppSelectSize.medium
                    ? 4.0
                    : 8.0)
            : 0.0);

    // Calculate select border radius
    final selectBorderRadius = borderRadius ??
        (size == AppSelectSize.small
            ? AppTheme.radius4
            : size == AppSelectSize.medium
                ? AppTheme.radius6
                : AppTheme.radius8);

    // Calculate select spacing
    final selectSpacing = size == AppSelectSize.small
        ? AppTheme.spacing2
        : size == AppSelectSize.medium
            ? AppTheme.spacing3
            : AppTheme.spacing4;

    // Calculate label style
    final labelStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppSelectSize.small
          ? 12.0
          : size == AppSelectSize.medium
              ? 14.0
              : 16.0,
      fontWeight: FontWeight.w500,
    );

    // Calculate helper style
    final helperStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant.withOpacity(0.6),
      fontSize: size == AppSelectSize.small
          ? 10.0
          : size == AppSelectSize.medium
              ? 12.0
              : 14.0,
      fontWeight: FontWeight.w400,
    );

    // Calculate error style
    final errorStyle = TextStyle(
      color: theme.colorScheme.error,
      fontSize: size == AppSelectSize.small
          ? 10.0
          : size == AppSelectSize.medium
              ? 12.0
              : 14.0,
      fontWeight: FontWeight.w400,
    );

    Widget select = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (label != null)
          DefaultTextStyle(
            style: labelStyle,
            child: Text(label!),
          ),
        if (label != null) SizedBox(height: selectSpacing / 2),
        Container(
          decoration: BoxDecoration(
            color: backgroundColor ?? selectColors.backgroundColor,
            borderRadius: BorderRadius.circular(selectBorderRadius),
            border: variant == AppSelectVariant.outlined
                ? Border.all(
                    color: error != null
                        ? errorBorderColor ?? theme.colorScheme.error
                        : borderColor ?? selectColors.borderColor,
                    width: 1.0,
                  )
                : null,
            boxShadow: variant == AppSelectVariant.standard
                ? [
                    BoxShadow(
                      color: theme.shadowColor.withOpacity(0.1),
                      blurRadius: selectElevation * 2,
                      offset: Offset(0, selectElevation),
                    ),
                  ]
                : null,
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<T>(
              value: value,
              items: items.map((item) {
                return DropdownMenuItem<T>(
                  value: item.value,
                  child: DefaultTextStyle(
                    style: TextStyle(
                      color: theme.colorScheme.onSurface,
                      fontSize: size == AppSelectSize.small
                          ? 12.0
                          : size == AppSelectSize.medium
                              ? 14.0
                              : 16.0,
                      fontWeight: FontWeight.w500,
                    ),
                    child: item.child,
                  ),
                );
              }).toList(),
              onChanged: enabled ? onChanged : null,
              hint: hint != null
                  ? DefaultTextStyle(
                      style: TextStyle(
                        color: theme.colorScheme.onSurface.withOpacity(0.5),
                        fontSize: size == AppSelectSize.small
                            ? 12.0
                            : size == AppSelectSize.medium
                                ? 14.0
                                : 16.0,
                        fontWeight: FontWeight.w400,
                      ),
                      child: Text(hint!),
                    )
                  : null,
              icon: suffix ??
                  Icon(
                    Icons.arrow_drop_down,
                    color: theme.colorScheme.onSurface.withOpacity(0.5),
                  ),
              isExpanded: true,
              padding: selectPadding,
              borderRadius: BorderRadius.circular(selectBorderRadius),
              dropdownColor: backgroundColor ?? selectColors.backgroundColor,
              focusColor: Colors.transparent,
              elevation: 8,
            ),
          ),
        ),
        if (helper != null || error != null) ...[
          SizedBox(height: selectSpacing / 2),
          DefaultTextStyle(
            style: error != null ? errorStyle : helperStyle,
            child: Text(error ?? helper!),
          ),
        ],
      ],
    );

    if (animate) {
      select = AppAnimations.fadeIn(
        select,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return select;
  }

  _SelectColors _getSelectColors(ThemeData theme) {
    switch (variant) {
      case AppSelectVariant.standard:
        return _SelectColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
        );
      case AppSelectVariant.filled:
        return _SelectColors(
          backgroundColor: theme.colorScheme.surfaceVariant,
          borderColor: theme.colorScheme.outline,
        );
      case AppSelectVariant.outlined:
        return _SelectColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
        );
    }
  }
}

class _SelectColors {
  final Color backgroundColor;
  final Color borderColor;

  const _SelectColors({
    required this.backgroundColor,
    required this.borderColor,
  });
}

class AppSelectItem<T> {
  final T value;
  final Widget child;

  const AppSelectItem({
    required this.value,
    required this.child,
  });
}

class AppSelectHeader extends StatelessWidget {
  final Widget? leading;
  final Widget? title;
  final Widget? subtitle;
  final List<Widget>? actions;
  final AppSelectSize size;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppSelectHeader({
    Key? key,
    this.leading,
    this.title,
    this.subtitle,
    this.actions,
    this.size = AppSelectSize.medium,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate header spacing
    final headerSpacing = size == AppSelectSize.small
        ? AppTheme.spacing2
        : size == AppSelectSize.medium
            ? AppTheme.spacing3
            : AppTheme.spacing4;

    // Calculate title style
    final titleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppSelectSize.small
          ? 14.0
          : size == AppSelectSize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w600,
    );

    // Calculate subtitle style
    final subtitleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant.withOpacity(0.6),
      fontSize: size == AppSelectSize.small
          ? 12.0
          : size == AppSelectSize.medium
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

class AppSelectFooter extends StatelessWidget {
  final List<Widget>? actions;
  final AppSelectSize size;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppSelectFooter({
    Key? key,
    this.actions,
    this.size = AppSelectSize.medium,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate footer spacing
    final footerSpacing = size == AppSelectSize.small
        ? AppTheme.spacing2
        : size == AppSelectSize.medium
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
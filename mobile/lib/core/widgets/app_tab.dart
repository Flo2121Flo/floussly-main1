import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';

enum AppTabVariant {
  standard,
  filled,
  outlined,
}

enum AppTabSize {
  small,
  medium,
  large,
}

class AppTab extends StatelessWidget {
  final List<AppTabItem> items;
  final int selectedIndex;
  final ValueChanged<int>? onSelected;
  final AppTabVariant variant;
  final AppTabSize size;
  final Color? backgroundColor;
  final Color? borderColor;
  final Color? selectedColor;
  final Color? unselectedColor;
  final Color? indicatorColor;
  final double? elevation;
  final EdgeInsetsGeometry? margin;
  final EdgeInsetsGeometry? padding;
  final double? borderRadius;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;
  final bool showLabels;
  final bool showIcons;
  final bool showIndicator;
  final bool disabled;

  const AppTab({
    Key? key,
    required this.items,
    required this.selectedIndex,
    this.onSelected,
    this.variant = AppTabVariant.standard,
    this.size = AppTabSize.medium,
    this.backgroundColor,
    this.borderColor,
    this.selectedColor,
    this.unselectedColor,
    this.indicatorColor,
    this.elevation,
    this.margin,
    this.padding,
    this.borderRadius,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
    this.showLabels = true,
    this.showIcons = true,
    this.showIndicator = true,
    this.disabled = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate tab colors
    final tabColors = _getTabColors(theme);

    // Calculate tab margin
    final tabMargin = margin ??
        EdgeInsets.all(
          size == AppTabSize.small
              ? AppTheme.spacing1
              : size == AppTabSize.medium
                  ? AppTheme.spacing2
                  : AppTheme.spacing3,
        );

    // Calculate tab padding
    final tabPadding = padding ??
        EdgeInsets.all(
          size == AppTabSize.small
              ? AppTheme.spacing2
              : size == AppTabSize.medium
                  ? AppTheme.spacing3
                  : AppTheme.spacing4,
        );

    // Calculate tab elevation
    final tabElevation = elevation ??
        (variant == AppTabVariant.standard
            ? (size == AppTabSize.small
                ? 1.0
                : size == AppTabSize.medium
                    ? 2.0
                    : 4.0)
            : 0.0);

    // Calculate tab border radius
    final tabBorderRadius = borderRadius ??
        (size == AppTabSize.small
            ? AppTheme.radius2
            : size == AppTabSize.medium
                ? AppTheme.radius3
                : AppTheme.radius4);

    // Calculate tab spacing
    final tabSpacing = size == AppTabSize.small
        ? AppTheme.spacing1
        : size == AppTabSize.medium
            ? AppTheme.spacing2
            : AppTheme.spacing3;

    // Calculate tab icon size
    final tabIconSize = size == AppTabSize.small
        ? 16.0
        : size == AppTabSize.medium
            ? 18.0
            : 20.0;

    // Calculate tab label style
    final tabLabelStyle = TextStyle(
      color: unselectedColor ?? tabColors.unselectedColor,
      fontSize: size == AppTabSize.small
          ? 12.0
          : size == AppTabSize.medium
              ? 14.0
              : 16.0,
      fontWeight: FontWeight.w500,
    );

    // Calculate tab selected label style
    final tabSelectedLabelStyle = TextStyle(
      color: selectedColor ?? tabColors.selectedColor,
      fontSize: size == AppTabSize.small
          ? 12.0
          : size == AppTabSize.medium
              ? 14.0
              : 16.0,
      fontWeight: FontWeight.w600,
    );

    Widget tab = Container(
      decoration: BoxDecoration(
        color: backgroundColor ?? tabColors.backgroundColor,
        borderRadius: BorderRadius.circular(tabBorderRadius),
        border: variant == AppTabVariant.outlined
            ? Border.all(
                color: borderColor ?? tabColors.borderColor,
                width: 1.0,
              )
            : null,
        boxShadow: variant == AppTabVariant.standard
            ? [
                BoxShadow(
                  color: theme.shadowColor.withOpacity(0.1),
                  blurRadius: tabElevation * 2,
                  offset: Offset(0, tabElevation),
                ),
              ]
            : null,
      ),
      margin: tabMargin,
      padding: tabPadding,
      child: TabBar(
        tabs: items.map((item) {
          return Tab(
            icon: showIcons
                ? Icon(
                    item.icon,
                    size: tabIconSize,
                    color: unselectedColor ?? tabColors.unselectedColor,
                  )
                : null,
            text: showLabels ? item.label : null,
          );
        }).toList(),
        onTap: disabled ? null : onSelected,
        indicatorColor: showIndicator
            ? (indicatorColor ?? tabColors.indicatorColor)
            : Colors.transparent,
        labelColor: selectedColor ?? tabColors.selectedColor,
        unselectedLabelColor: unselectedColor ?? tabColors.unselectedColor,
        labelStyle: tabSelectedLabelStyle,
        unselectedLabelStyle: tabLabelStyle,
      ),
    );

    if (animate) {
      tab = AppAnimations.fadeIn(
        tab,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return tab;
  }

  _TabColors _getTabColors(ThemeData theme) {
    switch (variant) {
      case AppTabVariant.standard:
        return _TabColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
          selectedColor: theme.colorScheme.primary,
          unselectedColor: theme.colorScheme.onSurfaceVariant,
          indicatorColor: theme.colorScheme.primary,
        );
      case AppTabVariant.filled:
        return _TabColors(
          backgroundColor: theme.colorScheme.surfaceVariant,
          borderColor: theme.colorScheme.outline,
          selectedColor: theme.colorScheme.primary,
          unselectedColor: theme.colorScheme.onSurfaceVariant,
          indicatorColor: theme.colorScheme.primary,
        );
      case AppTabVariant.outlined:
        return _TabColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
          selectedColor: theme.colorScheme.primary,
          unselectedColor: theme.colorScheme.onSurfaceVariant,
          indicatorColor: theme.colorScheme.primary,
        );
    }
  }
}

class AppTabItem {
  final IconData icon;
  final String label;

  const AppTabItem({
    required this.icon,
    required this.label,
  });
}

class _TabColors {
  final Color backgroundColor;
  final Color borderColor;
  final Color selectedColor;
  final Color unselectedColor;
  final Color indicatorColor;

  const _TabColors({
    required this.backgroundColor,
    required this.borderColor,
    required this.selectedColor,
    required this.unselectedColor,
    required this.indicatorColor,
  });
}

class AppTabBar extends StatelessWidget {
  final List<AppTabItem> items;
  final int selectedIndex;
  final ValueChanged<int>? onTap;
  final AppTabVariant variant;
  final AppTabSize size;
  final Color? backgroundColor;
  final Color? selectedColor;
  final Color? unselectedColor;
  final double? elevation;
  final EdgeInsetsGeometry? padding;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppTabBar({
    Key? key,
    required this.items,
    required this.selectedIndex,
    this.onTap,
    this.variant = AppTabVariant.standard,
    this.size = AppTabSize.medium,
    this.backgroundColor,
    this.selectedColor,
    this.unselectedColor,
    this.elevation,
    this.padding,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate tab bar colors
    final tabBarColors = _getTabBarColors(theme);

    // Calculate tab bar padding
    final tabBarPadding = padding ??
        EdgeInsets.symmetric(
          horizontal: size == AppTabSize.small
              ? AppTheme.spacing8
              : size == AppTabSize.medium
                  ? AppTheme.spacing12
                  : AppTheme.spacing16,
          vertical: size == AppTabSize.small
              ? AppTheme.spacing4
              : size == AppTabSize.medium
                  ? AppTheme.spacing6
                  : AppTheme.spacing8,
        );

    // Calculate tab bar elevation
    final tabBarElevation = elevation ??
        (variant == AppTabVariant.elevated
            ? (size == AppTabSize.small
                ? 2.0
                : size == AppTabSize.medium
                    ? 4.0
                    : 8.0)
            : 0.0);

    Widget tabBar = Container(
      padding: tabBarPadding,
      decoration: BoxDecoration(
        color: backgroundColor ?? tabBarColors.backgroundColor,
        borderRadius: BorderRadius.circular(
          size == AppTabSize.small
              ? AppTheme.radius4
              : size == AppTabSize.medium
                  ? AppTheme.radius6
                  : AppTheme.radius8,
        ),
        border: variant == AppTabVariant.outlined
            ? Border.all(
                color: theme.colorScheme.outline,
                width: 1.0,
              )
            : null,
        boxShadow: variant == AppTabVariant.elevated
            ? [
                BoxShadow(
                  color: theme.shadowColor.withOpacity(0.1),
                  blurRadius: tabBarElevation * 2,
                  offset: Offset(0, tabBarElevation),
                ),
              ]
            : null,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          for (var i = 0; i < items.length; i++)
            Expanded(
              child: _buildTabBarItem(
                context,
                items[i],
                i == selectedIndex,
                tabBarColors,
              ),
            ),
        ],
      ),
    );

    if (animate) {
      tabBar = AppAnimations.fadeIn(
        tabBar,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return tabBar;
  }

  Widget _buildTabBarItem(
    BuildContext context,
    AppTabItem item,
    bool isSelected,
    _TabBarColors colors,
  ) {
    final theme = Theme.of(context);

    // Calculate item color
    final itemColor = isSelected
        ? (selectedColor ?? colors.selectedColor)
        : (unselectedColor ?? colors.unselectedColor);

    // Calculate item padding
    final itemPadding = EdgeInsets.symmetric(
      horizontal: size == AppTabSize.small
          ? AppTheme.spacing4
          : size == AppTabSize.medium
              ? AppTheme.spacing6
              : AppTheme.spacing8,
      vertical: size == AppTabSize.small
          ? AppTheme.spacing2
          : size == AppTabSize.medium
              ? AppTheme.spacing3
              : AppTheme.spacing4,
    );

    // Calculate item spacing
    final itemSpacing = size == AppTabSize.small
        ? AppTheme.spacing2
        : size == AppTabSize.medium
            ? AppTheme.spacing3
            : AppTheme.spacing4;

    // Calculate icon size
    final iconSize = size == AppTabSize.small
        ? 20.0
        : size == AppTabSize.medium
            ? 24.0
            : 28.0;

    // Calculate text style
    final textStyle = TextStyle(
      color: itemColor,
      fontSize: size == AppTabSize.small
          ? 12.0
          : size == AppTabSize.medium
              ? 14.0
              : 16.0,
      fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
    );

    Widget tabBarItem = InkWell(
      onTap: () {
        if (onTap != null) {
          onTap!(items.indexOf(item));
        }
      },
      borderRadius: BorderRadius.circular(
        size == AppTabSize.small
            ? AppTheme.radius4
            : size == AppTabSize.medium
                ? AppTheme.radius6
                : AppTheme.radius8,
      ),
      child: Padding(
        padding: itemPadding,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              item.icon,
              size: iconSize,
              color: itemColor,
            ),
            SizedBox(height: itemSpacing),
            Text(
              item.label,
              style: textStyle,
            ),
            if (item.badge != null) ...[
              SizedBox(height: itemSpacing / 2),
              Container(
                padding: EdgeInsets.symmetric(
                  horizontal: size == AppTabSize.small
                      ? AppTheme.spacing2
                      : size == AppTabSize.medium
                          ? AppTheme.spacing3
                          : AppTheme.spacing4,
                  vertical: size == AppTabSize.small
                      ? AppTheme.spacing1
                      : size == AppTabSize.medium
                          ? AppTheme.spacing2
                          : AppTheme.spacing3,
                ),
                decoration: BoxDecoration(
                  color: theme.colorScheme.error,
                  borderRadius: BorderRadius.circular(
                    size == AppTabSize.small
                        ? AppTheme.radius2
                        : size == AppTabSize.medium
                            ? AppTheme.radius3
                            : AppTheme.radius4,
                  ),
                ),
                child: Text(
                  item.badge!,
                  style: TextStyle(
                    color: theme.colorScheme.onError,
                    fontSize: size == AppTabSize.small
                        ? 10.0
                        : size == AppTabSize.medium
                            ? 12.0
                            : 14.0,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );

    if (animate) {
      tabBarItem = AppAnimations.fadeIn(
        tabBarItem,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return tabBarItem;
  }

  _TabBarColors _getTabBarColors(ThemeData theme) {
    switch (variant) {
      case AppTabVariant.standard:
        return _TabBarColors(
          backgroundColor: theme.colorScheme.surface,
          selectedColor: theme.colorScheme.primary,
          unselectedColor: theme.colorScheme.onSurface.withOpacity(0.6),
        );
      case AppTabVariant.elevated:
        return _TabBarColors(
          backgroundColor: theme.colorScheme.surface,
          selectedColor: theme.colorScheme.primary,
          unselectedColor: theme.colorScheme.onSurface.withOpacity(0.6),
        );
      case AppTabVariant.outlined:
        return _TabBarColors(
          backgroundColor: theme.colorScheme.surface,
          selectedColor: theme.colorScheme.primary,
          unselectedColor: theme.colorScheme.onSurface.withOpacity(0.6),
        );
    }
  }
}

class _TabBarColors {
  final Color backgroundColor;
  final Color selectedColor;
  final Color unselectedColor;

  const _TabBarColors({
    required this.backgroundColor,
    required this.selectedColor,
    required this.unselectedColor,
  });
} 
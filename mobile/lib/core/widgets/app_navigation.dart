import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';

enum AppNavigationVariant {
  standard,
  filled,
  outlined,
}

enum AppNavigationSize {
  small,
  medium,
  large,
}

enum AppNavigationType {
  bottom,
  rail,
  drawer,
}

class AppNavigation extends StatelessWidget {
  final List<AppNavigationItem> items;
  final int selectedIndex;
  final ValueChanged<int>? onSelected;
  final AppNavigationVariant variant;
  final AppNavigationSize size;
  final AppNavigationType type;
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

  const AppNavigation({
    Key? key,
    required this.items,
    required this.selectedIndex,
    this.onSelected,
    this.variant = AppNavigationVariant.standard,
    this.size = AppNavigationSize.medium,
    this.type = AppNavigationType.bottom,
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

    // Calculate navigation colors
    final navigationColors = _getNavigationColors(theme);

    // Calculate navigation margin
    final navigationMargin = margin ??
        EdgeInsets.all(
          size == AppNavigationSize.small
              ? AppTheme.spacing1
              : size == AppNavigationSize.medium
                  ? AppTheme.spacing2
                  : AppTheme.spacing3,
        );

    // Calculate navigation padding
    final navigationPadding = padding ??
        EdgeInsets.all(
          size == AppNavigationSize.small
              ? AppTheme.spacing2
              : size == AppNavigationSize.medium
                  ? AppTheme.spacing3
                  : AppTheme.spacing4,
        );

    // Calculate navigation elevation
    final navigationElevation = elevation ??
        (variant == AppNavigationVariant.standard
            ? (size == AppNavigationSize.small
                ? 1.0
                : size == AppNavigationSize.medium
                    ? 2.0
                    : 4.0)
            : 0.0);

    // Calculate navigation border radius
    final navigationBorderRadius = borderRadius ??
        (size == AppNavigationSize.small
            ? AppTheme.radius2
            : size == AppNavigationSize.medium
                ? AppTheme.radius3
                : AppTheme.radius4);

    // Calculate navigation spacing
    final navigationSpacing = size == AppNavigationSize.small
        ? AppTheme.spacing1
        : size == AppNavigationSize.medium
            ? AppTheme.spacing2
            : AppTheme.spacing3;

    // Calculate navigation icon size
    final navigationIconSize = size == AppNavigationSize.small
        ? 16.0
        : size == AppNavigationSize.medium
            ? 18.0
            : 20.0;

    // Calculate navigation label style
    final navigationLabelStyle = TextStyle(
      color: unselectedColor ?? navigationColors.unselectedColor,
      fontSize: size == AppNavigationSize.small
          ? 12.0
          : size == AppNavigationSize.medium
              ? 14.0
              : 16.0,
      fontWeight: FontWeight.w500,
    );

    // Calculate navigation selected label style
    final navigationSelectedLabelStyle = TextStyle(
      color: selectedColor ?? navigationColors.selectedColor,
      fontSize: size == AppNavigationSize.small
          ? 12.0
          : size == AppNavigationSize.medium
              ? 14.0
              : 16.0,
      fontWeight: FontWeight.w600,
    );

    Widget navigation;

    switch (type) {
      case AppNavigationType.bottom:
        navigation = NavigationBar(
          selectedIndex: selectedIndex,
          onDestinationSelected: disabled ? null : onSelected,
          backgroundColor: backgroundColor ?? navigationColors.backgroundColor,
          elevation: navigationElevation,
          labelBehavior: showLabels
              ? NavigationDestinationLabelBehavior.alwaysShow
              : NavigationDestinationLabelBehavior.alwaysHide,
          destinations: items.map((item) {
            return NavigationDestination(
              icon: Icon(
                item.icon,
                size: navigationIconSize,
                color: unselectedColor ?? navigationColors.unselectedColor,
              ),
              selectedIcon: Icon(
                item.icon,
                size: navigationIconSize,
                color: selectedColor ?? navigationColors.selectedColor,
              ),
              label: item.label,
            );
          }).toList(),
        );
        break;
      case AppNavigationType.rail:
        navigation = NavigationRail(
          selectedIndex: selectedIndex,
          onDestinationSelected: disabled ? null : onSelected,
          backgroundColor: backgroundColor ?? navigationColors.backgroundColor,
          elevation: navigationElevation,
          useIndicator: showIndicator,
          indicatorColor: indicatorColor ?? navigationColors.indicatorColor,
          labelType: showLabels
              ? NavigationRailLabelType.all
              : NavigationRailLabelType.none,
          destinations: items.map((item) {
            return NavigationRailDestination(
              icon: Icon(
                item.icon,
                size: navigationIconSize,
                color: unselectedColor ?? navigationColors.unselectedColor,
              ),
              selectedIcon: Icon(
                item.icon,
                size: navigationIconSize,
                color: selectedColor ?? navigationColors.selectedColor,
              ),
              label: Text(
                item.label,
                style: navigationLabelStyle,
              ),
            );
          }).toList(),
        );
        break;
      case AppNavigationType.drawer:
        navigation = NavigationDrawer(
          selectedIndex: selectedIndex,
          onDestinationSelected: disabled ? null : onSelected,
          backgroundColor: backgroundColor ?? navigationColors.backgroundColor,
          elevation: navigationElevation,
          children: items.map((item) {
            return NavigationDrawerDestination(
              icon: Icon(
                item.icon,
                size: navigationIconSize,
                color: unselectedColor ?? navigationColors.unselectedColor,
              ),
              selectedIcon: Icon(
                item.icon,
                size: navigationIconSize,
                color: selectedColor ?? navigationColors.selectedColor,
              ),
              label: Text(
                item.label,
                style: navigationLabelStyle,
              ),
            );
          }).toList(),
        );
        break;
    }

    if (animate) {
      navigation = AppAnimations.fadeIn(
        navigation,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return navigation;
  }

  _NavigationColors _getNavigationColors(ThemeData theme) {
    switch (variant) {
      case AppNavigationVariant.standard:
        return _NavigationColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
          selectedColor: theme.colorScheme.primary,
          unselectedColor: theme.colorScheme.onSurfaceVariant,
          indicatorColor: theme.colorScheme.primaryContainer,
        );
      case AppNavigationVariant.filled:
        return _NavigationColors(
          backgroundColor: theme.colorScheme.surfaceVariant,
          borderColor: theme.colorScheme.outline,
          selectedColor: theme.colorScheme.primary,
          unselectedColor: theme.colorScheme.onSurfaceVariant,
          indicatorColor: theme.colorScheme.primaryContainer,
        );
      case AppNavigationVariant.outlined:
        return _NavigationColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
          selectedColor: theme.colorScheme.primary,
          unselectedColor: theme.colorScheme.onSurfaceVariant,
          indicatorColor: theme.colorScheme.primaryContainer,
        );
    }
  }
}

class AppNavigationItem {
  final IconData icon;
  final String label;

  const AppNavigationItem({
    required this.icon,
    required this.label,
  });
}

class _NavigationColors {
  final Color backgroundColor;
  final Color borderColor;
  final Color selectedColor;
  final Color unselectedColor;
  final Color indicatorColor;

  const _NavigationColors({
    required this.backgroundColor,
    required this.borderColor,
    required this.selectedColor,
    required this.unselectedColor,
    required this.indicatorColor,
  });
} 
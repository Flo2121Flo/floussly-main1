import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';

enum AppChipVariant {
  standard,
  filled,
  outlined,
}

enum AppChipSize {
  small,
  medium,
  large,
}

class AppChip extends StatelessWidget {
  final String? label;
  final Widget? avatar;
  final Widget? child;
  final AppChipVariant variant;
  final AppChipSize size;
  final Color? backgroundColor;
  final Color? borderColor;
  final Color? labelColor;
  final double? elevation;
  final EdgeInsetsGeometry? margin;
  final EdgeInsetsGeometry? padding;
  final double? borderRadius;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;
  final bool showLabel;
  final bool showAvatar;
  final bool showChild;
  final bool showBackground;
  final bool showBorder;
  final bool showShadow;
  final bool showAnimation;
  final bool showDeleteIcon;
  final bool showCheckIcon;
  final bool showSelectedIcon;
  final bool showUnselectedIcon;
  final bool showLeadingIcon;
  final bool showTrailingIcon;
  final IconData? deleteIcon;
  final IconData? checkIcon;
  final IconData? selectedIcon;
  final IconData? unselectedIcon;
  final IconData? leadingIcon;
  final IconData? trailingIcon;
  final VoidCallback? onDeleted;
  final VoidCallback? onSelected;
  final VoidCallback? onUnselected;
  final VoidCallback? onPressed;
  final bool selected;
  final bool disabled;
  final bool deletable;
  final bool selectable;
  final bool pressable;
  final bool showSelected;
  final bool showUnselected;
  final bool showPressed;
  final bool showDisabled;
  final bool showDeletable;
  final bool showSelectable;
  final bool showPressable;
  final bool showSelectedLabel;
  final bool showUnselectedLabel;
  final bool showPressedLabel;
  final bool showDisabledLabel;
  final bool showDeletableLabel;
  final bool showSelectableLabel;
  final bool showPressableLabel;
  final bool showSelectedAvatar;
  final bool showUnselectedAvatar;
  final bool showPressedAvatar;
  final bool showDisabledAvatar;
  final bool showDeletableAvatar;
  final bool showSelectableAvatar;
  final bool showPressableAvatar;
  final bool showSelectedChild;
  final bool showUnselectedChild;
  final bool showPressedChild;
  final bool showDisabledChild;
  final bool showDeletableChild;
  final bool showSelectableChild;
  final bool showPressableChild;
  final bool showSelectedIcon;
  final bool showUnselectedIcon;
  final bool showPressedIcon;
  final bool showDisabledIcon;
  final bool showDeletableIcon;
  final bool showSelectableIcon;
  final bool showPressableIcon;
  final bool showSelectedBackground;
  final bool showUnselectedBackground;
  final bool showPressedBackground;
  final bool showDisabledBackground;
  final bool showDeletableBackground;
  final bool showSelectableBackground;
  final bool showPressableBackground;
  final bool showSelectedBorder;
  final bool showUnselectedBorder;
  final bool showPressedBorder;
  final bool showDisabledBorder;
  final bool showDeletableBorder;
  final bool showSelectableBorder;
  final bool showPressableBorder;
  final bool showSelectedShadow;
  final bool showUnselectedShadow;
  final bool showPressedShadow;
  final bool showDisabledShadow;
  final bool showDeletableShadow;
  final bool showSelectableShadow;
  final bool showPressableShadow;
  final bool showSelectedAnimation;
  final bool showUnselectedAnimation;
  final bool showPressedAnimation;
  final bool showDisabledAnimation;
  final bool showDeletableAnimation;
  final bool showSelectableAnimation;
  final bool showPressableAnimation;

  const AppChip({
    Key? key,
    this.label,
    this.avatar,
    this.child,
    this.variant = AppChipVariant.standard,
    this.size = AppChipSize.medium,
    this.backgroundColor,
    this.borderColor,
    this.labelColor,
    this.elevation,
    this.margin,
    this.padding,
    this.borderRadius,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
    this.showLabel = true,
    this.showAvatar = true,
    this.showChild = true,
    this.showBackground = true,
    this.showBorder = true,
    this.showShadow = true,
    this.showAnimation = true,
    this.showDeleteIcon = false,
    this.showCheckIcon = false,
    this.showSelectedIcon = false,
    this.showUnselectedIcon = false,
    this.showLeadingIcon = false,
    this.showTrailingIcon = false,
    this.deleteIcon,
    this.checkIcon,
    this.selectedIcon,
    this.unselectedIcon,
    this.leadingIcon,
    this.trailingIcon,
    this.onDeleted,
    this.onSelected,
    this.onUnselected,
    this.onPressed,
    this.selected = false,
    this.disabled = false,
    this.deletable = false,
    this.selectable = false,
    this.pressable = false,
    this.showSelected = true,
    this.showUnselected = true,
    this.showPressed = true,
    this.showDisabled = true,
    this.showDeletable = true,
    this.showSelectable = true,
    this.showPressable = true,
    this.showSelectedLabel = true,
    this.showUnselectedLabel = true,
    this.showPressedLabel = true,
    this.showDisabledLabel = true,
    this.showDeletableLabel = true,
    this.showSelectableLabel = true,
    this.showPressableLabel = true,
    this.showSelectedAvatar = true,
    this.showUnselectedAvatar = true,
    this.showPressedAvatar = true,
    this.showDisabledAvatar = true,
    this.showDeletableAvatar = true,
    this.showSelectableAvatar = true,
    this.showPressableAvatar = true,
    this.showSelectedChild = true,
    this.showUnselectedChild = true,
    this.showPressedChild = true,
    this.showDisabledChild = true,
    this.showDeletableChild = true,
    this.showSelectableChild = true,
    this.showPressableChild = true,
    this.showSelectedIcon = true,
    this.showUnselectedIcon = true,
    this.showPressedIcon = true,
    this.showDisabledIcon = true,
    this.showDeletableIcon = true,
    this.showSelectableIcon = true,
    this.showPressableIcon = true,
    this.showSelectedBackground = true,
    this.showUnselectedBackground = true,
    this.showPressedBackground = true,
    this.showDisabledBackground = true,
    this.showDeletableBackground = true,
    this.showSelectableBackground = true,
    this.showPressableBackground = true,
    this.showSelectedBorder = true,
    this.showUnselectedBorder = true,
    this.showPressedBorder = true,
    this.showDisabledBorder = true,
    this.showDeletableBorder = true,
    this.showSelectableBorder = true,
    this.showPressableBorder = true,
    this.showSelectedShadow = true,
    this.showUnselectedShadow = true,
    this.showPressedShadow = true,
    this.showDisabledShadow = true,
    this.showDeletableShadow = true,
    this.showSelectableShadow = true,
    this.showPressableShadow = true,
    this.showSelectedAnimation = true,
    this.showUnselectedAnimation = true,
    this.showPressedAnimation = true,
    this.showDisabledAnimation = true,
    this.showDeletableAnimation = true,
    this.showSelectableAnimation = true,
    this.showPressableAnimation = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate chip colors
    final chipColors = _getChipColors(theme);

    // Calculate chip margin
    final chipMargin = margin ??
        EdgeInsets.all(
          size == AppChipSize.small
              ? AppTheme.spacing1
              : size == AppChipSize.medium
                  ? AppTheme.spacing2
                  : AppTheme.spacing3,
        );

    // Calculate chip padding
    final chipPadding = padding ??
        EdgeInsets.all(
          size == AppChipSize.small
              ? AppTheme.spacing2
              : size == AppChipSize.medium
                  ? AppTheme.spacing3
                  : AppTheme.spacing4,
        );

    // Calculate chip elevation
    final chipElevation = elevation ??
        (variant == AppChipVariant.standard
            ? (size == AppChipSize.small
                ? 1.0
                : size == AppChipSize.medium
                    ? 2.0
                    : 4.0)
            : 0.0);

    // Calculate chip border radius
    final chipBorderRadius = borderRadius ??
        (size == AppChipSize.small
            ? AppTheme.radius2
            : size == AppChipSize.medium
                ? AppTheme.radius3
                : AppTheme.radius4);

    // Calculate chip spacing
    final chipSpacing = size == AppChipSize.small
        ? AppTheme.spacing1
        : size == AppChipSize.medium
            ? AppTheme.spacing2
            : AppTheme.spacing3;

    // Calculate chip icon size
    final chipIconSize = size == AppChipSize.small
        ? 16.0
        : size == AppChipSize.medium
            ? 18.0
            : 20.0;

    // Calculate label style
    final labelStyle = TextStyle(
      color: labelColor ?? chipColors.labelColor,
      fontSize: size == AppChipSize.small
          ? 12.0
          : size == AppChipSize.medium
              ? 14.0
              : 16.0,
      fontWeight: FontWeight.w400,
    );

    Widget chip = Container(
      decoration: BoxDecoration(
        color: showBackground
            ? backgroundColor ?? chipColors.backgroundColor
            : Colors.transparent,
        borderRadius: BorderRadius.circular(chipBorderRadius),
        border: showBorder && variant == AppChipVariant.outlined
            ? Border.all(
                color: borderColor ?? chipColors.borderColor,
                width: 1.0,
              )
            : null,
        boxShadow: showShadow && variant == AppChipVariant.standard
            ? [
                BoxShadow(
                  color: theme.shadowColor.withOpacity(0.1),
                  blurRadius: chipElevation * 2,
                  offset: Offset(0, chipElevation),
                ),
              ]
            : null,
      ),
      margin: chipMargin,
      padding: chipPadding,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showLeadingIcon && leadingIcon != null) ...[
            Icon(
              leadingIcon,
              size: chipIconSize,
              color: labelColor ?? chipColors.labelColor,
            ),
            SizedBox(width: chipSpacing),
          ],
          if (showAvatar && avatar != null) ...[
            avatar!,
            SizedBox(width: chipSpacing),
          ],
          if (showLabel && label != null) ...[
            Text(
              label!,
              style: labelStyle,
            ),
            SizedBox(width: chipSpacing),
          ],
          if (showChild && child != null) ...[
            child!,
            SizedBox(width: chipSpacing),
          ],
          if (showTrailingIcon && trailingIcon != null) ...[
            Icon(
              trailingIcon,
              size: chipIconSize,
              color: labelColor ?? chipColors.labelColor,
            ),
            SizedBox(width: chipSpacing),
          ],
          if (showDeleteIcon && deleteIcon != null) ...[
            IconButton(
              icon: Icon(
                deleteIcon,
                size: chipIconSize,
                color: labelColor ?? chipColors.labelColor,
              ),
              onPressed: disabled ? null : onDeleted,
              padding: EdgeInsets.zero,
              constraints: BoxConstraints(
                minWidth: chipIconSize,
                minHeight: chipIconSize,
              ),
              splashRadius: chipIconSize,
            ),
          ],
          if (showCheckIcon && checkIcon != null) ...[
            Icon(
              checkIcon,
              size: chipIconSize,
              color: labelColor ?? chipColors.labelColor,
            ),
            SizedBox(width: chipSpacing),
          ],
          if (showSelectedIcon && selectedIcon != null) ...[
            Icon(
              selectedIcon,
              size: chipIconSize,
              color: labelColor ?? chipColors.labelColor,
            ),
            SizedBox(width: chipSpacing),
          ],
          if (showUnselectedIcon && unselectedIcon != null) ...[
            Icon(
              unselectedIcon,
              size: chipIconSize,
              color: labelColor ?? chipColors.labelColor,
            ),
            SizedBox(width: chipSpacing),
          ],
        ],
      ),
    );

    if (animate && showAnimation) {
      chip = AppAnimations.fadeIn(
        chip,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    if (pressable && onPressed != null && !disabled) {
      chip = InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(chipBorderRadius),
        child: chip,
      );
    }

    return chip;
  }

  _ChipColors _getChipColors(ThemeData theme) {
    switch (variant) {
      case AppChipVariant.standard:
        return _ChipColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
          labelColor: theme.colorScheme.onSurface,
        );
      case AppChipVariant.filled:
        return _ChipColors(
          backgroundColor: theme.colorScheme.surfaceVariant,
          borderColor: theme.colorScheme.outline,
          labelColor: theme.colorScheme.onSurfaceVariant,
        );
      case AppChipVariant.outlined:
        return _ChipColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
          labelColor: theme.colorScheme.onSurface,
        );
    }
  }
}

class _ChipColors {
  final Color backgroundColor;
  final Color borderColor;
  final Color labelColor;

  const _ChipColors({
    required this.backgroundColor,
    required this.borderColor,
    required this.labelColor,
  });
}

class AppFilterChip extends StatelessWidget {
  final String label;
  final IconData? icon;
  final Widget? avatar;
  final AppChipSize size;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final Color? borderColor;
  final EdgeInsets? padding;
  final BorderRadius? borderRadius;
  final VoidCallback? onTap;
  final VoidCallback? onLongPress;
  final bool selected;
  final bool disabled;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppFilterChip({
    Key? key,
    required this.label,
    this.icon,
    this.avatar,
    this.size = AppChipSize.medium,
    this.backgroundColor,
    this.foregroundColor,
    this.borderColor,
    this.padding,
    this.borderRadius,
    this.onTap,
    this.onLongPress,
    this.selected = false,
    this.disabled = false,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AppChip(
      avatar: avatar,
      label: Text(label),
      deleteIcon: null,
      variant: AppChipVariant.filled,
      size: size,
      backgroundColor: backgroundColor,
      borderColor: borderColor,
      avatarColor: null,
      labelColor: foregroundColor,
      deleteIconColor: null,
      elevation: null,
      margin: null,
      padding: padding,
      borderRadius: borderRadius,
      animate: animate,
      animationDuration: animationDuration,
      animationCurve: animationCurve,
      onTap: onTap,
      onDeleted: null,
      disabled: disabled,
      selected: selected,
    );
  }
}

class AppChoiceChip extends StatelessWidget {
  final String label;
  final IconData? icon;
  final Widget? avatar;
  final AppChipSize size;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final Color? borderColor;
  final EdgeInsets? padding;
  final BorderRadius? borderRadius;
  final VoidCallback? onTap;
  final VoidCallback? onLongPress;
  final bool selected;
  final bool disabled;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppChoiceChip({
    Key? key,
    required this.label,
    this.icon,
    this.avatar,
    this.size = AppChipSize.medium,
    this.backgroundColor,
    this.foregroundColor,
    this.borderColor,
    this.padding,
    this.borderRadius,
    this.onTap,
    this.onLongPress,
    this.selected = false,
    this.disabled = false,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AppChip(
      avatar: avatar,
      label: Text(label),
      deleteIcon: null,
      variant: AppChipVariant.outlined,
      size: size,
      backgroundColor: backgroundColor,
      borderColor: borderColor,
      avatarColor: null,
      labelColor: foregroundColor,
      deleteIconColor: null,
      elevation: null,
      margin: null,
      padding: padding,
      borderRadius: borderRadius,
      animate: animate,
      animationDuration: animationDuration,
      animationCurve: animationCurve,
      onTap: onTap,
      onDeleted: null,
      disabled: disabled,
      selected: selected,
    );
  }
}

class AppInputChip extends StatelessWidget {
  final String label;
  final IconData? icon;
  final Widget? avatar;
  final AppChipSize size;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final Color? borderColor;
  final EdgeInsets? padding;
  final BorderRadius? borderRadius;
  final VoidCallback? onTap;
  final VoidCallback? onLongPress;
  final VoidCallback? onDelete;
  final bool disabled;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppInputChip({
    Key? key,
    required this.label,
    this.icon,
    this.avatar,
    this.size = AppChipSize.medium,
    this.backgroundColor,
    this.foregroundColor,
    this.borderColor,
    this.padding,
    this.borderRadius,
    this.onTap,
    this.onLongPress,
    this.onDelete,
    this.disabled = false,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AppChip(
      avatar: avatar,
      label: Text(label),
      deleteIcon: null,
      variant: AppChipVariant.filled,
      size: size,
      backgroundColor: backgroundColor,
      borderColor: borderColor,
      avatarColor: null,
      labelColor: foregroundColor,
      deleteIconColor: null,
      elevation: null,
      margin: null,
      padding: padding,
      borderRadius: borderRadius,
      animate: animate,
      animationDuration: animationDuration,
      animationCurve: animationCurve,
      onTap: onTap,
      onDeleted: null,
      disabled: disabled,
      selected: false,
    );
  }
} 
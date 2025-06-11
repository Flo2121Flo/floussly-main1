import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';

enum AppStepperVariant {
  standard,
  elevated,
  outlined,
}

enum AppStepperSize {
  small,
  medium,
  large,
}

class AppStepper extends StatelessWidget {
  final List<AppStepperItem> items;
  final int currentStep;
  final ValueChanged<int>? onStepTapped;
  final AppStepperVariant variant;
  final AppStepperSize size;
  final Color? backgroundColor;
  final Color? selectedColor;
  final Color? unselectedColor;
  final double? elevation;
  final EdgeInsetsGeometry? padding;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppStepper({
    Key? key,
    required this.items,
    required this.currentStep,
    this.onStepTapped,
    this.variant = AppStepperVariant.standard,
    this.size = AppStepperSize.medium,
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

    // Calculate stepper colors
    final stepperColors = _getStepperColors(theme);

    // Calculate stepper padding
    final stepperPadding = padding ??
        EdgeInsets.symmetric(
          horizontal: size == AppStepperSize.small
              ? AppTheme.spacing8
              : size == AppStepperSize.medium
                  ? AppTheme.spacing12
                  : AppTheme.spacing16,
          vertical: size == AppStepperSize.small
              ? AppTheme.spacing8
              : size == AppStepperSize.medium
                  ? AppTheme.spacing12
                  : AppTheme.spacing16,
        );

    // Calculate stepper elevation
    final stepperElevation = elevation ??
        (variant == AppStepperVariant.elevated
            ? (size == AppStepperSize.small
                ? 2.0
                : size == AppStepperSize.medium
                    ? 4.0
                    : 8.0)
            : 0.0);

    Widget stepper = Container(
      padding: stepperPadding,
      decoration: BoxDecoration(
        color: backgroundColor ?? stepperColors.backgroundColor,
        borderRadius: BorderRadius.circular(
          size == AppStepperSize.small
              ? AppTheme.radius4
              : size == AppStepperSize.medium
                  ? AppTheme.radius6
                  : AppTheme.radius8,
        ),
        border: variant == AppStepperVariant.outlined
            ? Border.all(
                color: theme.colorScheme.outline,
                width: 1.0,
              )
            : null,
        boxShadow: variant == AppStepperVariant.elevated
            ? [
                BoxShadow(
                  color: theme.shadowColor.withOpacity(0.1),
                  blurRadius: stepperElevation * 2,
                  offset: Offset(0, stepperElevation),
                ),
              ]
            : null,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          for (var i = 0; i < items.length; i++) ...[
            _buildStepperItem(
              context,
              items[i],
              i,
              i == currentStep,
              i < currentStep,
              stepperColors,
            ),
            if (i < items.length - 1)
              _buildStepperLine(
                context,
                i < currentStep,
                stepperColors,
              ),
          ],
        ],
      ),
    );

    if (animate) {
      stepper = AppAnimations.fadeIn(
        stepper,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return stepper;
  }

  Widget _buildStepperItem(
    BuildContext context,
    AppStepperItem item,
    int index,
    bool isCurrent,
    bool isCompleted,
    _StepperColors colors,
  ) {
    final theme = Theme.of(context);

    // Calculate item color
    final itemColor = isCurrent
        ? (selectedColor ?? colors.selectedColor)
        : isCompleted
            ? (selectedColor ?? colors.selectedColor)
            : (unselectedColor ?? colors.unselectedColor);

    // Calculate item padding
    final itemPadding = EdgeInsets.symmetric(
      horizontal: size == AppStepperSize.small
          ? AppTheme.spacing4
          : size == AppStepperSize.medium
              ? AppTheme.spacing6
              : AppTheme.spacing8,
      vertical: size == AppStepperSize.small
          ? AppTheme.spacing2
          : size == AppStepperSize.medium
              ? AppTheme.spacing3
              : AppTheme.spacing4,
    );

    // Calculate item spacing
    final itemSpacing = size == AppStepperSize.small
        ? AppTheme.spacing2
        : size == AppStepperSize.medium
            ? AppTheme.spacing3
            : AppTheme.spacing4;

    // Calculate icon size
    final iconSize = size == AppStepperSize.small
        ? 20.0
        : size == AppStepperSize.medium
            ? 24.0
            : 28.0;

    // Calculate text style
    final textStyle = TextStyle(
      color: itemColor,
      fontSize: size == AppStepperSize.small
          ? 12.0
          : size == AppStepperSize.medium
              ? 14.0
              : 16.0,
      fontWeight: isCurrent ? FontWeight.w600 : FontWeight.w500,
    );

    Widget stepperItem = InkWell(
      onTap: () {
        if (onStepTapped != null) {
          onStepTapped!(index);
        }
      },
      borderRadius: BorderRadius.circular(
        size == AppStepperSize.small
            ? AppTheme.radius4
            : size == AppStepperSize.medium
                ? AppTheme.radius6
                : AppTheme.radius8,
      ),
      child: Padding(
        padding: itemPadding,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: iconSize * 2,
              height: iconSize * 2,
              decoration: BoxDecoration(
                color: itemColor.withOpacity(0.1),
                shape: BoxShape.circle,
                border: Border.all(
                  color: itemColor,
                  width: 2.0,
                ),
              ),
              child: Center(
                child: isCompleted
                    ? Icon(
                        Icons.check,
                        size: iconSize,
                        color: itemColor,
                      )
                    : Text(
                        '${index + 1}',
                        style: textStyle,
                      ),
              ),
            ),
            SizedBox(width: itemSpacing),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  item.label,
                  style: textStyle,
                ),
                if (item.subtitle != null) ...[
                  SizedBox(height: itemSpacing / 2),
                  Text(
                    item.subtitle!,
                    style: textStyle.copyWith(
                      fontSize: size == AppStepperSize.small
                          ? 10.0
                          : size == AppStepperSize.medium
                              ? 12.0
                              : 14.0,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );

    if (animate) {
      stepperItem = AppAnimations.fadeIn(
        stepperItem,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return stepperItem;
  }

  Widget _buildStepperLine(
    BuildContext context,
    bool isCompleted,
    _StepperColors colors,
  ) {
    final theme = Theme.of(context);

    // Calculate line color
    final lineColor = isCompleted
        ? (selectedColor ?? colors.selectedColor)
        : (unselectedColor ?? colors.unselectedColor);

    // Calculate line height
    final lineHeight = size == AppStepperSize.small
        ? 24.0
        : size == AppStepperSize.medium
            ? 32.0
            : 40.0;

    Widget stepperLine = Container(
      width: 2.0,
      height: lineHeight,
      color: lineColor,
    );

    if (animate) {
      stepperLine = AppAnimations.fadeIn(
        stepperLine,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return stepperLine;
  }

  _StepperColors _getStepperColors(ThemeData theme) {
    switch (variant) {
      case AppStepperVariant.standard:
        return _StepperColors(
          backgroundColor: theme.colorScheme.surface,
          selectedColor: theme.colorScheme.primary,
          unselectedColor: theme.colorScheme.onSurface.withOpacity(0.6),
        );
      case AppStepperVariant.elevated:
        return _StepperColors(
          backgroundColor: theme.colorScheme.surface,
          selectedColor: theme.colorScheme.primary,
          unselectedColor: theme.colorScheme.onSurface.withOpacity(0.6),
        );
      case AppStepperVariant.outlined:
        return _StepperColors(
          backgroundColor: theme.colorScheme.surface,
          selectedColor: theme.colorScheme.primary,
          unselectedColor: theme.colorScheme.onSurface.withOpacity(0.6),
        );
    }
  }
}

class _StepperColors {
  final Color backgroundColor;
  final Color selectedColor;
  final Color unselectedColor;

  const _StepperColors({
    required this.backgroundColor,
    required this.selectedColor,
    required this.unselectedColor,
  });
}

class AppStepperItem {
  final String label;
  final String? subtitle;

  const AppStepperItem({
    required this.label,
    this.subtitle,
  });
} 
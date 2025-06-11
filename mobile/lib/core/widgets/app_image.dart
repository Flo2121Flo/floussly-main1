import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';

enum AppImageVariant {
  standard,
  filled,
  outlined,
}

enum AppImageSize {
  small,
  medium,
  large,
}

class AppImage extends StatelessWidget {
  final String imageUrl;
  final AppImageVariant variant;
  final AppImageSize size;
  final Color? backgroundColor;
  final Color? borderColor;
  final double? elevation;
  final EdgeInsetsGeometry? margin;
  final EdgeInsetsGeometry? padding;
  final double? borderRadius;
  final BoxFit? fit;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;
  final VoidCallback? onTap;
  final bool disabled;
  final Widget? placeholder;
  final Widget? errorWidget;

  const AppImage({
    Key? key,
    required this.imageUrl,
    this.variant = AppImageVariant.standard,
    this.size = AppImageSize.medium,
    this.backgroundColor,
    this.borderColor,
    this.elevation,
    this.margin,
    this.padding,
    this.borderRadius,
    this.fit,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
    this.onTap,
    this.disabled = false,
    this.placeholder,
    this.errorWidget,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate image colors
    final imageColors = _getImageColors(theme);

    // Calculate image margin
    final imageMargin = margin ??
        EdgeInsets.all(
          size == AppImageSize.small
              ? AppTheme.spacing1
              : size == AppImageSize.medium
                  ? AppTheme.spacing2
                  : AppTheme.spacing3,
        );

    // Calculate image padding
    final imagePadding = padding ??
        EdgeInsets.all(
          size == AppImageSize.small
              ? AppTheme.spacing2
              : size == AppImageSize.medium
                  ? AppTheme.spacing3
                  : AppTheme.spacing4,
        );

    // Calculate image elevation
    final imageElevation = elevation ??
        (variant == AppImageVariant.standard
            ? (size == AppImageSize.small
                ? 1.0
                : size == AppImageSize.medium
                    ? 2.0
                    : 4.0)
            : 0.0);

    // Calculate image border radius
    final imageBorderRadius = borderRadius ??
        (size == AppImageSize.small
            ? AppTheme.radius2
            : size == AppImageSize.medium
                ? AppTheme.radius3
                : AppTheme.radius4);

    // Calculate image size
    final imageSize = size == AppImageSize.small
        ? 48.0
        : size == AppImageSize.medium
            ? 64.0
            : 96.0;

    Widget imageWidget = Container(
      width: imageSize,
      height: imageSize,
      decoration: BoxDecoration(
        color: backgroundColor ?? imageColors.backgroundColor,
        borderRadius: BorderRadius.circular(imageBorderRadius),
        border: variant == AppImageVariant.outlined
            ? Border.all(
                color: borderColor ?? imageColors.borderColor,
                width: 1.0,
              )
            : null,
        boxShadow: variant == AppImageVariant.standard
            ? [
                BoxShadow(
                  color: theme.shadowColor.withOpacity(0.1),
                  blurRadius: imageElevation * 2,
                  offset: Offset(0, imageElevation),
                ),
              ]
            : null,
      ),
      margin: imageMargin,
      padding: imagePadding,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(imageBorderRadius),
        child: Image.network(
          imageUrl,
          fit: fit ?? BoxFit.cover,
          loadingBuilder: (context, child, loadingProgress) {
            if (loadingProgress == null) return child;
            return placeholder ??
                Center(
                  child: CircularProgressIndicator(
                    value: loadingProgress.expectedTotalBytes != null
                        ? loadingProgress.cumulativeBytesLoaded /
                            loadingProgress.expectedTotalBytes!
                        : null,
                  ),
                );
          },
          errorBuilder: (context, error, stackTrace) {
            return errorWidget ??
                Icon(
                  Icons.error_outline,
                  color: theme.colorScheme.error,
                );
          },
        ),
      ),
    );

    if (onTap != null && !disabled) {
      imageWidget = InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(imageBorderRadius),
        child: imageWidget,
      );
    }

    if (animate) {
      imageWidget = AppAnimations.fadeIn(
        imageWidget,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return imageWidget;
  }

  _ImageColors _getImageColors(ThemeData theme) {
    switch (variant) {
      case AppImageVariant.standard:
        return _ImageColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
        );
      case AppImageVariant.filled:
        return _ImageColors(
          backgroundColor: theme.colorScheme.surfaceVariant,
          borderColor: theme.colorScheme.outline,
        );
      case AppImageVariant.outlined:
        return _ImageColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
        );
    }
  }
}

class _ImageColors {
  final Color backgroundColor;
  final Color borderColor;

  const _ImageColors({
    required this.backgroundColor,
    required this.borderColor,
  });
} 
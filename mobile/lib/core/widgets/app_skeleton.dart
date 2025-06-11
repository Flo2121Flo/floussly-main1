import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';

enum AppSkeletonVariant {
  standard,
  filled,
  outlined,
}

enum AppSkeletonSize {
  small,
  medium,
  large,
}

class AppSkeleton extends StatelessWidget {
  final double? width;
  final double? height;
  final AppSkeletonVariant variant;
  final AppSkeletonSize size;
  final Color? backgroundColor;
  final Color? shimmerColor;
  final double? borderRadius;
  final EdgeInsetsGeometry? margin;
  final EdgeInsetsGeometry? padding;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;
  final bool isCircular;
  final bool isText;
  final bool isAvatar;
  final bool isImage;
  final bool isButton;
  final bool isCard;
  final bool isListTile;

  const AppSkeleton({
    Key? key,
    this.width,
    this.height,
    this.variant = AppSkeletonVariant.standard,
    this.size = AppSkeletonSize.medium,
    this.backgroundColor,
    this.shimmerColor,
    this.borderRadius,
    this.margin,
    this.padding,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
    this.isCircular = false,
    this.isText = false,
    this.isAvatar = false,
    this.isImage = false,
    this.isButton = false,
    this.isCard = false,
    this.isListTile = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate skeleton colors
    final skeletonColors = _getSkeletonColors(theme);

    // Calculate skeleton size
    final skeletonSize = _getSkeletonSize();

    // Calculate skeleton margin
    final skeletonMargin = margin ??
        EdgeInsets.all(
          size == AppSkeletonSize.small
              ? AppTheme.spacing2
              : size == AppSkeletonSize.medium
                  ? AppTheme.spacing4
                  : AppTheme.spacing6,
        );

    // Calculate skeleton padding
    final skeletonPadding = padding ??
        EdgeInsets.all(
          size == AppSkeletonSize.small
              ? AppTheme.spacing2
              : size == AppSkeletonSize.medium
                  ? AppTheme.spacing4
                  : AppTheme.spacing6,
        );

    // Calculate skeleton border radius
    final skeletonBorderRadius = borderRadius ??
        (isCircular
            ? skeletonSize.width / 2
            : size == AppSkeletonSize.small
                ? AppTheme.radius2
                : size == AppSkeletonSize.medium
                    ? AppTheme.radius4
                    : AppTheme.radius6);

    Widget skeleton = Container(
      width: width ?? skeletonSize.width,
      height: height ?? skeletonSize.height,
      margin: skeletonMargin,
      padding: skeletonPadding,
      decoration: BoxDecoration(
        color: backgroundColor ?? skeletonColors.backgroundColor,
        borderRadius: BorderRadius.circular(skeletonBorderRadius),
        border: variant == AppSkeletonVariant.outlined
            ? Border.all(
                color: theme.colorScheme.outline,
                width: 1.0,
              )
            : null,
      ),
      child: ShimmerLoading(
        color: shimmerColor ?? skeletonColors.shimmerColor,
        child: Container(
          width: double.infinity,
          height: double.infinity,
          decoration: BoxDecoration(
            color: theme.colorScheme.surface,
            borderRadius: BorderRadius.circular(skeletonBorderRadius),
          ),
        ),
      ),
    );

    if (animate) {
      skeleton = AppAnimations.fadeIn(
        skeleton,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return skeleton;
  }

  _SkeletonSize _getSkeletonSize() {
    if (isText) {
      return _SkeletonSize(
        width: size == AppSkeletonSize.small
            ? 100.0
            : size == AppSkeletonSize.medium
                ? 200.0
                : 300.0,
        height: size == AppSkeletonSize.small
            ? 16.0
            : size == AppSkeletonSize.medium
                ? 20.0
                : 24.0,
      );
    } else if (isAvatar) {
      return _SkeletonSize(
        width: size == AppSkeletonSize.small
            ? 32.0
            : size == AppSkeletonSize.medium
                ? 40.0
                : 48.0,
        height: size == AppSkeletonSize.small
            ? 32.0
            : size == AppSkeletonSize.medium
                ? 40.0
                : 48.0,
      );
    } else if (isImage) {
      return _SkeletonSize(
        width: size == AppSkeletonSize.small
            ? 100.0
            : size == AppSkeletonSize.medium
                ? 200.0
                : 300.0,
        height: size == AppSkeletonSize.small
            ? 100.0
            : size == AppSkeletonSize.medium
                ? 200.0
                : 300.0,
      );
    } else if (isButton) {
      return _SkeletonSize(
        width: size == AppSkeletonSize.small
            ? 80.0
            : size == AppSkeletonSize.medium
                ? 120.0
                : 160.0,
        height: size == AppSkeletonSize.small
            ? 32.0
            : size == AppSkeletonSize.medium
                ? 40.0
                : 48.0,
      );
    } else if (isCard) {
      return _SkeletonSize(
        width: size == AppSkeletonSize.small
            ? 200.0
            : size == AppSkeletonSize.medium
                ? 300.0
                : 400.0,
        height: size == AppSkeletonSize.small
            ? 100.0
            : size == AppSkeletonSize.medium
                ? 150.0
                : 200.0,
      );
    } else if (isListTile) {
      return _SkeletonSize(
        width: size == AppSkeletonSize.small
            ? 200.0
            : size == AppSkeletonSize.medium
                ? 300.0
                : 400.0,
        height: size == AppSkeletonSize.small
            ? 48.0
            : size == AppSkeletonSize.medium
                ? 56.0
                : 64.0,
      );
    } else {
      return _SkeletonSize(
        width: size == AppSkeletonSize.small
            ? 100.0
            : size == AppSkeletonSize.medium
                ? 200.0
                : 300.0,
        height: size == AppSkeletonSize.small
            ? 100.0
            : size == AppSkeletonSize.medium
                ? 200.0
                : 300.0,
      );
    }
  }

  _SkeletonColors _getSkeletonColors(ThemeData theme) {
    switch (variant) {
      case AppSkeletonVariant.standard:
        return _SkeletonColors(
          backgroundColor: theme.colorScheme.surfaceVariant,
          shimmerColor: theme.colorScheme.primary.withOpacity(0.1),
        );
      case AppSkeletonVariant.filled:
        return _SkeletonColors(
          backgroundColor: theme.colorScheme.surfaceVariant.withOpacity(0.5),
          shimmerColor: theme.colorScheme.primary.withOpacity(0.1),
        );
      case AppSkeletonVariant.outlined:
        return _SkeletonColors(
          backgroundColor: theme.colorScheme.surface,
          shimmerColor: theme.colorScheme.primary.withOpacity(0.1),
        );
    }
  }
}

class _SkeletonSize {
  final double width;
  final double height;

  const _SkeletonSize({
    required this.width,
    required this.height,
  });
}

class _SkeletonColors {
  final Color backgroundColor;
  final Color shimmerColor;

  const _SkeletonColors({
    required this.backgroundColor,
    required this.shimmerColor,
  });
}

class ShimmerLoading extends StatefulWidget {
  final Widget child;
  final Color color;

  const ShimmerLoading({
    Key? key,
    required this.child,
    required this.color,
  }) : super(key: key);

  @override
  State<ShimmerLoading> createState() => _ShimmerLoadingState();
}

class _ShimmerLoadingState extends State<ShimmerLoading>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat();
    _animation = Tween<double>(begin: -1.0, end: 2.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeInOut,
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return ShaderMask(
          blendMode: BlendMode.srcATop,
          shaderCallback: (bounds) {
            return LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                widget.color.withOpacity(0.0),
                widget.color.withOpacity(0.5),
                widget.color.withOpacity(0.0),
              ],
              stops: [
                0.0,
                0.5,
                1.0,
              ],
              transform: _SlidingGradientTransform(
                slidePercent: _animation.value,
              ),
            ).createShader(bounds);
          },
          child: child,
        );
      },
      child: widget.child,
    );
  }
}

class _SlidingGradientTransform extends GradientTransform {
  const _SlidingGradientTransform({
    required this.slidePercent,
  });

  final double slidePercent;

  @override
  Matrix4? transform(Rect bounds, {TextDirection? textDirection}) {
    return Matrix4.translationValues(bounds.width * slidePercent, 0.0, 0.0);
  }
}

class AppSkeletonText extends StatelessWidget {
  final int lines;
  final AppSkeletonSize size;
  final double? width;
  final double? spacing;
  final Color? color;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppSkeletonText({
    Key? key,
    this.lines = 1,
    this.size = AppSkeletonSize.medium,
    this.width,
    this.spacing,
    this.color,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Calculate line spacing
    final lineSpacing = spacing ??
        (size == AppSkeletonSize.small
            ? AppTheme.spacing4
            : size == AppSkeletonSize.medium
                ? AppTheme.spacing8
                : AppTheme.spacing12);

    Widget skeletonText = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (var i = 0; i < lines; i++) ...[
          AppSkeleton(
            variant: AppSkeletonVariant.text,
            size: size,
            width: width,
            color: color,
            animate: animate,
            animationDuration: animationDuration,
            animationCurve: animationCurve,
          ),
          if (i < lines - 1) SizedBox(height: lineSpacing),
        ],
      ],
    );

    if (animate) {
      skeletonText = AppAnimations.fadeIn(
        skeletonText,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return skeletonText;
  }
}

class AppSkeletonAvatar extends StatelessWidget {
  final AppSkeletonSize size;
  final Color? color;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppSkeletonAvatar({
    Key? key,
    this.size = AppSkeletonSize.medium,
    this.color,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AppSkeleton(
      variant: AppSkeletonVariant.circular,
      size: size,
      color: color,
      animate: animate,
      animationDuration: animationDuration,
      animationCurve: animationCurve,
    );
  }
}

class AppSkeletonImage extends StatelessWidget {
  final double? width;
  final double? height;
  final AppSkeletonSize size;
  final Color? color;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppSkeletonImage({
    Key? key,
    this.width,
    this.height,
    this.size = AppSkeletonSize.medium,
    this.color,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AppSkeleton(
      variant: AppSkeletonVariant.rounded,
      size: size,
      width: width,
      height: height,
      color: color,
      animate: animate,
      animationDuration: animationDuration,
      animationCurve: animationCurve,
    );
  }
}

class AppSkeletonList extends StatelessWidget {
  final int items;
  final AppSkeletonSize size;
  final double? itemHeight;
  final double? spacing;
  final Color? color;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppSkeletonList({
    Key? key,
    this.items = 3,
    this.size = AppSkeletonSize.medium,
    this.itemHeight,
    this.spacing,
    this.color,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Calculate item spacing
    final itemSpacing = spacing ??
        (size == AppSkeletonSize.small
            ? AppTheme.spacing8
            : size == AppSkeletonSize.medium
                ? AppTheme.spacing12
                : AppTheme.spacing16);

    Widget skeletonList = Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        for (var i = 0; i < items; i++) ...[
          AppSkeleton(
            variant: AppSkeletonVariant.rectangular,
            size: size,
            height: itemHeight,
            color: color,
            animate: animate,
            animationDuration: animationDuration,
            animationCurve: animationCurve,
          ),
          if (i < items - 1) SizedBox(height: itemSpacing),
        ],
      ],
    );

    if (animate) {
      skeletonList = AppAnimations.fadeIn(
        skeletonList,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return skeletonList;
  }
}

class AppSkeletonCard extends StatelessWidget {
  final double? width;
  final double? height;
  final AppSkeletonSize size;
  final Color? color;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppSkeletonCard({
    Key? key,
    this.width,
    this.height,
    this.size = AppSkeletonSize.medium,
    this.color,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AppSkeleton(
      variant: AppSkeletonVariant.rounded,
      size: size,
      width: width,
      height: height,
      color: color,
      animate: animate,
      animationDuration: animationDuration,
      animationCurve: animationCurve,
    );
  }
} 
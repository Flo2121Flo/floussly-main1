import 'package:flutter/material.dart';
import 'app_theme.dart';

class AppAnimations {
  // Page transitions
  static PageRouteBuilder<T> fadeThrough<T>(Widget page) {
    return PageRouteBuilder<T>(
      pageBuilder: (context, animation, secondaryAnimation) => page,
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        return FadeTransition(
          opacity: animation,
          child: child,
        );
      },
      transitionDuration: AppTheme.mediumAnimation,
    );
  }

  static PageRouteBuilder<T> slideUp<T>(Widget page) {
    return PageRouteBuilder<T>(
      pageBuilder: (context, animation, secondaryAnimation) => page,
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        const begin = Offset(0.0, 1.0);
        const end = Offset.zero;
        const curve = Curves.easeOutCubic;
        var tween = Tween(begin: begin, end: end).chain(CurveTween(curve: curve));
        var offsetAnimation = animation.drive(tween);
        return SlideTransition(
          position: offsetAnimation,
          child: child,
        );
      },
      transitionDuration: AppTheme.mediumAnimation,
    );
  }

  // Button animations
  static Widget scaleOnTap({
    required Widget child,
    required VoidCallback onTap,
    double scale = 0.98,
  }) {
    return GestureDetector(
      onTapDown: (_) => onTap(),
      child: TweenAnimationBuilder<double>(
        tween: Tween(begin: 1.0, end: scale),
        duration: AppTheme.shortAnimation,
        builder: (context, value, child) {
          return Transform.scale(
            scale: value,
            child: child,
          );
        },
        child: child,
      ),
    );
  }

  // List item animations
  static Widget staggeredListItem({
    required Widget child,
    required int index,
  }) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.0, end: 1.0),
      duration: AppTheme.mediumAnimation,
      curve: Curves.easeOutCubic,
      builder: (context, value, child) {
        return Transform.translate(
          offset: Offset(0, 20 * (1 - value)),
          child: Opacity(
            opacity: value,
            child: child,
          ),
        );
      },
      child: child,
    );
  }

  // Loading animations
  static Widget shimmerLoading({
    required Widget child,
    required bool isLoading,
  }) {
    return AnimatedSwitcher(
      duration: AppTheme.shortAnimation,
      child: isLoading
          ? ShimmerLoading(child: child)
          : child,
    );
  }

  // Success/Error animations
  static Widget successAnimation({
    required Widget child,
    required bool isSuccess,
  }) {
    return AnimatedSwitcher(
      duration: AppTheme.shortAnimation,
      child: isSuccess
          ? TweenAnimationBuilder<double>(
              tween: Tween(begin: 0.0, end: 1.0),
              duration: AppTheme.shortAnimation,
              builder: (context, value, child) {
                return Transform.scale(
                  scale: 0.95 + (0.05 * value),
                  child: child,
                );
              },
              child: child,
            )
          : child,
    );
  }

  static Widget errorAnimation({
    required Widget child,
    required bool hasError,
  }) {
    return AnimatedSwitcher(
      duration: AppTheme.shortAnimation,
      child: hasError
          ? TweenAnimationBuilder<double>(
              tween: Tween(begin: 0.0, end: 1.0),
              duration: AppTheme.shortAnimation,
              builder: (context, value, child) {
                return Transform.translate(
                  offset: Offset(5 * value, 0),
                  child: child,
                );
              },
              child: child,
            )
          : child,
    );
  }
}

class ShimmerLoading extends StatefulWidget {
  final Widget child;

  const ShimmerLoading({
    Key? key,
    required this.child,
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
          shaderCallback: (bounds) {
            return LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Colors.grey.shade300,
                Colors.grey.shade100,
                Colors.grey.shade300,
              ],
              stops: [
                0.0,
                _animation.value,
                1.0,
              ],
            ).createShader(bounds);
          },
          child: child,
        );
      },
      child: widget.child,
    );
  }
} 
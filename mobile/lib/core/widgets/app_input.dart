import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';

enum AppInputVariant {
  standard,
  filled,
  outlined,
}

enum AppInputSize {
  small,
  medium,
  large,
}

class AppInput extends StatelessWidget {
  final TextEditingController? controller;
  final String? initialValue;
  final FocusNode? focusNode;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final TextCapitalization textCapitalization;
  final TextStyle? style;
  final StrutStyle? strutStyle;
  final TextAlign textAlign;
  final TextAlignVertical? textAlignVertical;
  final TextDirection? textDirection;
  final bool readOnly;
  final bool? showCursor;
  final bool autofocus;
  final String obscuringCharacter;
  final bool obscureText;
  final bool autocorrect;
  final SmartDashesType? smartDashesType;
  final SmartQuotesType? smartQuotesType;
  final bool enableSuggestions;
  final int? maxLines;
  final int? minLines;
  final bool expands;
  final int? maxLength;
  final bool maxLengthEnforced;
  final MaxLengthEnforcement? maxLengthEnforcement;
  final ValueChanged<String>? onChanged;
  final VoidCallback? onEditingComplete;
  final ValueChanged<String>? onSubmitted;
  final AppInputVariant variant;
  final AppInputSize size;
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
  final bool showLabel;
  final String? label;
  final TextStyle? labelStyle;
  final bool showHint;
  final String? hint;
  final TextStyle? hintStyle;
  final bool showError;
  final String? error;
  final TextStyle? errorStyle;
  final bool showHelper;
  final String? helper;
  final TextStyle? helperStyle;
  final bool showIcon;
  final IconData? icon;
  final Color? iconColor;
  final double? iconSize;
  final bool showPrefix;
  final Widget? prefix;
  final bool showSuffix;
  final Widget? suffix;
  final bool showClear;
  final bool showPassword;
  final bool showLoading;
  final bool isLoading;
  final Color? loadingColor;
  final double? loadingSize;
  final bool showDisabled;
  final bool isDisabled;
  final Color? disabledColor;
  final double? disabledOpacity;
  final bool showSuccess;
  final bool isSuccess;
  final Color? successColor;
  final String? successText;
  final TextStyle? successTextStyle;
  final bool showWarning;
  final bool isWarning;
  final Color? warningColor;
  final String? warningText;
  final TextStyle? warningTextStyle;
  final bool showInfo;
  final bool isInfo;
  final Color? infoColor;
  final String? infoText;
  final TextStyle? infoTextStyle;

  const AppInput({
    Key? key,
    this.controller,
    this.initialValue,
    this.focusNode,
    this.keyboardType,
    this.textInputAction,
    this.textCapitalization = TextCapitalization.none,
    this.style,
    this.strutStyle,
    this.textAlign = TextAlign.start,
    this.textAlignVertical,
    this.textDirection,
    this.readOnly = false,
    this.showCursor,
    this.autofocus = false,
    this.obscuringCharacter = '•',
    this.obscureText = false,
    this.autocorrect = true,
    this.smartDashesType,
    this.smartQuotesType,
    this.enableSuggestions = true,
    this.maxLines = 1,
    this.minLines,
    this.expands = false,
    this.maxLength,
    this.maxLengthEnforced = true,
    this.maxLengthEnforcement,
    this.onChanged,
    this.onEditingComplete,
    this.onSubmitted,
    this.variant = AppInputVariant.standard,
    this.size = AppInputSize.medium,
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
    this.showLabel = false,
    this.label,
    this.labelStyle,
    this.showHint = false,
    this.hint,
    this.hintStyle,
    this.showError = false,
    this.error,
    this.errorStyle,
    this.showHelper = false,
    this.helper,
    this.helperStyle,
    this.showIcon = false,
    this.icon,
    this.iconColor,
    this.iconSize,
    this.showPrefix = false,
    this.prefix,
    this.showSuffix = false,
    this.suffix,
    this.showClear = false,
    this.showPassword = false,
    this.showLoading = false,
    this.isLoading = false,
    this.loadingColor,
    this.loadingSize,
    this.showDisabled = false,
    this.isDisabled = false,
    this.disabledColor,
    this.disabledOpacity,
    this.showSuccess = false,
    this.isSuccess = false,
    this.successColor,
    this.successText,
    this.successTextStyle,
    this.showWarning = false,
    this.isWarning = false,
    this.warningColor,
    this.warningText,
    this.warningTextStyle,
    this.showInfo = false,
    this.isInfo = false,
    this.infoColor,
    this.infoText,
    this.infoTextStyle,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate input colors
    final inputColors = _getInputColors(theme);

    // Calculate input margin
    final inputMargin = margin ??
        EdgeInsets.all(
          size == AppInputSize.small
              ? AppTheme.spacing1
              : size == AppInputSize.medium
                  ? AppTheme.spacing2
                  : AppTheme.spacing3,
        );

    // Calculate input padding
    final inputPadding = padding ??
        EdgeInsets.all(
          size == AppInputSize.small
              ? AppTheme.spacing2
              : size == AppInputSize.medium
                  ? AppTheme.spacing3
                  : AppTheme.spacing4,
        );

    // Calculate input elevation
    final inputElevation = elevation ??
        (variant == AppInputVariant.standard
            ? (size == AppInputSize.small
                ? 1.0
                : size == AppInputSize.medium
                    ? 2.0
                    : 4.0)
            : 0.0);

    // Calculate input border radius
    final inputBorderRadius = borderRadius ??
        (size == AppInputSize.small
            ? AppTheme.radius2
            : size == AppInputSize.medium
                ? AppTheme.radius3
                : AppTheme.radius4);

    // Calculate input spacing
    final inputSpacing = size == AppInputSize.small
        ? AppTheme.spacing1
        : size == AppInputSize.medium
            ? AppTheme.spacing2
            : AppTheme.spacing3;

    // Calculate input icon size
    final inputIconSize = size == AppInputSize.small
        ? 16.0
        : size == AppInputSize.medium
            ? 18.0
            : 20.0;

    // Calculate input text style
    final inputTextStyle = TextStyle(
      color: theme.colorScheme.onSurface,
      fontSize: size == AppInputSize.small
          ? 14.0
          : size == AppInputSize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w400,
    );

    // Calculate input label style
    final inputLabelStyle = TextStyle(
      color: theme.colorScheme.onSurface,
      fontSize: size == AppInputSize.small
          ? 12.0
          : size == AppInputSize.medium
              ? 14.0
              : 16.0,
      fontWeight: FontWeight.w500,
    );

    // Calculate input hint style
    final inputHintStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppInputSize.small
          ? 12.0
          : size == AppInputSize.medium
              ? 14.0
              : 16.0,
      fontWeight: FontWeight.w400,
    );

    // Calculate input helper style
    final inputHelperStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppInputSize.small
          ? 12.0
          : size == AppInputSize.medium
              ? 14.0
              : 16.0,
      fontWeight: FontWeight.w400,
    );

    // Calculate input error style
    final inputErrorStyle = TextStyle(
      color: theme.colorScheme.error,
      fontSize: size == AppInputSize.small
          ? 12.0
          : size == AppInputSize.medium
              ? 14.0
              : 16.0,
      fontWeight: FontWeight.w400,
    );

    // Calculate input loading size
    final inputLoadingSize = size == AppInputSize.small
        ? 16.0
        : size == AppInputSize.medium
            ? 18.0
            : 20.0;

    Widget input = Container(
      decoration: BoxDecoration(
        color: showBackground
            ? backgroundColor ?? inputColors.backgroundColor
            : Colors.transparent,
        borderRadius: BorderRadius.circular(inputBorderRadius),
        border: showBorder && variant == AppInputVariant.outlined
            ? Border.all(
                color: borderColor ?? inputColors.borderColor,
                width: 1.0,
              )
            : null,
        boxShadow: showShadow && variant == AppInputVariant.standard
            ? [
                BoxShadow(
                  color: theme.shadowColor.withOpacity(0.1),
                  blurRadius: inputElevation * 2,
                  offset: Offset(0, inputElevation),
                ),
              ]
            : null,
      ),
      margin: inputMargin,
      padding: inputPadding,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (showLabel && label != null) ...[
            DefaultTextStyle(
              style: labelStyle ?? inputLabelStyle,
              child: Text(label!),
            ),
            SizedBox(height: inputSpacing / 2),
          ],
          Row(
            children: [
              if (showIcon && icon != null) ...[
                Icon(
                  icon,
                  color: iconColor ?? theme.colorScheme.onSurface,
                  size: iconSize ?? inputIconSize,
                ),
                SizedBox(width: inputSpacing),
              ],
              if (showPrefix && prefix != null) ...[
                prefix!,
                SizedBox(width: inputSpacing),
              ],
              Expanded(
                child: TextField(
                  controller: controller,
                  initialValue: initialValue,
                  focusNode: focusNode,
                  keyboardType: keyboardType,
                  textInputAction: textInputAction,
                  textCapitalization: textCapitalization,
                  style: style ?? inputTextStyle,
                  strutStyle: strutStyle,
                  textAlign: textAlign,
                  textAlignVertical: textAlignVertical,
                  textDirection: textDirection,
                  readOnly: readOnly,
                  showCursor: showCursor,
                  autofocus: autofocus,
                  obscuringCharacter: obscuringCharacter,
                  obscureText: obscureText,
                  autocorrect: autocorrect,
                  smartDashesType: smartDashesType,
                  smartQuotesType: smartQuotesType,
                  enableSuggestions: enableSuggestions,
                  maxLines: maxLines,
                  minLines: minLines,
                  expands: expands,
                  maxLength: maxLength,
                  maxLengthEnforced: maxLengthEnforced,
                  maxLengthEnforcement: maxLengthEnforcement,
                  onChanged: onChanged,
                  onEditingComplete: onEditingComplete,
                  onSubmitted: onSubmitted,
                  decoration: InputDecoration(
                    hintText: showHint ? hint : null,
                    hintStyle: hintStyle ?? inputHintStyle,
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.zero,
                  ),
                ),
              ),
              if (showSuffix && suffix != null) ...[
                SizedBox(width: inputSpacing),
                suffix!,
              ],
              if (showClear) ...[
                SizedBox(width: inputSpacing),
                IconButton(
                  icon: Icon(
                    Icons.clear,
                    color: theme.colorScheme.onSurface,
                    size: iconSize ?? inputIconSize,
                  ),
                  onPressed: () {
                    controller?.clear();
                  },
                ),
              ],
              if (showPassword) ...[
                SizedBox(width: inputSpacing),
                IconButton(
                  icon: Icon(
                    obscureText ? Icons.visibility : Icons.visibility_off,
                    color: theme.colorScheme.onSurface,
                    size: iconSize ?? inputIconSize,
                  ),
                  onPressed: () {
                    // TODO: Implement password visibility toggle
                  },
                ),
              ],
              if (showLoading && isLoading) ...[
                SizedBox(width: inputSpacing),
                SizedBox(
                  width: loadingSize ?? inputLoadingSize,
                  height: loadingSize ?? inputLoadingSize,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.0,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      loadingColor ?? theme.colorScheme.onSurface,
                    ),
                  ),
                ),
              ],
            ],
          ),
          if (showHelper && helper != null) ...[
            SizedBox(height: inputSpacing / 2),
            DefaultTextStyle(
              style: helperStyle ?? inputHelperStyle,
              child: Text(helper!),
            ),
          ],
          if (showError && error != null) ...[
            SizedBox(height: inputSpacing / 2),
            DefaultTextStyle(
              style: errorStyle ?? inputErrorStyle,
              child: Text(error!),
            ),
          ],
        ],
      ),
    );

    if (animate && showAnimation) {
      input = AppAnimations.fadeIn(
        input,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return input;
  }

  _InputColors _getInputColors(ThemeData theme) {
    switch (variant) {
      case AppInputVariant.standard:
        return _InputColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
        );
      case AppInputVariant.filled:
        return _InputColors(
          backgroundColor: theme.colorScheme.surfaceVariant,
          borderColor: theme.colorScheme.outline,
        );
      case AppInputVariant.outlined:
        return _InputColors(
          backgroundColor: Colors.transparent,
          borderColor: theme.colorScheme.outline,
        );
    }
  }
}

class _InputColors {
  final Color backgroundColor;
  final Color borderColor;

  const _InputColors({
    required this.backgroundColor,
    required this.borderColor,
  });
}

class AppInputHeader extends StatelessWidget {
  final Widget? leading;
  final Widget? title;
  final Widget? subtitle;
  final List<Widget>? actions;
  final AppInputSize size;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppInputHeader({
    Key? key,
    this.leading,
    this.title,
    this.subtitle,
    this.actions,
    this.size = AppInputSize.medium,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate header spacing
    final headerSpacing = size == AppInputSize.small
        ? AppTheme.spacing2
        : size == AppInputSize.medium
            ? AppTheme.spacing3
            : AppTheme.spacing4;

    // Calculate title style
    final titleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppInputSize.small
          ? 14.0
          : size == AppInputSize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w600,
    );

    // Calculate subtitle style
    final subtitleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant.withOpacity(0.6),
      fontSize: size == AppInputSize.small
          ? 12.0
          : size == AppInputSize.medium
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

class AppInputFooter extends StatelessWidget {
  final List<Widget>? actions;
  final AppInputSize size;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppInputFooter({
    Key? key,
    this.actions,
    this.size = AppInputSize.medium,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate footer spacing
    final footerSpacing = size == AppInputSize.small
        ? AppTheme.spacing2
        : size == AppInputSize.medium
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

class AppSearchInput extends StatelessWidget {
  final String? hint;
  final String? error;
  final bool enabled;
  final bool readOnly;
  final bool autofocus;
  final TextEditingController? controller;
  final FocusNode? focusNode;
  final Function(String)? onChanged;
  final Function(String)? onSubmitted;
  final VoidCallback? onTap;
  final VoidCallback? onClear;
  final Widget? prefix;
  final Widget? suffix;
  final AppInputSize size;
  final Color? backgroundColor;
  final Color? borderColor;
  final Color? errorColor;
  final Color? textColor;
  final Color? hintColor;
  final double? width;
  final double? height;
  final EdgeInsets? contentPadding;
  final BorderRadius? borderRadius;

  const AppSearchInput({
    Key? key,
    this.hint,
    this.error,
    this.enabled = true,
    this.readOnly = false,
    this.autofocus = false,
    this.controller,
    this.focusNode,
    this.onChanged,
    this.onSubmitted,
    this.onTap,
    this.onClear,
    this.prefix,
    this.suffix,
    this.size = AppInputSize.medium,
    this.backgroundColor,
    this.borderColor,
    this.errorColor,
    this.textColor,
    this.hintColor,
    this.width,
    this.height,
    this.contentPadding,
    this.borderRadius,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AppInput(
      hint: hint ?? 'Search...',
      error: error,
      enabled: enabled,
      readOnly: readOnly,
      autofocus: autofocus,
      showClearButton: true,
      controller: controller,
      focusNode: focusNode,
      onChanged: onChanged,
      onSubmitted: onSubmitted,
      onTap: onTap,
      onClear: onClear,
      prefix: prefix ??
          Icon(
            Icons.search,
            color: theme.colorScheme.onSurface.withOpacity(0.5),
          ),
      suffix: suffix,
      size: size,
      backgroundColor: backgroundColor,
      borderColor: borderColor,
      errorColor: errorColor,
      textColor: textColor,
      hintColor: hintColor,
      width: width,
      height: height,
      contentPadding: contentPadding,
      borderRadius: borderRadius,
    );
  }
}

class AppPasswordInput extends StatefulWidget {
  final String? label;
  final String? hint;
  final String? error;
  final String? helper;
  final bool enabled;
  final bool readOnly;
  final bool autofocus;
  final bool showClearButton;
  final TextEditingController? controller;
  final FocusNode? focusNode;
  final Function(String)? onChanged;
  final Function(String)? onSubmitted;
  final VoidCallback? onTap;
  final VoidCallback? onClear;
  final Widget? prefix;
  final Widget? suffix;
  final AppInputVariant variant;
  final AppInputSize size;
  final Color? backgroundColor;
  final Color? borderColor;
  final Color? errorColor;
  final Color? textColor;
  final Color? hintColor;
  final double? width;
  final double? height;
  final EdgeInsets? contentPadding;
  final BorderRadius? borderRadius;
  final bool showCounter;
  final bool showErrorIcon;
  final bool showHelperIcon;
  final Widget? errorIcon;
  final Widget? helperIcon;

  const AppPasswordInput({
    Key? key,
    this.label,
    this.hint,
    this.error,
    this.helper,
    this.enabled = true,
    this.readOnly = false,
    this.autofocus = false,
    this.showClearButton = false,
    this.controller,
    this.focusNode,
    this.onChanged,
    this.onSubmitted,
    this.onTap,
    this.onClear,
    this.prefix,
    this.suffix,
    this.variant = AppInputVariant.outlined,
    this.size = AppInputSize.medium,
    this.backgroundColor,
    this.borderColor,
    this.errorColor,
    this.textColor,
    this.hintColor,
    this.width,
    this.height,
    this.contentPadding,
    this.borderRadius,
    this.showCounter = false,
    this.showErrorIcon = true,
    this.showHelperIcon = true,
    this.errorIcon,
    this.helperIcon,
  }) : super(key: key);

  @override
  State<AppPasswordInput> createState() => _AppPasswordInputState();
}

class _AppPasswordInputState extends State<AppPasswordInput> {
  late TextEditingController _controller;
  late FocusNode _focusNode;
  bool _isFocused = false;
  bool _isObscured = true;

  @override
  void initState() {
    super.initState();
    _controller = widget.controller ?? TextEditingController();
    _focusNode = widget.focusNode ?? FocusNode();
    _focusNode.addListener(_handleFocusChange);
  }

  @override
  void dispose() {
    if (widget.controller == null) {
      _controller.dispose();
    }
    if (widget.focusNode == null) {
      _focusNode.dispose();
    }
    super.dispose();
  }

  void _handleFocusChange() {
    setState(() {
      _isFocused = _focusNode.hasFocus;
    });
  }

  void _handleClear() {
    _controller.clear();
    widget.onClear?.call();
    widget.onChanged?.call('');
  }

  void _toggleObscure() {
    setState(() {
      _isObscured = !_isObscured;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AppInput(
      label: widget.label,
      hint: widget.hint,
      error: widget.error,
      helper: widget.helper,
      obscureText: _isObscured,
      enabled: widget.enabled,
      readOnly: widget.readOnly,
      autofocus: widget.autofocus,
      showClearButton: widget.showClearButton,
      controller: _controller,
      focusNode: _focusNode,
      onChanged: widget.onChanged,
      onSubmitted: widget.onSubmitted,
      onTap: widget.onTap,
      onClear: _handleClear,
      prefix: widget.prefix ??
          Icon(
            Icons.lock_outline,
            color: theme.colorScheme.onSurface.withOpacity(0.5),
          ),
      suffix: IconButton(
        icon: Icon(
          _isObscured ? Icons.visibility : Icons.visibility_off,
        ),
        onPressed: _toggleObscure,
        color: theme.colorScheme.onSurface.withOpacity(0.5),
        padding: EdgeInsets.zero,
        constraints: const BoxConstraints(),
      ),
      variant: widget.variant,
      size: widget.size,
      backgroundColor: widget.backgroundColor,
      borderColor: widget.borderColor,
      errorColor: widget.errorColor,
      textColor: widget.textColor,
      hintColor: widget.hintColor,
      width: widget.width,
      height: widget.height,
      contentPadding: widget.contentPadding,
      borderRadius: widget.borderRadius,
      showCounter: widget.showCounter,
      showErrorIcon: widget.showErrorIcon,
      showHelperIcon: widget.showHelperIcon,
      errorIcon: widget.errorIcon,
      helperIcon: widget.helperIcon,
    );
  }
} 
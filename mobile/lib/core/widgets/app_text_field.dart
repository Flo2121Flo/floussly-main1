import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';

enum AppTextFieldVariant {
  standard,
  filled,
  outlined,
}

enum AppTextFieldSize {
  small,
  medium,
  large,
}

class AppTextField extends StatelessWidget {
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
  final List<TextInputFormatter>? inputFormatters;
  final bool? enabled;
  final double cursorWidth;
  final double? cursorHeight;
  final Radius? cursorRadius;
  final Color? cursorColor;
  final BoxHeightStyle selectionHeightStyle;
  final BoxWidthStyle selectionWidthStyle;
  final Brightness? keyboardAppearance;
  final EdgeInsets scrollPadding;
  final bool? enableInteractiveSelection;
  final TextSelectionControls? selectionControls;
  final VoidCallback? onTap;
  final MouseCursor? mouseCursor;
  final InputCounterWidgetBuilder? buildCounter;
  final ScrollPhysics? scrollPhysics;
  final ScrollController? scrollController;
  final Iterable<String>? autofillHints;
  final Clip clipBehavior;
  final String? restorationId;
  final bool scribbleEnabled;
  final AppTextFieldVariant variant;
  final AppTextFieldSize size;
  final Color? backgroundColor;
  final Color? borderColor;
  final Color? focusedBorderColor;
  final Color? errorBorderColor;
  final Color? disabledBorderColor;
  final Color? enabledBorderColor;
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
  final bool showPrefixIcon;
  final IconData? prefixIcon;
  final Color? prefixIconColor;
  final double? prefixIconSize;
  final bool showSuffix;
  final Widget? suffix;
  final bool showSuffixIcon;
  final IconData? suffixIcon;
  final Color? suffixIconColor;
  final double? suffixIconSize;
  final VoidCallback? onSuffixPressed;
  final bool showButton;
  final Widget? button;
  final bool showButtonIcon;
  final IconData? buttonIcon;
  final Color? buttonIconColor;
  final double? buttonIconSize;
  final VoidCallback? onButtonPressed;
  final bool showButtonText;
  final String? buttonText;
  final TextStyle? buttonTextStyle;
  final bool showButtonBackground;
  final Color? buttonBackgroundColor;
  final bool showButtonBorder;
  final Color? buttonBorderColor;
  final double? buttonBorderRadius;
  final bool showButtonShadow;
  final double? buttonElevation;
  final bool showButtonAnimation;
  final Duration? buttonAnimationDuration;
  final Curve? buttonAnimationCurve;

  const AppTextField({
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
    this.inputFormatters,
    this.enabled,
    this.cursorWidth = 2.0,
    this.cursorHeight,
    this.cursorRadius,
    this.cursorColor,
    this.selectionHeightStyle = BoxHeightStyle.tight,
    this.selectionWidthStyle = BoxWidthStyle.tight,
    this.keyboardAppearance,
    this.scrollPadding = const EdgeInsets.all(20.0),
    this.enableInteractiveSelection,
    this.selectionControls,
    this.onTap,
    this.mouseCursor,
    this.buildCounter,
    this.scrollPhysics,
    this.scrollController,
    this.autofillHints,
    this.clipBehavior = Clip.hardEdge,
    this.restorationId,
    this.scribbleEnabled = true,
    this.variant = AppTextFieldVariant.standard,
    this.size = AppTextFieldSize.medium,
    this.backgroundColor,
    this.borderColor,
    this.focusedBorderColor,
    this.errorBorderColor,
    this.disabledBorderColor,
    this.enabledBorderColor,
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
    this.showPrefixIcon = false,
    this.prefixIcon,
    this.prefixIconColor,
    this.prefixIconSize,
    this.showSuffix = false,
    this.suffix,
    this.showSuffixIcon = false,
    this.suffixIcon,
    this.suffixIconColor,
    this.suffixIconSize,
    this.onSuffixPressed,
    this.showButton = false,
    this.button,
    this.showButtonIcon = false,
    this.buttonIcon,
    this.buttonIconColor,
    this.buttonIconSize,
    this.onButtonPressed,
    this.showButtonText = false,
    this.buttonText,
    this.buttonTextStyle,
    this.showButtonBackground = false,
    this.buttonBackgroundColor,
    this.showButtonBorder = false,
    this.buttonBorderColor,
    this.buttonBorderRadius,
    this.showButtonShadow = false,
    this.buttonElevation,
    this.showButtonAnimation = false,
    this.buttonAnimationDuration,
    this.buttonAnimationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate text field colors
    final textFieldColors = _getTextFieldColors(theme);

    // Calculate text field margin
    final textFieldMargin = margin ??
        EdgeInsets.all(
          size == AppTextFieldSize.small
              ? AppTheme.spacing1
              : size == AppTextFieldSize.medium
                  ? AppTheme.spacing2
                  : AppTheme.spacing3,
        );

    // Calculate text field padding
    final textFieldPadding = padding ??
        EdgeInsets.symmetric(
          horizontal: size == AppTextFieldSize.small
              ? AppTheme.spacing2
              : size == AppTextFieldSize.medium
                  ? AppTheme.spacing3
                  : AppTheme.spacing4,
          vertical: size == AppTextFieldSize.small
              ? AppTheme.spacing1
              : size == AppTextFieldSize.medium
                  ? AppTheme.spacing2
                  : AppTheme.spacing3,
        );

    // Calculate text field elevation
    final textFieldElevation = elevation ??
        (variant == AppTextFieldVariant.standard
            ? (size == AppTextFieldSize.small
                ? 1.0
                : size == AppTextFieldSize.medium
                    ? 2.0
                    : 4.0)
            : 0.0);

    // Calculate text field border radius
    final textFieldBorderRadius = borderRadius ??
        (size == AppTextFieldSize.small
            ? AppTheme.radius2
            : size == AppTextFieldSize.medium
                ? AppTheme.radius3
                : AppTheme.radius4);

    // Calculate text field spacing
    final textFieldSpacing = size == AppTextFieldSize.small
        ? AppTheme.spacing1
        : size == AppTextFieldSize.medium
            ? AppTheme.spacing2
            : AppTheme.spacing3;

    // Calculate text field icon size
    final textFieldIconSize = size == AppTextFieldSize.small
        ? 16.0
        : size == AppTextFieldSize.medium
            ? 18.0
            : 20.0;

    // Calculate text field label style
    final textFieldLabelStyle = TextStyle(
      color: theme.colorScheme.onSurface,
      fontSize: size == AppTextFieldSize.small
          ? 14.0
          : size == AppTextFieldSize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w500,
    );

    // Calculate text field hint style
    final textFieldHintStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppTextFieldSize.small
          ? 14.0
          : size == AppTextFieldSize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w400,
    );

    // Calculate text field error style
    final textFieldErrorStyle = TextStyle(
      color: theme.colorScheme.error,
      fontSize: size == AppTextFieldSize.small
          ? 12.0
          : size == AppTextFieldSize.medium
              ? 14.0
              : 16.0,
      fontWeight: FontWeight.w400,
    );

    // Calculate text field helper style
    final textFieldHelperStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppTextFieldSize.small
          ? 12.0
          : size == AppTextFieldSize.medium
              ? 14.0
              : 16.0,
      fontWeight: FontWeight.w400,
    );

    Widget textField = Container(
      decoration: BoxDecoration(
        color: showBackground
            ? backgroundColor ?? textFieldColors.backgroundColor
            : Colors.transparent,
        borderRadius: BorderRadius.circular(textFieldBorderRadius),
        border: showBorder && variant == AppTextFieldVariant.outlined
            ? Border.all(
                color: borderColor ?? textFieldColors.borderColor,
                width: 1.0,
              )
            : null,
        boxShadow: showShadow && variant == AppTextFieldVariant.standard
            ? [
                BoxShadow(
                  color: theme.shadowColor.withOpacity(0.1),
                  blurRadius: textFieldElevation * 2,
                  offset: Offset(0, textFieldElevation),
                ),
              ]
            : null,
      ),
      margin: textFieldMargin,
      padding: textFieldPadding,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (showLabel && label != null) ...[
            DefaultTextStyle(
              style: labelStyle ?? textFieldLabelStyle,
              child: Text(label!),
            ),
            SizedBox(height: textFieldSpacing / 2),
          ],
          Row(
            children: [
              if (showIcon && icon != null) ...[
                Icon(
                  icon,
                  color: iconColor ?? theme.colorScheme.onSurface,
                  size: iconSize ?? textFieldIconSize,
                ),
                SizedBox(width: textFieldSpacing),
              ],
              if (showPrefix && prefix != null) ...[
                prefix!,
                SizedBox(width: textFieldSpacing),
              ],
              if (showPrefixIcon && prefixIcon != null) ...[
                Icon(
                  prefixIcon,
                  color: prefixIconColor ?? theme.colorScheme.onSurface,
                  size: prefixIconSize ?? textFieldIconSize,
                ),
                SizedBox(width: textFieldSpacing),
              ],
              Expanded(
                child: TextField(
                  controller: controller,
                  initialValue: initialValue,
                  focusNode: focusNode,
                  keyboardType: keyboardType,
                  textInputAction: textInputAction,
                  textCapitalization: textCapitalization,
                  style: style,
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
                  inputFormatters: inputFormatters,
                  enabled: enabled,
                  cursorWidth: cursorWidth,
                  cursorHeight: cursorHeight,
                  cursorRadius: cursorRadius,
                  cursorColor: cursorColor,
                  selectionHeightStyle: selectionHeightStyle,
                  selectionWidthStyle: selectionWidthStyle,
                  keyboardAppearance: keyboardAppearance,
                  scrollPadding: scrollPadding,
                  enableInteractiveSelection: enableInteractiveSelection,
                  selectionControls: selectionControls,
                  onTap: onTap,
                  mouseCursor: mouseCursor,
                  buildCounter: buildCounter,
                  scrollPhysics: scrollPhysics,
                  scrollController: scrollController,
                  autofillHints: autofillHints,
                  clipBehavior: clipBehavior,
                  restorationId: restorationId,
                  scribbleEnabled: scribbleEnabled,
                  decoration: InputDecoration(
                    hintText: showHint ? hint : null,
                    hintStyle: hintStyle ?? textFieldHintStyle,
                    errorText: showError ? error : null,
                    errorStyle: errorStyle ?? textFieldErrorStyle,
                    helperText: showHelper ? helper : null,
                    helperStyle: helperStyle ?? textFieldHelperStyle,
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.zero,
                  ),
                ),
              ),
              if (showSuffix && suffix != null) ...[
                SizedBox(width: textFieldSpacing),
                suffix!,
              ],
              if (showSuffixIcon && suffixIcon != null) ...[
                SizedBox(width: textFieldSpacing),
                IconButton(
                  icon: Icon(
                    suffixIcon,
                    color: suffixIconColor ?? theme.colorScheme.onSurface,
                    size: suffixIconSize ?? textFieldIconSize,
                  ),
                  onPressed: onSuffixPressed,
                ),
              ],
            ],
          ),
          if (showButton && button != null) ...[
            SizedBox(height: textFieldSpacing),
            button!,
          ],
          if (showButtonIcon && buttonIcon != null) ...[
            SizedBox(height: textFieldSpacing),
            IconButton(
              icon: Icon(
                buttonIcon,
                color: buttonIconColor ?? theme.colorScheme.onSurface,
                size: buttonIconSize ?? textFieldIconSize,
              ),
              onPressed: onButtonPressed,
            ),
          ],
          if (showButtonText && buttonText != null) ...[
            SizedBox(height: textFieldSpacing),
            DefaultTextStyle(
              style: buttonTextStyle ?? textFieldLabelStyle,
              child: Text(buttonText!),
            ),
          ],
        ],
      ),
    );

    if (animate && showAnimation) {
      textField = AppAnimations.fadeIn(
        textField,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return textField;
  }

  _TextFieldColors _getTextFieldColors(ThemeData theme) {
    switch (variant) {
      case AppTextFieldVariant.standard:
        return _TextFieldColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
        );
      case AppTextFieldVariant.filled:
        return _TextFieldColors(
          backgroundColor: theme.colorScheme.surfaceVariant,
          borderColor: theme.colorScheme.outline,
        );
      case AppTextFieldVariant.outlined:
        return _TextFieldColors(
          backgroundColor: Colors.transparent,
          borderColor: theme.colorScheme.outline,
        );
    }
  }
}

class _TextFieldColors {
  final Color backgroundColor;
  final Color borderColor;

  const _TextFieldColors({
    required this.backgroundColor,
    required this.borderColor,
  });
}

class AppSearchField extends StatelessWidget {
  final String? hint;
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;
  final VoidCallback? onClear;
  final bool enabled;
  final FocusNode? focusNode;

  const AppSearchField({
    Key? key,
    this.hint,
    this.controller,
    this.onChanged,
    this.onClear,
    this.enabled = true,
    this.focusNode,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AppTextField(
      controller: controller,
      hintText: hint ?? 'Search',
      onChanged: onChanged,
      enabled: enabled,
      focusNode: focusNode,
      prefix: Icon(
        Icons.search,
        color: theme.colorScheme.onSurface.withOpacity(0.5),
      ),
      suffix: controller?.text.isNotEmpty == true
          ? IconButton(
              icon: Icon(
                Icons.clear,
                color: theme.colorScheme.onSurface.withOpacity(0.5),
              ),
              onPressed: () {
                controller?.clear();
                onClear?.call();
              },
            )
          : null,
      textInputAction: TextInputAction.search,
    );
  }
}

class AppPasswordField extends StatefulWidget {
  final String? label;
  final String? hint;
  final String? error;
  final TextEditingController? controller;
  final TextInputAction textInputAction;
  final ValueChanged<String>? onChanged;
  final VoidCallback? onEditingComplete;
  final ValueChanged<String>? onSubmitted;
  final bool enabled;
  final bool readOnly;
  final bool autofocus;
  final FocusNode? focusNode;
  final String? Function(String?)? validator;
  final bool isRequired;

  const AppPasswordField({
    Key? key,
    this.label,
    this.hint,
    this.error,
    this.controller,
    this.textInputAction = TextInputAction.next,
    this.onChanged,
    this.onEditingComplete,
    this.onSubmitted,
    this.enabled = true,
    this.readOnly = false,
    this.autofocus = false,
    this.focusNode,
    this.validator,
    this.isRequired = false,
  }) : super(key: key);

  @override
  State<AppPasswordField> createState() => _AppPasswordFieldState();
}

class _AppPasswordFieldState extends State<AppPasswordField> {
  bool _obscureText = true;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AppTextField(
      label: widget.label,
      hint: widget.hint,
      error: widget.error,
      obscureText: _obscureText,
      controller: widget.controller,
      textInputAction: widget.textInputAction,
      onChanged: widget.onChanged,
      onEditingComplete: widget.onEditingComplete,
      onSubmitted: widget.onSubmitted,
      enabled: widget.enabled,
      readOnly: widget.readOnly,
      autofocus: widget.autofocus,
      focusNode: widget.focusNode,
      validator: widget.validator,
      isRequired: widget.isRequired,
      keyboardType: TextInputType.visiblePassword,
      suffix: IconButton(
        icon: Icon(
          _obscureText ? Icons.visibility : Icons.visibility_off,
          color: theme.colorScheme.onSurface.withOpacity(0.5),
        ),
        onPressed: () {
          setState(() {
            _obscureText = !_obscureText;
          });
        },
      ),
    );
  }
} 
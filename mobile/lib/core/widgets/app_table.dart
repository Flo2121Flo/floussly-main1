import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../theme/app_animations.dart';

enum AppTableVariant {
  standard,
  elevated,
  outlined,
}

enum AppTableSize {
  small,
  medium,
  large,
}

class AppTable extends StatelessWidget {
  final List<AppTableColumn> columns;
  final List<AppTableRow> rows;
  final AppTableVariant variant;
  final AppTableSize size;
  final Color? backgroundColor;
  final Color? borderColor;
  final double? elevation;
  final EdgeInsetsGeometry? margin;
  final EdgeInsetsGeometry? padding;
  final double? borderRadius;
  final bool showHeader;
  final bool showFooter;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppTable({
    Key? key,
    required this.columns,
    required this.rows,
    this.variant = AppTableVariant.standard,
    this.size = AppTableSize.medium,
    this.backgroundColor,
    this.borderColor,
    this.elevation,
    this.margin,
    this.padding,
    this.borderRadius,
    this.showHeader = true,
    this.showFooter = false,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate table colors
    final tableColors = _getTableColors(theme);

    // Calculate table margin
    final tableMargin = margin ??
        EdgeInsets.all(
          size == AppTableSize.small
              ? AppTheme.spacing4
              : size == AppTableSize.medium
                  ? AppTheme.spacing6
                  : AppTheme.spacing8,
        );

    // Calculate table padding
    final tablePadding = padding ??
        EdgeInsets.all(
          size == AppTableSize.small
              ? AppTheme.spacing4
              : size == AppTableSize.medium
                  ? AppTheme.spacing6
                  : AppTheme.spacing8,
        );

    // Calculate table elevation
    final tableElevation = elevation ??
        (variant == AppTableVariant.elevated
            ? (size == AppTableSize.small
                ? 2.0
                : size == AppTableSize.medium
                    ? 4.0
                    : 8.0)
            : 0.0);

    // Calculate table border radius
    final tableBorderRadius = borderRadius ??
        (size == AppTableSize.small
            ? AppTheme.radius4
            : size == AppTableSize.medium
                ? AppTheme.radius6
                : AppTheme.radius8);

    Widget table = Container(
      margin: tableMargin,
      decoration: BoxDecoration(
        color: backgroundColor ?? tableColors.backgroundColor,
        borderRadius: BorderRadius.circular(tableBorderRadius),
        border: variant == AppTableVariant.outlined
            ? Border.all(
                color: borderColor ?? tableColors.borderColor,
                width: 1.0,
              )
            : null,
        boxShadow: variant == AppTableVariant.elevated
            ? [
                BoxShadow(
                  color: theme.shadowColor.withOpacity(0.1),
                  blurRadius: tableElevation * 2,
                  offset: Offset(0, tableElevation),
                ),
              ]
            : null,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showHeader) _buildTableHeader(context),
          ...rows.map((row) => _buildTableRow(context, row)),
          if (showFooter) _buildTableFooter(context),
        ],
      ),
    );

    if (animate) {
      table = AppAnimations.fadeIn(
        table,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return table;
  }

  Widget _buildTableHeader(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate header padding
    final headerPadding = EdgeInsets.symmetric(
      horizontal: size == AppTableSize.small
          ? AppTheme.spacing4
          : size == AppTableSize.medium
              ? AppTheme.spacing6
              : AppTheme.spacing8,
      vertical: size == AppTableSize.small
          ? AppTheme.spacing2
          : size == AppTableSize.medium
              ? AppTheme.spacing3
              : AppTheme.spacing4,
    );

    // Calculate header text style
    final headerTextStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppTableSize.small
          ? 12.0
          : size == AppTableSize.medium
              ? 14.0
              : 16.0,
      fontWeight: FontWeight.w600,
    );

    Widget header = Container(
      padding: headerPadding,
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceVariant,
        border: Border(
          bottom: BorderSide(
            color: theme.colorScheme.outline.withOpacity(0.1),
            width: 1.0,
          ),
        ),
      ),
      child: Row(
        children: [
          for (var column in columns)
            Expanded(
              flex: column.flex,
              child: DefaultTextStyle(
                style: headerTextStyle,
                textAlign: column.alignment,
                child: column.header,
              ),
            ),
        ],
      ),
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

  Widget _buildTableRow(BuildContext context, AppTableRow row) {
    final theme = Theme.of(context);

    // Calculate row padding
    final rowPadding = EdgeInsets.symmetric(
      horizontal: size == AppTableSize.small
          ? AppTheme.spacing4
          : size == AppTableSize.medium
              ? AppTheme.spacing6
              : AppTheme.spacing8,
      vertical: size == AppTableSize.small
          ? AppTheme.spacing2
          : size == AppTableSize.medium
              ? AppTheme.spacing3
              : AppTheme.spacing4,
    );

    // Calculate row text style
    final rowTextStyle = TextStyle(
      color: theme.colorScheme.onSurface,
      fontSize: size == AppTableSize.small
          ? 12.0
          : size == AppTableSize.medium
              ? 14.0
              : 16.0,
      fontWeight: FontWeight.w500,
    );

    Widget tableRow = InkWell(
      onTap: row.onTap,
      child: Container(
        padding: rowPadding,
        decoration: BoxDecoration(
          color: row.selected
              ? theme.colorScheme.primaryContainer
              : theme.colorScheme.surface,
          border: Border(
            bottom: BorderSide(
              color: theme.colorScheme.outline.withOpacity(0.1),
              width: 1.0,
            ),
          ),
        ),
        child: Row(
          children: [
            for (var i = 0; i < columns.length; i++)
              Expanded(
                flex: columns[i].flex,
                child: DefaultTextStyle(
                  style: rowTextStyle.copyWith(
                    color: row.selected
                        ? theme.colorScheme.onPrimaryContainer
                        : theme.colorScheme.onSurface,
                  ),
                  textAlign: columns[i].alignment,
                  child: row.cells[i],
                ),
              ),
          ],
        ),
      ),
    );

    if (animate) {
      tableRow = AppAnimations.fadeIn(
        tableRow,
        duration: animationDuration,
        curve: animationCurve,
      );
    }

    return tableRow;
  }

  Widget _buildTableFooter(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate footer padding
    final footerPadding = EdgeInsets.symmetric(
      horizontal: size == AppTableSize.small
          ? AppTheme.spacing4
          : size == AppTableSize.medium
              ? AppTheme.spacing6
              : AppTheme.spacing8,
      vertical: size == AppTableSize.small
          ? AppTheme.spacing2
          : size == AppTableSize.medium
              ? AppTheme.spacing3
              : AppTheme.spacing4,
    );

    // Calculate footer text style
    final footerTextStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppTableSize.small
          ? 12.0
          : size == AppTableSize.medium
              ? 14.0
              : 16.0,
      fontWeight: FontWeight.w500,
    );

    Widget footer = Container(
      padding: footerPadding,
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceVariant,
        border: Border(
          top: BorderSide(
            color: theme.colorScheme.outline.withOpacity(0.1),
            width: 1.0,
          ),
        ),
      ),
      child: Row(
        children: [
          for (var column in columns)
            Expanded(
              flex: column.flex,
              child: DefaultTextStyle(
                style: footerTextStyle,
                textAlign: column.alignment,
                child: column.footer ?? const SizedBox.shrink(),
              ),
            ),
        ],
      ),
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

  _TableColors _getTableColors(ThemeData theme) {
    switch (variant) {
      case AppTableVariant.standard:
        return _TableColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
        );
      case AppTableVariant.elevated:
        return _TableColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
        );
      case AppTableVariant.outlined:
        return _TableColors(
          backgroundColor: theme.colorScheme.surface,
          borderColor: theme.colorScheme.outline,
        );
    }
  }
}

class _TableColors {
  final Color backgroundColor;
  final Color borderColor;

  const _TableColors({
    required this.backgroundColor,
    required this.borderColor,
  });
}

class AppTableColumn {
  final Widget header;
  final Widget? footer;
  final int flex;
  final TextAlign alignment;

  const AppTableColumn({
    required this.header,
    this.footer,
    this.flex = 1,
    this.alignment = TextAlign.start,
  });
}

class AppTableRow {
  final List<Widget> cells;
  final bool selected;
  final VoidCallback? onTap;

  const AppTableRow({
    required this.cells,
    this.selected = false,
    this.onTap,
  });
}

class AppTableHeader extends StatelessWidget {
  final Widget? leading;
  final Widget? title;
  final Widget? subtitle;
  final List<Widget>? actions;
  final AppTableSize size;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppTableHeader({
    Key? key,
    this.leading,
    this.title,
    this.subtitle,
    this.actions,
    this.size = AppTableSize.medium,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate header spacing
    final headerSpacing = size == AppTableSize.small
        ? AppTheme.spacing2
        : size == AppTableSize.medium
            ? AppTheme.spacing3
            : AppTheme.spacing4;

    // Calculate title style
    final titleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant,
      fontSize: size == AppTableSize.small
          ? 14.0
          : size == AppTableSize.medium
              ? 16.0
              : 18.0,
      fontWeight: FontWeight.w600,
    );

    // Calculate subtitle style
    final subtitleStyle = TextStyle(
      color: theme.colorScheme.onSurfaceVariant.withOpacity(0.6),
      fontSize: size == AppTableSize.small
          ? 12.0
          : size == AppTableSize.medium
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

class AppTableFooter extends StatelessWidget {
  final List<Widget>? actions;
  final AppTableSize size;
  final bool animate;
  final Duration? animationDuration;
  final Curve? animationCurve;

  const AppTableFooter({
    Key? key,
    this.actions,
    this.size = AppTableSize.medium,
    this.animate = false,
    this.animationDuration,
    this.animationCurve,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Calculate footer spacing
    final footerSpacing = size == AppTableSize.small
        ? AppTheme.spacing2
        : size == AppTableSize.medium
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
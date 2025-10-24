# Design System Recommendations for CRUD Components - Black-Cross Platform

**Analysis ID**: UX47D2
**Date**: 2025-10-24
**Purpose**: Define design system specifications for consistent CRUD UI across all modules

---

## Executive Summary

This document defines **design tokens, component styles, and visual standards** for CRUD operations in the Black-Cross platform. These specifications ensure visual consistency, maintain the security-focused aesthetic, and align with Material-UI design principles.

**Design Philosophy**:
- **Professional**: Enterprise-grade, security-focused aesthetic
- **Efficient**: Optimized for high-frequency use by SOC analysts
- **Accessible**: WCAG 2.1 AA compliant with high contrast
- **Consistent**: Predictable patterns across all 19 modules
- **Scalable**: Design tokens support theming and customization

---

## 1. Color Palette

### Brand Colors

```typescript
const brandColors = {
  primary: {
    main: '#1976d2',      // Blue - primary actions
    light: '#42a5f5',
    dark: '#1565c0',
    contrast: '#ffffff',
  },
  secondary: {
    main: '#9c27b0',      // Purple - secondary actions
    light: '#ba68c8',
    dark: '#7b1fa2',
    contrast: '#ffffff',
  },
};
```

### Semantic Colors

```typescript
const semanticColors = {
  // Severity Levels (for threats, incidents, vulnerabilities)
  severity: {
    critical: {
      main: '#d32f2f',    // Red
      bg: '#ffebee',      // Light red background
      text: '#b71c1c',    // Dark red text
    },
    high: {
      main: '#f57c00',    // Orange
      bg: '#fff3e0',
      text: '#e65100',
    },
    medium: {
      main: '#fbc02d',    // Yellow
      bg: '#fffde7',
      text: '#f57f17',
    },
    low: {
      main: '#388e3c',    // Green
      bg: '#e8f5e9',
      text: '#1b5e20',
    },
  },

  // Status Colors (for items, workflows)
  status: {
    active: {
      main: '#d32f2f',    // Red - active threats
      text: '#ffffff',
    },
    investigating: {
      main: '#f57c00',    // Orange - in progress
      text: '#ffffff',
    },
    contained: {
      main: '#fbc02d',    // Yellow - partially resolved
      text: '#000000',
    },
    resolved: {
      main: '#388e3c',    // Green - resolved
      text: '#ffffff',
    },
    archived: {
      main: '#757575',    // Gray - archived
      text: '#ffffff',
    },
  },

  // Feedback Colors
  feedback: {
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
      bg: '#e8f5e9',
      text: '#1b5e20',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
      bg: '#ffebee',
      text: '#b71c1c',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
      bg: '#fff3e0',
      text: '#e65100',
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      dark: '#01579b',
      bg: '#e1f5fe',
      text: '#01579b',
    },
  },
};
```

### Neutral Colors

```typescript
const neutralColors = {
  // Text Colors
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',       // Dark gray, high contrast
    secondary: 'rgba(0, 0, 0, 0.60)',     // Medium gray
    disabled: 'rgba(0, 0, 0, 0.38)',      // Light gray
    hint: 'rgba(0, 0, 0, 0.38)',
  },

  // Background Colors
  background: {
    default: '#fafafa',                    // Off-white page background
    paper: '#ffffff',                      // White card/paper background
    elevated: '#ffffff',                   // Elevated components
  },

  // Divider Colors
  divider: 'rgba(0, 0, 0, 0.12)',

  // Action Colors
  action: {
    active: 'rgba(0, 0, 0, 0.54)',
    hover: 'rgba(0, 0, 0, 0.04)',
    selected: 'rgba(0, 0, 0, 0.08)',
    disabled: 'rgba(0, 0, 0, 0.26)',
    disabledBackground: 'rgba(0, 0, 0, 0.12)',
    focus: 'rgba(0, 0, 0, 0.12)',
  },
};
```

### Dark Mode (Future Enhancement)

```typescript
const darkModeColors = {
  background: {
    default: '#121212',
    paper: '#1e1e1e',
    elevated: '#2c2c2c',
  },
  text: {
    primary: 'rgba(255, 255, 255, 0.87)',
    secondary: 'rgba(255, 255, 255, 0.60)',
    disabled: 'rgba(255, 255, 255, 0.38)',
  },
  divider: 'rgba(255, 255, 255, 0.12)',
};
```

---

## 2. Typography

### Font Family

```typescript
const typography = {
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),

  // Monospace for code/technical data
  fontFamilyMono: [
    '"Roboto Mono"',
    'Consolas',
    'Monaco',
    '"Courier New"',
    'monospace',
  ].join(','),
};
```

### Type Scale

```typescript
const typeScale = {
  // Page Titles
  h1: {
    fontSize: '2.5rem',        // 40px
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.01562em',
  },

  h2: {
    fontSize: '2rem',          // 32px
    fontWeight: 700,
    lineHeight: 1.25,
    letterSpacing: '-0.00833em',
  },

  h3: {
    fontSize: '1.75rem',       // 28px
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: '0em',
  },

  // Section Headings (CRUD page titles)
  h4: {
    fontSize: '1.5rem',        // 24px
    fontWeight: 700,
    lineHeight: 1.35,
    letterSpacing: '0.00735em',
  },

  h5: {
    fontSize: '1.25rem',       // 20px
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '0.0075em',
  },

  h6: {
    fontSize: '1rem',          // 16px
    fontWeight: 600,
    lineHeight: 1.5,
    letterSpacing: '0.0075em',
  },

  // Body Text
  body1: {
    fontSize: '1rem',          // 16px
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0.00938em',
  },

  body2: {
    fontSize: '0.875rem',      // 14px
    fontWeight: 400,
    lineHeight: 1.43,
    letterSpacing: '0.01071em',
  },

  // Captions and Labels
  caption: {
    fontSize: '0.75rem',       // 12px
    fontWeight: 400,
    lineHeight: 1.66,
    letterSpacing: '0.03333em',
    textTransform: 'uppercase',
  },

  overline: {
    fontSize: '0.75rem',       // 12px
    fontWeight: 600,
    lineHeight: 2.66,
    letterSpacing: '0.08333em',
    textTransform: 'uppercase',
  },

  // Buttons
  button: {
    fontSize: '0.875rem',      // 14px
    fontWeight: 500,
    lineHeight: 1.75,
    letterSpacing: '0.02857em',
    textTransform: 'uppercase',
  },
};
```

### Typography Usage in CRUD

```typescript
const crudTypography = {
  pageTitle: 'h4',              // "Create New Threat"
  sectionHeading: 'h6',         // "Metadata", "Categories & Tags"
  fieldLabel: 'body2',          // Form field labels
  fieldValue: 'body1',          // Form input values, detail view values
  fieldHelper: 'caption',       // Helper text below fields
  fieldError: 'caption',        // Error messages (with error color)
  tableHeader: 'body2',         // Table column headers
  tableCell: 'body2',           // Table cell content
  chipLabel: 'body2',           // Chip labels (status, severity)
  buttonLabel: 'button',        // Button text
};
```

---

## 3. Spacing System

### Base Spacing Unit

Material-UI uses 8px as the base spacing unit.

```typescript
const spacing = (factor: number) => `${8 * factor}px`;

// Examples:
spacing(1) = '8px'
spacing(2) = '16px'
spacing(3) = '24px'
spacing(4) = '32px'
```

### CRUD Spacing Standards

```typescript
const crudSpacing = {
  // Page Layout
  pageTopMargin: 3,              // 24px - space above page header
  pageBottomMargin: 3,           // 24px - space below page content

  // Component Spacing
  paperPadding: 3,               // 24px - padding inside Paper components
  cardPadding: 2,                // 16px - padding inside Cards

  // Form Spacing
  formGridSpacing: 3,            // 24px - spacing between form fields
  formFieldMarginBottom: 2,      // 16px - margin below each field
  formActionsMarginTop: 3,       // 24px - space above action buttons
  buttonGap: 2,                  // 16px - gap between buttons

  // Element Spacing
  titleMarginBottom: 3,          // 24px - space below page title
  sectionMarginBottom: 3,        // 24px - space below sections
  dividerMarginVertical: 3,      // 24px - margin above/below dividers
  chipGap: 1,                    // 8px - gap between chips

  // Table Spacing
  tableRowPaddingVertical: 2,    // 16px - padding in table rows
  tableRowPaddingHorizontal: 2,  // 16px - padding in table cells

  // Icon Spacing
  iconMarginRight: 1,            // 8px - space after icons in buttons
  iconButtonPadding: 1,          // 8px - padding in icon buttons
};
```

### Responsive Spacing

```typescript
const responsiveSpacing = {
  // Reduce spacing on mobile
  mobile: {
    paperPadding: 2,             // 16px instead of 24px
    formGridSpacing: 2,          // 16px instead of 24px
  },

  // Increase spacing on large screens
  desktop: {
    pageTopMargin: 4,            // 32px instead of 24px
    sectionMarginBottom: 4,      // 32px instead of 24px
  },
};
```

---

## 4. Elevation and Shadows

### Shadow Levels

Material-UI provides 25 shadow levels (0-24). Use these standard levels for CRUD components:

```typescript
const shadows = {
  none: 0,                  // No shadow (default buttons)
  paper: 1,                 // Paper components, cards
  raised: 2,                // Raised buttons, chips on hover
  dialog: 8,                // Modals, dialogs
  appBar: 4,                // App bar, persistent elements
  drawer: 16,               // Navigation drawer
};
```

### CRUD Component Elevations

```typescript
const crudElevations = {
  pageBackground: 0,        // No elevation
  filterBar: 1,             // Slight elevation for filter paper
  contentPaper: 1,          // Form containers, detail views
  table: 1,                 // Table containers
  hoverCard: 2,             // Cards on hover
  raisedButton: 2,          // Contained buttons on hover
  confirmDialog: 8,         // Confirmation dialogs
  snackbar: 6,              // Toast notifications
};
```

---

## 5. Border Radius

### Radius Scale

```typescript
const borderRadius = {
  none: 0,
  small: 4,                 // 4px - chips, small buttons
  medium: 8,                // 8px - default (buttons, inputs, cards)
  large: 12,                // 12px - large cards, dialogs
  full: 9999,               // Fully rounded (pills)
};
```

### CRUD Component Radius

```typescript
const crudBorderRadius = {
  button: 'medium',         // 8px
  textField: 'medium',      // 8px
  paper: 'medium',          // 8px
  chip: 'full',             // Pill-shaped
  dialog: 'large',          // 12px
  table: 'medium',          // 8px
};
```

---

## 6. Button Styles

### Button Variants

```typescript
const buttonVariants = {
  // Contained - Primary actions
  contained: {
    backgroundColor: brandColors.primary.main,
    color: '#ffffff',
    boxShadow: shadows.raised,
    '&:hover': {
      backgroundColor: brandColors.primary.dark,
      boxShadow: shadows.raisedHover,
    },
    '&:disabled': {
      backgroundColor: neutralColors.action.disabledBackground,
      color: neutralColors.action.disabled,
    },
  },

  // Outlined - Secondary actions
  outlined: {
    border: `1px solid ${neutralColors.divider}`,
    color: brandColors.primary.main,
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: neutralColors.action.hover,
      borderColor: brandColors.primary.main,
    },
    '&:disabled': {
      borderColor: neutralColors.action.disabledBackground,
      color: neutralColors.action.disabled,
    },
  },

  // Text - Tertiary actions
  text: {
    color: brandColors.primary.main,
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: neutralColors.action.hover,
    },
    '&:disabled': {
      color: neutralColors.action.disabled,
    },
  },
};
```

### Button Sizes

```typescript
const buttonSizes = {
  small: {
    height: 32,
    padding: '6px 12px',
    fontSize: '0.8125rem',    // 13px
  },
  medium: {
    height: 40,
    padding: '8px 16px',
    fontSize: '0.875rem',     // 14px
  },
  large: {
    height: 48,
    padding: '12px 24px',
    fontSize: '0.9375rem',    // 15px
  },
};
```

### CRUD Button Usage

```typescript
const crudButtons = {
  // Primary Actions
  submit: {
    variant: 'contained',
    size: 'medium',
    color: 'primary',
    // Examples: "Create Threat", "Save Changes"
  },

  // Secondary Actions
  cancel: {
    variant: 'outlined',
    size: 'medium',
    color: 'inherit',
    // Examples: "Cancel", "Back"
  },

  // Destructive Actions
  delete: {
    variant: 'outlined',
    size: 'medium',
    color: 'error',
    // Examples: "Delete"
  },

  // Tertiary Actions
  navigation: {
    variant: 'text',
    size: 'medium',
    color: 'primary',
    // Examples: "View Details", "Back to List"
  },

  // Icon Buttons
  iconButton: {
    size: 'medium',
    padding: 1,                // 8px
    minWidth: 44,              // Accessibility requirement
    minHeight: 44,
  },
};
```

### Button States

```typescript
const buttonStates = {
  loading: {
    disabled: true,
    startIcon: <CircularProgress size={20} />,
  },

  disabled: {
    opacity: 0.38,
    cursor: 'not-allowed',
  },

  focus: {
    outline: `2px solid ${brandColors.primary.main}`,
    outlineOffset: 2,
  },
};
```

---

## 7. Form Field Styles

### TextField Standard

```typescript
const textFieldStyle = {
  // Base styles
  fullWidth: true,
  variant: 'outlined',
  size: 'medium',

  // Dimensions
  height: 56,                  // With label
  borderRadius: borderRadius.medium,

  // Colors
  borderColor: neutralColors.divider,
  borderColorFocus: brandColors.primary.main,
  borderColorError: semanticColors.feedback.error.main,

  // States
  '&:hover': {
    borderColor: neutralColors.text.primary,
  },
  '&:focus': {
    borderColor: brandColors.primary.main,
    borderWidth: 2,
  },
  '&.error': {
    borderColor: semanticColors.feedback.error.main,
  },
  '&:disabled': {
    backgroundColor: neutralColors.action.disabledBackground,
    color: neutralColors.action.disabled,
  },
};
```

### Field Sizing

```typescript
const fieldSizes = {
  small: {
    height: 40,
    fontSize: '0.875rem',     // 14px
  },
  medium: {
    height: 56,
    fontSize: '1rem',         // 16px
  },
  large: {
    height: 64,
    fontSize: '1.125rem',     // 18px
  },
};
```

### Helper Text and Error Styles

```typescript
const fieldHelperText = {
  fontSize: typeScale.caption.fontSize,
  color: neutralColors.text.secondary,
  marginTop: spacing(0.5),
  minHeight: 20,              // Prevent layout shift when error appears
};

const fieldErrorText = {
  ...fieldHelperText,
  color: semanticColors.feedback.error.text,
};
```

### Select/Dropdown Styles

```typescript
const selectStyle = {
  ...textFieldStyle,
  // Dropdown icon
  iconColor: neutralColors.text.secondary,
  iconColorOpen: brandColors.primary.main,

  // Menu
  menuMaxHeight: 300,
  menuItemPadding: spacing(1.5),
  menuItemHoverBg: neutralColors.action.hover,
  menuItemSelectedBg: neutralColors.action.selected,
};
```

---

## 8. Chip Styles

### Chip Variants

```typescript
const chipVariants = {
  // Filled (default) - for severity, primary status
  filled: {
    backgroundColor: semanticColors.severity.high.main,
    color: '#ffffff',
    fontWeight: 600,
  },

  // Outlined - for secondary metadata
  outlined: {
    backgroundColor: 'transparent',
    border: `1px solid ${neutralColors.divider}`,
    color: neutralColors.text.primary,
  },
};
```

### Chip Sizes

```typescript
const chipSizes = {
  small: {
    height: 24,
    fontSize: '0.75rem',      // 12px
    padding: '0 8px',
  },
  medium: {
    height: 32,
    fontSize: '0.8125rem',    // 13px
    padding: '0 12px',
  },
};
```

### Severity Chip Colors

```typescript
const severityChips = {
  critical: {
    backgroundColor: semanticColors.severity.critical.main,
    color: '#ffffff',
  },
  high: {
    backgroundColor: semanticColors.severity.high.main,
    color: '#ffffff',
  },
  medium: {
    backgroundColor: semanticColors.severity.medium.main,
    color: '#000000',          // Black text for yellow bg (contrast)
  },
  low: {
    backgroundColor: semanticColors.severity.low.main,
    color: '#ffffff',
  },
};
```

### Status Chip Colors

```typescript
const statusChips = {
  active: {
    variant: 'filled',
    color: semanticColors.status.active.main,
  },
  investigating: {
    variant: 'filled',
    color: semanticColors.status.investigating.main,
  },
  resolved: {
    variant: 'filled',
    color: semanticColors.status.resolved.main,
  },
  archived: {
    variant: 'outlined',
    color: semanticColors.status.archived.main,
  },
};
```

---

## 9. Table Styles

### Table Layout

```typescript
const tableStyle = {
  // Container
  containerBorderRadius: borderRadius.medium,
  containerElevation: shadows.paper,

  // Header
  headerBackgroundColor: neutralColors.background.default,
  headerTextColor: neutralColors.text.primary,
  headerFontWeight: 600,
  headerPadding: `${spacing(2)} ${spacing(2)}`,

  // Rows
  rowPadding: `${spacing(1.5)} ${spacing(2)}`,
  rowHoverBackgroundColor: neutralColors.action.hover,
  rowSelectedBackgroundColor: neutralColors.action.selected,

  // Borders
  borderColor: neutralColors.divider,
  borderWidth: 1,

  // Zebra Striping (optional)
  zebraStripe: {
    evenRowBg: 'transparent',
    oddRowBg: neutralColors.background.default,
  },
};
```

### Table Cell Alignment

```typescript
const tableCellAlignment = {
  text: 'left',
  number: 'right',
  date: 'left',
  actions: 'center',
  checkbox: 'center',
  status: 'left',       // Chips align left
};
```

---

## 10. Card/Paper Styles

### Paper Component

```typescript
const paperStyle = {
  backgroundColor: neutralColors.background.paper,
  borderRadius: borderRadius.medium,
  elevation: shadows.paper,
  padding: spacing(3),

  // Hover state (for clickable cards)
  hoverElevation: shadows.raised,
  hoverCursor: 'pointer',
};
```

### Card Variants

```typescript
const cardVariants = {
  // Default card (detail views, forms)
  default: {
    ...paperStyle,
  },

  // Elevated card (important content)
  elevated: {
    ...paperStyle,
    elevation: shadows.raised,
  },

  // Outlined card (alternative style)
  outlined: {
    ...paperStyle,
    elevation: 0,
    border: `1px solid ${neutralColors.divider}`,
  },
};
```

---

## 11. Icon Usage

### Icon Sizes

```typescript
const iconSizes = {
  small: 20,
  medium: 24,
  large: 32,
  xlarge: 48,
};
```

### Icon Colors

```typescript
const iconColors = {
  default: neutralColors.action.active,
  primary: brandColors.primary.main,
  secondary: neutralColors.text.secondary,
  disabled: neutralColors.action.disabled,
  error: semanticColors.feedback.error.main,
  warning: semanticColors.feedback.warning.main,
  success: semanticColors.feedback.success.main,
};
```

### CRUD Icon Standards

```typescript
const crudIcons = {
  // Actions
  create: AddIcon,
  edit: EditIcon,
  delete: DeleteIcon,
  save: SaveIcon,
  cancel: CloseIcon,
  back: ArrowBackIcon,
  refresh: RefreshIcon,

  // Status
  success: CheckCircleIcon,
  error: ErrorIcon,
  warning: WarningIcon,
  info: InfoIcon,

  // Navigation
  next: ArrowForwardIcon,
  previous: ArrowBackIcon,
  expand: ExpandMoreIcon,
  collapse: ExpandLessIcon,

  // Data
  search: SearchIcon,
  filter: FilterListIcon,
  sort: SortIcon,
  export: DownloadIcon,
  import: UploadIcon,
};
```

---

## 12. Animation and Transitions

### Transition Durations

```typescript
const transitions = {
  shortest: 150,            // Micro-interactions
  shorter: 200,             // Hover, focus
  short: 250,               // Button states, ripples
  standard: 300,            // Default (dialogs, drawers)
  complex: 375,             // Complex animations
  enteringScreen: 225,      // Elements entering
  leavingScreen: 195,       // Elements leaving
};
```

### Easing Functions

```typescript
const easing = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',      // Default
  easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',        // Enter
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',           // Exit
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',          // Sharp
};
```

### CRUD Animation Standards

```typescript
const crudAnimations = {
  // Button hover
  buttonHover: {
    duration: transitions.shorter,
    easing: easing.easeInOut,
    properties: ['background-color', 'box-shadow'],
  },

  // Dialog open/close
  dialog: {
    duration: transitions.standard,
    easing: easing.easeInOut,
    properties: ['opacity', 'transform'],
  },

  // Snackbar slide
  snackbar: {
    duration: transitions.enteringScreen,
    easing: easing.easeOut,
    properties: ['transform', 'opacity'],
  },

  // Table row hover
  tableRowHover: {
    duration: transitions.shortest,
    easing: easing.easeInOut,
    properties: ['background-color'],
  },

  // Loading spinner
  loadingSpinner: {
    duration: 1400,          // Full rotation
    easing: 'linear',
    infinite: true,
  },
};
```

### Reduced Motion

Respect user preferences for reduced motion:

```tsx
'@media (prefers-reduced-motion: reduce)': {
  '*': {
    animationDuration: '0.001ms !important',
    transitionDuration: '0.001ms !important',
  },
}
```

---

## 13. Responsive Breakpoints

### Material-UI Breakpoints

```typescript
const breakpoints = {
  values: {
    xs: 0,        // Mobile (portrait)
    sm: 600,      // Mobile (landscape)
    md: 900,      // Tablet
    lg: 1200,     // Desktop
    xl: 1536,     // Large desktop
  },
};
```

### CRUD Responsive Patterns

```typescript
const responsivePatterns = {
  // Form fields
  formField: {
    xs: 12,       // Full width on mobile
    md: 6,        // Half width on tablet/desktop (for paired fields)
  },

  // Action buttons
  actionButtons: {
    xs: 'column',          // Stack vertically on mobile
    md: 'row',             // Horizontal on desktop
  },

  // Filter bar
  filterBar: {
    xs: 'column',          // Stack vertically on mobile
    md: 'row',             // Horizontal on desktop
  },

  // Table
  table: {
    xs: 'scroll',          // Horizontal scroll on mobile
    md: 'fixed',           // Fixed layout on desktop
  },

  // Page header
  pageHeader: {
    xs: 'column',          // Stack title and actions on mobile
    md: 'row',             // Side-by-side on desktop
  },
};
```

---

## 14. Loading States

### Spinner Styles

```typescript
const loadingStates = {
  // Full page loading
  fullPage: {
    spinnerSize: 60,
    spinnerColor: brandColors.primary.main,
    backgroundColor: neutralColors.background.default,
    minHeight: '400px',
  },

  // Button loading
  button: {
    spinnerSize: 20,
    spinnerColor: 'inherit',      // Matches button text color
    disabledOpacity: 0.7,
  },

  // Inline loading
  inline: {
    spinnerSize: 24,
    spinnerColor: brandColors.primary.main,
  },

  // Table loading (skeleton)
  skeleton: {
    backgroundColor: neutralColors.action.hover,
    animation: 'pulse 1.5s ease-in-out infinite',
  },
};
```

---

## 15. Design Token Implementation

### Create Design Tokens File

```typescript
// frontend/src/theme/tokens.ts

export const designTokens = {
  colors: {
    brand: brandColors,
    semantic: semanticColors,
    neutral: neutralColors,
  },
  typography: typeScale,
  spacing: crudSpacing,
  shadows: shadows,
  borderRadius: borderRadius,
  transitions: transitions,
  breakpoints: breakpoints,
};

export default designTokens;
```

### Material-UI Theme Configuration

```typescript
// frontend/src/theme/theme.ts

import { createTheme } from '@mui/material/styles';
import { designTokens } from './tokens';

export const theme = createTheme({
  palette: {
    primary: designTokens.colors.brand.primary,
    secondary: designTokens.colors.brand.secondary,
    error: designTokens.colors.semantic.feedback.error,
    warning: designTokens.colors.semantic.feedback.warning,
    info: designTokens.colors.semantic.feedback.info,
    success: designTokens.colors.semantic.feedback.success,
    text: designTokens.colors.neutral.text,
    background: designTokens.colors.neutral.background,
    divider: designTokens.colors.neutral.divider,
    action: designTokens.colors.neutral.action,
  },

  typography: designTokens.typography,

  spacing: 8, // Base unit

  shape: {
    borderRadius: designTokens.borderRadius.medium,
  },

  shadows: [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
    // ... (Material-UI default shadows)
  ],

  transitions: {
    duration: designTokens.transitions,
    easing: easing,
  },

  breakpoints: designTokens.breakpoints,

  components: {
    // Component-specific overrides
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Sentence case instead of all caps
          borderRadius: designTokens.borderRadius.medium,
        },
        sizeMedium: {
          height: 40,
          padding: '8px 16px',
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.medium,
        },
        elevation1: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
        sizeMedium: {
          height: 32,
        },
      },
    },
  },
});
```

---

## 16. Accessibility Design Standards

### Focus Indicators

```typescript
const focusIndicator = {
  outline: `2px solid ${brandColors.primary.main}`,
  outlineOffset: 2,
  borderRadius: borderRadius.small,

  // High contrast mode support
  '@media (prefers-contrast: high)': {
    outline: '3px solid currentColor',
  },
};
```

### Color Contrast Requirements

All color combinations must meet WCAG 2.1 AA:
- Normal text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- UI components: 3:1 minimum

**Pre-validated Combinations**:
```typescript
const accessibleCombinations = {
  // Text on backgrounds
  darkTextOnWhite: {
    text: neutralColors.text.primary,     // Contrast: 15.8:1 ✓
    background: neutralColors.background.paper,
  },
  lightTextOnPrimary: {
    text: '#ffffff',                       // Contrast: 4.6:1 ✓
    background: brandColors.primary.main,
  },

  // Severity chips
  criticalChip: {
    text: '#ffffff',                       // Contrast: 5.2:1 ✓
    background: semanticColors.severity.critical.main,
  },
  mediumChip: {
    text: '#000000',                       // Contrast: 12.4:1 ✓
    background: semanticColors.severity.medium.main,
  },
};
```

---

## 17. Documentation and Usage

### Design System Documentation Structure

```
frontend/src/theme/
├── README.md                  # Design system overview
├── tokens.ts                  # Design tokens
├── theme.ts                   # Material-UI theme config
├── colors.md                  # Color palette documentation
├── typography.md              # Typography scales
├── spacing.md                 # Spacing guidelines
├── components/
│   ├── buttons.md             # Button specifications
│   ├── forms.md               # Form component specs
│   ├── tables.md              # Table design standards
│   └── chips.md               # Chip usage guidelines
└── examples/
    ├── crud-create.example.tsx
    ├── crud-edit.example.tsx
    ├── crud-detail.example.tsx
    └── crud-list.example.tsx
```

### Developer Usage Examples

```tsx
// Import theme
import { useTheme } from '@mui/material/styles';

function MyComponent() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: theme.spacing(3),
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[1],
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: theme.palette.text.primary,
          mb: theme.spacing(3),
        }}
      >
        Page Title
      </Typography>
    </Box>
  );
}
```

---

## 18. Design QA Checklist

When implementing new CRUD pages, verify:

**Visual Consistency**:
- [ ] Uses correct typography scales (h4 for titles, body1/body2 for text)
- [ ] Uses spacing system consistently (spacing(3) for major gaps)
- [ ] Uses correct button variants (contained for primary, outlined for secondary)
- [ ] Uses correct chip colors for severity/status
- [ ] Uses correct elevation levels

**Color Compliance**:
- [ ] All text meets 4.5:1 contrast ratio
- [ ] All UI components meet 3:1 contrast ratio
- [ ] Information not conveyed by color alone
- [ ] Severity shown with color + text + icon

**Accessibility**:
- [ ] Focus indicators visible and meet contrast requirements
- [ ] Touch targets at least 44px x 44px
- [ ] Keyboard navigation works throughout

**Responsiveness**:
- [ ] Layout responsive from 320px to 2560px
- [ ] Form fields stack appropriately on mobile
- [ ] Action buttons accessible on all screen sizes
- [ ] Table scrolls horizontally on mobile

---

## Conclusion

This design system provides a **complete foundation** for consistent, accessible, and professional CRUD interfaces across the Black-Cross platform.

**Key Benefits**:
1. ✅ **Visual Consistency**: All modules look and feel cohesive
2. ✅ **Faster Development**: Reusable design tokens reduce decisions
3. ✅ **Accessibility**: Built-in WCAG 2.1 AA compliance
4. ✅ **Maintainability**: Centralized tokens enable global updates
5. ✅ **Brand Alignment**: Professional security-focused aesthetic

**Implementation Timeline**:
- Design token file creation: 1 day
- Material-UI theme configuration: 1 day
- Component style overrides: 2 days
- Documentation: 1 day
- **Total**: 5 days

**Expected Outcome**:
- 100% visual consistency across all 19 modules
- 50% reduction in design decision time
- 90%+ WCAG 2.1 AA compliance
- Professional, enterprise-grade UI

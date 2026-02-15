/**
 * Design Tokens System
 *
 * Centralized design system tokens for consistent styling across the application.
 * Uses 8px grid system, accessible colors, and modern typography scale.
 */

export const tokens = {
  /**
   * Spacing Scale (8px grid system)
   * Base unit: 8px (0.5rem)
   */
  spacing: {
    0: '0',
    0.5: '0.25rem',   // 4px - Half unit for fine-tuning
    1: '0.5rem',      // 8px - Base unit
    2: '1rem',        // 16px - 2x
    3: '1.5rem',      // 24px - 3x
    4: '2rem',        // 32px - 4x
    5: '2.5rem',      // 40px - 5x
    6: '3rem',        // 48px - 6x
    8: '4rem',        // 64px - 8x (large sections)
    10: '5rem',       // 80px - 10x
    12: '6rem',       // 96px - 12x (hero spacing)
    16: '8rem',       // 128px - 16x (mega sections)
    20: '10rem',      // 160px
    24: '12rem',      // 192px
  },

  /**
   * Typography Scale (1.25 ratio - Perfect Fourth)
   * Improved readability with larger base size (16px)
   */
  fontSize: {
    // Body text (increased from 14px to 16px for better readability)
    xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],      // 12px/16px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],                            // 14px/20px
    base: ['1rem', { lineHeight: '1.5rem' }],                               // 16px/24px - NEW DEFAULT
    lg: ['1.125rem', { lineHeight: '1.75rem' }],                            // 18px/28px
    xl: ['1.25rem', { lineHeight: '1.875rem' }],                            // 20px/30px

    // Headings (clearer hierarchy)
    '2xl': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],           // 24px/32px
    '3xl': ['1.875rem', { lineHeight: '2.25rem', fontWeight: '600' }],      // 30px/36px
    '4xl': ['2.25rem', { lineHeight: '2.5rem', fontWeight: '700' }],        // 36px/40px
    '5xl': ['3rem', { lineHeight: '3rem', fontWeight: '700' }],             // 48px/48px
    '6xl': ['3.75rem', { lineHeight: '3.75rem', fontWeight: '700' }],       // 60px/60px
    '7xl': ['4.5rem', { lineHeight: '4.5rem', fontWeight: '700' }],         // 72px/72px
  },

  /**
   * Font Weights
   */
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  /**
   * Shadows (subtle, modern)
   */
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: '0 0 #0000',
  },

  /**
   * Border Radius (consistent rounding)
   */
  radius: {
    none: '0',
    sm: '0.25rem',    // 4px
    DEFAULT: '0.5rem', // 8px
    md: '0.625rem',   // 10px - Current default
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    '3xl': '2rem',    // 32px
    full: '9999px',
  },

  /**
   * Transitions (fast, purposeful)
   */
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slowest: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  /**
   * Z-Index Scale (prevent conflicts)
   */
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    notification: 1080,
  },

  /**
   * Breakpoints (mobile-first)
   */
  breakpoints: {
    xs: '320px',   // iPhone SE
    sm: '640px',   // Large phones landscape
    md: '768px',   // Tablets portrait
    lg: '1024px',  // Tablets landscape / small laptops
    xl: '1280px',  // Desktops
    '2xl': '1536px', // Large desktops
  },

  /**
   * Animation Easing Functions
   */
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Bounce effect
  },

  /**
   * Touch Target Sizes (accessibility)
   */
  touchTarget: {
    min: '44px',      // Apple HIG minimum
    comfortable: '48px',
    large: '56px',
  },
} as const;

/**
 * Semantic Color Palette
 * Using OKLch color space for perceptual uniformity
 */
export const semanticColors = {
  // Brand/Primary
  primary: {
    50: 'oklch(0.98 0.01 240)',
    100: 'oklch(0.95 0.02 240)',
    200: 'oklch(0.90 0.04 240)',
    300: 'oklch(0.80 0.08 240)',
    400: 'oklch(0.68 0.12 240)',
    500: 'oklch(0.55 0.15 240)',  // Main - 4.5:1 contrast
    600: 'oklch(0.48 0.15 240)',  // Hover
    700: 'oklch(0.38 0.12 240)',
    800: 'oklch(0.28 0.10 240)',
    900: 'oklch(0.20 0.08 240)',
  },

  // Success (green)
  success: {
    50: 'oklch(0.97 0.02 145)',
    100: 'oklch(0.94 0.04 145)',
    200: 'oklch(0.88 0.08 145)',
    300: 'oklch(0.78 0.12 145)',
    400: 'oklch(0.68 0.14 145)',
    500: 'oklch(0.55 0.15 145)',
    600: 'oklch(0.45 0.15 145)',
    700: 'oklch(0.38 0.12 145)',
    800: 'oklch(0.30 0.10 145)',
    900: 'oklch(0.22 0.08 145)',
  },

  // Warning (amber)
  warning: {
    50: 'oklch(0.98 0.02 80)',
    100: 'oklch(0.95 0.05 80)',
    200: 'oklch(0.90 0.10 80)',
    300: 'oklch(0.82 0.14 80)',
    400: 'oklch(0.75 0.16 80)',
    500: 'oklch(0.65 0.18 80)',
    600: 'oklch(0.55 0.18 80)',
    700: 'oklch(0.45 0.16 80)',
    800: 'oklch(0.35 0.12 80)',
    900: 'oklch(0.28 0.10 80)',
  },

  // Error/Destructive (red)
  error: {
    50: 'oklch(0.98 0.02 20)',
    100: 'oklch(0.95 0.05 20)',
    200: 'oklch(0.90 0.10 20)',
    300: 'oklch(0.82 0.16 20)',
    400: 'oklch(0.70 0.20 20)',
    500: 'oklch(0.58 0.22 20)',
    600: 'oklch(0.50 0.22 20)',
    700: 'oklch(0.42 0.20 20)',
    800: 'oklch(0.35 0.16 20)',
    900: 'oklch(0.28 0.12 20)',
  },

  // Neutral (high contrast)
  neutral: {
    0: 'oklch(1 0 0)',            // Pure white
    50: 'oklch(0.98 0 0)',        // Near-white bg
    100: 'oklch(0.96 0 0)',       // Light bg
    200: 'oklch(0.92 0 0)',       // Border
    300: 'oklch(0.85 0 0)',       // Hover border
    400: 'oklch(0.70 0 0)',       // Disabled text
    500: 'oklch(0.58 0 0)',       // Placeholder
    600: 'oklch(0.50 0 0)',       // Secondary text (4.5:1)
    700: 'oklch(0.38 0 0)',       // Body text (7:1)
    800: 'oklch(0.25 0 0)',       // Headings (12:1)
    900: 'oklch(0.15 0 0)',       // Near-black
    950: 'oklch(0.10 0 0)',       // Darkest
  },
};

/**
 * Component-specific tokens
 */
export const componentTokens = {
  button: {
    height: {
      xs: '1.5rem',    // 24px
      sm: '2rem',      // 32px
      md: '2.5rem',    // 40px (default)
      lg: '2.75rem',   // 44px (touch-friendly)
      xl: '3.5rem',    // 56px
    },
    paddingX: {
      xs: '0.5rem',    // 8px
      sm: '0.75rem',   // 12px
      md: '1rem',      // 16px
      lg: '1.5rem',    // 24px
      xl: '2rem',      // 32px
    },
  },

  input: {
    height: '2.5rem',  // 40px (touch-friendly)
    padding: '0.75rem', // 12px
    fontSize: '1rem',   // 16px (prevents zoom on iOS)
  },

  card: {
    padding: '1.5rem',  // 24px
    gap: '1rem',        // 16px
  },
};

export type DesignTokens = typeof tokens;
export type SemanticColors = typeof semanticColors;
export type ComponentTokens = typeof componentTokens;
